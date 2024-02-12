import { ExchangeStatus as ExchangeStatusEnum } from '../../open-api';

export function getExchangeStatusDescription(exchangeStatus: ExchangeStatusEnum) {
  switch (exchangeStatus) {
    case ExchangeStatusEnum.OK:
      return 'On-Chain Funding exceed Customer Balances';
    case ExchangeStatusEnum.INSUFFICIENT_FUNDS:
      return 'Customer Balances exceed On-Chain Funding';
    case ExchangeStatusEnum.AWAITING_DATA:
      return 'Submission is incomplete';
    default:
      return 'The status of the latest submissions';
  }
}
