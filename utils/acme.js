import fs from "fs";
import path from "path";

const __dirname = path
  .dirname(new URL(import.meta.url).pathname)
  .replace(/^\/([a-zA-Z]):\//, "$1:/");

export function serveAcmeChallenge(req, res) {
  const acmePath = "/.well-known/acme-challenge";
  if (req.url.startsWith(acmePath)) {
    const challengeFile = req.url.slice(acmePath.length + 1);
    console.log("🚀 ~ serveAcmeChallenge ~ challengeFile:", challengeFile);
    const filePath = path.join(
      __dirname,
      "..",
      ".well-known",
      "acme-challenge",
      challengeFile
    );
    console.log("🚀 ~ serveAcmeChallenge ~ filePath:", filePath);

    console.log("Requesting file path:", filePath);

    const testFilePath = path.join(__dirname, "../.well-known/acme-challenge");

    fs.access(testFilePath, fs.constants.R_OK, (err) => {
      if (err) {
        console.error("No read access to the file:", testFilePath);
      } else {
        console.log("Read access confirmed for file:", testFilePath);
      }
    });

    if (fs.existsSync(filePath)) {
      res.writeHead(200, { "Content-Type": "text/plain" });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end("Not Found");
    }
    return true;
  }
  return false;
}
