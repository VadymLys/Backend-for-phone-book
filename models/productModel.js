import { ContactCollection } from "../db/models/contact.js";

export async function findAllContacts(req, res, userId) {
  try {
    const contacts = await ContactCollection.find({ userId });

    res.writeHead(200, { "Content-Type": "application/json" });

    res.end(
      JSON.stringify({
        status: 200,
        message: "Successfully found contacts!",
        data: contacts,
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

function findById(id) {
  return new Promise((resolve, reject) => {
    const product = products.find((p) => p.id === id);
    resolve(product);
  });
}

function create(product) {
  return new Promise((resolve, reject) => {
    const newProduct = { id: uuidv4(), ...product };
    products.push(newProduct);
    writeDataToFile("../products.json", products);
    resolve(newProduct);
  });
}

function update(id, product) {
  return new Promise((resolve, reject) => {
    const index = products.findIndex((p) => p.id === id);
    products[index] = { id, ...product };

    writeDataToFile("../products.json", products);
    resolve(products[index]);
  });
}

function remove(id) {
  return new Promise((resolve, reject) => {
    products = products.filter((p) => p.id !== id);

    writeDataToFile("../products.json", products);
    resolve();
  });
}
