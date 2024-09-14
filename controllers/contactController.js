import { ContactCollection } from "../db/models/contact.js";
import {
  deleteContactById,
  findAllContacts,
} from "../services/contactServices.js";
import { getPostData } from "../utils/getPostData.js";
// gets all products
export async function getContacts(req, res) {
  try {
    const contacts = await findAllContacts(req, res);

    res.writeHead(200, { "Content-Type": "application/json" });

    res.end(
      JSON.stringify({
        status: 200,
        message: "Successfully found contacts!",
        data: contacts,
      })
    );
  } catch (error) {
    console.log(error.message);
  }
}

export async function deleteContact(req, res, id) {
  try {
    const contact = await deleteContactById(req, res, id);

    if (!contact) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Contact not exist" }));
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Contact successfully deleted",
          data: contact,
        })
      );
    }
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ message: "Internal Server Error", error: error.message })
    );
    console.log(error.message);
  }
}

// create a product

export async function createContact(req, res) {
  try {
    const body = await getPostData(req);

    const { name, phoneNumber } = JSON.parse(body);

    const newContact = new ContactCollection({
      name,
      phoneNumber,
    });

    const savedContact = await newContact.save();

    res.writeHead(201, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        status: 201,
        message: "Contact created successfully!",
        data: savedContact,
      })
    );
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: 500,
        message: "Internal Server Error",
        error: error.message,
      })
    );

    console.log(error.message);
  }
}
