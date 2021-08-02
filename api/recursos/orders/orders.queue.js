const amqp = require('amqplib')
const log = require('../../../utils/logger');

function publicMessage(message, routingKey){
    return amqp.connect('amqp://guest:guest@localhost:5672//facturacionVH').then(connection => {
        log.debug('Se creo la conexion al servidor de Rabbit de forma exitosa')
        return connection.createChannel().then(channel => {
            log.debug('Se creo el canal de Rabbit de forma exitosa');
            const buffer = Buffer.from(JSON.stringify(message));
            log.debug('Se inicia el proceso de envio del mensaje a la cola');
            const ok = channel.assertQueue('FacturacionManagementQueue');
            return ok.then(resultado => {
                channel.publish('amq.direct', routingKey, buffer);
                log.debug('Se responde la peticion exitosamente');
                return channel.close();
            })
        }).finally(function() {connection.close()});
    }).catch(console.warn)
}  

module.exports = {
    publicMessage
}