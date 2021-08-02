const Order = require("./orders.model");

function foundOrder() {
  return Order.find({});
}

function createOrder(order) {
  return new Order({ ...order }).save();
}

function deleteOrder(id) {
  return Order.findByIdAndRemove(id);
}

function foundOneOrder({ id: id }) {
  if (id) {
    return Order.findById(id);
  }
  throw new Error(
    "Funcion de obtener un pedido fue llamado sin especificar el id"
  );
}

module.exports = {
  foundOrder,
  createOrder,
  deleteOrder,
  foundOneOrder,
};
