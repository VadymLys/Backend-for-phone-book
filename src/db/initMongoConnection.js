import mongoose from "mongoose";
import dotenv from "dotenv";
import { env } from "../utils/env.js";

dotenv.config({ path: ".env.test" });

export async function initMongoConnection() {
  try {
    const user = env("MONGODB_USER");
    const pwd = env("MONGODB_PASSWORD");
    const url = env("MONGODB_URL");
    const db =
      process.env.NODE_ENV === "test"
        ? env("MONGODB_DB_TEST")
        : env("MONGODB_DB");

    const mongoDBURL = `mongodb+srv://${user}:${pwd}@${url}/${db}?retryWrites=true&w=majority&appName=Cluster0&tls=true`;

    await mongoose.connect(mongoDBURL);
    console.log("Mongo connection successfully established!");
  } catch (error) {
    console.log("Error while setting up mongo connection", error.message);
    throw error;
  }
}
