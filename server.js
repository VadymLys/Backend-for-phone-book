import fs from "fs/promises";
import https from "https";
import dotenv from "dotenv";

import {
  createContactController,
  deleteContactController,
  getContactsController,
} from "./src/controllers/contactController.js";
import {
  loginUserController,
  logoutUserController,
  refreshUserSessionController,
  registerUserController,
} from "./src/controllers/userControllers.js";
import { findAvailablePort } from "./src/utils/findDesiredPort.js";
import { __dirname } from "./src/constants/index.js";
import { downloadCertificates } from "./src/utils/functionsAWS/downloadCertificates.js";
import { env } from "./src/utils/env.js";
import { ctrlWrapper } from "./src/utils/ctrlWrapper.js";

dotenv.config();

const allowedOrigins = ["https://goit-react-hw-08-phi-six.vercel.app"];

function setCORSHeaders(req, res) {
  const origin = req.headers.origin;
  const method = req.method;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Accept"
  );

  if (method === "OPTIONS") {
    res.writeHead(204, { "Content-Type": "text/plain" });
    res.end();
    return true;
  }
  return false;
}

export async function startServer() {
  try {
    let privateKey;
    let certificate;
    let ca;

    const isAWSEnabled = env("ENABLE_AWS") === "true";

    if (isAWSEnabled) {
      console.log("Downloading certificates from AWS");
      const bucketName = env("BUCKET_NAME");

      if (
        !bucketName ||
        !env("PRIVATE_KEY_PATH") ||
        !env("CERTIFICATE_PATH") ||
        !env("CA_PATH")
      ) {
        throw new Error(
          "One or more required environment variables are missing."
        );
      }
      const [privateKeyPath, certificatePath, caPath] =
        await downloadCertificates(bucketName, [
          env("PRIVATE_KEY_PATH"),
          env("CERTIFICATE_PATH"),
          env("CA_PATH"),
        ]);

      privateKey = await fs.readFile(privateKeyPath, "utf-8");

      certificate = await fs.readFile(certificatePath, "utf-8");

      ca = await fs.readFile(caPath, "utf-8");
    } else {
      console.log("Downloading certificates from render");
      privateKey = process.env.PRIVATE_KEY;

      certificate = process.env.CERTIFICATE;

      ca = process.env.CA;
    }

    const credentials = {
      key: privateKey,
      cert: certificate,
      ca: ca,
    };

    const server = https.createServer(credentials, (req, res) => {
      const handledCors = setCORSHeaders(req, res);

      if (handledCors) {
        return;
      }

      const url = req.url.split("?")[0];

      if (url === "/contacts" && method === "GET") {
        ctrlWrapper(getContactsController)(req, res);
      } else if (url === "/contacts" && method === "POST") {
        ctrlWrapper(createContactController)(req, res);
      } else if (
        url.match(/^\/contacts\/([a-fA-F0-9]{24})$/) &&
        method === "DELETE"
      ) {
        const id = url.split("/")[2];
        ctrlWrapper(deleteContactController)(req, res, id);
      } else if (url === "/users/signup" && method === "POST") {
        ctrlWrapper(registerUserController)(req, res);
      } else if (url === "/users/login" && method === "POST") {
        ctrlWrapper(loginUserController)(req, res);
      } else if (url === "/users/logout" && method === "POST") {
        ctrlWrapper(logoutUserController)(req, res);
      } else if (url === "/users/current" && method === "GET") {
        ctrlWrapper(refreshUserSessionController)(req, res);
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Not Found" }));
      }
    });

    const desiredPort = process.env.PORT || 443;
    findAvailablePort(desiredPort)
      .then((port) => {
        server.listen(port, () => {
          console.log(`server listening on port https://localhost:${port}`);
        });
      })
      .catch((err) => {
        console.error("Error finding available port:", err);
        throw new Error("Failed to find available port.");
      });
  } catch (error) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
}
