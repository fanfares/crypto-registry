import React, { useState } from 'react';
import Error from './error';
import { NetworkService } from '../open-api';
import { Button } from 'react-bootstrap';

const PingNetwork = () => {
  const [error, setError] = useState();

  const sendPing = async () => {
    try {
      await NetworkService.broadcastPing();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <Error>{error}</Error>
      <Button onClick={sendPing}
              type="button">
        Broadcast Ping
      </Button>
    </div>
  );

};

export default PingNetwork;
