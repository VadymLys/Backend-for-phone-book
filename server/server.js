import https from "https";
import dotenv from "dotenv";
import http from "http";

import {
  createContactController,
  deleteContactController,
  getContactsController,
} from "../controllers/contactController.js";
import {
  loginUserController,
  logoutUserController,
  refreshUserSessionController,
  registerUserController,
} from "../controllers/userControllers.js";
import { findAvailablePort } from "../utils/findDesiredPort.js";
import ctrlWrapper from "../utils/ctrlWrapper.js";
import { setCORSHeaders } from "../utils/corsHeaders.js";
import { flagCertificates } from "../utils/certificates.js";
import { trackConnections } from "./server-utils.js";
import { serveAcmeChallenge } from "../../certs/acmeConfig/acmeConfig.js";
import { throttle } from "./throttle.js";

import path from "path";
import { fileURLToPath } from "url";

// Отримуємо абсолютний шлях до цього файлу
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Формуємо шлях так, як у імпорті
const acmeConfigPath = path.resolve(
  __dirname,
  "../../certs/acmeConfig/acmeConfig.js"
);

console.log(acmeConfigPath);

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

      throttle(req, res, () => {
        trackConnections(httpsServer);

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
