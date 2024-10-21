import { randomBytes } from "crypto";
import { FIFTEEN_MINUTES, ONE_DAY } from "../constants/index.js";
import { setCookie } from "./setCookie.js";

export function createSession(userId) {
  const accessToken = randomBytes(30).toString("base64");
  const refreshToken = randomBytes(30).toString("base64");
  const sessionId = randomBytes(20).toString("hex");

  const session = {
    sessionId,
    userId,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  };

  return session;
}

export function setupSession(res, session) {
  setCookie(res, [
    {
      name: "refreshToken",
      value: session.refreshToken,
      options: {
        HttpOnly: true,
        Expires: new Date(Date.now() + ONE_DAY).toUTCString(),
      },
    },
    {
      name: "sessionId",
      value: session.sessionId,
      options: {
        HttpOnly: true,
        MaxAge: ONE_DAY,
      },
    },
    {
      name: "userId",
      value: session.userId,
      options: {
        HttpOnly: true,
        MaxAge: ONE_DAY,
      },
    },
  ]);
}

export function updateSessionFields(session, newSession) {
  session.accessToken = newSession.accessToken;
  session.refreshToken = newSession.refreshToken;
  session.accessTokenValidUntil = newSession.accessTokenValidUntil;
  session.refreshTokenValidUntil = newSession.refreshTokenValidUntil;
  session.sessionId = newSession.sessionId;
  session.userId = newSession.userId;

  return session;
}
