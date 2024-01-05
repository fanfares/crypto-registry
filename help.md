392  sudo vi /etc/electrumx.conf
430  git clone https://github.com/spesmilo/electrumx.git
438  mkdir electrumx-db
440  cd electrumx
442  cp contrib/systemd/electrumx.service /etc/systemd/system/
443  sudo cp contrib/systemd/electrumx.service /etc/systemd/system/
466  sudo vi electrumx.conf
478  ls /usr/local/bin/electrumx_server
479  sudo vi /etc/systemd/system/electrumx.service
482  sudo systemctl start electrumx
483  sudo systemctl stop electrumx
486  journalctl -u electrumx -f
488  ps aux | grep electrum
697  ./electrumx/electrumx_rpc -p 50001 getinfo
698  ps aux | grep electrumx
705  journalctl -u electrumx -f
709  sudo vi /etc/electrumx.conf
710  sudo systemctl restart electrumx
711  sudo vi /etc/electrumx.conf
712  sudo systemctl restart electrumx
713  ./electrumx/electrumx_rpc -p 50001 getinfo
714  ./electrumx/electrumx_rpc -p 50001 -h  getinfo
715  cat /etc/electrumx.conf
717  cat /etc/electrumx.conf
718  sudo vi /etc/electrumx.conf
719  sudo systemctl restart electrumx
720  cat /etc/electrumx.conf
722  sudo vi /etc/electrumx.conf
723  sudo systemctl restart electrumx
724  ./electrumx/electrumx_rpc -p 50001 -h  getinfo
725  ./electrumx/electrumx_rpc -p 50001 getinfo
726  cat /etc/electrumx.conf
727  ./electrumx/electrumx_rpc -p 50001 get_info
728  ./electrumx/electrumx_rpc -p 50001 getinfo
729  sudo vi /etc/electrumx.conf
730  sudo systemctl restart electrumx
731  ./electrumx/electrumx_rpc -p 50001 getinfo
732  ./electrumx/electrumx_rpc -p 8000 getinfo
733  ./electrumx/electrumx_rpc -p 50001 getinfo
734  cat /etc/electrumx.conf
735  sudo vi /etc/electrumx.conf
736  sudo systemctl restart electrumx
737  ./electrumx/electrumx_rpc -p 50001 getinfo
738  ./electrumx/electrumx_rpc -p 50001 bitcoin.account.balance
740  cat /etc/electrumx.conf
741  sudo vi /etc/electrumx.conf
742  sudo systemctl restart electrumx
743  ./electrumx/electrumx_rpc -p 8000 getinfo
744  ./electrumx/electrumx_rpc getinfo
745  ./electrumx/electrumx_rpc -p 8000 getinfo
746  cat /etc/electrumx.conf
747  sudo vi /etc/electrumx.conf
748  sudo systemctl restart electrumx
749  ./electrumx/electrumx_rpc -p 8000 getinfo
750  ./electrumx/electrumx_rpc  getinfo
751  ./electrumx/electrumx_rpc log
753  sudo vi /etc/electrumx.conf
754  sudo systemctl restart electrumx
755  cat /etc/electrumx.conf
768  journalctl -u electrumx -f
769  sudo systemctl start electrumx
770  journalctl -u electrumx -f
771  sudo systemctl start electrumx
772  sudo systemctl status electrumx
775  sudo systemctl status electrumx
776  journalctl -u electrumx -f
780  sudo systemctl status electrumx
781  sudo systemctl start electrumx
782  journalctl -u electrumx -f
789  sudo systemctl start electrumx
790  journalctl -u electrumx -f
791  sudo systemctl restart electrumx
792  journalctl -u electrumx -f
793  sudo systemctl restart electrumx
794  journalctl -u electrumx -f
795  cat /etc/electrumx.conf
807  ps aux | grep electrumx
809  journalctl -u electrumx -f
812  systemctl restart electrumx
813  sudo systemctl restart electrumx
817  journalctl -u electrumx -f
818  ps aux | grep electrumx
843  ps -deaf | grep electrum
847  ./electrumx/electrumx_rpc -p 50001 bitcoin.account.balance
848  history | grep electrum
849  ./electrumx/electrumx_rpc -p 50001 bitcoin.account.balancesudo systemctl restart electrumx
850  sudo systemctl restart electrumx
851  journalctl -u electrumx -f
874  history | grep electrum




