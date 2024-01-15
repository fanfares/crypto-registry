import CodeRenderComponent from './code-box.tsx';

const authenticate = `import {createSign, randomBytes} from 'crypto';
import axios from 'axios';
import fs from 'fs';

async function testRequest() {
  const method = 'GET'; // HTTP method
  const url = 'https://customer-deposits-registry.com/api/system'

  const timestamp = new Date().toISOString();
  const randomText = randomBytes(16).toString('hex'); // Random text
  const email = 'rob@excal.tv'

  const messageStr = JSON.stringify({
    timestamp, randomText, email
  });

  const privateKeyUTF8 = fs.readFileSync('./private-key.rsa', 'utf8');
  const privateKey = Buffer.from(privateKeyUTF8).toString('ascii')

  const sign = createSign('SHA256');
  sign.update(messageStr);
  sign.end();

  const signature = sign.sign(privateKey, 'hex');

  try {
    const result = await axios.request({
      url: url,
      method: method,
      'content-type': 'application/json',
      headers: {
        'x-auth-nonce': messageStr,
        'x-auth-signature': signature,
      }
    })
    console.log('Result: ', result.data);
  } catch (err) {
    console.error(err.message);
  }
}`;


const ApiDocsPage = () => {
  return <>
    <h1>API Documentation</h1>
    <h3>API Reference</h3>
    <p>The API Reference can be found <a href="https://customer-deposits-registry.com/docs">here</a>.</p>
    <h3>Authentication</h3>
    <CodeRenderComponent codeString={authenticate}/>
    <h3>Signing Funding Addresses</h3>
    <p>TBC</p>
    <h3>Hash Email</h3>
    <p>TBC</p>;
  </>;
};

export default ApiDocsPage;
