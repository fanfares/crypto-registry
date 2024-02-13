import { useStore } from '../../store';
import { FloatingLabel } from 'react-bootstrap';
import Input from '../utils/input.ts';
import { hyphenatedToRegular } from '../utils/enum.tsx';
import Form from 'react-bootstrap/Form';
import { formatSatoshi } from '../utils/satoshi.tsx';
import { getExchangeStatusDescription } from './get-exchange-status-description.ts';


const ExchangeStatus = () => {

  const {currentExchange} = useStore();

  if (!currentExchange) {
    return null;
  }

  return (
    <div>
      <hr/>
      <h5>Exchange Status</h5>
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

    </div>
  );

};

export default ExchangeStatus;
