import { ONE_DAY } from "../constants/index.js";
import {
  userLogin,
  userLogout,
  userRegistration,
} from "../services/userServices.js";
import { getPostData } from "../utils/getPostData.js";

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
      res.writeHead(201, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          status: 201,
          message: "User created successfully!",
          data: {
            id: savedUser._id,
            name: savedUser.name,
            email: savedUser.email,
          },
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
