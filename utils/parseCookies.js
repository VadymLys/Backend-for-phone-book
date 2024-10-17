export function parseCookies(req) {
  const list = {};
  const cookieHeader = req.headers.cookie;
  console.log("Cookie Header=============", cookieHeader);

  if (cookieHeader) {
    cookieHeader.split(";").forEach((cookie) => {
      const parts = cookie.split("=");

      if (parts.length === 2) {
        const key = decodeURIComponent(parts[0].trim());
        const value = decodeURIComponent(parts[1].trim());
        list[key] = value;
      }
    });
  }

  return list;
}
