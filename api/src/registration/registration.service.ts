import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  ApprovalStatusDto,
  RegistrationMessageDto,
  RegistrationStatusDto,
  SendRegistrationRequestDto
} from '../types/registration.dto';
import { DbService } from '../db/db.service';
import { ApprovalRecord, ApprovalStatus } from '../types/registration.types';
import { MailService } from '../mail-service';
import { ApiConfigService } from '../api-config';
import * as jwt from 'jsonwebtoken';
import { VerificationSignature } from './verification-signature';
import { ApprovalSignature } from './approval-signature';
import { SignatureService } from '../authentication/signature.service';
import { MessageSenderService } from '../network/message-sender.service';
import { MessageType } from '@bcr/types';

@Injectable()
export class RegistrationService {

  constructor(
    private dbService: DbService,
    private mailService: MailService,
    private apiConfigService: ApiConfigService,
    private signatureService: SignatureService,
    private messageSenderService: MessageSenderService,
    private logger: Logger
  ) {
  }

  async sendRegistration(sendRegistrationRequest: SendRegistrationRequestDto) {
    const registrationRequest: RegistrationMessageDto = {
      email: this.apiConfigService.ownerEmail,
      fromNodeAddress: this.apiConfigService.nodeAddress,
      fromNodeName: this.apiConfigService.nodeName,
      fromPublicKey: this.signatureService.publicKey,
      institutionName: this.apiConfigService.institutionName
    };
    await this.messageSenderService.sendDirectMessage(sendRegistrationRequest.toNodeAddress, MessageType.registration, JSON.stringify(registrationRequest));
  }

  async processRegistration(
    registrationRequest: RegistrationMessageDto
  ) {
    this.logger.log('Process registration request', {registrationRequest});
    const existingNode = await this.dbService.nodes.findOne({
      nodeAddress: registrationRequest.fromNodeAddress
    });

    if (existingNode) {
      throw new BadRequestException('Node already registered');
    }

    const existingRegistrations = await this.dbService.registrations.find({
      nodeAddress: registrationRequest.fromNodeAddress
    });

    if (existingRegistrations.length) {
      await this.dbService.registrations.updateMany({
        nodeAddress: registrationRequest.fromNodeAddress
      }, {
        status: ApprovalStatus.cancelled
      });
    }

    const id = await this.dbService.registrations.insert({
      email: registrationRequest.email,
      status: ApprovalStatus.pendingInitiation,
      institutionName: registrationRequest.institutionName,
      verified: false,
      nodePublicKey: registrationRequest.fromPublicKey,
      nodeName: registrationRequest.fromNodeName,
      nodeAddress: registrationRequest.fromNodeAddress
    });

    const signature: VerificationSignature = {registrationId: id};
    const token = jwt.sign(signature, this.apiConfigService.jwtSigningSecret, {
      expiresIn: '1h'
    });
    const link = `${this.apiConfigService.clientAddress}/verify-email?token=${token}`;
    await this.mailService.sendRegistrationVerification(registrationRequest.email, link);
  }

  private decodeVerificationToken(token: string): string {
    let registrationId: string;
    try {
      const signature = jwt.verify(token, this.apiConfigService.jwtSigningSecret) as VerificationSignature;
      registrationId = signature.registrationId;
    } catch (err) {
      this.logger.error('Failed to decode verification token');
      throw new BadRequestException('Failed to decode verification token');
    }

    if (!registrationId) {
      this.logger.error('No registration id on decoded token');
      throw new BadRequestException('No registration id on decoded token');
    }

    return registrationId;
  }

  async verifyEmail(token: string): Promise<RegistrationStatusDto> {
    const registrationId = this.decodeVerificationToken(token);
    await this.dbService.registrations.update(registrationId, {
      verified: true
    });
    return this.getRegistrationStatusById(registrationId);
  }

