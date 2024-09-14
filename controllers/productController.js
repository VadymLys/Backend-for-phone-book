import { deleteContactById, findAllContacts } from "../models/productModel.js";
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

async function createProduct(req, res) {
  try {
    const body = await getPostData(req);

    const { title, description, price } = JSON.parse(body);

    const product = {
      title,
      description,
      price,
    };

    const newProduct = await Product.create(product);

    res.writeHead(201, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(newProduct));
  } catch (error) {
    console.log(error.message);
  }
}

async function updateProduct(req, res, id) {
  try {
    const putProduct = await Product.findById(id);

    if (!putProduct) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Product not exist" }));
    } else {
      const body = await getPostData(req);

      const { title, description, price } = JSON.parse(body);

      const productData = {
        title: title || putProduct.title,
        description: description || putProduct.description,
        price: price || putProduct.price,
      };

      const updProduct = await Product.update(id, productData);

      res.writeHead(201, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(updProduct));
    }
  } catch (error) {
    console.log(error.message);
  }
}

async function deleteProduct(req, res, id) {
  try {
    const product = await Product.findById(id);

    if (!product) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Product not exist" }));
    } else {
      await Product.remove(id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: `Product ${id} has been deleted` }));
    }
  } catch (error) {
    console.log(error.message);
  }
}
