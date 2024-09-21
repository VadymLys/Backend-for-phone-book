import { ONE_DAY } from "../constants/index.js";
import { getUserById } from "../services/contactServices.js";
import {
  refreshUsersSession,
  userLogin,
  userLogout,
  userRegistration,
} from "../services/userServices.js";
import { generateToken } from "../utils/generateToken.js";
import { getPostData } from "../utils/getPostData.js";
import { parseCookies } from "../utils/parseCookies.js";

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
      const token = generateToken(savedUser);

      res.writeHead(201, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          status: 201,
          message: "User created successfully!",
          user: {
            id: savedUser._id,
            name: savedUser.name,
            email: savedUser.email,
          },
          token: token,
        })
      );
    }
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: 500,
        message: "Internal Server Error",
        err: err.message,
      })
    );

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
        data: {
          accessToken: session.accessToken,
        },
      })
    );
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

const setupSession = (res, session) => {
  res.setHeader("Set-Cookie", [
    `refreshToken=${session.refreshToken}; HttpOnly; Expires=${
      new Date(Date.now() + ONE_DAY).toUTCString
    }`,
    `sessionId=${session._id}; HttpOnly; Expires=${new Date(
      Date.now() + ONE_DAY
    ).toUTCString()}`,
  ]);
};

export async function refreshUserSessionController(req, res, token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await getUserById(userId);

    if (!user) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          status: 404,
          message: "User not found",
        })
      );
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        status: 200,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      })
    );
  } catch (error) {
    res.writeHead(401, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        status: 401,
        message: "Invalid or expired token",
      })
    );
  }
}
