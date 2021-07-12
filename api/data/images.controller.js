const AWS = require("aws-sdk");
const config = require("../../config");

const s3Client = new AWS.S3({
  ...config.s3,
});

exports.doUpload = (req, res) => {
  const params = {
    Bucket: "data-image-gestor-librerias",
    Key: `images-usuarios/${req.file.originalname}`,
    Body: req.file.buffer,
  };

  s3Client.upload(params, (err, data) => {
    if (err) {
      res.status(204).send({ message: "No se encontro la imagen" });
    }
    res.send({
      message: `Imagen subida con exito!! con nombre => ${req.file.originalname}`,
    });
  });
};

function saveImageUser(imageData, nameFile) {
  return s3Client
    .putObject({
      Body: imageData,
      Bucket: "data-image-gestor-librerias",
      Key: `images-usuarios/${nameFile}`,
    })
    .promise();
}

function saveImageSchoolStore(imageData, nameFile) {
  return s3Client
    .putObject({
      Body: imageData,
      Bucket: "data-image-gestor-librerias",
      Key: `images-librerias/${nameFile}`,
    })
    .promise();
}

function saveImageProduct(imageData, nameFile) {
  return s3Client
    .putObject({
      Body: imageData,
      Bucket: "data-image-gestor-librerias",
      Key: `images-productos/${nameFile}`,
    })
    .promise();
}

module.exports = {
  saveImageUser,
  saveImageSchoolStore,
  saveImageProduct,
  s3Client
};
