import { SES } from 'aws-sdk';

const sesClientConfiguration: SES.ClientConfiguration = {
  region: 'eu-west-2',
  endpoint: 'email-smtp.eu-west-2.amazonaws.com',
  credentials: {
    accessKeyId: 'AKIARZKY4KM53ZUMNMUV',
    secretAccessKey: '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',
  }
};

const AWS_SES = new SES(sesClientConfiguration);

const sendEmail = async (recipientEmail, name) => {
  let params = {
    Source: 'rob@bitcoincustodianregistry.org',
    Destination: {
      ToAddresses: [
        recipientEmail
      ]
    },
    ReplyToAddresses: [],
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: 'This is the body of my email!'
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `Hello, ${name}!`
      }
    }
  };
  try {
    const result = await AWS_SES.sendEmail(params).promise();
    console.log(result);
  } catch ( err) {
    console.error(err);
  }
};

sendEmail('robert.porter1@gmail.com', 'Rob')
