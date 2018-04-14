'use strict';

import { NextFunction, Request, Response } from 'express';

/**
 * GET /api
 * List of API examples.
 */
export let getApi = (req: Request, res: Response) => {
  res.render('api/index', {
    title: 'API Examples',
  });
};
