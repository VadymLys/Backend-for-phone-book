import jwt from "jsonwebtoken";
import { env } from "./env.js";

export function getUserIdFromToken(token) {
  try {
    if (!token) {
      console.error("Токен не передано!");
      return null;
    }

    const secret = env("JWT_SECRET");
    const decodedToken = jwt.decode(token, secret);
    console.log("🚀 ~ getUserIdFromToken ~ decodedToken:", decodedToken);

    return decodedToken.userId;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}
