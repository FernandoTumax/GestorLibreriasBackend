const mongoose = require("mongoose");
const log = require("./../../utils/logger");
const fileToArrayBuffer = require('file-to-array-buffer')

exports.procesarErrores = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
};

exports.procesarErroresDeDB = (err, req, res, next) => {
  if (err instanceof mongoose.Error || err.name === "MongoError") {
    log.error("Ocurrio un error relacionado a mongoose.", err);
    err.message =
      "Error relacionado con la base de datos ocurrio inesperadamente. Para ayudar contacte con fernandotumax11@gmail.com";
    err.status = 500;
  }
  next(err);
};

exports.erroresEnProduccion = (err, req, res, next) => {
  res.status(err.status || 500);
  log.error(err.message)
  res.send({ message: err.message });
};

exports.erroresEnDesarrollo = (err, req, res, next) => {
  res.status(err.status || 500);
  log.error(err.message)
  res.send({ message: err.message });
};
