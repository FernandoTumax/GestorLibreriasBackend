const express = require("express");
const bodyparser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const passport = require("passport");
const cors = require("cors");

const log = require("./utils/logger");
const authJWT = require("./api/libs/auth");
const config = require("./config");
const errorHandler = require("./api/libs/errorHandler");
const userRouter = require("./api/recursos/user/user.routes");
const schoolStoreRouter = require("./api/recursos/schoolStore/schoolStore.routes");
const productRouter = require("./api/recursos/products/products.routes");
const orderRouter = require('./api/recursos/orders/orders.routes');

passport.use(authJWT);

mongoose.connect("mongodb://127.0.0.1:27017/gestorlibrerias");
mongoose.connection.on("error", () => {
  log.error("Fallo la conexion a mongodb");
  process.exit(1);
});

mongoose.set("useFindAndModify", false);

const app = express();

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(bodyparser.raw({ type: "image/*", limit: "25mb" }));

app.use(cors());

app.use(
  morgan("short", {
    stream: {
      write: (message) => log.info(message.trim()),
    },
  })
);

app.use(passport.initialize());

app.use("/usuarios", userRouter);
app.use("/librerias", schoolStoreRouter);
app.use("/productos", productRouter);
app.use("/pedidos", orderRouter);


app.use(errorHandler.procesarErroresDeDB);
if (config.ambiente === "prod") {
  app.use(errorHandler.erroresEnProduccion);
} else {
  app.use(errorHandler.erroresEnDesarrollo);
}

const server = app.listen(config.puerto, () => {
  log.info("Escuchando en el puerto 3000");
});

module.exports = {
  app,
  server,
};
