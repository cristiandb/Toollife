/** Module dependencies && variables*/
var db = require('../DBController.js');

/** Eventos socket */
function connection(socket){
var address = socket.handshake.address;
console.log("New connection from " + address.address + ":" + address.port);
  //Desconexion de un cliente, esta desconexion es muy brusca, es cuando el cliente cierra la pagina
  socket.on('disconnect', function () {

  });
}

/** Exports */
exports.connection = connection;