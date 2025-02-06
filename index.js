import { initMongoConnection } from "./src/db/initMongoConnection.js";
import { startServer } from "./src/server/server.js";

const bootstrap = async () => {
  await initMongoConnection();
  startServer();
};

bootstrap();
