/** Module dependencies && variables*/
var db = require('../DBController.js');
var num_conexiones = 0;

/** Handlers */
function connection(socket){
  var hs = socket.handshake;
  var userId = hs.session.userId;
  socket.join(hs.sessionID); //Identificamos este socket por su sessionID
  num_conexiones++;
  console.log("Web socket account session: " + userId + " Conexiones: " + num_conexiones);
  
  //Permite que la cookie session dure durante toda la conexion WebSocket
  var intervalID = setInterval(function () {
        hs.session.reload( function () { 
            hs.session.touch().save();
        });
  }, 60 * 1000);
	
  //Envios de mensajes entre cliente y servidor
  socket.on('message', function (message){
	console.log('Mensaje: ' + message);
  });

  //Desconexion de un cliente, esta desconexion es muy brusca, es cuando el cliente cierra la pagina
  socket.on('disconnect', function () {
	num_conexiones--;
	console.log('Se ha ido ... quedan: ' + num_conexiones);
	clearInterval(intervalID);
  });
}

/** Exports */
exports.connection = connection;