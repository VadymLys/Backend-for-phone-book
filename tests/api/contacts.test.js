import { it, describe, before, after } from "node:test";
import assert from "node:assert";
import https from "node:https";
import { config } from "../../config/index.js";
import fetch from "node-fetch";
import { startServer } from "../../server.js";

let server;
let baseUrl;

describe("Contacts API", () => {
  before(async () => {
    server = await startServer();
    console.log("Connecting to test server");
    baseUrl = `https://localhost:${server.address().port}`;
  });

  after(async () => {
    if (server) {
      console.log("Closing server connection");
      await new Promise((resolve) => server.close(resolve));
      console.log("server connection closed");
    }
  });

  it("GET /contacts", async () => {
    try {
      const httpsAgent = new https.Agent({
        key: config.ssl.privateKey,
        cert: config.ssl.certificate,
        ca: config.ssl.ca || config.ssl.fullchain,
      });

      const url = `${baseUrl}/contacts`;
      const response = await fetch(url, { agent: httpsAgent });

      const data = await response.json();

      console.log("Response Status:", response.status);
      console.log("Response Headers:", response.headers);

      assert.strictEqual(response.status, 200, "Expected HTTPS 200 status");
      assert(Array.isArray(data), "Response should be an array");

      if (data.length > 0) {
        "name" in data[0] && "phoneNumber" in data[0],
          "Expected objects in the array to have 'name' and 'phoneNumber'";
      }
    } catch (err) {
      throw new Error(err.message);
    }
  });
});
