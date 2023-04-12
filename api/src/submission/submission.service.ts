import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ApiConfigService } from '../api-config';
import { CreateSubmissionDto, CustomerHolding, SubmissionDto, SubmissionStatus } from '@bcr/types';
import { submissionStatusRecordToDto } from './submission-record-to-dto';
import { getHash, minimumBitcoinPaymentInSatoshi } from '../utils';
import { WalletService } from '../crypto/wallet.service';
import { isTxsSendersFromWallet } from '../crypto/is-tx-sender-from-wallet';
import { DbService } from '../db/db.service';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { getNetworkForZpub } from '../crypto/get-network-for-zpub';
import { SubmissionConfirmationMessage } from '../types/submission-confirmation.types';
import { Cron } from '@nestjs/schedule';
import { MessageSenderService } from '../network/message-sender.service';
import { EventGateway } from '../network/event.gateway';
import { NodeService } from '../node';
import { SynchronisationService } from '../syncronisation/synchronisation.service';
import { DbInsertOptions } from '../db';
import { getLatestSubmissionBlock } from './get-latest-submission-block';

@Injectable()
export class SubmissionService {
    constructor(
        private db: DbService,
        private bitcoinServiceFactory: BitcoinServiceFactory,
        private apiConfigService: ApiConfigService,
        private walletService: WalletService,
        private logger: Logger,
        private messageSenderService: MessageSenderService,
        private eventGateway: EventGateway,
        private nodeService: NodeService,
        private syncService: SynchronisationService
    ) {
    }

    private async updateSubmissionStatus(submissionId: string, status: SubmissionStatus) {
        const thisNode = (await this.nodeService.getThisNode()).address;
        await this.db.submissions.update(submissionId, {status});
        const submission = await this.db.submissions.get(submissionId);
        const confirmations = await this.db.submissionConfirmations.find({
            submissionId: submission._id
        });
        const submissionDto = submissionStatusRecordToDto(submission, confirmations);
        this.eventGateway.emitSubmissionUpdates(submissionDto);
    }

    @Cron('5 * * * * *')
    async waitForSubmissionsForPayment() {
        const submissions = await this.db.submissions.find({
            status: {$in: [SubmissionStatus.WAITING_FOR_PAYMENT, SubmissionStatus.WAITING_FOR_CONFIRMATION]},
            isCurrent: true
        });
        const thisNode = (await this.nodeService.getThisNode()).address;
        for (const submission of submissions) {
            this.logger.debug('polling for submission payment', {submission});
            if (submission.status === SubmissionStatus.WAITING_FOR_PAYMENT) {
                const bitcoinService = this.bitcoinServiceFactory.getService(submission.network);
                const txs = await bitcoinService.getTransactionsForAddress(submission.paymentAddress);
                if (txs.length === 0) {
                    break;
                } else if (!isTxsSendersFromWallet(txs, submission.exchangeZpub)) {
                    await this.updateSubmissionStatus(submission._id, SubmissionStatus.SENDER_MISMATCH);
                    break;
                } else {
                    const addressBalance = await bitcoinService.getAddressBalance(submission.paymentAddress);
                    if (addressBalance < submission.paymentAmount) {
                        break;
                    } else {
                        // todo - refactor to use _id and call this.confirmSubmissions
                        await this.db.submissionConfirmations.insert({
                            confirmed: true,
                            submissionId: submission._id,
                            nodeAddress: this.apiConfigService.nodeAddress
                        });
                        await this.updateSubmissionStatus(submission._id, SubmissionStatus.WAITING_FOR_CONFIRMATION);
                        const confirmationStatus = await this.getConfirmationStatus(submission._id);
                        if (confirmationStatus === SubmissionStatus.CONFIRMED) {
                            await this.updateSubmissionStatus(submission._id, confirmationStatus);
                        }
                        await this.messageSenderService.broadcastSubmissionConfirmation({
                            submissionHash: submission.hash,
                            confirmed: true
                        });
                    }
                }
            } else if (submission.status === SubmissionStatus.WAITING_FOR_CONFIRMATION) {
                const confirmationStatus = await this.getConfirmationStatus(submission._id);
                await this.updateSubmissionStatus(submission._id, confirmationStatus);
            }
        }
    }

