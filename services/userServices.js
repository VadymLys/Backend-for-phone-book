import { UsersCollection } from "../db/models/user.js";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { SessionsCollection } from "../db/models/session.js";
import { FIFTEEN_MINUTES, ONE_DAY } from "../constants/index.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import {
  createSession,
  updateSessionFields,
} from "../utils/sessionFunciones.js";

export async function userRegistration(req, res, payload) {
  const user = await UsersCollection.findOne({ email: payload.email });

  if (user) {
    res.writeHead(409, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Email in use",
      })
    );
  }
  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  const newUser = await UsersCollection.create({
    ...payload,
    password: encryptedPassword,
  });

  const savedUser = await newUser.save();

  return savedUser;
}

export async function userLogin(req, res, payload) {
  try {
    const user = await UsersCollection.findOne({ email: payload.email });

    if (!user) {
      return console.error("User is not found");
    }

    const isEqual = await bcrypt.compare(payload.password, user.password);

    if (!isEqual) {
      return console.error("isEqual is not found");
    }

    const result = await SessionsCollection.deleteOne({ userId: user._id });

    const newSession = createSession(user._id);

    const session = await SessionsCollection.create(
      updateSessionFields({}, newSession)
    );

    const userSession = {
      ...session.toObject(),
      name: user.name,
    };

    return userSession;
  } catch (err) {
    console.error("Error during user login:", err.message);

    // Логічно відловлюємо помилку у контролері
    throw new Error("Error during user login");
  }
}

export async function getUserById(userId) {
  try {
    const user = await UsersCollection.findById(userId);
    return user;
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        status: 500,
        message: "Internal Server Error",
        error: err.message,
      })
    );
  }
}

export async function userLogout(payload) {
  await SessionsCollection.deleteOne({ sessionId: payload.sessionId });
}

export async function refreshUsersSession(
  req,
  res,
  { userId, refreshToken, sessionId }
) {
  const session = await SessionsCollection.findOne({
    userId: userId,
    refreshToken: refreshToken,
    sessionId: sessionId,
  });

  if (!session) {
    res.writeHead(401, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        status: 401,
        message: "Session not found",
      })
    );
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    res.writeHead(401, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        status: 401,
        message: "Session token expired",
      })
    );
  }

  const newSession = createSession(userId);

  if (session) {
    updateSessionFields(session, newSession);
    await session.save();
  }

  return session;
}

export async function requestResetToken(req, res, email) {
  const user = await UsersCollection.findOne({ email });

  if (!user) {
    res.writeHead(404, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        status: 404,
        message: "User not found",
      })
    );
  }

  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    env("JWT_SECRET"),
    {
      expiresIn: "15m",
    }
  );
  return resetToken;
}
