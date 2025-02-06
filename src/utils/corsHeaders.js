import { config } from "../config/index.js";

const allowedOrigins = [config.allowedOrigins];

export function setCORSHeaders(req, res) {
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
