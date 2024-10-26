import fs from "fs";
import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export function serveAcmeChallenge(req, res) {
  const acmePath = "/.well-known/acme-challenge";
  if (req.url.startsWith(acmePath)) {
    const challengeFile = req.url.slice(acmePath.length + 1);
    const filePath = path.join(
      __dirname,
      ".well-known/acme-challenge",
      challengeFile
    );

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
