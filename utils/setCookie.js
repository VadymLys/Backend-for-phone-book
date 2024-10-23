export function setCookie(res, cookies) {
  const formattedCookies = cookies.map(({ name, value, options = {} }) => {
    const cookieParts = [`${name}=${value}`];

    if (options.HttpOnly) cookieParts.push("HttpOnly");
    if (options.Secure) cookieParts.push("Secure");
    if (options.SameSite) cookieParts.push(`SameSite=${options.SameSite}`);
    if (options.Expires) cookieParts.push(`Expires=${options.Expires}`);
    if (options.MaxAge) cookieParts.push(`Max-Age=${options.MaxAge}`);
    if (options.Domain) cookieParts.push(`Domain=${options.domain}`);
    if (options.Path) cookieParts.push(`Path=${options.path}`);

    return cookieParts.join("; ");
  });

  res.setHeader("Set-Cookie", formattedCookies);
  console.log("🚀 ~ setCookie ~ formattedCookies:", formattedCookies);
}
