# CDR Maintenance Instructions

### Bitcoin Core 
## Starting the Services
1. sudo systemctl daemon-reload (if you make changes to service definitions)
2. sudo systemctl enable bitcoind (enables start on boot)
3. sudo systemctl start bitcoind (start it up)
4. journalctl -u bitcoind -n 30 (check the logs)
5. bitcoin-cli -testnet getblockchaininfo (check it's running)
6. bitcoin-cli -testnet getbestblockhash (to check if it's synced)
7. Compare with https://blockstream.info/api/blocks/tip/hash or https://blockstream.info/testnet/api/blocks/tip/hash
8. bitcoin-cli getblockcount - to find sync status, and compare with https://www.blockchain.com/explorer/blocks/btc?page=1

or, bitcoind -testnet -daemon

### Bitcoin Core 
## Installation

Download binaries, etc.  tbc

Create a bitcoin.conf file in the .bitcoin directory.

```
server=1
rpcuser=robertporter
rpcpassword=Helicopter2
rpcallowip=127.0.0.1
txindex=1
```

1. Start the bitcoin node   
   bitcoind -testnet -daemon


2. Test the HTTP service.  
   curl -v --user username:password --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblockchaininfo", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/


3. Install Reverse Proxy to expose Bitcoin Http to Https & Internet
```
sudo apt update
sudo apt install nginx
```

4. Create a Private Key and Public Certificate
```
cd /etc/nginx
sudo mkdir ssl
cd ssl
sudo openssl genrsa -out bitcoin.key 2048
sudo openssl req -new -x509 -key bitcoin.key -out bitcoin.crt
```
When asked to enter 'Common Name', you must use the hostname server name.  Get it from the AWS Console - Public IPv4 DNS


5. Configure the client  
   Copy the contents of bitcoin.crt into a file called bitcoin-mainnet.crt in your api/.certs directory.


6. Configure Nginx Server  
   Edit /etc/nginx/ngnin.conf, and copy the definition below.
````
  ## Reverse Proxy for Bitcoin Mainnet
  server {
          listen 443;
          ssl on;
          ssl_certificate /etc/nginx/ssl/bitcoin.crt;
          ssl_certificate_key /etc/nginx/ssl/bitcoin.key;

      location / {
          proxy_pass http://localhost:8332;
          proxy_set_header Host $host;
      }
  }
````

7. Start the Nginx Server
```
sudo systemctl restart nginx
```

### ElectrumX 
## Starting
1. sudo systemctl restart electrumx 
2. ElectrumX will sync immediately it starts and you cannot connect.
3. Check the Logs - journalctl -u electrumx -f -n 30

## Installation

1. Follow Installation instructions here;
https://electrumx.readthedocs.io/en/latest/HOWTO.html

Key files:
- /etc/electrumx.config
- /etc/systemd/system/electrumx.service

One installed and synced, check the server is running
```
./electrumx/electrumx_rpc -p 8000 getinfo
```
We are connecting both testnet and mainnet on port 50010.  This is set in the electrumx.config and
the value for the ELECTRUM_MAINNET_URL environment variable in the .env file is ws://x.x.x.x:50010.

2. Create and Install SSL Certificates.
https://electrumx.readthedocs.io/en/latest/HOWTO.html#creating-a-self-signed-ssl-certificate

When creating the certificate, use the long "Public IPv4 DNS" as the Common Name.  

Rename the crt, key and csr files to electrumx.crt, etc.

3. Modify the electrumx.conf
```
COIN = Bitcoin
NET = mainnet
DB_DIRECTORY = /home/ubuntu/electrumx-db
DAEMON_URL = robporter:Helicopter2@127.0.0.1:8332
PEER_DISCOVERY = off
COST_SOFT_LIMIT = 0
COST_HARD_LIMIT = 0
SERVICES = rpc://localhost:8000,tcp://0.0.0.0:50001,ws://0.0.0.0:50010,ssl://0.0.0.0/50002
SSL_CERTFILE=/home/ubuntu/electrumx.crt
SSL_KEYFILE=/home/ubuntu/electrumx.key
```

4. Open the SSL Port on AWS.
Edit the inbound rules on the Instance Security Group

Create an Entry - Custom TCP - 50002 - 0.0.0.0/0

5. Install the CRT into the API
Copy the contents of electrumx.crt into ./api/.certs/electrumx-${network}.crt
Where network is testnet or mainnet.

6. Update /api/.env
There should be two records:
ELECTRUM_TESTNET_URL=ssl://ec2-18-170-107-186.eu-west-2.compute.amazonaws.com:50002
ELECTRUM_MAINNET_URL=ssl://ec2-18-171-201-72.eu-west-2.compute.amazonaws.com:50002

Where the machine name matches what you entered into the Cert Common Name.

### CDR API
1. Start BitCoin and ElectrumX
2. Build and Serve the API
````
- git pull
- cd api 
- pnpm i 
- pnpm run build
- cd ../client
- pnpm run build
- sudo systemctl restart crypto-registry.service
````
3. Test the Server  
```
journalctl -u crypto-registry -f -n 30
./electrumx/electrumx_rpc -p 8000 getinfo 
```  
Where 8000 is a port set in /etc/systemd/system/electrumx.service


## Troubleshooting

### How to increase disk space on EC2
Typically, the Bitcoin Node will run out of disk space. Here's how to fix that.
1. Edit the volume in the EC2 Terminal
2. Login to the instance.
3. lsblk - verify the instance can see the new disk space. See the 1T below.
````
ubuntu@ip-172-31-45-147:~$ lsblk
NAME         MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
loop0          7:0    0  55.6M  1 loop /snap/core18/2745
loop1          7:1    0  24.4M  1 loop /snap/amazon-ssm-agent/6312
loop2          7:2    0  55.7M  1 loop /snap/core18/2790
loop3          7:3    0  63.3M  1 loop /snap/core20/1879
loop4          7:4    0 111.9M  1 loop /snap/lxd/24322
loop5          7:5    0  40.9M  1 loop /snap/snapd/20290
loop6          7:6    0  63.5M  1 loop /snap/core20/2015
loop7          7:7    0  53.2M  1 loop /snap/snapd/19122
nvme0n1      259:0    0     1T  0 disk
├─nvme0n1p1  259:1    0 255.9G  0 part /
├─nvme0n1p14 259:2    0     4M  0 part
└─nvme0n1p15 259:3    0   106M  0 part /boot/efi
````
4. sudo growpart /dev/nvme0n1 1 - resizes the partition.
5. sudo resize2fs /dev/nvme0n1p1 - resizes the file system



# CDR Server

Prerequisites
--------------
1. Create Linux Instance (at least 2G RAM, 32 Gb disk) 
2. Install NVM 
3. Install Node 18.17.0
4. Create MongoDb Instance
5. Create AWS SES Account
6. Create Your Node's Domain.
7. Email Address at the Domain with an Inbox (e.g. admin@domain.com)
8. Clone the Repo git@github.com:project-excalibur/crypto-registry.git

To operate, you will need a testnet (or mainnet) wallet with funds to represent an Exchange

Build Instructions
-------------------
cd api
npm install
cd ../client
npm install
npm run build

Configuration
-------------
1. Cut & paste the .env.example to .env.<node-name>
2. Add the following environment variable to your profile e.g. .bash_profile
   - export NODE_ENV='node name'
3. Generate your security keys
   - cd api
   - npm i
   - npm run generate-security-keys
   - Copy paste the output int the .env file, overwriting the last 3 variables
4. Complete the remaining items in the square brackets

Start Up
--------
npm run start:node

Join the network
----------------
Login, and Navigate to the Network Page.
Input the URL of another node on the network


Container Build Instructions
============================

Alternatively, you can run 

1. From root directory; docker build -t bcr .
2. To test run container locally; docker run -it bcr
3. To login to container; docker run -it bcr bash
4. Tag the image; docker tag bcr 123129844539.dkr.ecr.eu-west-2.amazonaws.com/bcr:latest
5. Login to ECR; aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin
   123129844539.dkr.ecr.eu-west-2.amazonaws.com
6. Push image to ECR; docker push 123129844539.dkr.ecr.eu-west-2.amazonaws.com/bcr:latest
7. Update the service: aws ecs update-service --cluster bcr --service bcr-service --force-new-deployment

To run it locally
docker -p 3005:3005 bcr


How to start Electrum Testnet
=============================
open -n /Applications/Electrum.app –args –testnet


Installing Mainnet Node
=======================

1. Create an AWS EC2 Instance (t3.medium)
