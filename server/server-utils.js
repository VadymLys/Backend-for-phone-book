const sockets = new Set();

export function trackConnections(server) {
  server.on("connection", (socket) => {
    sockets.add(socket);
    socket.on("close", () => {
      sockets.delete(socket);
    });
  });
}

export function closeConnections() {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
    for (const socket of sockets) {
      socket.destroy();
    }
  });
}
