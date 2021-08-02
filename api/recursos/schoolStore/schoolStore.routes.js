const express = require("express");
const passport = require("passport");
const uuidv4 = require("uuid/v4");

const log = require("../../../utils/logger");
const schoolStoreController = require("./schoolStore.controller");
const userController = require("../user/user.controller");
const validateImage = require("./schoolStore.validate").validateImage;
const validateSchoolStore =
  require("./schoolStore.validate").validateSchoolStore;
const validateUpdate = require("./schoolStore.validate").validateUpdate;
const procesarErrores = require("../../libs/errorHandler").procesarErrores;
const { saveImageSchoolStore } = require("../../data/images.controller");
const {
  DatosDeLibreriaYaEnUso,
  LibreriaNoExiste,
} = require("./schoolStore.error");

const jwtAuthenticate = passport.authenticate("jwt", { session: false });
const schoolStoreRouter = express.Router();

function transformarBodyALowerCase(req, res, next) {
  req.body.name && (req.body.name = req.body.name.toLowerCase());
  req.body.direction && (req.body.direction = req.body.direction.toLowerCase());
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

schoolStoreRouter.get(
  "/",
  [jwtAuthenticate],
  procesarErrores((req, res) => {
    return schoolStoreController.foundSchoolStore().then((schoolStore) => {
      res
        .status(200)
        .send({ message: "Librerias encontradas", librerias: schoolStore });
    });
  })
);

schoolStoreRouter.get(
  "/oneSchoolStore/:id",
  [jwtAuthenticate, validarId],
  procesarErrores((req, res) => {
    let id = req.params.id;

    return schoolStoreController
      .foundOneSchoolStore({ id: id })
      .then((schoolStore) => {
        res
          .status(200)
          .send({ message: "Libreria encontrada", libreria: schoolStore });
      });
  })
);

schoolStoreRouter.post(
  "/create",
  [jwtAuthenticate, validateSchoolStore, transformarBodyALowerCase],
  procesarErrores(async (req, res) => {
    let newSchoolStore = req.body;
    let schoolStoreExisting;

    schoolStoreExisting = await schoolStoreController.existingSchoolStore(
      newSchoolStore.name
    );

    if (schoolStoreExisting) {
      log.warn(`La libreria con nombre [${newSchoolStore.name}] ya existe`);
      throw new DatosDeLibreriaYaEnUso();
    }

    schoolStoreController
      .createSchoolStore(newSchoolStore)
      .then((schoolStore) => {
        log.info("Libreria creada con exito");
        userController
          .setSchoolStore(req.user.id, schoolStore._id)
          .then((userUpdated) => {
            res
              .status(201)
              .send({ message: "Libreria creada", libreria: schoolStore });
            log.info(
              `Usuario con id [${userUpdated._id}] ha sido actualizado con una nueva libreria`
            );
          });
      });
  })
);

schoolStoreRouter.put(
  "/:id",
  [jwtAuthenticate, validarId, validateUpdate, transformarBodyALowerCase],
  procesarErrores(async (req, res) => {
    let id = req.params.id;
    let schoolStoreExisting;

    schoolStoreExisting = await schoolStoreController.foundOneSchoolStore({
      id: id,
    });

    if (!schoolStoreExisting) {
      log.warn(`La libreria con id [${id}] no existe en la base de datos`);
      throw new LibreriaNoExiste();
    }

    schoolStoreController
      .updateSchoolStore(id, req.body)
      .then((schoolStoreUpdated) => {
        res.send({
          message: "Libreria actualizada",
          libreria: schoolStoreUpdated,
        });
      });
  })
);

schoolStoreRouter.delete(
  "/:id",
  [jwtAuthenticate, validarId],
  procesarErrores(async (req, res) => {
    let id = req.params.id;
    let schoolStoreExisting;

    schoolStoreExisting = await schoolStoreController.foundOneSchoolStore({
      id: id,
    });

    if (!schoolStoreExisting) {
      log.warn(`La libreria con id [${id}] no existe en la base de datos`);
      throw new LibreriaNoExiste();
    }

    schoolStoreController.deleteSchoolStore(id).then((schoolStoreDeleted) => {
      log.info(`La libreria con id [${id}] ha sido eliminada`);
      userController.deleteSchoolStore(req.user.id, id).then((userUpdated) => {
        log.info(
          `El usuario con id [${req.user.id}] ha sido actualizado. Se ha eliminado la libreria que le pertenece`
        );
        res.send({
          message: "Libreria eliminada",
          libreria: schoolStoreDeleted,
        });
      });
    });
  })
);

schoolStoreRouter.put(
  "/:id/image",
  [jwtAuthenticate, validateImage],
  procesarErrores(async (req, res) => {
    const id = req.params.id;

    const file = req.body;

    let fileBuffer = Buffer.from(file);

    log.debug(
      `Request recibido de la libreria [${id}] para guardar imagen de la libreria`
    );

    const nameRandom = `${uuidv4()}.${req.extensionDeArchivo}`;

    await saveImageSchoolStore(fileBuffer, nameRandom);

    const urlImage = `https://data-image-gestor-librerias.s3.us-east-2.amazonaws.com/images-librerias/${nameRandom}`;

    const schoolStoreUpdated = await schoolStoreController.saveImg(
      id,
      urlImage
    );

    log.info(
      `Imagen de la libreria con id [${id}] fue modificada. Link de la nueva imagen [${urlImage}]`
    );

    res
      .status(200)
      .send({ message: "Imagen subida", libreria: schoolStoreUpdated });
  })
);

module.exports = schoolStoreRouter;
