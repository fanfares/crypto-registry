import { useEffect, useState } from 'react';
import { NodeDto, NodeService } from '../../open-api';
import ErrorMessage from '../utils/errorMessage.ts';
import NodeTable from './node-table';
import JoinNetwork from './join-network';
import { getErrorMessage } from '../../utils';

const NetworkPage = () => {

  const [error, setError] = useState<string>('');
  const [networkNodes, setNetworkNodes] = useState<NodeDto[]>([]);
  // const {initWebSocket, isConnected} = useWebSocket();

  useEffect(() => {
    getNetworkStatus().then();

    //   initWebSocket().on('nodes', nodes => {
    //     setNetworkNodes(nodes);
    //   });
    //
    //   return () => {
    //     initWebSocket().off('nodes');
    //   };
  }, []); // eslint-disable-line

  const getNetworkStatus = async () => {
    setError('');
    try {
      const networkStatus = await NodeService.getNetworkStatus();
      setNetworkNodes(networkStatus.nodes);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div style={{marginTop: 20}}>
      <h3>Network Status</h3>
      <ErrorMessage>{error}</ErrorMessage>
      <NodeTable nodes={networkNodes} isConnected={true}/>
      <JoinNetwork></JoinNetwork>
    </div>
  );
};

export default NetworkPage;
