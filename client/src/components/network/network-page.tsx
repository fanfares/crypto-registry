import { useEffect, useState } from 'react';
import { NodeDto, NodeService } from '../../open-api';
import Error from '../utils/error';
import NodeTable from './node-table';
import JoinNetwork from './join-network';
import { CentreLayoutContainer } from '../utils/centre-layout-container';
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
      <Error>{error}</Error>
      <NodeTable nodes={networkNodes} isConnected={true}/>
      <CentreLayoutContainer>
        <JoinNetwork></JoinNetwork>
      </CentreLayoutContainer>
    </div>
  );
};

export default NetworkPage;
