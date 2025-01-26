import { test } from "node:test";
import assert from "node:assert";
import https from "node:https";
import { config } from "../../config/index.js";
import fetch from "node-fetch";

const httpsAgent = new https.Agent({
  key: config.ssl.privateKey,
  cert: config.ssl.certificate,
  ca: config.ssl.ca || config.ssl.fullchain,
});

test("GET /contacts", async () => {
  try {
    const url = "https://localhost:443/contacts";

    const response = await fetch(url, { agent: httpsAgent });

    const data = response.json();

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
