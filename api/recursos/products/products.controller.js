const Product = require("./products.model");

function foundProduct() {
  return Product.find({});
}

function createProduct(product) {
  return new Product({
    ...product,
  }).save();
}

function updateProduct(id, product) {
  return Product.findOneAndUpdate({ _id: id }, { ...product }, { new: true });
}

function deleteProduct(id) {
  return Product.findByIdAndDelete(id);
}

function existingProduct(name) {
  return new Promise((resolve, reject) => {
    Product.find()
      .or([{ name: name }])
      .then((producto) => {
        resolve(producto.length > 0);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function foundOneProduct({ id: id, name: name }) {
  if (id) {
    return Product.findById(id);
  }
  if (name) {
    return Product.findOne({ name: name });
  }
  throw new Error(
    "Funcion obtener un producto del controlador fue llamado sin especificar el id o el nombre"
  );
}

function saveImg(id, imageUrl) {
  return Product.findOneAndUpdate(
    { _id: id },
    { img: imageUrl },
    { new: true }
  );
}

module.exports = {
  foundProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  existingProduct,
  foundOneProduct,
  saveImg,
};
