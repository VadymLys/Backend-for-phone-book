export function parseCookies(req) {
  const list = {};
  const cookieHeader = req.headers.cookie;

  if (cookieHeader) {
    cookieHeader.split(";").forEach((cookie) => {
      const parts = cookie.split("=");
      const key = parts[0].trim();
      const value = decodeURIComponent(parts[1]);
      list[key] = value;
    });
  }

  return list;
}
