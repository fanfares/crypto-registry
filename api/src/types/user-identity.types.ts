export interface UserIdentity {
  type: 'exchange' | 'customer' | 'anonymous' | 'reset';
  id?: string;
}
