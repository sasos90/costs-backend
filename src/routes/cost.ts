import { NextFunction, Request, Response, Router } from 'express';

import * as costController from '../controllers/cost';

import * as passportConfig from '../config/passport';
class Cost {
  public router: Router;
  public constructor() {
    this.router = Router();
    this.init();
  }
  private init() {
    this.router.post('/', costController.createCost);
    this.router.get('/', costController.getAllCosts);
    this.router.get('/:id', costController.getCost);
    this.router.put('/:id', costController.updateCost);
    this.router.delete('/:id', costController.deleteCost);
  }
}

const costRoutes = new Cost();
export default costRoutes.router;
