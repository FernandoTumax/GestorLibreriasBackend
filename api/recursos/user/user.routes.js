const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const uuidv4 = require("uuid/v4");
const multipart = require("connect-multiparty");
const multuparty = require("multiparty");
const fs = require("fs");

const multipartMiddleware = multipart({ uploadDir: "./api/uploads" });
const log = require("../../../utils/logger");
const config = require("../../../config");
const validateUser = require("./user.validate").validateUser;
const validateLogin = require("./user.validate").validateLogin;
const validateUpdate = require("./user.validate").validateUpdate;
const validateImage = require("./user.validate").validateImage;
const userController = require("./user.controller");
const { saveImageUser, s3Client } = require("../../data/images.controller");
const image = require("../../data/images.controller");
const procesarErrores = require("../../libs/errorHandler").procesarErrores;
const upload = require("../../../config/multer");
const {
  DatosDeUsuarioYaEnUso,
  CredencialesIncorrectas,
  UsuarioNoExiste,
  ProductoYaExistenEnElCarrito,
} = require("./user.error");

const jwtAuthenticate = passport.authenticate("jwt", { session: false });
const userRouter = express.Router();

function transformarBodyALowerCase(req, res, next) {
  req.body.username && (req.body.username = req.body.username.toLowerCase());
  req.body.name && (req.body.name = req.body.name.toLowerCase());
  req.body.email && (req.body.email = req.body.email.toLowerCase());
  req.body.lastname && (req.body.lastname = req.body.lastname.toLowerCase());
  next();
}

function validarId(req, res, next) {
  let id = req.params.id;

  if (id.match(/^[a-fA-F0-9]{24}$/) === null) {
    res
      .status(400)
      .send({ message: `El id [${id}] suministrado en la URL no es valido` });
    return;
  }
  next();
}

userRouter.get(
  "/",
  jwtAuthenticate,
  procesarErrores((req, res) => {
    return userController.foundUser().then((usuarios) => {
      res
        .status(200)
        .send({ message: "Usuarios encontraods", usuarios: usuarios });
    });
  })
);

userRouter.get(
  "/oneUser/:id",
  [jwtAuthenticate, validarId],
  procesarErrores((req, res) => {
    let id = req.params.id;

    return userController.foundOneUser({ id: id }).then((usuario) => {
      if (!usuario) {
        log.warn(`Usuario con id [${id}] no existe`);
        throw new UsuarioNoExiste();
      }
      res
        .status(200)
        .send({ message: "Usuario encontrado", usuarios: usuario });
    });
  })
);

userRouter.post(
  "/create",
  [validateUser, transformarBodyALowerCase],
  procesarErrores((req, res) => {
    let newUser = req.body;
    return userController
      .existingUser(newUser.username, newUser.email)
      .then((usuarioEncontrado) => {
        if (usuarioEncontrado) {
          log.warn(
            `El usuario con nombre [${newUser.username}] y email [${newUser.email}] ya existen en la base de datos`
          );
          throw new DatosDeUsuarioYaEnUso();
        }
        return bcrypt.hash(newUser.password, 10);
      })
      .then((hash) => {
        return userController
          .createUser(newUser, hash)
          .then((nuevoUsuarioCreado) => {
            res.status(201).send({
              message: "Usuario creado con exito",
              usuario: nuevoUsuarioCreado,
            });
            log.info("Usuario creado con exito en la base de datos");
          });
      });
  })
);

userRouter.post(
  "/login",
  [validateLogin, transformarBodyALowerCase],
  procesarErrores(async (req, res) => {
    let usuarioNoAutenticado = req.body;

    let usuarioRegistrado = await userController.foundOneUser({
      email: usuarioNoAutenticado.email,
    });
    if (!usuarioRegistrado) {
      log.info(
        `El usuario con nombre [${usuarioNoAutenticado.email}] No existe. no se puede autenticar`
      );
      throw new CredencialesIncorrectas(
        "El usuario con el que se quiere logear no existe. Verifique si la contraseña o username coinciden."
      );
    }

    let contraseñaCorrecta = bcrypt.compare(
      usuarioNoAutenticado.password,
      usuarioRegistrado.password
    );
    if (contraseñaCorrecta) {
      let token = jwt.sign({ id: usuarioRegistrado._id }, config.jwt.secreto, {
        expiresIn: config.jwt.tiempoDeExpiracion,
      });
      log.debug(
        `El usuario [${usuarioRegistrado.username}] completo la autenticacion con exito`
      );
      res.status(200).send({ token: token, usuario: usuarioRegistrado });
    } else {
      log.info(
        `Usuario [${usuarioRegistrado.username}] no completo la autenticacion. Contraseña incorrecta`
      );
      throw new CredencialesIncorrectas();
    }
  })
);

