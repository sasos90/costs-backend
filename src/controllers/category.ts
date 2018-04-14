import { NextFunction, Request, Response } from 'express';
import { ResponseMsg } from '../../helper/response-msg';
import Category, { CategoryModel } from '../models/Category';
import { ICategory } from '../models/i-category';

export let getCategory = async (req: Request, res: Response, next: NextFunction) => {
  const category: ICategory = await Category.findById(req.params.id).lean().exec() as ICategory;
  return res.json(ResponseMsg.success(category));
};

export let getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  const categories: ICategory[] = await Category.find().lean().exec() as ICategory[];
  return res.json(ResponseMsg.success(categories));
};

export let updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  const category: ICategory = req.body;
  const categoryUpdated: ICategory = await Category
    .findByIdAndUpdate(req.params.id, category, {new: true})
    .lean()
    .exec() as ICategory;
  return res.json(ResponseMsg.success(categoryUpdated));
};

export let deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  await Category.findByIdAndRemove(req.params.id).exec();
  return res.json(ResponseMsg.success({
    msg: `Item with ID "${req.params.id}" was deleted!`
  }));
};

export let createCategory = async (req: Request, res: Response, next: NextFunction) => {
  const categoryReq: ICategory = req.body;
  const categoryDoc = new Category(req.body);
  const categoryDocNew: CategoryModel = await categoryDoc.save();
  return res.json(ResponseMsg.success(categoryDocNew));
};
