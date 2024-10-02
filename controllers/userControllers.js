import { ONE_DAY } from "../constants/index.js";
import { getUserById } from "../services/contactServices.js";
import {
  refreshUsersSession,
  userLogin,
  userLogout,
  userRegistration,
} from "../services/userServices.js";
import { getPostData } from "../utils/getPostData.js";
import { parseCookies } from "../utils/parseCookies.js";
import jwt from "jsonwebtoken";

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
          name: savedUser.name,
          email: savedUser.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

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

    const session = await userLogin(req, res, { email, password });

    if (!email || !password) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          status: 400,
          message: "Please provide both email and password",
        })
      );
    }

    if (!session) {
      res.writeHead(401, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          status: 401,
          message: "Invalid credentials",
        })
      );
    }

    res.setHeader("Set-Cookie", [
      `refreshToken=${session.refreshToken}; HttpOnly; Max-Age=${ONE_DAY}`,
      `sessionId=${session._id}; HttpOnly; Max-Age=${ONE_DAY}`,
    ]);

    res.writeHead(201, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        status: 200,
        message: "Successfully logged in!",
        user: {
          accessToken: session.accessToken,
          name: session.name,
        },
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
    const cookies = req.headers.cookie;
    if (cookies) {
      const cookiesArray = cookies.split(";");
      const cookiesObject = cookiesArray.reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split("=");
        acc[name] = value;
        return acc;
      }, {});

      const sessionId = cookiesObject.sessionId;

      if (sessionId) {
        await userLogout(sessionId);
      }
    }

    res.writeHead(204, {
      "Set-Cookie": [
        "sessionId=; HttpOnly; Max-Age=0",
        "refreshToken=; HttpOnly; Max-Age=0",
      ],
      "Content-Type": "application/json",
    });

    res.end();
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
  res.setHeader("Set-Cookie", [
    `refreshToken=${session.refreshToken}; HttpOnly; Expires=${new Date(
      Date.now() + ONE_DAY
    ).toUTCString()}`,
    `sessionId=${session._id}; HttpOnly; Expires=${new Date(
      Date.now() + ONE_DAY
    ).toUTCString()}`,
  ]);
};

export async function refreshUserSessionController(req, res) {
  try {
    const cookies = parseCookies(req);

    const { sessionId, refreshToken } = cookies;

    const session = await refreshUsersSession(req, res, {
      sessionId: sessionId,
      refreshToken: refreshToken,
    });

    if (!sessionId || !refreshToken) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Session or token missing" }));
    }

    setupSession(res, session);

    res.writeHead(201, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        status: 200,
        message: "Successfully  refreshed a session!",
        data: {
          accessToken: session.accessToken,
        },
      })
    );
  } catch (error) {
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
