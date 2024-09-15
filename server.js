import http from "http";
import {
  createContact,
  deleteContact,
  getContacts,
} from "./controllers/contactController.js";
import { registerUser } from "./controllers/userControllers.js";

export const startServer = (port) => {
  const server = http.createServer((req, res) => {
    const url = req.url;
    const method = req.method;

    if (url === "/contacts" && method === "GET") {
      getContacts(req, res);
    } else if (url === "/contacts" && method === "POST") {
      createContact(req, res);
    } else if (
      url.match(/^\/contacts\/([a-fA-F0-9]{24})$/) &&
      method === "DELETE"
    ) {
      const id = url.split("/")[2];
      deleteContact(req, res, id);
    } else if (url === "/users/register" && method === "POST") {
      registerUser(req, res);
    } else if (url === "/users/login" && method === "POST") {
      loginUser(res, req);
    } else if (url === "/users/logout" && method === "POST") {
      logoutUser(res, req);
    }
  });
  server.listen(port, () => console.log(`Server running on port ${port}`));
};
