import fs from "fs";
import path from "path";

const ACME_DIR = path.join(process.cwd(), ".well-known", "acme-challenge");

export async function serveAcmeChallenge(req, res) {
  if (
    req.method === "GET" &&
    req.url.startsWith("/.well-known/acme-challenge/")
  ) {
    const token = req.url.split("/").pop();
    const filePath = path.join(ACME_DIR, token);
    console.log("🚀 ~ serveAcmeChallenge ~ filePath:", filePath);

    try {
      await fs.promises.access(filePath, fs.constants.R_OK);
      const keyAuthorization = await fs.promises.readFile(filePath, "utf-8");

      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(keyAuthorization);
      return;
    } catch (error) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
      return;
    }
  }
  return false;
}
