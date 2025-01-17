async function ctrlWrapper(controller) {
  return async function (req, res, ...args) {
    console.log("Wrapper called with args:", args);
    try {
      await controller(req, res, ...args);
    } catch (err) {
      console.error("Error occurred:", err.message);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ error: "Internal Server Error", details: err.message })
      );
    }
  };
}

export default ctrlWrapper;
