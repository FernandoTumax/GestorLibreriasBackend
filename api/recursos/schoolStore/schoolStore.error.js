class DatosDeLibreriaYaEnUso extends Error{
    constructor(message){
        super(message)
        this.message = message || 'Esta libreria ya existe en la base de datos';
        this.status = 409;
        this.name = "DatosDeLibreriaYaEnUso"
    }
}

class LibreriaNoExiste extends Error{
    constructor(message){
        super(message)
        this.message = message || 'Esta libreria no existe en la base de datos';
        this.status = 204;
        this.name = "LibreriaNoExiste"
    }
}

module.exports = {
    DatosDeLibreriaYaEnUso,
    LibreriaNoExiste
}