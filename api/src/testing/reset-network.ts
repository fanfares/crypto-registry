import { DbService } from '../db/db.service';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import axios from 'axios';
import { ResetDataOptions } from "@bcr/types";
import { NodeService } from "../node";
import { BadRequestException, Logger } from "@nestjs/common";

export const resetNetwork = async (
  envFiles: string[],
  db: DbService,
  nodeService: NodeService,
  emitResetNetwork: boolean,
  thisAddress: string,
  logger: Logger
) => {

  for (const envFile of envFiles) {
    if (!fs.existsSync(envFile)) {
      throw new BadRequestException('Reset failed:' + envFile + ' does not exist')
    }
  }

  const envs: any[] = []
  for (const envFile of envFiles) {
    const env = dotenv.parse(fs.readFileSync(envFile));
    envs.push(env);
    const envAddress = env.LOCAL_ADDRESS.endsWith('/') ? env.LOCAL_ADDRESS.substring(0, env.LOCAL_ADDRESS.length - 1) : env.LOCAL_ADDRESS;

    if (emitResetNetwork && envAddress !== thisAddress) {
      try {
        const options: ResetDataOptions = {
          // resetNetwork: true,
          // nodes: envFiles,
          // emitResetNetwork: false,
        }
        logger.log('Emitting reset to ' + envAddress);
        await axios.post(envAddress + '/api/test/reset', options);
      } catch (err) {
        logger.error('Remote reset failed');
        logger.error(err);
      }
    }
  }


  logger.log('Reset Node Table');
  await db.nodes.deleteMany({});
  for (const env of envs) {
    const publicKey = Buffer.from(env.PUBLIC_KEY_BASE64, 'base64').toString('ascii');
    const envAddress = env.LOCAL_ADDRESS.endsWith('/') ? env.LOCAL_ADDRESS.substring(0, env.LOCAL_ADDRESS.length - 1) : env.LOCAL_ADDRESS;

    await db.nodes.insert({
      nodeName: env.NODE_NAME,
      address: envAddress,
      publicKey: publicKey,
      unresponsive: false,
      blackBalled: false,
      ownerEmail: env.OWNER_EMAIL,
      lastSeen: new Date(),
      latestVerificationId: null,
      latestSubmissionId: null,
      isLeader: false,
      leaderVote: '',
    });
  }

  logger.log('Start Node Service');
  await nodeService.startUp()
};
