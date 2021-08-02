const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  fecha: {
    type: String,
    required: [true, "El pedido necesita una fecha"],
  },
  totalAPagar: {
    type: Number,
    min: 0,
    required: [true, "El pedido necesita un total"],
  },
  products: [],
  schoolStore: {
    _id: {
      type: String,
      required: [true, "La libreria necesita un id"],
    },
    nameSchoolStore: {
      type: String,
      required: [true, "La libreria necesita un nombre"],
    },
    directionSchoolStore: {
      type: String,
      required: [true, "La libreria necesita una direccion"],
    },
    NIT: {
      type: Number,
      required: [true, "La libreria necesita un NIT"],
    },
  },
  client: {
    _id: {
      type: String,
      required: [true, "El cliente necesita un id"],
    },
    nombreCliente: {
      type: String,
      required: [true, "El cliente necesita un nombre"],
    },
    apellidoCliente: {
      type: String,
      required: [true, "El cliente necesita un apellido"],
    },
    emailCliente: {
      type: String,
      required: [true, "El cliente necesita un correo"]
    }
  },
});

module.exports = mongoose.model("orders", orderSchema);