    private async getConfirmationStatus(submissionId: string) {
        const thisNOde = (await this.nodeService.getThisNode()).address;

        const submission = await this.db.submissions.get(submissionId);
        if (submission.status !== SubmissionStatus.WAITING_FOR_CONFIRMATION) {
            throw new Error('Must be waiting for confirmation ');
        }

        const confirmations = await this.db.submissionConfirmations.find({
            submissionId: submissionId
        });
        // todo - node count can vary
        const nodeCount = await this.db.nodes.count({});
        let status: SubmissionStatus;
        const confirmedCount = confirmations.filter(c => c.confirmed).length;
        const rejectedCount = confirmations.filter(c => !c.confirmed).length;
        if (rejectedCount > 0) {
            status = SubmissionStatus.REJECTED;
        } else if (confirmedCount === nodeCount) {
            status = SubmissionStatus.CONFIRMED;
        } else {
            status = SubmissionStatus.WAITING_FOR_CONFIRMATION;
        }
        return status;
    }

    async getSubmissionStatus(
        paymentAddress: string
    ): Promise<SubmissionDto> {
        const submission = await this.db.submissions.findOne({
            paymentAddress
        });
        if (!submission) {
            throw new BadRequestException('Invalid Address');
        }
        const confirmations = await this.db.submissionConfirmations.find({
            submissionId: submission._id
        });
        return submissionStatusRecordToDto(submission, confirmations);
    }

    async cancel(paymentAddress: string) {
        await this.db.submissions.findOneAndUpdate({
            paymentAddress: paymentAddress
        }, {
            status: SubmissionStatus.CANCELLED
        });
    }

    async createSubmission(
        createSubmissionDto: CreateSubmissionDto
    ): Promise<SubmissionDto> {
        const thisNOde = (await this.nodeService.getThisNode()).address;
        if (createSubmissionDto._id) {
            const submission = await this.db.submissions.get(createSubmissionDto._id);
            if (submission) {
                this.logger.log('Receiver getting index from leader');
                if (!createSubmissionDto.index) {
                    throw new Error('Follower expected index from leader');
                }
                await this.assignSubmissionIndex(submission._id, createSubmissionDto.index);
                return;
            }
        }

        const network = getNetworkForZpub(createSubmissionDto.exchangeZpub);
        const bitcoinService = this.bitcoinServiceFactory.getService(network);
        bitcoinService.validateZPub(createSubmissionDto.exchangeZpub);

        const totalExchangeFunds = await bitcoinService.getWalletBalance(createSubmissionDto.exchangeZpub);
        if (totalExchangeFunds === 0) {
            throw new BadRequestException('Exchange Wallet Balance is zero');
        }

        const totalCustomerFunds = createSubmissionDto.customerHoldings.reduce((amount, holding) => amount + holding.amount, 0);
        if (totalExchangeFunds < (totalCustomerFunds * this.apiConfigService.reserveLimit)) {
            const reserveLimit = Math.round(this.apiConfigService.reserveLimit * 100);
            throw new BadRequestException(`Exchange funds are below reserve limit (${reserveLimit}% of customer funds)`);
        }

        const paymentAmount = Math.max(totalCustomerFunds * this.apiConfigService.paymentPercentage, minimumBitcoinPaymentInSatoshi);

        // todo - leader should be responsible for assigning payment address - or there is a possibility that
        // a follower/receiving node may choose the same address due to race conditions.
        let paymentAddress: string = createSubmissionDto.paymentAddress;
        if (!createSubmissionDto.paymentAddress) {
            paymentAddress = await this.walletService.getReceivingAddress(this.apiConfigService.getRegistryZpub(network), 'Registry', network);
        } else {
            const s = await this.db.submissions.findOne({
                paymentAddress: paymentAddress
            })

            if ( s ) {
                console.log('should never happen')
            }

            await this.walletService.storeReceivingAddress(this.apiConfigService.getRegistryZpub(network), 'Registry', network, createSubmissionDto.paymentAddress);
        }

        const currentSubmission = await this.db.submissions.findOne({
            exchangeZpub: createSubmissionDto.exchangeZpub,
            network: network,
            isCurrent: true
        });

        if (currentSubmission && currentSubmission._id !== createSubmissionDto._id) {
            await this.db.submissions.updateMany({
                _id: currentSubmission._id
            }, {
                isCurrent: false
            });

            await this.db.customerHoldings.updateMany({
                paymentAddress: currentSubmission.paymentAddress,
                network: network
            }, {
                isCurrent: false
            });
        }

        let options: DbInsertOptions = null;

        if (createSubmissionDto._id) {
            options = {_id: createSubmissionDto._id};
        }

        const submissionId = await this.db.submissions.insert({
            initialNodeAddress: createSubmissionDto.initialNodeAddress,
            paymentAddress: paymentAddress,
            network: network,
            index: null,
            precedingHash: null,
            hash: null,
            paymentAmount: paymentAmount,
            totalCustomerFunds: totalCustomerFunds,
            totalExchangeFunds: totalExchangeFunds,
            status: SubmissionStatus.WAITING_FOR_PAYMENT,
            exchangeName: createSubmissionDto.exchangeName,
            exchangeZpub: createSubmissionDto.exchangeZpub,
            isCurrent: true
        }, options);

        const inserts: CustomerHolding[] =
            createSubmissionDto.customerHoldings.map((holding) => ({
                hashedEmail: holding.hashedEmail.toLowerCase(),
                amount: holding.amount,
                paymentAddress: paymentAddress,
                network: network,
                isCurrent: true,
                submissionId: submissionId
            }));

        await this.db.customerHoldings.insertMany(inserts);

        const isLeader = await this.nodeService.isThisNodeLeader();

        if (!createSubmissionDto.index) {
            if (isLeader) {
                this.logger.log('Leader received new submission');
                const latestSubmissionBlock = await getLatestSubmissionBlock(this.db);
                const newSubmissionIndex = (latestSubmissionBlock?.index ?? 0) + 1;
                await this.assignSubmissionIndex(submissionId, newSubmissionIndex);
                await this.messageSenderService.broadcastCreateSubmission({
                    ...createSubmissionDto,
                    index: newSubmissionIndex,
                    _id: submissionId,
                    paymentAddress: paymentAddress
                });
            } else {
                this.logger.log('Follower received new submission');
                const leader = await this.nodeService.getLeader();
                await this.messageSenderService.sendCreateSubmission(leader.address, {
                    ...createSubmissionDto,
                    _id: submissionId,
                    paymentAddress: paymentAddress
                });
            }
        } else {
            this.logger.log('Follower received submission from leader');
            await this.assignSubmissionIndex(submissionId, createSubmissionDto.index);
        }

        return {
            _id: submissionId,
            initialNodeAddress: createSubmissionDto.initialNodeAddress,
            paymentAddress: paymentAddress,
            exchangeZpub: createSubmissionDto.exchangeZpub,
            network: network,
            paymentAmount: paymentAmount,
            totalCustomerFunds: totalCustomerFunds,
            totalExchangeFunds: totalExchangeFunds,
            status: SubmissionStatus.WAITING_FOR_PAYMENT,
            exchangeName: createSubmissionDto.exchangeName,
            isCurrent: true,
            confirmations: []
        };
    }

