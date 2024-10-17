import { FIFTEEN_MINUTES, ONE_DAY } from "../constants/index.js";
import { UsersCollection } from "../db/models/user.js";
import {
  refreshUsersSession,
  userLogin,
  userLogout,
  userRegistration,
} from "../services/userServices.js";
import { getUserIdFromToken } from "../utils/generateToken.js";
import { getPostData } from "../utils/getPostData.js";
import { parseCookies } from "../utils/parseCookies.js";
import jwt from "jsonwebtoken";
import { setCookie } from "../utils/setCookie.js";
import mongoose from "mongoose";

export async function registerUserController(req, res) {
  try {
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
        { expiresIn: "1h" }
      );
      console.log("🚀 ~ registerUserController ~ token :", token);

      res.setHeader("Set-Cookie", [
        `accessToken=${token}; HttpOnly; Max-Age=${FIFTEEN_MINUTES}`,
      ]);

      res.writeHead(201, { "Content-Type": "application/json" });
      console.log(savedUser);
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
  } catch (err) {
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          status: 500,
          message: "Internal Server Error",
          err: err.message,
        })
      );
    }
    console.log(err.message);
  }
}

export async function loginUserController(req, res) {
  try {
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

    const { accessToken, refreshToken, sessionId } = session;

    setCookie(res, [
      {
        name: "accessToken",
        value: accessToken,
        options: {
          HttpOnly: true,
          MaxAge: ONE_DAY,
        },
      },
      {
        name: "refreshToken",
        value: refreshToken,
        options: {
          HttpOnly: true,
          MaxAge: ONE_DAY,
        },
      },
      {
        name: "sessionId",
        value: sessionId,
        options: {
          HttpOnly: true,
          MaxAge: ONE_DAY,
        },
      },
    ]);

    console.log(
      "🚀 ~ loginUserController ~ session.refreshToken:",
      refreshToken
    );

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

export async function logoutUserController(req, res) {
  try {
    setCookie(res, [
      {
        name: "sessionId",
        value: "",
        options: { MaxAge: 0, HttpOnly: true },
      },
      {
        name: "refreshToken",
        value: "",
        options: { MaxAge: 0, HttpOnly: true },
      },
      {
        name: "accessToken",
        value: "",
        options: { MaxAge: 0, HttpOnly: true },
      },
    ]);

    res.writeHead(204, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        status: 204,
        message: "Successfully logged out",
      })
    );
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

const setupSession = (res, session) => {
  console.log("🚀 ~ setupSession ~ session:", session);
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
        Expires: new Date(Date.now() + ONE_DAY).toUTCString(),
      },
    },
    {
      name: "userId",
      value: session.userId,
      options: {
        HttpOnly: true,
        Expires: new Date(Date.now() + ONE_DAY).toUTCString(),
      },
    },
  ]);
};

export async function refreshUserSessionController(req, res) {
  try {
    const cookies = parseCookies(req);
    console.log("Cookies parsed:", cookies);

    const { userId, refreshToken, sessionId } = cookies;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error(`Invalid userId format: ${userId}`);
    }

    console.log(
      "🚀 ~ refreshUserSessionController ~ userId:",
      userId,
      refreshToken,
      sessionId
    );

    console.log(
      "🚀 ~ refreshUserSessionController ~ userId, refreshToken:",
      userId,
      refreshToken,
      sessionId
    );

    if (!userId || !refreshToken || !sessionId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "UserId or token missing" }));
    }

    const session = await refreshUsersSession(req, res, {
      userId: userId,
      refreshToken: refreshToken,
      sessionId: sessionId,
    });

    console.log("Looking for session with:", {
      userId,
      refreshToken,
      sessionId,
    });

    if (!session) {
      console.error("No session found for userId:", userId);
    } else {
      console.log("----Found session:", session);
    }

    const user = await UsersCollection.findOne({ _id: userId });

    if (!user) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "User not found" }));
    }

    const result = setupSession(res, session);
    console.log("🚀 ~ refreshUserSessionController ~ result:", result);

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
  } catch (error) {
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          status: 500,
          message: "Internal Server Error",
          error: error.message,
        })
      );
    }
  }
}
