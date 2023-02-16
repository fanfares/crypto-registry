import { RegistrationDto } from '../open-api';
import Table from 'react-bootstrap/Table';


export interface RegistrationDetailProps {
  registration: RegistrationDto;
}

export const RegistrationDetail = (
  { registration }: RegistrationDetailProps
) => {
  return (
    <div>
      <Table>
        <tbody>
        <tr>
          <td>Institution</td>
          <td>{registration.institutionName}</td>
        </tr>
        <tr>
          <td>Requester Email</td>
          <td>{registration.email}</td>
        </tr>
        <tr>
          <td>Node Name</td>
          <td>{registration.nodeName}</td>
        </tr>
        <tr>
          <td>Node Address</td>
          <td>{registration.nodeAddress}</td>
        </tr>
        </tbody>
      </Table>
    </div>
  );
};
