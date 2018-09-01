import * as bcrypt from 'bcrypt-nodejs';
import * as crypto from 'crypto';
import * as mongoose from 'mongoose';

export type UserModel = mongoose.Document & {
  username: string,
  password: string,
  passwordResetToken: string,
  passwordResetExpires: Date,

  profile: {
    name: string,
    gender: string,
    location: string,
    website: string,
    picture: string,
  },

  comparePassword: (candidatePassword: string, cb: (err: any, isMatch: any) => {}) => void,
  gravatar: (size: number) => string,
};

// tslint:disable-next-line:interface-name
export interface AuthToken {
  accessToken: string;
  kind: string;
}

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  passwordResetExpires: Date,
  passwordResetToken: String,

  profile: {
    gender: String,
    location: String,
    name: String,
    picture: String,
    website: String,
  },

  twitter: String,
}, { timestamps: true });

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next: any) {
  const user: any = this;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, undefined, (err: mongoose.Error, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword: string, cb: (err: any, isMatch: any) => {}) {
  bcrypt.compare(candidatePassword, this.password, (err: mongoose.Error, isMatch: boolean) => {
    cb(err, isMatch);
  });
};

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function(size: number) {
  if (!size) {
    size = 200;
  }
  if (!this.username) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash('md5').update(this.username).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

// export const User: UserType = mongoose.model<UserType>('User', userSchema);
const User = mongoose.model<UserModel>('User', userSchema);
export default User;
