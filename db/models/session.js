import mongoose, { Schema, model } from "mongoose";

const sessionsSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    accessTokenValidUntil: { type: Date, required: true },
    refreshTokenValidUntil: { type: Date, required: true },
    sessionId: { type: String, required: true },
  },
  {
    collection: "sessionsBackend",
    timestamps: true,
    versionKey: false,
  }
);

export const SessionsCollection = model("sessions", sessionsSchema);
