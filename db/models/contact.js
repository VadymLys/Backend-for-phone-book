import { model, Schema } from "mongoose";

const contactsSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      required: true,
    },

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
    collection: "contactsBackend",
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const ContactCollection = model("Contact", contactsSchema);