  async initiateApprovals(token: string): Promise<RegistrationStatusDto> {
    const registrationId = this.decodeVerificationToken(token);

    const registration = await this.dbService.registrations.findOne({
      _id: registrationId
    });

    if (!registration || !registration.verified) {
      throw new BadRequestException('Registration is not approved');
    }

    if (registration.status === ApprovalStatus.approved) {
      throw new BadRequestException('Registration is already approved');
    }

    await this.dbService.registrations.update(registrationId, {
      status: ApprovalStatus.pendingApproval
    });

    const nodesToApprove = await this.dbService.nodes.find({});

    await this.dbService.approvals.insertMany(nodesToApprove.map(approverNode => ({
      email: approverNode.ownerEmail,
      institutionName: approverNode.nodeName,
      registrationId: registration._id,
      status: ApprovalStatus.pendingApproval
    })));

    const approvals = await this.dbService.approvals.find({
      registrationId: registration._id
    });

    for (const approval of approvals) {
      const signature: ApprovalSignature = {approvalId: approval._id};
      const token = jwt.sign(signature, this.apiConfigService.jwtSigningSecret, {
        expiresIn: '1week'
      });
      const link = `${this.apiConfigService.clientAddress}/approve-registration?token=${token}`;
      await this.mailService.sendRegistrationApprovalRequest(approval.email, registration, link);
    }

    return this.getRegistrationStatusById(registrationId);
  }

  private async getApprovalFromToken(token: string): Promise<ApprovalRecord> {
    const signature = jwt.verify(token, this.apiConfigService.jwtSigningSecret) as ApprovalSignature;
    const approvalId = signature.approvalId;
    const approval = await this.dbService.approvals.findOne({_id: approvalId});
    if (!approval) {
      throw new BadRequestException('Invalid Approval');
    }
    return approval;
  }

  async getApprovalStatus(token: string): Promise<ApprovalStatusDto> {
    const approval = await this.getApprovalFromToken(token);
    return this.getApprovalStatusDto(approval);
  }

  private async getApprovalStatusDto(approval: ApprovalRecord): Promise<ApprovalStatusDto> {
    const registration = await this.dbService.registrations.get(approval.registrationId);
    return {
      status: approval.status,
      email: approval.email,
      institutionName: approval.institutionName,
      registration: {
        email: registration.email,
        institutionName: registration.institutionName,
        nodeAddress: registration.nodeAddress,
        nodeName: registration.nodeName,
        status: registration.status
      }
    };
  }

  async approve(token: string, approved: boolean): Promise<ApprovalStatusDto> {
    let approval = await this.getApprovalFromToken(token);
    await this.dbService.approvals.update(approval._id, {
      status: approved ? ApprovalStatus.approved : ApprovalStatus.rejected
    });

    const approvals = await this.dbService.approvals.find({
      registrationId: approval.registrationId
    });

    if (approvals.filter(a => a.status === ApprovalStatus.rejected).length > 0) {
      await this.dbService.registrations.update(approval.registrationId, {
        status: ApprovalStatus.rejected
      });

      const registration = await this.dbService.registrations.get(approval.registrationId);
      await this.mailService.sendRegistrationUpdated(registration);
      return;
    }

    if (approvals.filter(a => a.status === ApprovalStatus.approved).length === approvals.length) {
      await this.dbService.registrations.update(approval.registrationId, {
        status: ApprovalStatus.approved
      });

      const registration = await this.dbService.registrations.get(approval.registrationId);
      await this.mailService.sendRegistrationUpdated(registration);

      await this.messageSenderService.broadcastNodeJoin({
        address: registration.nodeAddress,
        nodeName: registration.nodeName,
        unresponsive: false,
        blackBalled: false,
        publicKey: registration.nodePublicKey,
        ownerEmail: registration.email,
        lastSeen: new Date(),
        latestSubmissionId: null,
        latestVerificationId: null,
        isLeader: false,
        leaderVote: '',
      });
    }
    approval = await this.dbService.approvals.get(approval._id);
    return this.getApprovalStatusDto(approval);
  }

  private async getRegistrationStatusById(registrationId: string): Promise<RegistrationStatusDto> {
    const registration = await this.dbService.registrations.get(registrationId);
    const approvals = await this.dbService.approvals.find({
      registrationId: registrationId
    });
    return {
      registration: {
        nodeName: registration.nodeName,
        nodeAddress: registration.nodeAddress,
        status: registration.status,
        email: registration.email,
        institutionName: registration.institutionName
      },
      approvals: approvals.map(a => ({
        status: a.status,
        email: a.email,
        institutionName: a.institutionName
      }))
    };
  }

  async getRegistrationStatus(token: string): Promise<RegistrationStatusDto> {
    const registrationId = this.decodeVerificationToken(token);
    return this.getRegistrationStatusById(registrationId);
  }
}
