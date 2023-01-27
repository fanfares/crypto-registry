import { MessageDto } from '../open-api';
import { Table } from 'react-bootstrap';

export interface MessageTableProps {
  messages: MessageDto[];
}

const MessageTable = ({ messages }: MessageTableProps) => {

  const renderRow = (message: MessageDto, index: number) => {

    let data = message.data;

    if (data && data?.length > 100) {
      data = data.substring(0, 100) + '...';
    }
    return <tr key={message.id}>
      <td>{index + 1}</td>
      <td>{message.isSender ? 'Sent' : 'Received'}</td>
      <td>{message.senderName}</td>
      <td>{message.type}</td>
      <td>{data}</td>
    </tr>;
  };

  const renderTable = () =>
    <Table striped bordered hover style={{ width: 900, tableLayout: 'fixed', wordWrap: 'break-word' }}>
      <thead>
      <tr key="header">
        <th style={{ width: 50 }}>#</th>
        <th style={{ width: 100 }}>Sent/ Received</th>
        <th style={{ width: 100 }}>Sender</th>
        <th style={{ width: 130 }}>Type</th>
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
