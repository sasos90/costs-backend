import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { AuthToken, UserModel } from './User';

export type CostModel = mongoose.Document & {
  user: UserModel,
  name: string,
  category: string,
  cost: number,
};

const costSchema = new mongoose.Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  name: String,
  category: String,
  cost: Number,
}, { timestamps: true });

const Cost = mongoose.model<CostModel>('Cost', costSchema);
export default Cost;
