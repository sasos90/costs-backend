import * as mongoose from 'mongoose';

const costSchema = new mongoose.Schema({
  user: { type: String },
  cost: Number,
}, { timestamps: true });

const Cost = mongoose.model<any>('Cost', costSchema);
export default Cost;
