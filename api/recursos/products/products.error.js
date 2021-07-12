class DatosDeProductoYaEnUso extends Error{
    constructor(message){
        super(message)
        this.message = message || "Los datos de este producto ya existen en la base de datos",
        this.status = 409;
        this.name = "DatosDeProductoYaEnUso";
    }
}

class ProductoNoExiste extends Error{
    constructor(message){
        super(message)
        this.message = message || "El producto que busca no existe en la base de datos",
        this.status = 204;
        this.name = "ProductoNoExiste";
    }
}

module.exports = {
    DatosDeProductoYaEnUso,
    ProductoNoExiste
}