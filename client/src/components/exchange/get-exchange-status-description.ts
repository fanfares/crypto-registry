import { ExchangeStatus as ExchangeStatusEnum } from '../../open-api';

export function getExchangeStatusDescription(exchangeStatus: ExchangeStatusEnum) {
  switch (exchangeStatus) {
    case ExchangeStatusEnum.OK:
      return 'On-chain funding exceeds customer balances';
    case ExchangeStatusEnum.INSUFFICIENT_FUNDS:
      return 'Customer balances exceeds on-chain funding';
    case ExchangeStatusEnum.AWAITING_DATA:
      return 'Insufficient data to verify customer balances';
    default:
      return '';
  }
}
