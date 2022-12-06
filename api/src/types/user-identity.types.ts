export interface UserIdentity {
  type: 'exchange' | 'customer' | 'anonymous' | 'reset' | 'test';
  id?: string;
}
