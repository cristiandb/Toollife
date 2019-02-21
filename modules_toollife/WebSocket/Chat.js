/** Module dependencies && variables*/
var db = require('../DBController.js');

/** Eventos socket */
function connection(socket){
  var hs = socket.handshake;
  var userId = hs.session.userId;
  socket.join(hs.sessionID); //Identificamos este socket por su sessionID
  console.log("Web socket chat session: " + userId);
  
  //Permite que la cookie session dure durante toda la conexion WebSocket
  var intervalID = setInterval(function () {
        hs.session.reload( function () { 
            hs.session.touch().save();
        });
  }, 60 * 1000);

  //Desconexion de un cliente, esta desconexion es muy brusca, es cuando el cliente cierra la pagina
  socket.on('disconnect', function () {
	clearInterval(intervalID);
  });
}

/** Exports */
exports.connection = connection;