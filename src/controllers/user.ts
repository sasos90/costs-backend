import * as async from 'async';
import * as crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { WriteError } from 'mongodb';
import * as nodemailer from 'nodemailer';
import * as passport from 'passport';
import { LocalStrategyInfo } from 'passport-local';
import { AuthToken, default as User, UserModel } from '../models/User';
import * as HttpStatus from 'http-status-codes';
import { ResponseMsg } from '../../helper/response-msg';
import { IUser } from '../models/i-user';
import { sign, SignOptions } from 'jsonwebtoken';
import * as winston from 'winston';
import * as mongoose from 'mongoose';

/**
 * GET /login
 * Login page.
 */
export let getLogin = (req: Request, res: Response) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/login', {
    title: 'Login',
  });
};

/**
 * POST /login
 * Sign in using username and password.
 */
export let postLogin = async (req: Request, res: Response, next: NextFunction) => {
  // req.assert('username', 'Email is not valid').isEmail();
  req.assert('username', 'Username cannot be blank').notEmpty();
  req.assert('password', 'Password cannot be blank').notEmpty();
  // req.sanitize('username').normalizeEmail({ gmail_remove_dots: false });

  const errors = await req.getValidationResult();

  if (!errors.isEmpty()) {
    req.flash('errors', errors);
    return res.status(HttpStatus.BAD_REQUEST).json(ResponseMsg.error('Validation errors', errors.mapped()));
  }

  let userDoc: mongoose.Document;
  let user: IUser;
  try {
    userDoc = await User.findOne({ username: req.body.username }).exec();
    if (userDoc) {
      user = userDoc.toObject();
    } else {
      winston.info(`User "${req.body.username}" not found!`);
      return res.status(HttpStatus.BAD_REQUEST).json(ResponseMsg.error('Invalid credentials'));
    }
  } catch (err) {
    winston.error('Error at checking the existing user!', err);
    return res.status(HttpStatus.BAD_REQUEST).json(ResponseMsg.error('Something went wrong', err));
  }

  (userDoc as any).comparePassword(req.body.password, (err: Error, isMatch: boolean) => {
    if (isMatch) {
      return makeLogin(res, user);
    }
    return res.status(HttpStatus.BAD_REQUEST).json(ResponseMsg.error('Invalid credentials'));
  });
};

export let makeLogin = (res: Response, user: IUser) => {
  // Create JWT token
  const payload = {
    username: user.username
  };
  const token = sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d'
  } as SignOptions);

  delete user.password;
  return res.json(ResponseMsg.success({
    msg: 'Successfull login!',
    user,
    token,
  }));
};

/**
 * GET /logout
 * Log out.
 */
export let logout = (req: Request, res: Response) => {
  req.logout();
  res.redirect('/');
};

/**
 * POST /signup
 * Create a new local account.
 */
export let postSignup = async (req: Request, res: Response, next: NextFunction) => {
  req.assert('password', 'Password must be at least 4 characters long').len({ min: 4 });

  const errors = await req.getValidationResult();

  if (!errors.isEmpty()) {
    req.flash('errors', errors);
    return res.status(HttpStatus.BAD_REQUEST).json(ResponseMsg.error('Validation errors', errors.mapped()));
  }

  const userDoc = new User({
    username: req.body.username,
    password: req.body.password,
  });

  User.findOne({ username: req.body.username }, (err: any, existingUser: any) => {
    if (err) { return next(err); }
    if (existingUser) {
      req.flash('errors', { msg: 'Account with that username address already exists.' });
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ResponseMsg.error('Account with that username address already exists.'));
    }
    userDoc.save((err) => {
      if (err) { return next(err); }
      const user: IUser = userDoc.toObject();
      makeLogin(res, user);
    });
  });
};

/**
 * GET /account
 * Profile page.
 */
