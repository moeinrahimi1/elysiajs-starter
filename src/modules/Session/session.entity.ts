import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  token: string;
  refreshToken: string;
  refreshTokenExpire: number;
  expireAt: Date;
  // firebaseToken: string;
  agent: string;
  deviceType: string;
  // deviceId: string;
  deviceVersion: string;
  appVersion: string;
  user: mongoose.Types.ObjectId;
}

const schema = new Schema<ISession>(
  {
    token: { type: String, default: '' },
    refreshToken: { type: String, required: true },
    refreshTokenExpire: { type: Number, required: true },
    expireAt: { type: Date, required: true },
    // firebaseToken: { type: String, required: true },
    agent: { type: String, required: true },
    deviceType: { type: String, required: true },
    // deviceId: { type: String, required: true },
    deviceVersion: { type: String, required: true },
    appVersion: { type: String, required: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
  },
  { timestamps: true }
);

schema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const model = mongoose.model<ISession>('session', schema);

export { schema, model };