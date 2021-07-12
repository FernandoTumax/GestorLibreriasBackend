const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, "El producto necesita de un nombre"] },
  description: {
    type: String,
    required: [true, "El producto necesita una descripcion"],
  },
  price: { type: Number, required: [true, "El producto necesita un precio"] },
  stock: { type: Number, required: [true, "El producto necesita un stock"] },
  img: { type: String },
});

module.exports = mongoose.model("product", productSchema);
