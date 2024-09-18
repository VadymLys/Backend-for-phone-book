import http from "http";
import {
  createContactController,
  deleteContactController,
  getContactsController,
} from "./controllers/contactController.js";
import {
  loginUserController,
  logoutUserController,
  registerUserController,
} from "./controllers/userControllers.js";

export const startServer = (port) => {
  const server = http.createServer((req, res) => {
    const url = req.url;
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
    } else if (url === "/auth/logout" && method === "POST") {
      logoutUserController(req, res);
    }
  });
  server.listen(port, () => console.log(`Server running on port ${port}`));
};
