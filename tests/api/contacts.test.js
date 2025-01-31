import { it, describe, before, after } from "node:test";
import assert from "node:assert";
import { startServer } from "../../server/server.js";
import { closeConnections } from "../../server/server-utils.js";
import { initMongoConnection } from "../../src/db/initMongoConnection.js";
import mongoose from "mongoose";
import request from "supertest";

let server;
let app;

describe("Contacts API", () => {
  before(async () => {
    await initMongoConnection();
    server = await startServer();

    console.log("Connecting to test server");

    app = request(server);
  });

  after(async () => {
    if (server) {
      console.log("Closing server connection");
      await closeConnections();

      await server.close();

      await mongoose.disconnect();
      console.log("MongoDB connection closed");
    } else {
      console.log("Server instance was not initialized.");
    }
  });

  it("GET /contacts", async () => {
    const response = await app.get("/contacts?page=1&perPage=10").expect(200);

    assert.strictEqual(response.status, 200, "Expected HTTPS 200 status");
    assert(
      Array.isArray(response.body.data.contacts),
      "Expected an array of contacts"
    );

    if (response.body.data.contacts.length > 0) {
      assert(
        "name" in response.body.data.contacts[0],
        "Expected 'name' in contact object"
      );
      assert(
        "phoneNumber" in response.body.data.contacts[0],
        "Expected  'phoneNumber' in contact object "
      );
    }
  });
});
