import mongoose from "mongoose";
export const marketObject = {
"play" :"play" ,
 "bazaar" :"bazaar" ,
 "myket" :"myket" ,
 "pwa" :"pwa" ,
 "ios" :"ios" ,
 "panel" :"panel" ,
 "sam":"sam",
} as const 
export enum marketEnum {
  play,
  bazaar,
  myket,
  pwa,
  ios,
  panel,
  sam,
}
const { Schema } = mongoose;
export const schema = new Schema(
  {
    name: String,
    username: { type: String, unique: true, sparse: true },
    phoneNumber: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, sparse: true },
    phoneNumberPassword: String,
    phoneNumberExpire: Number,
    sex: { type: String, enum: ["female", "male"], default: null },
    birthDate: Number,
    market: {
      type: String,
      enum: marketEnum,
    },
    roles: [{ type: Schema.Types.ObjectId, ref: "role" }],
    notes: [{type:String}],
    referralCode: { type: String, unique: true },
    version: String,
    lastAppOpened: Date,
    is_guest: { type: Boolean, default: false },
    level: { type: String, ref: "level" },

    score: { type: Number,default:0 },
    coin: { type: Number,default:0 },
    avatar: { type: String, },
  },
  { timestamps: true }
);

export const model = mongoose.model<IUser>("user", schema);

import { Document, Types } from "mongoose";

export interface IUser extends Document {
  name?: string;
  phoneNumber: string;
  email?: string;
  phoneNumberPassword?: string;
  phoneNumberExpire?: number;
  sex: "female" | "male";
  birthDate?: number;
  height?: number;
  weight?: number;
  market?: marketEnum;
  smsProvider?: string;
  roles: Types.ObjectId[];
  notes: String[];
  source?: string;
  referralCode: string;
  version?: string;
  lastAppOpened?: Date;
  createdAt: Date;
  updatedAt: Date;
  is_guest: Boolean;
  username: String;
  score:number;
  coin:number
  avatar?:string
}
