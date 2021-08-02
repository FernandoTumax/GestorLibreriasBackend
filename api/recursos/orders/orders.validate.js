const Joi = require("@hapi/joi");
const log = require("../../../utils/logger");

const blueprintOrder = Joi.object({
  fecha: Joi.required(),
  totalAPagar: Joi.number().positive().precision(2).required(),
  products: Joi.array().allow(""),
  schoolStore: Joi.allow(""),
  client: Joi.allow(""),
});

let validarPedido = (req, res, next) => {
  const resultado = blueprintOrder.validate(req.body, {
    abortEarly: false,
    convert: false,
  });
  if (resultado.error === undefined) {
    next();
  } else {
    log.info(
      "Fallo la validacion del pedido",
      resultado.error.details.map((error) => error.message)
    );
    res.status(400);
    res.send(
      "Informacion del pedido no cumple con el minimo. La fecha de ingreso tiene que ser del valida. El total tiene que ser en numeros positvos y tener solo 2 decimales"
    );
  }
};

module.exports = {
  validarPedido,
};
