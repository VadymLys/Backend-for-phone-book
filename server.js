import http from "http";
import { getContacts } from "./controllers/productController.js";

export const startServer = (port) => {
  const server = http.createServer((req, res) => {
    if (req.url === "/contacts" && req.method === "GET") {
      getContacts(req, res);
    } else if (
      req.url.match(/\/api\/products\/([0-9]+)/) &&
      req.method === "GET"
    ) {
      const id = req.url.split("/")[3];
      getProduct(req, res, id);
    } else if (req.url === "/api/products" && req.method === "POST") {
      createProduct(req, res);
    } else if (
      req.url.match(/\/api\/products\/([0-9]+)/) &&
      req.method === "PUT"
    ) {
      const id = req.url.split("/")[3];
      updateProduct(req, res, id);
    } else if (
      req.url.match(/\/api\/products\/([0-9]+)/) &&
      req.method === "PUT"
    ) {
      const id = req.url.split("/")[3];
      updateProduct(req, res, id);
    } else if (
      req.url.match(/\/api\/products\/([0-9]+)/) &&
      req.method === "PUT"
    ) {
      const id = req.url.split("/")[3];
      updateProduct(req, res, id);
    } else if (
      req.url.match(/\/api\/products\/([0-9]+)/) &&
      req.method === "DELETE"
    ) {
      const id = req.url.split("/")[3];
      deleteProduct(req, res, id);
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Route not found" }));
    }
  });
  server.listen(port, () => console.log(`Server running on port ${port}`));
};
