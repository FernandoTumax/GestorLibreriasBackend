const Joi = require("@hapi/joi");
const fileType = require("file-type");
const log = require("../../../utils/logger");

const blueprintSchoolStore = Joi.object({
  name: Joi.string().min(4).max(100).required(),
  direction: Joi.string().min(4).max(200).required(),
  description: Joi.string().min(4).max(200).required(),
  NIT: Joi.number().min(9).required(),
  phone: Joi.number().min(8).required(),
  img: Joi.optional().allow(""),
  products: Joi.array().optional(),
  orders: Joi.array().optional(),
});

const blueprintUpdate = Joi.object({
  name: Joi.string().min(4).max(100).required(),
  direction: Joi.string().min(4).max(200).required(),
  description: Joi.string().min(4).max(200).required(),
  NIT: Joi.number().min(9).required(),
  phone: Joi.number().min(8).required(),
  img: Joi.optional().allow(""),
  products: Joi.array().optional(),
  orders: Joi.array().optional(),
  _id: Joi.optional().allow(""),
  __v: Joi.allow("").optional(),
});

const CONTENT_TYPES_PERMIT = ["image/jpeg", "image/jpg", "image/png"];

function validateImage(req, res, next) {
  let contentType = req.get("content-type");
  if (!CONTENT_TYPES_PERMIT.includes(contentType)) {
    log.warn(
      `Request para modificar imagen de la libreria con id [${req.params.id}] no tiene content-type valido [${contentType}]`
    );
    res.status(400).send({
      message: `Archivos de tipo [${contentType}] no son soportados. Usar uno de [${CONTENT_TYPES_PERMIT.join(
        ", "
      )}]`,
    });
    return;
  }

  let infoFile = fileType(req.body);

  if (!CONTENT_TYPES_PERMIT.includes(infoFile.mime)) {
    const message = `Disparidad entre content-type [${contentType}] y tipo de archivo [${infoFile.ext}]. Request no sera procesado`;
    log.warn(
      `${message}. Request dirigido a libreria con id [${req.params.id}]`
    );
    res.status(400).send({ message: message });
    return;
  }

  req.extensionDeArchivo = infoFile.ext;
  next();
}

const validateSchoolStore = (req, res, next) => {
  const resultado = blueprintSchoolStore.validate(req.body, {
    abortEarly: false,
    convert: false,
  });
  if (resultado.error === undefined) {
    next();
  } else {
    log.error(
      `Fallo en la validacion de la libreria: ${resultado.error.details.map(
        (err) => err.message
      )}`
    );
    res.status(400).send({
      message:
        "Informacion del usuario no cumple con los requisitos. verifique que la libreria lleve un nombre. verifique que la libreria lleve una direccion. verifique que la libreria lleve una descripcion. verifique que la libreria lleve un NIT",
    });
  }
};

const validateUpdate = (req, res, next) => {
  const resultado = blueprintUpdate.validate(req.body, {
    abortEarly: false,
    convert: false,
  });
  if (resultado.error === undefined) {
    next();
  } else {
    log.error(
      `Fallo en la validacion de la libreria: ${resultado.error.details.map(
        (err) => err.message
      )}`
    );
    res.status(400).send({
      message:
        "Informacion del usuario no cumple con los requisitos. verifique que la libreria lleve un nombre. verifique que la libreria lleve una direccion. verifique que la libreria lleve una descripcion. verifique que la libreria lleve un NIT",
    });
  }
};

module.exports = {
  validateSchoolStore,
  validateImage,
  validateUpdate
};
