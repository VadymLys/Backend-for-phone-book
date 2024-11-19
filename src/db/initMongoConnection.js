import mongoose from "mongoose";

export const initMongoConnection = async () => {
  try {
    const user = process.env.MONGODB_USER;

    console.log("🚀 ~ initMongoConnection ~ user:", user);

    const pwd = encodeURIComponent(process.env.MONGODB_PASSWORD);

    console.log("🚀 ~ initMongoConnection ~ pwd:", pwd);

    const url = process.env.MONGODB_URL;

    console.log("🚀 ~ initMongoConnection ~ url:", url);

    const db = process.env.MONGODB_DB;

    console.log("🚀 ~ initMongoConnection ~ db:", db);

    const mongoDBURL = `mongodb+srv://${user}:${pwd}@${url}/${db}?retryWrites=true&w=majority&appName=Cluster0&tls=true`;

    console.log("🚀 ~ initMongoConnection ~ mongoDBURL:", mongoDBURL);
    await mongoose.connect(mongoDBURL);
    console.log("Mongo connection successfully established!");
  } catch (error) {
    console.log("Error while setting up mongo connection", error.message);
    throw error;
  }
};
