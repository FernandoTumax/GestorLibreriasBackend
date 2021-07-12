const Joi = require("@hapi/joi");
const fileType = require("file-type");
const log = require("../../../utils/logger");

const blueprintUser = Joi.object({
  username: Joi.string().alphanum().min(4).max(40).required(),
  password: Joi.string().min(6).max(200).required(),
  email: Joi.string().email().required(),
  name: Joi.string().min(4).max(100).required(),
  lastname: Joi.string().min(4).max(150).required(),
  role: Joi.string().valid("Cliente", "Propietario").required(),
  img: Joi.optional().allow(""),
  shoppingCar: Joi.array(),
  schoolStore: Joi.array()
});

const CONTENT_TYPES_PERMIT = ["image/jpeg", "image/jpg", "image/png", "application/octet-stream"];

function validateImage(req, res, next) {
  let contentType = req.get("content-type");
  if (!CONTENT_TYPES_PERMIT.includes(contentType)) {
    log.warn(
      `Request para modificar imagen del usuario con id [${req.params.id}] no tiene content-type valido [${contentType}]`
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
      `${message}. Request dirigido a usuario con id [${req.params.id}] de usuario [${req.user.username}]`
    );
    res.status(400).send({ message: message });
    return;
  }

  log.info('Hola a todos', req.body);

  req.extensionDeArchivo = infoFile.ext;
  next();
}

const validateUser = (req, res, next) => {
  const resultado = blueprintUser.validate(req.body, {
    abortEarly: false,
    convert: false,
  });
  if (resultado.error === undefined) {
    next();
  } else {
    log.debug(
      `Fallo en la validacion del usuario ${resultado.error.details.map(
        (error) => error.message
      )}`
    );
    res.status(400).send({
      message:
        `
          Informacion del usuario no cumple con los requisitos:

          El nombre de usuario debe ser alfanumerico y tener entre 3 y 30 caracteres.
        
          La contraseña debe tener entre 6 y 200 caracteres.
        
          El usuario necesita tener un email valido.
        
          El usuario necesita un nombre.
        
          El usuario necesita un apellido.
        
          Asegurese que los roles sean 'Cliente' o 'Propietario'.
         `,
    });
  }
};

const blueprintLogin = Joi.object({
  username: Joi.allow(""),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(200).required(),
  name: Joi.allow(""),
  lastname: Joi.allow(""),
  role: Joi.allow(""),
  img: Joi.optional().allow(""),
  shoppingCar: Joi.array(),
  schoolStore: Joi.array()
});

const validateLogin = (req, res, next) => {
  const resultado = blueprintLogin.validate(req.body, {
    abortEarly: false,
    convert: false,
  });
  if (resultado.error === undefined) {
    next();
  } else {
    log.debug(
      `Fallo en la validacion del login ${resultado.error.details.map(
        (error) => error.message
      )}`
    );
    res.status(400).send({
      message:
        "Informacion del usuario no cumple con los requisitos. El email tiene que ser uno valido. la contraseña tiene que tener entre 6 y 200 caracteres.",
    });
  }
};

const blueprintUpdate = Joi.object({
  username: Joi.string().alphanum().min(4).max(40).required(),
  email: Joi.string().email().required(),
  name: Joi.string().min(4).max(100).required(),
  lastname: Joi.string().min(4).max(150).required(),
  shoppingCar: Joi.array().optional(),
  schoolStore: Joi.array().optional(),
  _id: Joi.optional().allow(''),
  role: Joi.optional().allow(''),
  img: Joi.optional().allow(''),
  __v: Joi.allow('').optional()
});

const validateUpdate = (req, res, next) => {
  const resultado = blueprintUpdate.validate(req.body, {
    abortEarly: false,
    convert: false,
  });
  if (resultado.error === undefined) {
    next();
  } else {
    log.debug(
      `Fallo en la validacion del update ${resultado.error.details.map(
        (error) => error.message
      )}`
    );
    res.status(400).send({
      message:
        "Informacion del usuario no cumple con los requisitos. El username tiene que ser alphanumerico. El email tiene que ser valido. El nombre tiene que tener entre 4 y 100 caracteres. El apellido tiene que tener entre 4 y 150 caracteres.",
    });
  }
};

module.exports = {
  validateUser,
  validateLogin,
  validateUpdate,
  validateImage,
};
