import { Bip84Utils } from './bip84-utils';

function signAddress(extendedPrivateKey: string, message: string, address: string) {
  const bip84 = Bip84Utils.fromExtendedKey(extendedPrivateKey);
  let {index, change} = bip84.findAddress(address);
  const { signature } = bip84.sign(index, change, message);
  return { signature, index, change };
}

const privateKey = 'vprv9Lrz51GgUJnZAcPJpGpNCfrHFYrqHcvPHG6b9jAHM9WudF3CgKdLJhMoupiMzRcXkTxN33FwKCt8YQHP3aitmx3FaGbSXmCQ91qJz2NTqPE';
const address = 'tb1qp4qsnlsg622ygpgcvn9q8lz52he53wdta5lg3q';
const message = 'I assert that, as of 24 Jan 2024, the exchange owns the referenced bitcoin on behalf of the customers specified';

const expectedSignature = 'IBBEYGd1yXlSUtyyxnW/ukPeJBazhQ9dofYuvpertGQFPAUCM2R4i4fCMWZBcfGlZUzBBF6X6zUgsUEuuKf8mjE=';
const { signature, index, change } = signAddress(privateKey, message, address);

console.log('Index ' + index + ' change:' + change);
console.log('Signature Correct?: ', signature === expectedSignature, signature, expectedSignature);
