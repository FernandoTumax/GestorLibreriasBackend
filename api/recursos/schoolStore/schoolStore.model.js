const mongoose = require("mongoose");

const schoolStoreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "La libreria necesita de un nombre"],
  },
  direction: {
    type: String,
    required: [true, "La libreria necesita de una direccion"],
  },
  description: {
    type: String,
    required: [true, "La libreria necesita de una descripcion"],
  },
  phone: {
    type: Number,
    required: [true, "La libreria necesita un numero de telefono"],
  },
  NIT: {
    type: Number,
    required: [true, "La libreria necesita un NIT"],
  },
  img: {
    type: String,
  },
  products: [{ type: mongoose.Schema.ObjectId, ref: "product" }],
  orders: [{ type: mongoose.Schema.ObjectId, ref: "orders" }],
});

module.exports = mongoose.model("schoolStore", schoolStoreSchema);
