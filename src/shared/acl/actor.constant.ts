import { ROLE } from './../../auth/constants/role.constant';

/**
 * The actor who is perfoming the action
 */
export enum ActorType {
  USER,
  OPERATOR,
}
export interface Actor {
  id: string;
  type: string;
  roles: ROLE[];
}
