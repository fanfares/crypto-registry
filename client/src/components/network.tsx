import React, { useEffect, useState } from 'react';
import { NetworkService } from '../open-api';
import io from 'socket.io-client';
import BigButton from './big-button';
import ErrorMessage from './error-message';
import ButtonPanel from './button-panel';
import MessageTable from './message-table';
import BroadcastMessage from './broadcast-message';
import NodeTable from './node-table';

const socket = io({
  path: '/event'
});

const Network = () => {

  const [error, setError] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [count, setCount] = useState<number | null>(0);

  useEffect(() => {

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('count', count => {
      setCount(count);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.off('count');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []); // eslint-disable-line


  const joinNetwork = async () => {
    try {
      await NetworkService.join();
    } catch (err) {
      console.log(err);
      setError(err.message);
    }
  };

  const reset = () => {
    setCount(null);
    socket.emit('reset', new Date());
  };

  return (
    <>
      <p>Proxy: {process.env.REACT_APP_PROXY_HOST}</p>
      {isConnected ? 'Connected' : 'Disconnected'}
      <p>Count: {count ? count : '-'}</p>
      <BigButton onClick={reset}>Reset</BigButton>
      <ErrorMessage>{error}</ErrorMessage>
      <ButtonPanel>
        <BigButton onClick={joinNetwork}>Join Network</BigButton>
      </ButtonPanel>
      <NodeTable socket={socket} />
      <MessageTable socket={socket} />
      <BroadcastMessage />
    </>
  );
};

export default Network;
