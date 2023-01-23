import { Message, NetworkService } from '../open-api';
import { Table } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import ErrorMessage from './error-message';

//
// const socket = io({
//   path: '/event'
// });
//

export interface MessageTableProps {
  socket: Socket;
}

const MessageTable = ({ socket }: MessageTableProps) => {
  const [error, setError] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);

  const getMessages = async () => {
    try {
      setError('');
      setMessages(await NetworkService.getMessages());
    } catch (err) {
      console.log(err.message);
      setError(err.message);
    }
  };

  useEffect(() => {
    socket.on('messages', messages => {
      setMessages(messages);
    });
    getMessages().then()
    return () => {
      socket.off('messages');
    };
  }, []); //eslint-disable-line

  const renderRow = (message: Message, index: number) =>
    <tr key={message.id}>
      <td>{index + 1}</td>
      <td>{message.type}</td>
      <td>{message.data}</td>
    </tr>;

  const renderTable = () =>
    <Table striped bordered hover>
      <thead>
      <tr key="header">
        <th>#</th>
        <th>Type</th>
        <th>Data</th>
      </tr>
      </thead>
      <tbody>
      {messages.map((message, i) => renderRow(message, i))}
      </tbody>
    </Table>;

  return (
    <>
      <h3>Messages</h3>
      {renderTable()}
      <ErrorMessage>{error}</ErrorMessage>
    </>
  );
};

export default MessageTable;
