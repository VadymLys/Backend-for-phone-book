export const FIFTEEN_MINUTES = 15 * 60 * 1000;
export const ONE_DAY = 24 * 60 * 60 * 1000;
export const isRender = process.env.RENDER === "true";
import path from "path";
import { getDirname } from "../utils/pathHelper.js";

const __dirname = getDirname(import.meta.url);

export const certsDir = path.join(__dirname, "..", "certs", "certificates");
