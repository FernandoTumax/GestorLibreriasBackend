class DatosDeUsuarioYaEnUso extends Error {
  constructor(message) {
    super(message);
    this.message = message || "Los datos ya existen en la base de datos";
    this.status = 409;
    this.name = "DatosDeUsuarioYaEnUso";
  }
}

class ProductoYaExistenEnElCarrito extends Error{
  constructor(message){
    super(message);
    this.message = message || 'En el carrito ya existen estos datos, por favor ingresa la seccion del carrito para poder agregar más';
    this.status = 409;
    this.name = "ProductoYaExistenEnElCarrito"
  }
}

class CredencialesIncorrectas extends Error {
  constructor(message) {
    super(message);
    this.message = message || "Las credeciales introduccidas no existen";
    this.status = 400;
    this.name = "CredencialesIncorrectas";
  }
}

class UsuarioNoExiste extends Error {
  constructor(message) {
    super(message);
    this.message =
      message || "El usuario que busca no existe en la base de datos";
    this.status = 204;
    this.name = "UsuarioNoExiste";
  }
}

class RolDeUsuarioInvalido extends Error {
  constructor(message) {
    super(message);
    this.message =
      message || "El rol del usuario no es el correcto para esta funcion";
    this.status = 401;
    this.name = "RolDeUsuarioInvalido";
  }
}

module.exports = {
  DatosDeUsuarioYaEnUso,
  CredencialesIncorrectas,
  UsuarioNoExiste,
  RolDeUsuarioInvalido,
  ProductoYaExistenEnElCarrito
};
