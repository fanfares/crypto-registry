export interface UserIdentity {
  type: 'custodian' | 'customer' | 'anonymous';
  id?: string;
}
