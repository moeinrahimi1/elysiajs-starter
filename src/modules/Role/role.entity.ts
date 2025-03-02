import mongoose from "mongoose";
import { Document, Types } from "mongoose";

const { Schema } = mongoose;
export const schema = new Schema(
  {
    name: { type: String, unique: true },
  },
  { timestamps: true }
);

export const model = mongoose.model<IRole>("role", schema);

export interface IRole extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