    private async assignSubmissionIndex(
        submissionId: string,
        index: number
    ) {
        const submission = await this.db.submissions.get(submissionId);

        if (!submission) {
            this.logger.log('Cannot find submission ', {submissionId});
            return;
        }

        if (submission.index) {
            this.logger.error('Submission already blockchained', {submissionId});
            return;
        }

        const previousSubmission = await this.db.submissions.findOne({
            index: index - 1
        });

        const precedingHash = previousSubmission?.hash ?? 'genesis';

        const customerHoldings = await this.db.customerHoldings.find({submissionId}, {
            projection: {
                hashedEmail: 1,
                amount: 1
            }
        });

        const hash = getHash(JSON.stringify({
            initialNodeAddress: submission.initialNodeAddress,
            index: index,
            paymentAddress: submission.paymentAddress,
            network: submission.network,
            paymentAmount: submission.paymentAmount,
            totalCustomerFunds: submission.totalCustomerFunds,
            exchangeName: submission.exchangeName,
            exchangeZpub: submission.exchangeZpub,
            holdings: customerHoldings.map(h => ({
                hashedEmail: h.hashedEmail.toLowerCase(),
                amount: h.amount
            }))
        }) + previousSubmission?.hash ?? 'genesis', 'sha256');

        await this.db.submissions.update(submissionId, {
            hash, index, precedingHash
        });

        await this.nodeService.updateStatus(false, this.apiConfigService.nodeAddress, await this.syncService.getSyncRequest());
    }

    async confirmSubmission(confirmingNodeAddress: string, confirmation: SubmissionConfirmationMessage) {
        try {
            const submission = await this.db.submissions.findOne({
                hash: confirmation.submissionHash
            });
            if (confirmation.submissionHash !== submission.hash) {
                // blackballed
                await this.nodeService.setNodeBlackBall(confirmingNodeAddress);
                return;
            }

            await this.db.submissionConfirmations.insert({
                confirmed: confirmation.confirmed,
                submissionId: submission._id,
                nodeAddress: confirmingNodeAddress
            });

            if (submission.status === SubmissionStatus.WAITING_FOR_CONFIRMATION) {
                const confirmationStatus = await this.getConfirmationStatus(submission._id);
                await this.updateSubmissionStatus(submission._id, confirmationStatus);
            }

        } catch (err) {
            this.logger.error('Failed to process submission confirmation', confirmation);
        }

    }

}
