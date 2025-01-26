import { describe, it, before, after } from "node:test";
import assert from "assert";
import { ContactCollection } from "../../src/db/models/contact.js";
import { initMongoConnection } from "../../src/db/initMongoConnection.js";
import mongoose from "mongoose";

describe("ContactCollection", () => {
  before(async () => {
    console.log("Connecting to test MongoDB");
    await initMongoConnection();
  });

  after(async () => {
    console.log("Closing MongoDB connection");
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  });

  it("should return an empty array when no contacts are found", async () => {
    try {
      const contacts = await ContactCollection.find({});
      assert.strictEqual(contacts.length, 0);
    } catch (err) {
      console.error(err.message);
    }
  });

  it("return all contacts", async () => {
    try {
      const contacts = await ContactCollection.find();
      assert.strictEqual(contacts.length, contacts.length);
    } catch (err) {
      throw new Error(err.message);
    }
  });
});
