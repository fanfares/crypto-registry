import { useStore } from '../../store';
import { FloatingLabel } from 'react-bootstrap';
import Input from '../utils/input.ts';
import { hyphenatedToRegular } from '../utils/enum.tsx';
import Form from 'react-bootstrap/Form';
import { formatSatoshi } from '../utils/satoshi.tsx';
import { getExchangeStatusDescription } from './get-exchange-status-description.ts';
import { formatDate } from '../utils/date-format.tsx';


const ExchangeFundingStatus = () => {

  const {currentExchange} = useStore();

  if (!currentExchange) {
    return null;
  }

  return (
    <div>
      <FloatingLabel
        label="Exchange Status">
        <Input type="text"
               disabled={true}
               value={hyphenatedToRegular(currentExchange.status)}/>
        <Form.Text className="text-muted">
          {getExchangeStatusDescription(currentExchange.status)}
        </Form.Text>
      </FloatingLabel>

      <FloatingLabel
        label="Customer Claims on Funds">
        <Input type="text"
               disabled={true}
               value={formatSatoshi(currentExchange.currentHoldings)}/>
        <Form.Text className="text-muted">
          The total amount of customer account balances submitted by the exchange.
        </Form.Text>
      </FloatingLabel>

      <FloatingLabel
        label="Imported On">
        <Input type="text"
               disabled={true}
               value={formatDate(currentExchange.holdingsAsAt)}/>
        <Form.Text className="text-muted">
          The latest submission date of the customer balances.
        </Form.Text>
      </FloatingLabel>

    </div>
  );

};

export default ExchangeFundingStatus;
