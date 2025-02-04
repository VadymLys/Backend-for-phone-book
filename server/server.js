import https from "https";
import dotenv from "dotenv";
import http from "http";

import {
  createContactController,
  deleteContactController,
  getContactsController,
} from "../src/controllers/contactController.js";
import {
  loginUserController,
  logoutUserController,
  refreshUserSessionController,
  registerUserController,
} from "../src/controllers/userControllers.js";
import { findAvailablePort } from "../src/utils/findDesiredPort.js";
import { __dirname } from "../src/constants/index.js";
console.log("🚀 ~ __dirname :", __dirname);
import ctrlWrapper from "../src/utils/ctrlWrapper.js";
import { setCORSHeaders } from "../src/utils/corsHeaders.js";
import { flagCertificates } from "../src/utils/certificates.js";
import { trackConnections } from "./server-utils.js";
import { serveAcmeChallenge } from "../certs/acmeConfig/acmeConfig.js";
import { throttle } from "./throttle.js";

dotenv.config();

export async function startServer() {
  try {
    const { key, cert, ca, fullchain } = await flagCertificates();

    const credentials = {
      key,
      cert,
      ca,
      fullchain,
    };

    const httpServer = http.createServer(async (req, res) => {
      if (await serveAcmeChallenge(req, res)) {
        return;
      }

      res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
      res.end();
    });

    const httpsServer = https.createServer(credentials, (req, res) => {
      const handledCors = setCORSHeaders(req, res);

      if (handledCors) {
        return;
      }

      trackConnections(httpsServer);

      throttle(req, res, () => {
        const method = req.method;
        const url = req.url.split("?")[0];
        if (url === "/contacts" && method === "GET") {
          ctrlWrapper(getContactsController(req, res));
        } else if (url === "/contacts" && method === "POST") {
          ctrlWrapper(createContactController(req, res));
        } else if (
          url.match(/^\/contacts\/([a-fA-F0-9]{24})$/) &&
          method === "DELETE"
        ) {
          const id = url.split("/")[2];
          ctrlWrapper(deleteContactController)(req, res, id);
        } else if (url === "/users/signup" && method === "POST") {
          ctrlWrapper(registerUserController(req, res));
        } else if (url === "/users/login" && method === "POST") {
          ctrlWrapper(loginUserController(req, res));
        } else if (url === "/users/logout" && method === "POST") {
          ctrlWrapper(logoutUserController(req, res));
        } else if (url === "/users/current" && method === "GET") {
          ctrlWrapper(refreshUserSessionController(req, res));
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Not Found" }));
        }
      });
    });

    const desiredPort = process.env.PORT || 443;
    try {
      const port = await findAvailablePort(desiredPort);

      httpsServer.listen(port, () => {
        console.log(`server listening on port https://localhost:${port}`);
      });
    } catch (err) {
      console.error("Error finding available port:", err);
      throw new Error("Failed to find available port.");
    }
    return httpsServer;
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
}
