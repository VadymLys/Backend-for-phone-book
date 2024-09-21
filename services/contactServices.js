import { ContactCollection } from "../db/models/contact.js";
import mongoose from "mongoose";
import { UsersCollection } from "../db/models/user.js";

export async function findAllContacts(req, res) {
  try {
    const contacts = await ContactCollection.find();
    return contacts;
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: 500,
        message: "Internal Server Error",
        error: err.message,
      })
    );
    console.log(err.message);
  }
}

export async function getUserById(userId) {
  try {
    const user = await UsersCollection.findById(userId);
    return user;
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: 500,
        message: "Internal Server Error",
        error: err.message,
      })
    );
    console.log(err.message);
  }
}

export async function deleteContactById(req, res, id) {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Invalid ID format" }));
      return;
    }

    const contact = await ContactCollection.findOneAndDelete({ _id: id });

    return contact;
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: 500,
        message: "Internal Server Error",
        error: err.message,
      })
    );
    console.log(err.message);
  }
}

export async function contactCreate(payload) {
  try {
    const contact = await ContactCollection.create(payload);
    return contact;
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: 500,
        message: "Internal Server Error",
        error: err.message,
      })
    );
    console.log(err.message);
  }
}