== Blockchain ==                                                                                                                                                  
getbestblockhash                                                                                                                                                  
getblock "blockhash" ( verbosity )                                                                                                                                
getblockchaininfo                                                                                                                                                 
getblockcount                                                                                                                                                     
getblockfilter "blockhash" ( "filtertype" )                                                                                                                       
getblockhash height                                                                                                                                               
getblockheader "blockhash" ( verbose )                                                                                                                            
getblockstats hash_or_height ( stats )                                                                                                                            
getchaintips                                                                                                                                                      
getchaintxstats ( nblocks "blockhash" )                                                                                                                           
getdifficulty                                                                                                                                                     
getmempoolancestors "txid" ( verbose )                                                                                                                            
getmempooldescendants "txid" ( verbose )                                                                                                                          
getmempoolentry "txid"                                                                                                                                            
getmempoolinfo                                                                                                                                                    
getrawmempool ( verbose mempool_sequence )                                                                                                                        
gettxout "txid" n ( include_mempool )                                                                                                                             
gettxoutproof ["txid",...] ( "blockhash" )                                                                                                                        
gettxoutsetinfo ( "hash_type" hash_or_height use_index )                                                                                                          
preciousblock "blockhash"                                                                                                                                         
pruneblockchain height                                                                                                                                            
savemempool                                                                                                                                                       
scantxoutset "action" ( [scanobjects,...] )                                                                                                                       
verifychain ( checklevel nblocks )                                                                                                                                
verifytxoutproof "proof"

== Control ==                                                                                                                                                     
getmemoryinfo ( "mode" )                                                                                                                                          
getrpcinfo                                                                                                                                                        
help ( "command" )                                                                                                                                                
logging ( ["include_category",...] ["exclude_category",...] )                                                                                                     
stop                                                                                                                                                              
uptime

== Generating ==                                                                                                                                                  
generateblock "output" ["rawtx/txid",...]                                                                                                                         
generatetoaddress nblocks "address" ( maxtries )                                                                                                                  
generatetodescriptor num_blocks "descriptor" ( maxtries )

== Mining ==                                                                                                                                                      
getblocktemplate ( "template_request" )                                                                                                                           
getmininginfo                                                                                                                                                     
getnetworkhashps ( nblocks height )                                                                                                                               
prioritisetransaction "txid" ( dummy ) fee_delta                                                                                                                  
submitblock "hexdata" ( "dummy" )                                                                                                                                 
submitheader "hexdata"

== Network ==                                                                                                                                                     
addnode "node" "command"                                                                                                                                          
clearbanned                                                                                                                                                       
disconnectnode ( "address" nodeid )                                                                                                                               
getaddednodeinfo ( "node" )                                                                                                                                       
getconnectioncount                                                                                                                                                
getnettotals                                                                                                                                                      
getnetworkinfo                                                                                                                                                    
getnodeaddresses ( count "network" )                                                                                                                              
getpeerinfo                                                                                                                                                       
listbanned                                                                                                                                                        
ping                                                                                                                                                              
setban "subnet" "command" ( bantime absolute )                                                                                                                    
setnetworkactive state

