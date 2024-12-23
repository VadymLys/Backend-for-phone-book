import { FIFTEEN_MINUTES, ONE_DAY } from "../constants/index.js";
import { UsersCollection } from "../db/models/user.js";
import {
  refreshUsersSession,
  userLogin,
  userLogout,
  userRegistration,
} from "../services/userServices.js";
import { getPostData } from "../utils/getPostData.js";
import { parseCookies } from "../utils/parseCookies.js";
import jwt from "jsonwebtoken";
import { setCookie } from "../utils/setCookie.js";
import mongoose from "mongoose";
import { setupSession } from "../utils/sessionFunctions.js";

export async function registerUserController(req, res) {
  const body = await getPostData(req);
  const { name, email, password } = JSON.parse(body);

  if (!name || !email || !password) {
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        status: 400,
        message: "Please provide name, email, and password",
      })
    );
  }

  const savedUser = await userRegistration(req, res, {
    name,
    email,
    password,
  });

  if (savedUser) {
    const token = jwt.sign(
      {
        userId: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: savedUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    setCookie(res, [
      {
        name: "refreshToken",
        value: refreshToken,
        options: {
          HttpOnly: true,
          MaxAge: ONE_DAY,
          SameSite: "None",
          Secure: true,
          Domain: "backend-for-phone-book.onrender.com",
          Path: "/",
        },
      },
    ]);

    res.writeHead(201, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        status: 201,
        message: "User created successfully!",
        user: {
          name: savedUser.name,
          email: savedUser.email,
        },
        token: token,
      })
    );
  }
}

export async function loginUserController(req, res) {
  const body = await getPostData(req);
  const { email, password } = JSON.parse(body);

  if (!email || !password) {
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        status: 400,
        message: "Please provide both email and password",
      })
    );
  }

  const session = await userLogin(req, res, { email, password });
  console.log("🚀 ~ loginUserController ~ session:", session);

  if (!session) {
    res.writeHead(401, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        status: 401,
        message: "Invalid credentials",
      })
    );
  }

  const { accessToken, refreshToken, sessionId, userId } = session;

  setCookie(res, [
    {
      name: "refreshToken",
      value: refreshToken,
      options: {
        HttpOnly: true,
        MaxAge: ONE_DAY,
        SameSite: "None",
        Secure: true,
        Domain: "backend-for-phone-book.onrender.com",
        Path: "/",
      },
    },
    {
      name: "sessionId",
      value: sessionId,
      options: {
        HttpOnly: true,
        MaxAge: ONE_DAY,
        SameSite: "None",
        Secure: true,
        Domain: "backend-for-phone-book.onrender.com",
        Path: "/",
      },
    },
    {
      name: "userId",
      value: userId,
      options: {
        HttpOnly: true,
        MaxAge: ONE_DAY,
        SameSite: "None",
        Secure: true,
        Domain: "backend-for-phone-book.onrender.com",
        Path: "/",
      },
    },
  ]);

  res.writeHead(201, { "Content-Type": "application/json" });
  return res.end(
    JSON.stringify({
      status: 200,
      message: "Successfully logged in!",
      user: {
        name: session.name,
        email: session.email,
      },
      token: accessToken,
    })
  );
}

export async function logoutUserController(req, res) {
  setCookie(res, [
    {
      name: "sessionId",
      value: "",
      options: {
        MaxAge: 0,
        HttpOnly: true,
        SameSite: "None",
        Secure: true,
        Domain: "backend-for-phone-book.onrender.com",
        Path: "/",
      },
    },
    {
      name: "refreshToken",
      value: "",
      options: {
        MaxAge: 0,
        HttpOnly: true,
        SameSite: "None",
        Secure: true,
        Domain: "backend-for-phone-book.onrender.com",
        Path: "/",
      },
    },
    {
      name: "userId",
      value: "",
      options: {
        MaxAge: 0,
        HttpOnly: true,
        SameSite: "None",
        Secure: true,
        Domain: "backend-for-phone-book.onrender.com",
        Path: "/",
      },
    },
  ]);

  res.writeHead(204, { "Content-Type": "application/json" });
  return res.end(
    JSON.stringify({
      status: 204,
      message: "Successfully logged out",
    })
  );
}

export async function refreshUserSessionController(req, res) {
  const cookies = parseCookies(req);
  console.log("🚀 ~ refreshUserSessionController ~ cookies:", cookies);

  const { refreshToken, sessionId, userId } = cookies;
  console.log("🚀 ~ refreshUserSessionController ~ sessionId:", sessionId);
  console.log(
    "🚀 ~ refreshUserSessionController ~ refreshToken:",
    refreshToken
  );
  console.log(
    "🚀 ~ refreshUserSessionController ~ userId:",
    userId,
    "type of userId",
    typeof userId
  );

  console.log("🚀 ~ refreshUserSessionController ~ headers:", req.headers);

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error(`Invalid userId format: ${userId}`);
  }

  if (!userId || !refreshToken || !sessionId) {
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "UserId or token missing" }));
  }

  const session = await refreshUsersSession(req, res, {
    userId: userId,
    refreshToken: refreshToken,
    sessionId: sessionId,
  });
  console.log("🚀 ~ refreshUserSessionController ~ session:", session);

  const user = await UsersCollection.findOne({ _id: userId });

  if (!user) {
    res.writeHead(404, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "User not found" }));
  }

  setupSession(res, session);

  res.writeHead(201, { "Content-Type": "application/json" });
  return res.end(
    JSON.stringify({
      status: 200,
      message: "Successfully  refreshed a session!",
      user: {
        name: user.name,
        email: user.email,
      },
      token: session.accessToken,
    })
  );
}
