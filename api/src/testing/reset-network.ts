import { DbService } from '../db/db.service';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import axios from 'axios';
import { ResetNodeOptions } from "@bcr/types";
import { NodeService } from "../node";
import { BadRequestException } from "@nestjs/common";

export const resetNetwork = async (
  envFiles: string[],
  db: DbService,
  nodeService: NodeService,
  emitResetNetwork: boolean,
  thisAddress: string,
  resetWallet: boolean,
  autoStart: boolean
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
        const options: ResetNodeOptions = {
          resetWallet: resetWallet,
          resetNetwork: true,
          nodes: envFiles,
          emitResetNetwork: false,
          autoStart: autoStart
        }
        await axios.post(envAddress + '/api/test/reset', options);
      } catch (err) {
        console.log(err);
      }
    }
  }

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
      latestVerificationIndex: 0,
      latestVerificationHash: '',
      latestSubmissionIndex: 0,
      latestSubmissionHash: '',
      testnetRegistryWalletAddressCount: 0,
      mainnetRegistryWalletAddressCount: 0,
      isLeader: false,
      leaderVote: '',
      isStarting: autoStart
    });
  }
  await nodeService.startUp()
};
