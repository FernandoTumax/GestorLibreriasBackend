class PedidoNoExiste extends Error {
  constructor(message) {
    super(message);
    this.message = message || "Esta pedido no existe en la base de datos";
    this.status = 204;
    this.name = "PedidoNoExiste";
  }
}

module.exports = {
  PedidoNoExiste,
};
