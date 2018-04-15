import * as mongoose from 'mongoose';

export type CategoryModel = mongoose.Document & {
  name: string,
};

const categorySchema = new mongoose.Schema({
  name: String,
});

const Category = mongoose.model<CategoryModel>('Category', categorySchema );
export default Category;
