const Joi = require("@hapi/joi");
const fileType = require('file-type')
const log = require("../../../utils/logger");

const blueprintProduct = Joi.object({
  name: Joi.string().min(4).max(200).required(),
  description: Joi.string().min(4).max(300).required(),
  price: Joi.number().positive().precision(2).required(),
  stock: Joi.number().positive().precision(0).required(),
  img: Joi.string().allow("").optional(),
});

const blueprintUpdate = Joi.object({
  name: Joi.string().min(4).max(200).required(),
  description: Joi.string().min(4).max(300).required(),
  price: Joi.number().positive().precision(2).required(),
  stock: Joi.number().positive().precision(0).required(),
  img: Joi.string().allow("").optional(),
  _id: Joi.optional().allow(""),
  __v: Joi.allow("").optional(),
  cantidad: Joi.allow("").optional()
})

const CONTENT_TYPES_PERMIT = ["image/jpeg", "image/jpg", "image/png"];

function validateImage(req, res, next){
    let contentType = req.get("content-type");
    if(!CONTENT_TYPES_PERMIT.includes(contentType)){
        log.warn(`Request para modificar imagen de la libreria con id [${req.params.id}] no tiene content-type valido [${contentType}]`)
        res.status(400).send({
            message: `Archivos de tipo [${contentType}] no son soportados. Usar uno de [${CONTENT_TYPES_PERMIT.join(",")}]`
        })
        return
    }

    let infoFile = fileType(req.body);

    if(!CONTENT_TYPES_PERMIT.includes(infoFile.mime)){
        const message = `Disparidad entre content-type [${contentType}] y tipo de archivo [${infoFile.ext}]. Request no sera procesado`;
        log.warn(`${message}. Request dirigido a producto con id [${req.params.id}]`)
        res.status(400).send({message: message})
        return
    };

    req.extensionDeArchivo = infoFile.ext;
    next();

}

let validateUpdate = (req, res, next) => {
  const resultado = blueprintUpdate.validate(req.body, {
    abortEarly: false,
    convert: false
  })
  if(resultado.error === undefined){
    next();
  }else{
    log.warn(`Error al validar el producto: ${resultado.error.details.map((error) => error.message)}`)
    res.status(400).send({
      message: "Informacion del producto no cumple con los requisitos minimos: Verifique que el nombre tenga entre 4 y 200 caracteres. Verifique que la descripcion tenga entre 4 y 300 caracteres. Verifique que el precio sea positivo, tenga solo dos decimales. Verifique que el stock sea positivo"
    })
  }
}

let validateProduct = (req, res, next) => {
  const resultado = blueprintProduct.validate(req.body, {
    abortEarly: false,
    convert: false,
  });
  if (resultado.error === undefined) {
    next();
  } else {
    log.warn(
      `Error al validar el producto: ${resultado.error.details.map(
        (error) => error.message
      )}`
    );
    res
      .status(400)
      .send({
        message:
          "Informacion del producto no cumple con los requisitos minimos: Verifique que el nombre tenga entre 4 y 200 caracteres. Verifique que la descripcion tenga entre 4 y 300 caracteres. Verifique que el precio sea positivo, tenga solo dos decimales. Verifique que el stock sea positivo",
      });
  }
};

module.exports = {
  validateProduct,
  validateImage,
  validateUpdate
};
