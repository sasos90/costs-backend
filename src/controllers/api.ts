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

export let getCost = async (req: Request, res: Response, next: NextFunction) => {
  const cost: ICost = await Cost
    .findById(req.params.id)
    .populate('user', '-password')
    .populate('category')
    .lean()
    .exec() as ICost;
  return res.json(ResponseMsg.success(cost));
};

export let getAllCosts = async (req: Request, res: Response, next: NextFunction) => {
  const costs: ICost[] = await Cost
    .find()
    .populate('user', '-password')
    .populate('category')
    .lean()
    .exec() as ICost[];
  return res.json(ResponseMsg.success(costs));
};

export let updateCost = async (req: Request, res: Response, next: NextFunction) => {
  const cost: ICost = req.body;
  const costUpdated: ICost = await Cost
    .findByIdAndUpdate(req.params.id, cost, {new: true})
    .populate('user', '-password')
    .populate('category')
    .lean()
    .exec() as ICost;
  return res.json(ResponseMsg.success(costUpdated));
};

export let deleteCost = async (req: Request, res: Response, next: NextFunction) => {
  await Cost.findByIdAndRemove(req.params.id).exec();
  return res.json(ResponseMsg.success({
    msg: `Item with ID "${req.params.id}" was deleted!`
  }));
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
