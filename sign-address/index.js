const bitcoin = require('bitcoinjs-lib');
const { BIP32Factory } = require('bip32')
const ecc = require('tiny-secp256k1')
const bitcoinMessage = require('bitcoinjs-message')

const segwitTestnetNetwork = {
    ...bitcoin.networks.testnet,
    bip32: {
        ...bitcoin.networks.testnet.bip32,
        private: 0x045f18bc,
        public: 0x045f1cf6
    }
};

function signAddress(network, privateKey, message) {
    const bip32 = BIP32Factory(ecc)
    const bitcoinNetwork = segwitTestnetNetwork;// network === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
    const root = bip32.fromBase58(privateKey, bitcoinNetwork);
    // const child = root.derivePath("m/0'/0/0");
    const child = root.derive(0).derive(0);
    const bcAddress = bitcoin.payments.p2wpkh({
        pubkey: child.publicKey,
        network: bitcoinNetwork
    });
    const signature = bitcoinMessage.sign(message, child.privateKey, child.compressed, { network: bitcoinNetwork });
    return {
        signature: signature.toString('base64'),
        address: bcAddress.address
    }
}

// Extended Private Key of Wallet Owning Address
const vprv = 'vprv9Lrz51GgUJnZAcPJpGpNCfrHFYrqHcvPHG6b9jAHM9WudF3CgKdLJhMoupiMzRcXkTxN33FwKCt8YQHP3aitmx3FaGbSXmCQ91qJz2NTqPE'
const xprv = 'xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi'

// An address containing customer funds.
const expectedAddress = 'tb1q7yx7zmzu9c5s0d6s4ccsagt8r53u8kyrjsgncv'
const expectedSignature ='Hz8ayR3sB0HQzBYjJLCSOdZzmLO/rmiPXVhCjDekyhgDZJZtER/3paT4F/UZFuPxopkrgk2wdobXraEcqLLPZng=';
const message = 'hello world';

const {signature, address} = signAddress('testnet', vprv, message)

console.log('Sig Correct?: ', signature === expectedSignature);
console.log('Addr Correct?: ', address === expectedAddress);
