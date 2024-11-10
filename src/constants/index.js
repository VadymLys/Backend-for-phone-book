import path from "path";

export const FIFTEEN_MINUTES = 15 * 60 * 1000;
export const ONE_DAY = 24 * 60 * 60 * 1000;

export const __dirname = path.join(process.cwd(), "src");

const isRender = process.env.RENDER === "true";
export const certsDir = isRender
  ? path.join(process.cwd(), "certificates")
  : path.join(process.cwd(), "src", "certificates");
