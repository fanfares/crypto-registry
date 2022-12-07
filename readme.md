Build Instructions
==================

1. From root directory; docker build -t bcr .
2. To test run container locally; docker run -it bcr
3. To login to container; docker run -it bcr bash  
4. Tag the image; docker tag bcr 123129844539.dkr.ecr.eu-west-2.amazonaws.com/bcr:latest
5. Login to ECR; aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin 123129844539.dkr.ecr.eu-west-2.amazonaws.com
6. Push image to ECR; docker push 123129844539.dkr.ecr.eu-west-2.amazonaws.com/bcr:latest
7. Update the service: aws ecs update-service --cluster bcr --service bcr-service --force-new-deployment

To run it locally
docker -p 3005:3005 bcr

Bitcoin Custodian Registry
===========================

A proposal to create an application that allows bitcoin holdings by custodians to be audited and to confirm that the
balance of the customer’s accounts are in fact backed by on-chain bitcoin held in a wallet controlled by the custodian.
We will provide an opportunity for the bitcoin community to audit itself by allowing each customer to spot check their
balance against confined on-chain holdings. We will give custodians an application that allows them to demonstrate that
they are holding customer bitcoin on chain. Customers will be the auditors as they will the use the application to check
that their balance is backed by actual bitcoin in a wallet held by the custodian. Proof of bitcoin ownership can be
provided programatically by the BCR (Bitcoin Custodian Registry) without exposing customer details to the public.

Key Features:

1. Bitcoin custodians can register their client funds wallet address along with a contact email address on the BCR
   website and make a small payment from that address to prove ownership.
2. Custodians that have registered will be emailed details of how to access the API and in what format to provide the
   encrypted customer data.
3. Each row of the data they provide will contain the sha256 encrypted version of the customer email address along with
   the balance of that customer’s account.
4. A Bitcoin custodian is any excahnge, defi protocol or any kind of custodial wallet that holds bitcoin on someone’s
   behalf. The data from each custodian can be uploaded to the BCR website on a daily basis.
5. Customers of custodians will enter their email address into the website and then they are emailed the balance of
   their bitcoin account along with the custodian that holds that balance for them. In the background the website will
   hash the customer email address and search for matches in the uploaded data in order to identify the customer
   balance.
6. The data structure itself is simple, three columns, hash of email address, name of custodian, number of bitcoins.
7. The total of the customer holdings should be equal to the holdings in the customer wallets.

The fee provides proof of ownership as it should be paid from the wallets that are submitted as being owned by their
clients. The custodian can pass on the fee to the customers pro rata their bitcoin holding on their own site. Everyone
that has an account with a BCR compliant custodian has security of knowing that their bitcoin is on chain and fully
backed.

There is no breach of trust if the SHA256 hash of the customer email address is being disclosed as this is a one way
encryption process. It is not feasible to derive the email from the hash as SHA256 has never been broken. The auditors
are everyone in the bitcoin community that has their coins with a custodian. By checking their registered email with the
BCR website they are serving the whole community in providing confidence that the bitcoin is being held on chain. This
registry is for the benefit of anyone present or future who wants to hold their coins without holding their keys. The
code for the website will be open source and deployed on immutable distributed storage.

Bitcoin was developed to be a trustless, peer-to-peer network where digital assets can only be used once. What has
evolved in the space is a layer of trust, centralization and the distinct possibility that bitcoins are being sold to
people more than once by at least some of these trusted counterparties. It is possible that some custodians may have
more customer accounts that show a total bitcoin ownership that is greater than the bitcoin held in the exchange
controlled wallets. This app will provide authenticity to Bitcoin custodians that are provide a fully backed service to
their clients.
