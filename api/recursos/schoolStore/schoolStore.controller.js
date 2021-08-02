const SchoolStore = require("./schoolStore.model");

function foundSchoolStore() {
  return SchoolStore.find({}).populate("products");
}

function createSchoolStore(schoolStore) {
  return new SchoolStore({
    ...schoolStore,
  }).save();
}

function deleteSchoolStore(schoolStore) {
  return SchoolStore.findByIdAndDelete(schoolStore);
}

function updateSchoolStore(id, schoolStore) {
  return SchoolStore.findOneAndUpdate(
    { _id: id },
    { ...schoolStore },
    { new: true }
  );
}

function setProducts(id, product) {
  return SchoolStore.findOneAndUpdate(
    { _id: id },
    { $push: { products: product } },
    { new: true }
  );
}

function deleteProduct(id, product) {
  return SchoolStore.findOneAndUpdate(
    { _id: id },
    { $pull: { products: product } },
    { new: true }
  );
}

function setOrders(id, order) {
  return SchoolStore.findOneAndUpdate(
    { _id: id },
    { $push: { orders: order } },
    { new: true }
  );
}

function deleteOrders(id, order){
  return SchoolStore.findOneAndUpdate({_id: id}, {$pull: {orders: order}}, {new:true})
}


function existingSchoolStore(name) {
  return new Promise((resolve, reject) => {
    SchoolStore.find()
      .populate("products")
      .or([{ name: name }])
      .then((librerias) => {
        resolve(librerias.length > 0);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function foundOneSchoolStore({ name: name, id: id }) {
  if (name) {
    return SchoolStore.findOne({ name: name }).populate("products");
  }
  if (id) {
    return SchoolStore.findById(id).populate("products");
  }
  throw new Error(
    "Funcion obtener librerias del controlador fue llamado sin especificar el nombre o el id"
  );
}

function saveImg(id, imageUrl) {
  return SchoolStore.findOneAndUpdate(
    { _id: id },
    { img: imageUrl },
    { new: true }
  );
}

module.exports = {
  foundSchoolStore,
  createSchoolStore,
  deleteSchoolStore,
  updateSchoolStore,
  setProducts,
  deleteProduct,
  existingSchoolStore,
  foundOneSchoolStore,
  saveImg,
  setOrders,
  deleteOrders
};
