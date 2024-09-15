import { UsersCollection } from "../db/models/user.js";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

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