userRouter.put(
  "/shoppingCar",
  [jwtAuthenticate],
  procesarErrores(async (req, res) => {
    let id = req.user.id;
    let params = req.body;
    let product = {
      ...params,
      cantidad: 1
    };

    userController.setshoppingCar(id, product).then((usuarioActualizado) => {
      res.status(200).send({
        message: "Usuario Actualizado",
        usuario: usuarioActualizado,
      });
    });
  })
);

userRouter.put(
  "/:id",
  [jwtAuthenticate, validarId, validateUpdate, transformarBodyALowerCase],
  procesarErrores(async (req, res) => {
    let idUsuario = req.params.id;
    let id = req.user.id;
    let updateUser;

    updateUser = await userController.foundOneUser({ id: idUsuario });

    if (!updateUser) {
      log.warn(
        `El usuario con id [${idUsuario}] no existe en la base de datos`
      );
      throw new UsuarioNoExiste();
    }

    if (id !== idUsuario) {
      log.warn(`El id [${id}] no coincide con el id enviado`);
      throw new CredencialesIncorrectas("Los id enviados no coinciden");
    }

    userController
      .updateUser(idUsuario, req.body)
      .then((usuarioActualizado) => {
        res.status(200).send({
          message: "Usuario actualizado",
          usuario: usuarioActualizado,
        });
        log.info(
          `El usuario con id [${idUsuario}] fue actualizado correctamente.`
        );
      });
  })
);

userRouter.delete(
  "/:id",
  [jwtAuthenticate, validarId],
  procesarErrores(async (req, res) => {
    let idUsuario = req.params.id;
    let usuarioAEliminar;

    usuarioAEliminar = await userController.foundOneUser({ id: idUsuario });

    if (!usuarioAEliminar) {
      log.warn(
        `El usuario con id [${idUsuario}] ya fue eliminado o no existe en la base de datos`
      );
      throw new UsuarioNoExiste();
    }

    let usuarioId = req.user.id;

    if (idUsuario !== usuarioId) {
      log.warn(
        `El usuario con id [${idUsuario}] no coincide con el usuario logeado`
      );
      throw new CredencialesIncorrectas(`Los ids no coinciden`);
    }

    let usuarioBorrado = await userController.deleteUser(idUsuario);
    log.info(`El usuario con id [${idUsuario}] fue eliminado con exito`);
    res.status(200).send({
      message: "Usuario eliminado con exito",
      usuario: usuarioBorrado,
    });
  })
);

userRouter.put(
  "/:id/image",
  [jwtAuthenticate, validateImage],
  procesarErrores(async (req, res) => {
    const id = req.params.id;
    const user = req.user.username;
    const file = req.body;

    let fileBuffer = Buffer.from(file);

    log.debug(
      `Request recibido de usuario [${user}] para guardar imagen del usuario`
    );

    /*let form = new multuparty.Form();
    form.parse(req, function(err, fields, files){
      let fileUpload = files.file;
      fileUpload.forEach(function(file){
        readFile = fs.readFileSync(file.path);
        let params = {Bucket: "data-image-gestor-librerias", Key: `images-usuarios/${file.originalFilename}`, Body: fs.readFile};
        s3Client.upload(params, function(err, data){
          next(err, data);
          fs.unlink(file.path, function(err){
            if(err){
              log.error('Error => ', err)
            }
          })
        })
      })
    })*/

    /*let filePath = req.files.image.path;
    let fileSplit = filePath.split("\\");
    let fileName = fileSplit[2];
    let extension = fileName.split(".");
    let fileExt = extension[1];*/
    const nameRandom = `${uuidv4()}.${req.extensionDeArchivo}`;

    await saveImageUser(fileBuffer, nameRandom);

    const urlImage = `https://data-image-gestor-librerias.s3.us-east-2.amazonaws.com/images-usuarios/${nameRandom}`;

    const userUpdated = await userController.saveImg(id, urlImage);

    log.info(
      `Imagen de usuario con id [${id}] fue modificada. Link de la nueva imagen [${urlImage}]`
    );
    res.status(200).send({ message: "Imagen subida", user: userUpdated });
  })
);

module.exports = userRouter;
