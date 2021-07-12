const express = require("express");
const passport = require("passport");
const uuidv4 = require("uuid/v4");

const log = require("../../../utils/logger");
const productController = require("./products.controller");
const schoolStoreController = require("../schoolStore/schoolStore.controller");
const { saveImageProduct } = require("../../data/images.controller");
const validateProduct = require("./products.validate").validateProduct;
const validateImage = require("./products.validate").validateImage;
const validateUpdate = require('./products.validate').validateUpdate;
const {
  DatosDeProductoYaEnUso,
  ProductoNoExiste,
} = require("./products.error");
const procesarErrores = require("../../libs/errorHandler").procesarErrores;

const jwtAuthenticate = passport.authenticate("jwt", { session: false });
const productRouter = express.Router();

function transformarBodyALowerCase(req, res, next) {
  req.body.name && (req.body.name = req.body.name.toLowerCase());
  req.body.description &&
    (req.body.description = req.body.description.toLowerCase());
  next();
}

function validarId(req, res, next) {
  let id = req.params.id;

  if (id.match(/^[a-fA-F0-9]{24}$/ === null)) {
    res
      .status(400)
      .send({ message: `El id [${id}] suministrado en la URI no es valido` });
    return;
  }
  next();
}

productRouter.get(
  "/",
  jwtAuthenticate,
  procesarErrores((req, res) => {
    return productController.foundProduct().then((productos) => {
      log.info(`Productos encontrados`);
      res
        .status(200)
        .send({ message: "Productos encontrados", products: productos });
    });
  })
);

productRouter.get(
  "/:id",
  jwtAuthenticate,
  procesarErrores((req, res) => {
    let id = req.params.id;

    return productController.foundOneProduct({ id: id }).then((producto) => {
      log.info(`Producto con id [${id}] encontrado`);
      res
        .status(200)
        .send({ message: "Producto encontrado", product: producto });
    });
  })
);

productRouter.post(
  "/:id/create",
  [jwtAuthenticate, validarId, validateProduct, transformarBodyALowerCase],
  procesarErrores(async (req, res) => {
    let newProduct = req.body;
    let idSchoolStore = req.params.id;
    let productExisting;

    productExisting = await productController.foundOneProduct({
      name: newProduct.name,
    });

    if (productExisting) {
      log.warn(
        `El producto con nombre [${newProduct.name}] ya existe en la base de datos`
      );
      throw new DatosDeProductoYaEnUso();
    }

    productController.createProduct(newProduct).then((producto) => {
      log.info(`Producto creado en la base de datos`);
      schoolStoreController
        .setProducts(idSchoolStore, producto._id)
        .then((schoolStoreUpdated) => {
          log.info(`La libreria con id [${idSchoolStore}] ha sido actualizada`);
          res
            .status(201)
            .send({ message: "Producto creado", product: producto });
        });
    });
  })
);

productRouter.put(
  "/:id",
  [jwtAuthenticate, validarId, validateUpdate, transformarBodyALowerCase],
  procesarErrores(async (req, res) => {
    let id = req.params.id;
    let productExisting;

    productExisting = await productController.foundOneProduct({ id: id });

    if (!productExisting) {
      log.warn(`El producto con id [${id}] no existe en la base de datos`);
      throw new ProductoNoExiste();
    }

    productController.updateProduct(id, req.body).then((productUpdated) => {
      log.info(`El producto fue actualizado con exito`);
      res.status(200).send({
        message: "Producto actualizado con exito",
        product: productUpdated,
      });
    });
  })
);

productRouter.delete(
  "/:id/:idS",
  [jwtAuthenticate],
  procesarErrores(async (req, res) => {
    let idProduct = req.params.id;
    let idSchoolStore = req.params.idS;
    let productExisting;

    productExisting = await productController.foundOneProduct({
      id: idProduct,
    });

    if (!productExisting) {
      log.warn(`El producto con id [${id}] no existe en la base de datos`);
      throw new ProductoNoExiste();
    }

    productController.deleteProduct(idProduct).then((productRemoved) => {
      log.info(`El producto con id [${idProduct}] fue eliminado`);
      schoolStoreController
        .deleteProduct(idSchoolStore, idProduct)
        .then((schoolStoreUpdated) => {
          log.info(`La libreria con id [${idSchoolStore}] fue actualizado`);
          res
            .status(200)
            .send({ message: "Producto eliminado", product: productRemoved });
        });
    });
  })
);

productRouter.put(
  "/:id/image",
  [jwtAuthenticate, validateImage],
  procesarErrores(async (req, res) => {
    const id = req.params.id;
    log.debug(
      `Request recibido del producto con id [${id}] para guardar imagen del producto`
    );

    const nameRandom = `${uuidv4()}.${req.extensionDeArchivo}`;

    await saveImageProduct(req.body, nameRandom);

    const urlImage = `https://data-image-gestor-librerias.s3.us-east-2.amazonaws.com/images-productos/${nameRandom}`;

    const productUpdated = await productController.saveImg(id, urlImage);

    log.info(
      `Imagen del producto con id [${id}] fue modificada. Link de la nueva imagen [${urlImage}]`
    );

    res
      .status(200)
      .send({ message: "Imagen subida", producto: productUpdated });
  })
);

module.exports = productRouter;
