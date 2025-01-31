import { model, Schema } from "mongoose";

const contactsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    phoneNumber: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const ContactCollection = model(
  "Contact",
  contactsSchema,
  process.env.NODE_ENV === "test" ? "contacts_test" : "contacts"
);
