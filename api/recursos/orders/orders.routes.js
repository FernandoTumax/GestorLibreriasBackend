const express = require("express");
const passport = require("passport");

const log = require("./../../../utils/logger");
const validarPedido = require("./orders.validate").validarPedido;
const ordersController = require("./orders.controller");
const schoolStoreController = require("../schoolStore/schoolStore.controller");
const userController = require('../user/user.controller');
const producerMQ = require('./orders.queue');
const procesarErrores = require("./../../libs/errorHandler").procesarErrores;
const { PedidoNoExiste } = require("./orders.error");

const jwtAuthenticate = passport.authenticate("jwt", { session: false });
const orderRouter = express.Router();

function validarId(req, res, next) {
  let id = req.params.id;

  if (id.match(/^[a-fA-F0-9]{24}$/) == null) {
    res.status(400).send(`El id ${id} suministrado en el URL no es valido`);
    return;
  }
  next();
}

orderRouter.get(
  "/",
  procesarErrores((req, res) => {
    return ordersController.foundOrder().then((order) => {
      res.status(200).send({ message: "Pedido encontrar", pedido: order });
    });
  })
);

orderRouter.get(
  "/oneOrder/:id",
  [jwtAuthenticate, validarId],
  procesarErrores((req, res) => {
    let id = req.params.id;

    return ordersController.foundOneOrder({ id: id }).then((order) => {
      res.status(200).send({ message: "Pedido encontrado", pedido: order });
    });
  })
);

orderRouter.post(
  "/create/:idL/:idU",
  [jwtAuthenticate, validarPedido],
  procesarErrores(async (req, res) => {
    let newOrder = req.body;
    let schoolStoreId = req.params.idL;
    let orderExisting;
    let user = req.params.idU;
    console.log(newOrder);
    ordersController.createOrder(newOrder).then((order) => {
      producerMQ.publicMessage(order, 'facturacionKey').then(resultado => {
        log.info('Se encolo el pedido para el envio de el pedido')
      }).catch(err => {
        log.error(`Se provoco un error al momento de encolar el pedido: ${err}`)
      })
      log.info("Pedido creada con exito");
      schoolStoreController
        .setOrders(schoolStoreId, order._id)
        .then((schoolStoreUpdated) => {
          log.info("Libreria actualizada con un pedido");
          userController.deleteShoppingCar(user).then((user) => {
            log.info("El carrito del usuario esta vacio")
            res.send({ message: "Pedido realizado", orders: order });
          })
        });
    });
  })
);

orderRouter.delete(
  "/deleteOrder/:id/:idL",
  jwtAuthenticate,
  procesarErrores(async (req, res) => {
    let orderId = req.params.id;
    let schoolStoreId = req.params.idL;
    let orderExisting;

    orderExisting = await ordersController.foundOneOrder({ id: orderId });

    if (!orderExisting) {
      log.warn(`La order con id [${orderId}] no existe en la base de datos`);
      throw new PedidoNoExiste();
    }

    ordersController.deleteOrder(orderId).then((orderRemoved) => {
      log.info(`El pedido con id [${orderId}] fue eliminado`);
      schoolStoreController
        .deleteOrders(schoolStoreId, orderId)
        .then((schoolStoreUpdated) => {
          log.info(`La libreria con id [${schoolStoreId}] fue actualizada`);
          res
            .status(200)
            .send({ message: "Pedido eliminado", order: orderRemoved });
        });
    });
  })
);

module.exports = orderRouter;