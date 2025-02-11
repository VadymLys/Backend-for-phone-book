import { ContactCollection } from "../db/models/contact.js";
import mongoose from "mongoose";
import { calculatePaginationData } from "../utils/calculatePaginationData.js";

export async function findAllContacts(req, res, { page = 1, perPage = 10 }) {
  try {
    const limit = perPage;
    const skip = (page - 1) * perPage;

    const contactsQuery = ContactCollection.find({}).skip(skip).limit(limit);

    const total = await ContactCollection.countDocuments();

    const contacts = await contactsQuery.exec();

    const paginationData = calculatePaginationData(total, limit, page);

    return { contacts, total, ...paginationData };
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: 500,
        message: "Internal Server Error",
        error: err.message,
      })
    );
    console.error("Error fetching contacts:", err);
    return { contacts: [], total: 0 };
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
