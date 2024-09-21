import http from "http";
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

const setCORSHeaders = (res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
};

export const startServer = (port) => {
  const server = http.createServer((req, res) => {
    setCORSHeaders(res);

    const url = req.url;
    const method = req.method;

    if (method === "OPTIONS") {
      res.writeHead(204);
      return res.end();
    }

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
    } else if (url === "/auth/logout" && method === "POST") {
      logoutUserController(req, res);
    } else if (url === "/users/current" && method === "GET") {
      refreshUserSessionController(req, res);
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Not Found" }));
    }
  });
  server.listen(port, () => console.log(`Server running on port ${port}`));
};