== Rawtransactions ==                                                                                                                                             
analyzepsbt "psbt"                                                                                                                                                
combinepsbt ["psbt",...]                                                                                                                                          
combinerawtransaction ["hexstring",...]                                                                                                                           
converttopsbt "hexstring" ( permitsigdata iswitness )                                                                                                             
createpsbt [{"txid":"hex","vout":n,"sequence":n},...] [{"address":amount,...},{"data":"hex"},...] ( locktime replaceable )                                        
createrawtransaction [{"txid":"hex","vout":n,"sequence":n},...] [{"address":amount,...},{"data":"hex"},...] ( locktime replaceable )                              
decodepsbt "psbt"                                                                                                                                                 
decoderawtransaction "hexstring" ( iswitness )                                                                                                                    
decodescript "hexstring"                                                                                                                                          
finalizepsbt "psbt" ( extract )                                                                                                                                   
fundrawtransaction "hexstring" ( options iswitness )                                                                                                              
getrawtransaction "txid" ( verbose "blockhash" )                                                                                                                  
joinpsbts ["psbt",...]                                                                                                                                            
sendrawtransaction "hexstring" ( maxfeerate )                                                                                                                     
signrawtransactionwithkey "hexstring" ["privatekey",...] ( [{"txid":"hex","vout":n,"scriptPubKey":"hex","redeemScript":"hex","witnessScript":"hex","amount":amount
htype" )                                                                                                                                                          
testmempoolaccept ["rawtx",...] ( maxfeerate )                                                                                                                    
utxoupdatepsbt "psbt" ( ["",{"desc":"str","range":n or [n,n]},...] )

== Signer ==                                                                                                                                                      
enumeratesigners

== Util ==                                                                                                                                                        
createmultisig nrequired ["key",...] ( "address_type" )                                                                                                           
deriveaddresses "descriptor" ( range )                                                                                                                            
estimatesmartfee conf_target ( "estimate_mode" )                                                                                                                  
getdescriptorinfo "descriptor"                                                                                                                                    
getindexinfo ( "index_name" )                                                                                                                                     
signmessagewithprivkey "privkey" "message"                                                                                                                        
validateaddress "address"                                                                                                                                         
verifymessage "address" "signature" "message"

== Wallet ==                                                                                                                                                      
abandontransaction "txid"                                                                                                                                         
abortrescan                                                                                                                                                       
addmultisigaddress nrequired ["key",...] ( "label" "address_type" )                                                                                               
backupwallet "destination"                                                                                                                                        
bumpfee "txid" ( options )                                                                                                                                        
createwallet "wallet_name" ( disable_private_keys blank "passphrase" avoid_reuse descriptors load_on_startup external_signer )                                    
dumpprivkey "address"                                                                                                                                             
dumpwallet "filename"                                                                                                                                             
encryptwallet "passphrase"                                                                                                                                        
getaddressesbylabel "label"                                                                                                                                       
getaddressinfo "address"                                                                                                                                          
getbalance ( "dummy" minconf include_watchonly avoid_reuse )                                                                                                      
getbalances                                                                                                                                                       
getnewaddress ( "label" "address_type" )                                                                                                                          
getrawchangeaddress ( "address_type" )                                                                                                                            
getreceivedbyaddress "address" ( minconf )                                                                                                                        
getreceivedbylabel "label" ( minconf )                                                                                                                            
gettransaction "txid" ( include_watchonly verbose )                                                                                                               
getunconfirmedbalance                                                                                                                                             
getwalletinfo                                                                                                                                                     
importaddress "address" ( "label" rescan p2sh )                                                                                                                   
importdescriptors "requests"                                                                                                                                      
importmulti "requests" ( "options" )                                                                                                                              
importprivkey "privkey" ( "label" rescan )                                                                                                                        
importprunedfunds "rawtransaction" "txoutproof"                                                                                                                   
importpubkey "pubkey" ( "label" rescan )                                                                                                                          
importwallet "filename"                                                                                                                                           
keypoolrefill ( newsize )                                                                                                                                         
listaddressgroupings                                                                                                                                              
listdescriptors                                                                                                                                                   
listlabels ( "purpose" )                                                                                                                                          
listlockunspent                                                                                                                                                   
listreceivedbyaddress ( minconf include_empty include_watchonly "address_filter" )                                                                                
listreceivedbylabel ( minconf include_empty include_watchonly )                                                                                                   
listsinceblock ( "blockhash" target_confirmations include_watchonly include_removed )                                                                             
listtransactions ( "label" count skip include_watchonly )                                                                                                         
listunspent ( minconf maxconf ["address",...] include_unsafe query_options )                                                                                      
listwalletdir                                                                                                                                                     
listwallets                                                                                                                                                       
loadwallet "filename" ( load_on_startup )                                                                                                                         
lockunspent unlock ( [{"txid":"hex","vout":n},...] )                                                                                                              
psbtbumpfee "txid" ( options )                                                                                                                                    
removeprunedfunds "txid"                                                                                                                                          
rescanblockchain ( start_height stop_height )                                                                                                                     
send [{"address":amount,...},{"data":"hex"},...] ( conf_target "estimate_mode" fee_rate options )                                                                 
sendmany "" {"address":amount,...} ( minconf "comment" ["address",...] replaceable conf_target "estimate_mode" fee_rate verbose )                                 
sendtoaddress "address" amount ( "comment" "comment_to" subtractfeefromamount replaceable conf_target "estimate_mode" avoid_reuse fee_rate verbose )              
sethdseed ( newkeypool "seed" )                                                                                                                                   
setlabel "address" "label"                                                                                                                                        
settxfee amount                                                                                                                                                   
setwalletflag "flag" ( value )                                                                                                                                    
signmessage "address" "message"                                                                                                                                   
signrawtransactionwithwallet "hexstring" ( [{"txid":"hex","vout":n,"scriptPubKey":"hex","redeemScript":"hex","witnessScript":"hex","amount":amount},...] "sighasht
unloadwallet ( "wallet_name" load_on_startup )                                                                                                                    
upgradewallet ( version )                                                                                                                                         
walletcreatefundedpsbt ( [{"txid":"hex","vout":n,"sequence":n},...] ) [{"address":amount,...},{"data":"hex"},...] ( locktime options bip32derivs )                
walletdisplayaddress bitcoin address to display                                                                                                                   
walletlock                                                                                                                                                        
walletpassphrase "passphrase" timeout                                                                                                                             
walletpassphrasechange "oldpassphrase" "newpassphrase"                                                                                                            
walletprocesspsbt "psbt" ( sign "sighashtype" bip32derivs )                                                                                                       



journalctl -u electrumx -f -n 30

sudo systemctl start electrumx
sudo systemctl restart electrumx
sudo systemctl status electrumx

./electrumx/electrumx_rpc -p 8000 getinfo

'getinfo', 
'groups', 
'peers', 
'sessions', 
'stop',
'disconnect',
'log', 
'add_peer', 
'daemon_url',
'query',
'reorg', 
'debug_memusage_list_all_objects', 
'debug_memusage_get_random_backref_chain'



