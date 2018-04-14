import { NextFunction, Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';
import { ResponseMsg } from '../../helper/response-msg';

/**
 * GET /api
 * List of API examples.
 */
export let getApi = (req: Request, res: Response) => {
  /*res.render('api/index', {
    title: 'API Examples',
  });*/
  res.status(HttpStatus.OK).end();
};

export let getAllCosts = (req: Request, res: Response, next: NextFunction) => {
  return res.json(ResponseMsg.success([]));
};
