/** Module dependencies && Variables*/
var express = require('express');
var routes = require('./routes');
var wsmc = require('./modules_toollife/WebSocket/ManagementClient.js');
var wsmi = require('./modules_toollife/WebSocket/ManagementIndex.js');
var wschat = require('./modules_toollife/WebSocket/Chat.js');
var utils = require('./modules_toollife/Utils.js');
var mail = require('./modules_toollife/MailController.js');
var RedisStore = require('connect-redis')(express);
var sessionStore = new RedisStore();
var parseCookie = require('connect').utils.parseCookie;
var Session = require('connect').middleware.session.Session;
var path = require('path');
var fs = require('fs');
var color = require("ansi-color").set;

//Opciones relacionados con el certificado de la pagina
var cert_options = {
  key: fs.readFileSync('./auth/server.key'),
  cert: fs.readFileSync('./auth/server.crt'),
  ca: fs.readFileSync('./auth/ca.crt'),
  requestCert: true,
  rejectUnauthorized: false
};

var server = module.exports = express.createServer();
var io = require('socket.io').listen(server);

/** Configuration */
//Servidor
server.configure(function(){
  server.set('views', __dirname + '/views');
  server.set('view engine', 'ejs');
  server.use(express.static(__dirname + '/public'));
  server.use(express.bodyParser());
  server.use(express.methodOverride());
  server.use(express.cookieParser());
  server.use(express.session({store: sessionStore, secret: 'social_diary_2012', key: 'express.sid'}));
  server.use(server.router);
});

//socket.io
io.configure(function () {
  io.set('transports', ['websocket', 'flashsocket', 'xhr-polling']);
  io.set('log level', 1); //Deshabilita modo debugging 
});

// Antes de iniciar un websocket, se llama a este método
io.set('authorization', function (handshakeData, accept) {
  // Comprobamos si nos han enviado la cookie
  if (handshakeData.headers.cookie) {
    handshakeData.cookie = parseCookie(handshakeData.headers.cookie);
    handshakeData.sessionID = handshakeData.cookie['express.sid'];
	handshakeData.sessionStore = sessionStore;
	
	//Obtenemos la session de dicho usuario
	sessionStore.get(handshakeData.sessionID, function (err, session) {
        if (err || !session){
		//AQUI SE DEBE TRATAR EL ERROR DE QUE LA SESSION NO EXISTA, POR EJEMPLO REDIRIGIENDO A /
			console.log("Session error: " + session); 
            accept('Error', false);
        } else {
            handshakeData.session = new Session(handshakeData, session);
			accept(null, true); //Aceptamos la conexion
        }
    });
  } else 
    return accept('No cookie transmitted.', false);
});

/** Error */
// Si sucede algun error controlado en el servidor, se llamara a esta funcion
server.error(function(err, req, res, next){
  console.log("Error: " + err);
});

//Si ocurre un error de los gordos, ej. Servidor Mysql caido, salta el evento
// uncaughtException, evitando que se cierre el servidor web
/*process.on('uncaughtException', function(err) {
  console.log("ERROR FATAL: " + err.message);
});*/

/** Params */
//pathUser es la ruta que identifica a un usuario
server.param('pathUser', function (req, res, next, id){
  if(!req.session.thisByLogging || typeof req.session.thisByLogging  == "undefined"){
	if(typeof req.session.userId == "undefined" || req.session.userId == -1){
		//No ha iniciado sesion. Es un obsevador. 
		//DE MOMENTO LE PERMITO ENTRAR PERO SIN WEBSOCKET Y SOLO PUEDE VER. MAS ADELANTE SE VERA QUE PUEDE HACER
		res.redirect('/');
	} else if(req.session.userId == -2){
		if(id == req.session.pathUser) next();
		else res.redirect('/users/' + req.session.pathUser);
	} else {
		var infoPath = 'public/users/' + id + '/info.json';
		if(!path.existsSync(infoPath)){
			//Mostraremos una pagina de error del tipo 'no encontrado pagina solicitada'
			notPageFound(req, res);
		} else {
			var userID = require('./' + infoPath).userId;
			if(userID == req.session.userId) next();
			else {
				//EL USUARIO QUIERE VER LA PAGINA DE OTRO USUARIO, DE MOMENTO NO HAREMOS NADA
				res.write("Bienvenido!!, esta viendo la pagina de " + id);
				res.end();
			}
		}
	}
  } else {
	req.session.thisByLogging = false;
	if(req.session.userId > 0){
		var infoPath = 'public/users/' + id + '/info.json';
		var isActive = require('./' + infoPath).isActive;
		if(!isActive) req.session.userId = -2;
	}
    next();
  }
});

/** Routes */
server.get('/', routes.index);
server.get('/users/:pathUser', routes.login);
server.get('/logout', routes.logout);
server.get('/:action(validation|invalidation)/:hash', routes.performAction);
server.post('/login', routes.comprobarUser);
server.post('/register', routes.registrarUser);
server.all('*', routes.notFound);

/** Arrancar servicios */
console.log(color("\nServidor arrancado ... ", 'cyan'));
server.listen(process.env.PORT || 3000);
io.of('/index').on('connection', wsmi.connection);
io.of('/management_account').on('connection', wsmc.connection);
io.of('/chat').on('connection', wschat.connection);