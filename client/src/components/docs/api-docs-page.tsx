import CodeRenderComponent from './code-box.tsx';

const authenticate = `import {createSign, randomBytes} from 'crypto';
import axios from 'axios';
import fs from 'fs';

async function testRequest() {
    const messageStr = JSON.stringify({
        timestamp: new Date().toISOString(),
        randomText: randomBytes(16).toString('hex'),
        email: 'rob@excal.tv'
    });

    const privateKey = fs.readFileSync('./private-key.rsa', 'utf8').toString();
    const signature = createSign('SHA256')
        .update(messageStr)
        .end()
        .sign(privateKey, 'hex');

    try {
        const result = await axios.request({
            url: 'https://customer-deposits-registry.com/api/system',
            method: 'get',
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
    <p>The API Reference can be found <a href="https://customer-deposits-registry.com/api-reference">here</a>.</p>
    <h3>Authentication</h3>

    <ol>
      <li>Generate Public/Private Keypair</li>
      <li>Save the Public Key in your User Settings</li>
      <li>Sign some data in the request to the API</li>
    </ol>
    <CodeRenderComponent codeString={authenticate}/>
    <h3>Signing Funding Addresses</h3>
    <p>TBC</p>
    <h3>Hash Email</h3>
    <p>TBC</p>;
  </>;
};

export default ApiDocsPage;
