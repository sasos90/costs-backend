import { NextFunction, Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';
import { ResponseMsg } from '../../helper/response-msg';
import Cost, { CostModel } from '../models/Cost';

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

export let createCost = async (req: Request, res: Response, next: NextFunction) => {
  // const cost: ICost = req.body;
  const costDoc = new Cost(req.body);
  const cost: CostModel = await costDoc.save();
  return res.json(ResponseMsg.success(cost));
};
