import { initMongoConnection } from "./db/initMongoConnection.js";
import { startServer } from "./server.js";

const bootstrap = async () => {
  await initMongoConnection();

  const PORT = process.env.PORT || 3000;
  startServer(PORT);
};

bootstrap();
