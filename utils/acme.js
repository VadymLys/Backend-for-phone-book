import fs from "fs";
import path from "path";

const ACME_DIR = path.join(process.cwd(), ".well-known", "acme-challenge");

if (!fs.existsSync(ACME_DIR)) {
  fs.mkdirSync(ACME_DIR, { recursive: true });
}

export async function serveAcmeChallenge(req, res) {
  if (
    req.method === "GET" &&
    req.url.startsWith("/.well-known/acme-challenge/")
  ) {
    const token = req.url.split("/").pop();
    const filePath = path.join(ACME_DIR, `${token}.txt`);
    console.log("🚀 ~ serveAcmeChallenge ~ filePath:", filePath);

    try {
      await fs.promises.access(filePath, fs.constants.R_OK);
      const keyAuthorization = await fs.promises.readFile(filePath, "utf-8");

      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(keyAuthorization);
      return;
    } catch (error) {
      const tokenContent = `${token}.myDpb5FhcXwcI721petisiEXkVHmeSKSQxq2DV9TEyc`;

      try {
        await fs.promises.writeFile(filePath, tokenContent, "utf-8");

        res.writeHead(201, { "Content-Type": "text/plain" });
        res.end("Token file created");
      } catch (writeError) {
        console.error("Failed to write token file:", writeError);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Server Error");
      }
      return;
    }
  }
  return false;
}
