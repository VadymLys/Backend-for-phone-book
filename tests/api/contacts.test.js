import { it, describe, before, after } from "node:test";
import assert from "node:assert";
import https from "node:https";
import { config } from "../../config/index.js";
import fetch from "node-fetch";
import { startServer } from "../../server/server.js";
import { closeConnections } from "../../server/server-utils.js";
import { initMongoConnection } from "../../src/db/initMongoConnection.js";
import mongoose, { mongo } from "mongoose";

let server;
let baseUrl;

https.globalAgent = new https.Agent({
  key: config.ssl.privateKey,
  cert: config.ssl.certificate,
  ca: (await config.ssl.ca) || (await config.ssl.fullchain),
  rejectUnauthorized: false,
});

describe("Contacts API", () => {
  before(async () => {
    try {
      await initMongoConnection();

      server = await startServer();
      console.log("Connecting to test server");
      baseUrl = `https://localhost:${server.address().port}`;
    } catch (err) {
      console.error("Error while starting the server:", err);
      throw err;
    }
  });

  after(async () => {
    if (server) {
      console.log("Closing server connection");
      try {
        await closeConnections();

        await new Promise((resolve, reject) => {
          server.close((err) => {
            if (err) {
              console.error("Error while closing server:", err);
              return reject(err);
            } else {
              console.log("Server connection successfully closed.");
              resolve();
            }
          });
        });
        console.log("server connection closed");

        try {
          mongoose.disconnect();
          console.log("MongoDB connection closed");
        } catch (err) {
          console.error(err.message);
        }
      } catch (err) {
        throw new Error(err.message);
      }
    } else {
      console.log("Server instance was not initialized.");
    }
  });

  it("GET /contacts", async () => {
    try {
      const url = `${baseUrl}/contacts`;
      const response = await fetch(url, { agent: https.globalAgent });

      const data = await response.json();

      console.log("Response Status:", response.status);
      console.log("Response Headers:", response.headers);

      assert.strictEqual(response.status, 200, "Expected HTTPS 200 status");
      assert("contacts" in data, "Expected 'contacts' in response");
      assert(Array.isArray(data.contacts), "Response should be an array");

      if (data.length > 0) {
        "name" in data[0] && "phoneNumber" in data[0],
          "Expected objects in the array to have 'name' and 'phoneNumber'";
      }
    } catch (err) {
      throw new Error(err.message);
    }
  });
});
