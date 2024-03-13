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
      <hr/>
      <FloatingLabel
        label="Exchange Status">
        <Input type="text"
               disabled={true}
               value={hyphenatedToRegular(currentExchange.status)}/>
        <Form.Text className="text-muted">
          {getExchangeStatusDescription(currentExchange.status)}
        </Form.Text>
      </FloatingLabel>

      {currentExchange.shortFall ?
        <FloatingLabel
          label="Funding Shortfall">
          <Input type="text"
                 disabled={true}
                 value={formatSatoshi(currentExchange.shortFall)}/>
          <Form.Text className="text-muted">
            The amount that balances exceed funding.
          </Form.Text>
        </FloatingLabel> : null}

      <FloatingLabel
        label="Exchange Funds On-Chain">
        <Input type="text"
               disabled={true}
               value={formatSatoshi(currentExchange.currentFunds)}/>
        <Form.Text className="text-muted">
          Total funds submitted to this exchange
        </Form.Text>
      </FloatingLabel>

      <FloatingLabel
        label="Valid From">
        <Input type="text"
               disabled={true}
               value={formatDate(currentExchange.fundingAsAt)}/>
        <Form.Text className="text-muted">
          The latest submission date of on-chain funds.
        </Form.Text>
      </FloatingLabel>

      <FloatingLabel
        label="Network">
        <Input type="text"
               disabled={true}
               value={currentExchange.fundingSource}/>
        <Form.Text className="text-muted">
          The bitcoin network where the funds reside
        </Form.Text>
      </FloatingLabel>

    </div>
  );

};

export default ExchangeFundingStatus;
