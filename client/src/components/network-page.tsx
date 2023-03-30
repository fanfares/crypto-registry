import React, { useEffect, useState } from 'react';
import { NetworkService, NodeDto } from '../open-api';
import Error from './error';
import NodeTable from './node-table';
import JoinNetwork from './join-network';
// import PingNetwork from './ping-network';
import { useWebSocket } from '../store';
import { CentreLayoutContainer } from './centre-layout-container';

const NetworkPage = () => {

  const [error, setError] = useState<string>('');
  const [networkNodes, setNetworkNodes] = useState<NodeDto[]>([]);
  // const [nodeName, setNodeName] = useState<string>('');
  // const [nodeAddress, setNodeAddress] = useState<string>('');
  const { getSocket } = useWebSocket();

  useEffect(() => {
    getNetworkStatus().then();

    getSocket().on('nodes', nodes => {
      setNetworkNodes(nodes);
    });

    return () => {
      getSocket().off('nodes');
    };
  }, []); // eslint-disable-line

  const getNetworkStatus = async () => {
    setError('');
    try {
      const networkStatus = await NetworkService.getNetworkStatus();
      setNetworkNodes(networkStatus.nodes);
      // setNodeAddress(networkStatus.address);
      // setNodeName(networkStatus.nodeName);
    } catch (err) {
      console.log(err);
      setError(err.message);
    }
  };

  return (
    <div style={{marginTop: 20}}>
      <h3>Network Status</h3>
      {/*<p>Node Name: {nodeName}</p>*/}
      {/*<p>Node Address: {nodeAddress}</p>*/}
      {/*<p>Status: {networkNodes.length === 0 ? 'Loading...' : networkNodes.length === 1 ? 'Not connected' : 'Connected'}</p>*/}
      {/*<PingNetwork></PingNetwork>*/}
      {/*<hr/>*/}
      <Error>{error}</Error>
      <NodeTable nodes={networkNodes}/>
      {/*<hr/>*/}
      <CentreLayoutContainer>
        <JoinNetwork></JoinNetwork>
      </CentreLayoutContainer>
      {/*<hr/>*/}
    </div>
  );
};

export default NetworkPage;
