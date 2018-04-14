import { NextFunction, Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';

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
