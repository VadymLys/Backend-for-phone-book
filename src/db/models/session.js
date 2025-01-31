import mongoose, { Schema, model } from "mongoose";

const sessionsSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    accessTokenValidUntil: { type: Date, required: true },
    refreshTokenValidUntil: { type: Date, required: true },
    sessionId: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const SessionsCollection = model(
  "Session",
  sessionsSchema,
  process.env.NODE_ENV === "test" ? "sessions_test" : "sessions"
);
