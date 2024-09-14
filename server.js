import http from "http";
import { deleteContact, getContacts } from "./controllers/productController.js";

export const startServer = (port) => {
  const server = http.createServer((req, res) => {
    const url = req.url;
    const method = req.method;

    if (url === "/contacts" && method === "GET") {
      getContacts(req, res);
    } else if (
      url.match(/^\/contacts\/([a-fA-F0-9]{24})$/) &&
      method === "DELETE"
    ) {
      const id = url.split("/")[2];
      deleteContact(req, res, id);
    }
  });
  server.listen(port, () => console.log(`Server running on port ${port}`));
};
