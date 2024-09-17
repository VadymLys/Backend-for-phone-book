import { Schema, model } from "mongoose";

const sessionsSchema = new Schema(
  {
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    accessTokenValidUntil: { type: Date, required: true },
    refreshTokenValidUntil: { type: Date, required: true },
  },
  {
    collection: "sessionsBackend",
    timestamps: true,
    versionKey: false,
  }
);

export const SessionsCollection = model("sessions", sessionsSchema);
