import mongoose from "mongoose";
import { config } from "../../config/index.js";

export const initMongoConnection = async () => {
  try {
    const {
      db: { user, pwd, url, db },
    } = config;

    const mongoDBURL = `mongodb+srv://${user}:${pwd}@${url}/${db}?retryWrites=true&w=majority&appName=Cluster0&tls=true`;

    await mongoose.connect(mongoDBURL);
    console.log("Mongo connection successfully established!");
  } catch (error) {
    console.log("Error while setting up mongo connection", error.message);
    throw error;
  }
};
