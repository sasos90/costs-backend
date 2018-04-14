import { IUser } from './i-user';

export interface ICost {
  _id: object | string;
  user: IUser | string;
  name: string;
  category: string;
  cost: number;
}