export let getAccount = (req: Request, res: Response) => {
  res.render('account/profile', {
    title: 'Account Management',
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */
export let postUpdateProfile = (req: Request, res: Response, next: NextFunction) => {
  // req.assert('username', 'Please enter a valid username address.').isEmail();
  // req.sanitize('username').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, (err, user: UserModel) => {
    if (err) { return next(err); }
    // user.username = req.body.username || '';
    user.profile.name = req.body.name || '';
    user.profile.gender = req.body.gender || '';
    user.profile.location = req.body.location || '';
    user.profile.website = req.body.website || '';
    user.save((err: WriteError) => {
      if (err) {
        if (err.code === 11000) {
          req.flash('errors', { msg: 'The username address you have entered is already associated with an account.' });
          return res.redirect('/account');
        }
        return next(err);
      }
      req.flash('success', { msg: 'Profile information has been updated.' });
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/password
 * Update current password.
 */
export let postUpdatePassword = (req: Request, res: Response, next: NextFunction) => {
  req.assert('password', 'Password must be at least 4 characters long').len({ min: 4 });
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, (err, user: UserModel) => {
    if (err) { return next(err); }
    user.password = req.body.password;
    user.save((err: WriteError) => {
      if (err) { return next(err); }
      req.flash('success', { msg: 'Password has been changed.' });
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/delete
 * Delete user account.
 */
export let postDeleteAccount = (req: Request, res: Response, next: NextFunction) => {
  User.remove({ _id: req.user.id }, (err) => {
    if (err) { return next(err); }
    req.logout();
    req.flash('info', { msg: 'Your account has been deleted.' });
    res.redirect('/');
  });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
export let getOauthUnlink = (req: Request, res: Response, next: NextFunction) => {
  const provider = req.params.provider;
  User.findById(req.user.id, (err, user: any) => {
    if (err) { return next(err); }
    user[provider] = undefined;
    user.tokens = user.tokens.filter((token: AuthToken) => token.kind !== provider);
    user.save((err: WriteError) => {
      if (err) { return next(err); }
      req.flash('info', { msg: `${provider} account has been unlinked.` });
      res.redirect('/account');
    });
  });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
export let getReset = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  User
    .findOne({ passwordResetToken: req.params.token })
    .where('passwordResetExpires').gt(Date.now())
    .exec((err, user) => {
      if (err) { return next(err); }
      if (!user) {
        req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
        return res.redirect('/forgot');
      }
      res.render('account/reset', {
        title: 'Password Reset',
      });
    });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
export let postReset = (req: Request, res: Response, next: NextFunction) => {
  req.assert('password', 'Password must be at least 4 characters long.').len({ min: 4 });
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  async.waterfall([
    // tslint:disable-next-line:ban-types
    function resetPassword(done: Function) {
      User
        .findOne({ passwordResetToken: req.params.token })
        .where('passwordResetExpires').gt(Date.now())
        .exec((err, user: any) => {
          if (err) { return next(err); }
          if (!user) {
            req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
            return res.redirect('back');
          }
          user.password = req.body.password;
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;
          user.save((err: WriteError) => {
            if (err) { return next(err); }
            req.logIn(user, (err) => {
              done(err, user);
            });
          });
        });
    },
    // tslint:disable-next-line:ban-types
    function sendResetPasswordEmail(user: UserModel, done: Function) {
      const transporter = nodemailer.createTransport({
        auth: {
          pass: process.env.SENDGRID_PASSWORD,
          user: process.env.SENDGRID_USER,
        },
        service: 'SendGrid',
      });
      const mailOptions = {
        from: 'sasos90@gmail.com',
        subject: 'Your password has been changed',
        text: `Hello,\n\nThis is a confirmation that the password for \
        your account ${user.username} has just been changed.\n`,
        to: user.username,
      };
      transporter.sendMail(mailOptions, (err) => {
        req.flash('success', { msg: 'Success! Your password has been changed.' });
        done(err);
      });
    },
  ], (err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
};

/**
 * POST /forgot
 * Create a random token, then the send user an username with a reset link.
 */
export let postForgot = (req: Request, res: Response, next: NextFunction) => {
  req.assert('email', 'Please enter a valid username address.').isEmail();
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot');
  }

  async.waterfall([
    // tslint:disable-next-line:ban-types
    function createRandomToken(done: Function) {
      crypto.randomBytes(16, (err, buf) => {
        const token = buf.toString('hex');
        done(err, token);
      });
    },
    // tslint:disable-next-line:ban-types
    function setRandomToken(token: AuthToken, done: Function) {
      User.findOne({ username: req.body.username }, (err, user: any) => {
        if (err) { return done(err); }
        if (!user) {
          req.flash('errors', { msg: 'Account with that username address does not exist.' });
          return res.redirect('/forgot');
        }
        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 3600000; // 1 hour
        user.save((err: WriteError) => {
          done(err, token, user);
        });
      });
    },
    // tslint:disable-next-line:ban-types
    function sendForgotPasswordEmail(token: AuthToken, user: UserModel, done: Function) {
      const transporter = nodemailer.createTransport({
        auth: {
          pass: process.env.SENDGRID_PASSWORD,
          user: process.env.SENDGRID_USER,
        },
        service: 'SendGrid',
      });
      const mailOptions = {
        from: 'hackathon@starter.com',
        subject: 'Reset your password on Hackathon Starter',
        text: `You are receiving this email because you (or someone else) \
        have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/reset/${token}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        to: user.username,
      };
      transporter.sendMail(mailOptions, (err) => {
        req.flash('info', { msg: `An e-mail has been sent to ${user.username} with further instructions.` });
        done(err);
      });
    },
  ], (err) => {
    if (err) { return next(err); }
    res.redirect('/forgot');
  });
};
