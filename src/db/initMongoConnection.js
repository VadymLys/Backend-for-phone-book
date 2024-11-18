import mongoose from "mongoose";

export const initMongoConnection = async () => {
  try {
    const user = process.env.MONGODB_USER;
    const pwd = process.env.MONGODB_PASSWORD;
    const url = process.env.MONGODB_URL;
    const db = process.env.MONGODB_DB;

    const mongoDBURL = `mongodb+srv://${user}:${pwd}@${url}/${db}?retryWrites=true&w=majority&appName=Cluster0`;

    await mongoose.connect(mongoDBURL);
    console.log("Mongo connection successfully established!");
  } catch (error) {
    console.log("Error while setting up mongo connection", error.message);
    throw error;
  }
};
