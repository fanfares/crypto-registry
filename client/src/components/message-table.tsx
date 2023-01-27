import { MessageDto } from '../open-api';
import { Table } from 'react-bootstrap';

export interface MessageTableProps {
  messages: MessageDto[];
}

const MessageTable = ({ messages }: MessageTableProps) => {

  const renderRow = (message: MessageDto, index: number) =>
    <tr key={message.id}>
      <td>{index + 1}</td>
      <td>{message.isSender ? 'Sent' : 'Received'}</td>
      <td>{message.senderName}</td>
      <td>{message.type}</td>
      <td>{message.data}</td>
    </tr>;

  const renderTable = () =>
    <Table striped bordered hover>
      <thead>
      <tr key="header">
        <th>#</th>
        <th>Sent/Received</th>
        <th>Sender</th>
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
    </>
  );
};

export default MessageTable;
