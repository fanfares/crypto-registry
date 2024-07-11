# CDR Maintenance Instructions

## 1. Bitcoin Core

### 1.1 Starting the Services

1. sudo systemctl daemon-reload (if you make changes to service definitions)
2. sudo systemctl enable bitcoind (enables start on boot)
3. sudo systemctl start bitcoind (start it up)
4. journalctl -u bitcoind -n 30 (check the logs)
5. bitcoin-cli -testnet getblockchaininfo (check it's running)
6. bitcoin-cli -testnet getbestblockhash (to check if it's synced)
7. Compare with https://blockstream.info/api/blocks/tip/hash or https://blockstream.info/testnet/api/blocks/tip/hash
8. bitcoin-cli getblockcount - to find sync status, and compare
   with https://www.blockchain.com/explorer/blocks/btc?page=1

or, bitcoind -testnet -daemon

### 1.2 Certificate Expiry

See below item 4 on how to create new certificates.

# 2. Bitcoin Core
## 2.1 Installation

Download binaries, etc. tbc

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
   curl -v --user username:password --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblockchaininfo", "
   params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/


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

When asked to enter 'Common Name', you must use the Public IPv4 DNS. Get it from the AWS Console

5. Configure the client  
   Copy the contents of bitcoin.crt into a file called bitcoin-core-mainnet.crt in your api/.certs directory.

   Make sure this is the same file name in your .env.

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

# 3. ElectrumX

## 3.1 Starting

1. sudo systemctl restart electrumx
2. ElectrumX will sync immediately it starts and you cannot connect.
3. Check the Logs - journalctl -u electrumx -f -n 30

## 3.2 Installation

1. Follow Installation instructions here;
   https://electrumx.readthedocs.io/en/latest/HOWTO.html

Key files:

- /etc/electrumx.conf
- /etc/systemd/system/electrumx.service

One installed and synced, check the server is running

```
cd ~
./electrumx/electrumx_rpc -p 8000 getinfo
```

We are connecting both testnet and mainnet on port 50010. This is set in the electrumx.config and
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
SERVICES = rpc://localhost:8000,tcp://0.0.0.0:50001,ws://0.0.0.0:50010,ssl://0.0.0.0:50002
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

7. Restart ElectrumX and CDR API.

```
sudo systemctl restart electrumx
sudo systemctl restart crypto-registry.service
```

## 3.3 Troubleshooting ElectrumX

Try compacting the database, by creating and running the following script (this one is setup for testnet).

On our testnet server, this is called compact.sh. So just re-run it.

   ```
   export DAEMON_URL="http://username:password@localhost:18332"           
   export DB_DIRECTORY=/home/ubuntu/electrumx-db                                 
   export COIN=Bitcoin                                                           
   export NET=testnet                                                            
   export PEER_ANNOUNCE=""                                                       
   export PEER_DISCOVERY=""                                                      
   export SERVICES="rpc://localhost:8000,ssl://0.0.0.0:50002"                    
   export REPORT_SERVICES=""                                                     
   export INITIAL_CONCURRENT=100                                                 
   export COST_SOFT_LIMIT=100000                                                 
   export COST_HARD_LIMIT=1000000                                                
   export REQUEST_SLEEP=30000                                                    
   export SSL_CERTFILE=/home/ubuntu/electrumx.crt                                
   export SSL_KEYFILE=/home/ubuntu/electrumx.key
   
   ./electrumx/electrumx_compact_history
   ```

3. Check the Logs
```
journalctl -u electrumx -f -n 30
```  

3. Get Status
```
./electrumx/electrumx_rpc -p 8000 getinfo 
```  
Where 8000 is a port set in /etc/systemd/system/electrumx.service

# 4. CDR API
## 4.1 Installation 
1. Start BitCoin and ElectrumX (see above)
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

3. Check the Logs
```
journalctl -u crypto-registry -f -n 30
```

## 4.2 Troubleshooting

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
