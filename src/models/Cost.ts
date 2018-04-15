import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { UserModel } from './User';
import { CategoryModel } from './Category';

export type CostModel = mongoose.Document & {
  user: UserModel,
  name: string,
  category: CategoryModel,
  cost: number,
};

const costSchema = new mongoose.Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  name: String,
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  cost: Number,
}, { timestamps: true });

const Cost = mongoose.model<CostModel>('Cost', costSchema);
export default Cost;
