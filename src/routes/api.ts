import { NextFunction, Request, Response, Router } from 'express';

import * as apiController from '../controllers/api';

import * as passportConfig from '../config/passport';
class Api {
  public router: Router;
  public constructor() {
    this.router = Router();
    this.init();
  }
  private init() {
    this.router.get('/', apiController.getApi);

    // CRUD operations for costs
    this.router.get('/costs', apiController.getApi);
    this.router.get('/costs/:id', apiController.getApi);
    this.router.post('/costs', apiController.getApi);
    this.router.put('/costs/:id', apiController.getApi);
    this.router.delete('/costs/:id', apiController.getApi);
  }
}

const apiRoutes = new Api();
export default apiRoutes.router;
