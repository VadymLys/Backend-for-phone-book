import { UsersCollection } from "../db/models/user.js";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { SessionsCollection } from "../db/models/session.js";
import { FIFTEEN_MINUTES, ONE_DAY } from "../constants/index.js";

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
      res.end(
        JSON.stringify({
          status: 404,
          message: "User not found",
        })
      );
    }

    const isEqual = await bcrypt.compare(payload.password, user.password);

    if (!isEqual) {
      res.end(
        JSON.stringify({
          status: 401,
          message: "Unauthorized",
        })
      );
    }

    await SessionsCollection.deleteOne({ userId: user._id });

    const accessToken = randomBytes(30).toString("base64");
    const refreshToken = randomBytes(30).toString("base64");

    const session = await SessionsCollection.create({
      userId: user._id,
      accessToken,
      refreshToken,
      accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
      refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
    });

    return session;
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: 500,
        message: "Internal Server Error",
        error: err.message,
      })
    );
    console.log(err.message);
  }
}

export async function userLogout(payload) {
  await SessionsCollection.deleteOne({ sessionId: payload.sessionId });
}
