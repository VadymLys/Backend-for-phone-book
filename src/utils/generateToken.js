import jwt from "jsonwebtoken";
import { env } from "./env.js";

export function getUserIdFromToken(token) {
  try {
    if (!token) {
      console.error("Token not provided!");
      return null;
    }

    const secret = env("JWT_SECRET");
    const decodedToken = jwt.decode(token, secret);

    return decodedToken.userId;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}
