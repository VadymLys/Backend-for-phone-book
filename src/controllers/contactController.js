import { ContactCollection } from "../db/models/contact.js";
import {
  deleteContactById,
  findAllContacts,
} from "../services/contactServices.js";
import { getPostData } from "../utils/getPostData.js";
import { parsePaginationParams } from "../utils/parsePaginationParams.js";
// gets all products
export async function getContactsController(req, res) {
  const urlParams = new URLSearchParams(req.url.split("?")[1]);

  const paginationParams = parsePaginationParams(Object.fromEntries(urlParams));

  const { page, perPage } = paginationParams;

  const { contacts, total, ...paginationData } = await findAllContacts(
    req,
    res,
    { page, perPage }
  );

  res.writeHead(200, { "Content-Type": "application/json" });

  res.end(
    JSON.stringify({
      status: 200,
      message: "Successfully found contacts!",
      data: {
        contacts,
        total,
        pagination: paginationData,
      },
    })
  );
}

export async function deleteContactController(req, res, id) {
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
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ message: "Internal Server Error", error: error.message })
    );
    console.log(err.message);
  }
}

// create a product

export async function createContactController(req, res) {
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
