const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "El usuario necesita un username"],
  },
  email: {
    type: String,
    required: [true, "El usuario necesita un email"],
  },
  password: {
    type: String,
    required: [true, "El usuario necesita una contraseña"],
  },
  name: {
    type: String,
    required: [true, "El usuario necesita un nombre"],
  },
  lastname: {
    type: String,
    required: [true, "El usuario necesita un apellido"],
  },
  role: {
    type: String,
    required: [true, "El usuario necesita un rol"],
  },
  img: {
    type: String,
  },
  shoppingCar: [],
  schoolStore: [{type: mongoose.Schema.ObjectId, ref:'schoolStore'}]
});

module.exports = mongoose.model("user", userSchema);
