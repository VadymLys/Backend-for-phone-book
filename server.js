import fs from "fs";
import https from "https";
import {
  createContactController,
  deleteContactController,
  getContactsController,
} from "./controllers/contactController.js";
import {
  loginUserController,
  logoutUserController,
  refreshUserSessionController,
  registerUserController,
} from "./controllers/userControllers.js";
import { findAvailablePort } from "./utils/findDesiredPort.js";

const allowedOrigins = ["https://goit-react-hw-08-phi-six.vercel.app"];

const setCORSHeaders = (req, res) => {
  const origin = req.headers.origin;

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

  if (req.method === "OPTIONS") {
    res.writeHead(204, { "Content-Type": "text/plain" });
    res.end();
    return true;
  }
  return false;
};

export const startServer = () => {
  const privateKey = fs.readFileSync(
    "./certificates/backend-for-phone-book.onrender.com-key.pem",
    "utf-8"
  );

  const certificate = fs.readFileSync(
    "./certificates/backend-for-phone-book.onrender.com-crt.pem",
    "utf-8"
  );

  const ca = fs.readFileSync(
    "./certificates/backend-for-phone-book.onrender.com-chain.pem",
    "utf-8"
  );

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
    const method = req.method;

    if (url === "/contacts" && method === "GET") {
      getContactsController(req, res);
    } else if (url === "/contacts" && method === "POST") {
      createContactController(req, res);
    } else if (
      url.match(/^\/contacts\/([a-fA-F0-9]{24})$/) &&
      method === "DELETE"
    ) {
      const id = url.split("/")[2];
      deleteContactController(req, res, id);
    } else if (url === "/users/signup" && method === "POST") {
      registerUserController(req, res);
    } else if (url === "/users/login" && method === "POST") {
      loginUserController(req, res);
    } else if (url === "/users/logout" && method === "POST") {
      logoutUserController(req, res);
    } else if (url === "/users/current" && method === "GET") {
      refreshUserSessionController(req, res);
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Not Found" }));
    }
  });

  const desiredPort = process.env.PORT || 443;
  findAvailablePort(desiredPort).then((port) => {
    server.listen(port, () => {
      console.log(`server listening on port https://localhost:${port}`);
    });
  });
};
