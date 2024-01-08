import {createSign, randomBytes} from 'crypto';
import axios from 'axios';

const prvBase64 = 'LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFcFFJQkFBS0NBUUVBcEZxT3BxMjVHeXNjVDF5L2NDS0Q4U0I3a1BaRjI0Z0pReTE0U2VVMzJDdlZNTGxrCnF2Y0hDcFhjbGZuc0RNcTRMcFRody8xZm02WUN5b3prT3ExaFhMcDN2ZXFTcElBbVl5Nzc4YzNIeGxIQTlXd28KRWNBaXRnSDgrQ0t5cHVxYTFaZjRhV2hmTFBDdGxNbUw5ZEdkVjhjSkxZbStEUFZYeXFIcmtGaEYvT1pGckFMcApCOHRoTnBWMExYeWplb0RCZXMwQjhYODBqVjFUUkc3Sm1ncVVRMUlLSUFFL3NQTWJBVzhtRlZybGNBaWVDY1ljCjR6TjZOZWtSWENCTVYwd1dCaFFFSURITFJRdTJVcmw4NEppSWZaV1J3bnd5T3dkd1ljMTBsbklVZk1oa1EzdWMKRkpJUTZ6MjJQUkcxNmFiR0lSWVdSTHJzM0RYdzJ0T04zRG5FZ3dJREFRQUJBb0lCQVFDRkJYSmR2MCtKaUx2eQpFOXd4OHcyZE5MQXVKTlZubUZQKzFpZDhqNVJDVnovR250YTJkUmR5M3RaWllKMUh3UytQTEJzS1dPRndCYzVPCmgvZ1U4YzFTa3UxbGZoelFIWlIwUkV2UWFzQWRhSC9uWTNHTzVGWnp2Mm95bjBxL1JEU3JXY1BKOUpyTHNjU2MKSHdBenBrTldEeGNEajIrTjUyajE3VlhPVDFQZUdtblFZS0FkcXY2dG1MU2ErbGkyNjZlUkM0cm94SEd1M05uNgpEdlRTOEUzSUhLUTJLMUFDelRBVjVYbFgwSGhFcWNyVUkwM2hvdWdyTU1yMTR6SlEyUU1nYUVTUFN5encwQlZWCi93MlM1YlM3YytKR1hHbFhtU29ldnQxdUVqVzlKSmwzWGVqZ1lTUm14WUpRUENXSGJtYmt1VjhOQmFobWQ1Wk4KOWNGR09hdkJBb0dCQU5WVCtQdDBBaXFDb0Jjb3YxaktaeFBVbnIvcWdxZVZpOHhFdHJodkhCM1RTRHVkeitMNwpVSkJIRzRoK0h2alpPL0FLaklDUHpkN0tiZ2tIc003UkhQajRrc3dEcFF3eGpPSDZWZHdaN2ZieUFtYndrSHFVCnVzS2pZV3ZDKzcvRTZGQTQ0cDVEazJnQitldHpPN0xZc0xUZjZ4S3dCcUROQUlGVDRCczh2TjZqQW9HQkFNVTYKdWdsT3dWbWFqUlRDMWo2OG03U1dBS1BrbVAzN3Y5SU5mbGN3RWlQS1lSZlVpVUhpY09zd3Jibk1odFVWbjhFZApPcllBZDlQRlhFZGZSUTFMTmRFNjMra3JtRFVwSHpENitZczJaZUgvbUhMU2JkWExZZFZtMlcrQ2x4R0djcU85CkwrMWFRanFMWFlMTkRFM0o1UWl1dCtPZnpTR054eDRvaTBDUW8wQ2hBb0dCQU5RV2ZEOWlncFRJOFdpVTlrZk0KVXRhQVdLUHMvcUNtS1NxWVZpRGZObERnc2J1emxlN1FkTFE4UGI5aHhHRWJlRitaM1Q0anVrVjVkQlErTlNZbworR2orbU5PRC9CODNWQjJHeUwzZWVaczkxKzJIMWR4STZiU0F3bVprbisxMFVwTVBPeDZsaUhPckkxRldhMC9QCjV6NnNNQVdRUThheWlZSUtaWkF1dm9lSkFvR0JBSldCZWVwNlQ2anJ0Z3hKMFh4SEhzVGFmR3ZBYXBVRkZCaFgKY0RFSldJYlc3NWpQM0tnYnpic0s4SFlLYXg3MXdGNzBHRUJFeEpDOFo4SVdudEovODdEQ0wxK2lVMFBoQXlydQo1T0U1Z0N1N3c4VXViR0lIUlFjdWFwN1Q0RTVCbTM4eGR6WTJHRVFteHVEVExJTi9DdVgxQTZKQnpZNmsyWTZyCjd6c25LUWxoQW9HQUIxdjltTDdRVWRpMC9NY0Rvd0hnRGRiMzI4a3ROR0lPYUZiVllXeWJBVG5xTmJER003T1kKU3JraGNraGZxcWhqclJJZTkwSHlEMFFlUFRleEY0Q1BNTGFFMk9reTVTeWFaSDh1eVZmbUZyTy96UEFhcE11OQpMVCt1UUxnbkpqdlhrRlBoZ0VVNTFOWmlSMzhxR1QrV2czR1htZWgzcnFIUEhuY3gwcXE4R2hjPQotLS0tLUVORCBSU0EgUFJJVkFURSBLRVktLS0tLQo'

async function testRequest() {
    const method = 'GET'; // HTTP method
    const path = '/api/system'; // Request path

    const timestamp = new Date().toISOString();
    const randomText = randomBytes(16).toString('hex'); // Random text
    const email = 'rob@excal.tv'

    const messageStr = JSON.stringify({
        timestamp, randomText, path, email
    });

    const privateKey = Buffer.from(prvBase64, 'base64').toString('ascii')
    console.log(privateKey);
    const sign = createSign('SHA256');
    sign.update(messageStr);
    sign.end();

    const signature = sign.sign(privateKey, 'hex');

    try {
        const result = await axios.request({
            url: `http://localhost:3101${path}`,
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
