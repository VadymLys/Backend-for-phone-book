export function getPostData(req) {
  return new Promise((resolve, reject) => {
    try {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk.toString();

        req.on("end", () => {
          resolve(body);
        });
      });
    } catch (err) {
      console.log(err.message);
    }
  });
}
