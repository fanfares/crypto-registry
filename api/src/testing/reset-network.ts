import { DbService } from '../db/db.service';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import axios from 'axios';

export const resetNetwork = async (
  envFiles: string[],
  db: DbService,
  emitResetNetwork: boolean,
  thisAddress: string
) => {
  await db.nodes.deleteMany({});

  for (const envFile of envFiles) {
    const env = dotenv.parse(fs.readFileSync(envFile));
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
      leaderVote: ''
    });

    if (emitResetNetwork && envAddress !== thisAddress) {
      try {
        await axios.post(envAddress + '/api/test/reset', {
          resetVerificationsAndSubmissionsOnly: true,
          dontResetWalletHistory: true,
          resetNetwork: true,
          nodes: envFiles,
          emitResetNetwork: false
        });
      } catch (err) {
        console.log(err);
      }
    }
  }
};
