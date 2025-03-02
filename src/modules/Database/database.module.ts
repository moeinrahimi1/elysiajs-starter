import { env } from "@/config";
import mongoose, { MongooseOptions } from "mongoose";

mongoose.set("debug", true);

const runDB = async () => {
  let options:MongooseOptions = {
    
  };

  await mongoose.connect(env.DATABASE_URI);
};

export default runDB;
