import { VerificationMessageDto, VerificationStatus } from "./verification.types";

describe('verification-message-dto types', () => {
  test('message deserialisation', () => {
    const verificationMessageDto: VerificationMessageDto = {
      requestDate: new Date(),
      email: 'email@email.com',
      receivingAddress: 'receiver',
      status: VerificationStatus.RECEIVED
    }
    const jsonString = JSON.stringify(verificationMessageDto);
    const deserialised = VerificationMessageDto.parse(jsonString);
    expect(deserialised.requestDate instanceof Date).toBe(true)
  })
})
