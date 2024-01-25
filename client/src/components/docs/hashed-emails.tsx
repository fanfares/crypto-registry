import CodeBoxComponent from './code-box.tsx';

const hashEmail = `import * as crypto from 'crypto';
const hash = crypto.createHash('sha256').update('rob@excal.tv').digest('hex');
console.log(hash);`;

const HashedEmails = () => {
  return (
    <>
      <h1>Hashed Emails</h1>
      <p>The holdings file contains SHA256 Hash of the </p>
      <p>Again, see the <a href="https://github.com/robport/cdr-examples">examples</a> for a working example</p>
      <CodeBoxComponent codeString={hashEmail}/>
    </>
  );
};

export default HashedEmails;
