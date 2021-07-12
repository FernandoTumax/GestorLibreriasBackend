const Usuario = require("./user.model");

function foundUser() {
  return Usuario.find({}).populate("schoolStore");
}

function createUser(user, hashedPassword) {
  return new Usuario({
    ...user,
    password: hashedPassword,
  }).save();
}

function deleteUser(user) {
  return Usuario.findByIdAndDelete(user);
}

function updateUser(id, user) {
  return Usuario.findOneAndUpdate({ _id: id }, { ...user }, { new: true });
}

function setSchoolStore(id, schoolStore) {
  return Usuario.findOneAndUpdate(
    { _id: id },
    { $push: { schoolStore: schoolStore } },
    { new: true }
  );
}

function setshoppingCar(id, shoppingCar) {
  return Usuario.findOneAndUpdate(
    { _id: id },
    { $push: { shoppingCar: shoppingCar } },
    { new: true }
  );
}

function deleteSchoolStore(id, schoolStore) {
  return Usuario.findOneAndUpdate(
    { _id: id },
    { $pull: { schoolStore: schoolStore } },
    { new: true }
  );
}

function deleteShoppingCar(id) {
  return Usuario.findOneAndUpdate(
    { _id: id },
    { shoppingCar: [] },
    { new: true }
  );
}

function existingUser(username, email) {
  return new Promise((resolve, reject) => {
    Usuario.find()
      .or([{ username: username }, { email: email }])
      .populate("schoolStore")
      .then((usuarios) => {
        resolve(usuarios.length > 0);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function foundOneUser({ username: username, id: id, email: email }) {
  if (username) {
    return Usuario.findOne({ username: username }).populate("schoolStore");
  }
  if (email) {
    return Usuario.findOne({ email: email }).populate("schoolStore");
  }
  if (id) {
    return Usuario.findById(id).populate("schoolStore");
  }
  throw new Error(
    "Funcion obtener usuarios del controlador fue llamado sin especificar el username, id o email"
  );
}

function saveImg(id, imageUrl) {
  return Usuario.findOneAndUpdate(
    { _id: id },
    { img: imageUrl },
    { new: true }
  );
}

module.exports = {
  foundUser,
  createUser,
  deleteUser,
  updateUser,
  deleteShoppingCar,
  setSchoolStore,
  deleteSchoolStore,
  existingUser,
  foundOneUser,
  saveImg,
  setshoppingCar
};
