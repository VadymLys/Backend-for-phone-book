const rateLimitMap = new Map();

export function throttle(req, res, next) {
  const ip = req.socket.remoteAddress;
  const now = Date.now();
  const timeWindow = 10 * 1000;
  const maxRequests = 5;

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  const timestamps = rateLimitMap.get(ip);

  while (timestamps.length > 0 && timestamps[0] < now - timeWindow) {
    timestamps.shift();
  }

  if (timestamps.length >= maxRequests) {
    res.writeHead(429, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Too many requests, try again later!" }));
    return;
  }

  timestamps.push(now);
  next();
}
