import { NextFunction, Request, Response, Router } from 'express';
import * as apiController from '../controllers/api';
import * as winston from 'winston';
import { JsonWebTokenError, NotBeforeError, TokenExpiredError, verify, VerifyCallback } from 'jsonwebtoken';
import * as HttpStatus from 'http-status-codes';
import { ResponseMsg } from '../../helper/response-msg';
import * as mongoose from 'mongoose';
import User from '../models/User';
import { IUser } from '../models/i-user';

class Api {
  public router: Router;
  public constructor() {
    this.router = Router();
    this.init();
  }
  private init() {
    this.router.use((req: Request, res: Response, next: NextFunction) => {
      winston.info('Authentication');
      const token = req.body.token || req.query.token || req.headers['x-access-token'];
      if (token && token !== '') {
        // Verify the JWT
        return verify(token, process.env.JWT_SECRET,
          async (err: JsonWebTokenError | NotBeforeError | TokenExpiredError, decoded: object | string) => {
          if (err) {
            winston.error('Token verifying failed', err);
            return res.status(HttpStatus.BAD_REQUEST).json(ResponseMsg.error('Failed to authenticate token!'));
          } else {
            // Store decoded data to locals decoded.
            (res as any).locals.decoded = decoded;
            const user: IUser = await User.findOne({ email: (decoded as any).email }).lean().exec() as IUser;
            (res as any).locals.user = user;
            return next();
          }
        });
      }
      return res.status(HttpStatus.BAD_REQUEST).json(ResponseMsg.error(`'token' is missing in request.`));
    });
    this.router.get('/', apiController.getApi);

    // CRUD operations for costs
    this.router.get('/costs', apiController.getAllCosts);
    this.router.get('/costs/:id', apiController.getCost);
    this.router.post('/costs', apiController.createCost);
    this.router.put('/costs/:id', apiController.updateCost);
    this.router.delete('/costs/:id', apiController.deleteCost);
  }
}

const apiRoutes = new Api();
export default apiRoutes.router;
