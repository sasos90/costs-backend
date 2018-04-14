import { NextFunction, Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';
import { ResponseMsg } from '../../helper/response-msg';
import Cost, { CostModel } from '../models/Cost';
import { ICost } from '../models/i-cost';
import { IUser } from '../models/i-user';

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

export let getAllCosts = async (req: Request, res: Response, next: NextFunction) => {
  const costs: ICost[] = await Cost.find().populate('user', '-password').lean().exec() as ICost[];
  return res.json(ResponseMsg.success(costs));
};

export let createCost = async (req: Request, res: Response, next: NextFunction) => {
  // const cost: ICost = req.body;
  const costReq: ICost = req.body;
  const user: IUser = res.locals.user;
  costReq.user = user._id as string;
  const costDoc = new Cost(req.body);
  const costDocNew: CostModel = await costDoc.save();
  return res.json(ResponseMsg.success(costDocNew));
};
