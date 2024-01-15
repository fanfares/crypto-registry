import {createSign, randomBytes} from 'crypto';
import axios from 'axios';
import fs from 'fs';

async function testRequest() {
    const method = 'GET'; // HTTP method
    const path = '/api/system'; // Request path

    const timestamp = new Date().toISOString();
    const randomText = randomBytes(16).toString('hex'); // Random text
    const email = 'rob@excal.tv'

    const messageStr = JSON.stringify({
        timestamp, randomText, path, email
    });

    const privateKeyUTF8 = fs.readFileSync('./private-key.rsa', 'utf8');
    const privateKey = Buffer.from(privateKeyUTF8).toString('ascii')

    const sign = createSign('SHA256');
    sign.update(messageStr);
    sign.end();

    const signature = sign.sign(privateKey, 'hex');

    try {
        const result = await axios.request({
            url: `https://customer-deposits-registry.com${path}`,
            method: method,
            'content-type': 'application/json',
            headers: {
                'x-auth-nonce': messageStr,
                'x-auth-signature': signature,
            }
        })
        console.log(result.data);
    } catch (err) {
        console.log(err.message);
    }
}

testRequest();
