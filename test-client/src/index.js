import {createSign, randomBytes} from 'crypto';
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
        console.log(`Request: ${url}`);
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
}

testRequest();
