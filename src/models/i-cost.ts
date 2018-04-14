import { IUser } from './i-user';

export interface ICost {
  user: IUser | string;
  name: string;
  category: string;
  cost: number;
}
