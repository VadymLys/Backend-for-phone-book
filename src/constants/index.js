import path from "path";
import os from "os";

export const FIFTEEN_MINUTES = 15 * 60 * 1000;
export const ONE_DAY = 24 * 60 * 60 * 1000;
export const isRender = process.env.RENDER === "true";

export const __dirname = isRender
  ? path.resolve()
  : path.join(process.cwd(), "src");

export const certsDir = isRender
  ? path.join(os.tmpdir(), "certificates")
  : path.join(process.cwd(), "src", "certificates");
