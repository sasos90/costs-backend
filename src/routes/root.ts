import { NextFunction, Request, Response, Router } from 'express';

import * as homeController from '../controllers/home';
import * as userController from '../controllers/user';
class Root {
  public router: Router;
  public constructor() {
    this.router = Router();
    this.init();
  }
  private init() {
    this.router.get('/', (req, res) => {
      return res.send('Latest release: 4.12.2018').end();
    });
    this.router.post('/login', userController.postLogin);
    this.router.get('/logout', userController.logout);
    this.router.post('/forgot', userController.postForgot);
    this.router.get('/reset/:token', userController.getReset);
    this.router.post('/reset/:token', userController.postReset);
    this.router.post('/signup', userController.postSignup);
  }
}

const rootRoutes = new Root();
const router = rootRoutes.router;
export default router;
