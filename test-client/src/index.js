import {createSign, randomBytes} from 'crypto';
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
}

testRequest();
