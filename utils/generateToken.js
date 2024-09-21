import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  const payload = {
    id: user._id,
    name: user.name,
    email: user.email,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  return token;
};
