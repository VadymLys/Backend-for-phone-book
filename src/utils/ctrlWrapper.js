export async function ctrlWrapper(controller) {
  return async (req, res) => {
    try {
      await controller(req, res);
    } catch (error) {
      console.error("Error occurred:", err.message);

      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ error: "Internal Server Error", details: err.message })
      );
    }
  };
}
