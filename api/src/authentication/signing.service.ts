import * as bitcoin from 'bitcoinjs-lib';
import * as bip32 from 'bip32';
import * as bitcoinMessage from 'bitcoinjs-message';
import bip84 from 'bip84';
import * as ecc from 'tiny-secp256k1';

export class SigningService {

  sign(zprv: string, message: string): string {
    // Get the node from the xpriv
    const account = new bip84.fromZPrv(zprv);
    const rootNode = bip32.BIP32Factory(ecc).fromBase58(account.zprv, account.network);
    const privateKey = rootNode.derive(0).privateKey;
    const signature = bitcoinMessage.sign(message, privateKey, false, {segwitType: 'p2wpkh'});
    return signature.toString('base64');
  }

  verify(zpub: string, message: string, signature: string): boolean {
    const account = new bip84.fromZPub(zpub);
    const rootNode = bip32.BIP32Factory(ecc).fromBase58(account.zpub, account.network);
    const publicKey = rootNode.derive(0).publicKey;
    const address = bitcoin.payments.p2wpkh({pubkey: publicKey}).address;
    return bitcoinMessage.verify(message, address, signature);
  }

}
