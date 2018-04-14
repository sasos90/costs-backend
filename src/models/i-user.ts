import { AuthToken } from './User';

export interface IUser {
  email: string;
  password: string;
  passwordResetToken: string;
  passwordResetExpires: Date;

  tokens: AuthToken[];

  profile: {
    name: string;
    gender: string;
    location: string;
    website: string;
    picture: string;
  };

  comparePassword: (candidatePassword: string, cb: (err: any, isMatch: any) => {}) => void;
  gravatar: (size: number) => string;
}
