import { ApiProperty } from "@nestjs/swagger";

export interface AmountSentBySender {
  senderMismatch: boolean;
  noTransactions: boolean;
  valueOfOutputFromSender: number;
}

export class AmountSentBySenderDto implements AmountSentBySender {
  @ApiProperty()
  senderMismatch: boolean;
  @ApiProperty()
  noTransactions: boolean;
  @ApiProperty()
  valueOfOutputFromSender: number;
}
