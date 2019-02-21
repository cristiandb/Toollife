/** Documentacion:
Los idUser son identificativos unicos para los usuarios. Valores mayores que uno son usuarios validos,
pueden realizar cualquier actividad asociada relacionado con los usuarios. 

Un idUser de -1 significa que es un usuario Observador, tan solo se le permite ver una serie de 
opciones de la web. 

Un idUser de -2 significa que es un usuario no valido ha sido marcado para darse de baja, estos
usuarios tienen cuenta pero no se les permite el acceso a la web hasta que cambien a ser usuarios 
válidos. Tambien puede ser un usuario que se acaba de registrar, en general tan solo tiene acceso a una
pagina de informacion sobre como debera activar su cuenta.
*/

/** Module dependencies & Variables*/
var url = require('url');
var db = require('../modules_toollife/DBController.js');
var utils = require('../modules_toollife/Utils.js');
var Keygrip = require('keygrip');
var Cookies = require('cookies');
require('Array.prototype.forEachAsync');
var key_pass = "|#€9`¬23edg4ooe14";

/** Inicializamos servicios y variables externas a este modulo */
db.startTimers(); //Arrancamos los timers que se ocupan de las gestiones relacionadas con la BD
utils.createMapping(); //Inicializamos el mapping para las tildes

/** VARIABLES */
//Definimos las keys para encriptar las cookies
var keys = new Keygrip(["social_diary_2012", "diarin_yuin_diarina", "fundacion_toollife_en_2012"]);

/** Funciones handlers para los eventos de la BD */
//El usuario es valido, será redirigido a su pagina personal
var userValido = function(pathUser, userId, isActive, req, res){
  req.session.userId = userId;
  req.session.thisByLogging = true;
  req.session.pathUser = pathUser;
  req.session.isActive = isActive;
  req.session.cookie.expires = false;
  res.redirect('/users/' + pathUser);
}

//El usuario es invalido, no se logea
var userInvalido = function(err, res){
  console.log("Invalid: " + err);
  res.redirect('/');
}
  
//Hubo problemas con la BD relacionado con el registro o el login, lo mas seguro es que el servidor no este arrancado
var errorLoginDB = function(error, res){
  res.write("Error DB: " + error);
  res.end();
}

//El hash introducido es invalido
var hashInvalido = function(req, res){
  notPageFound(req, res);
}

var errorActionDB = function(error, res){
  res.write("Lo lamentamos mucho, actualmente no se puede realizar la tarea indicada.");
  res.write("Vuelva a intentarlo mas tarde.");
  res.end();
}

//Realiza las acciones necesarias cuando se intenta hacer auto login con una cookie del tipo remember-me
var validarLoginCookie = function (res, req, isValid, cookie, cookieDATA, pathUser, isActive){
  if(!isValid){
	//Borramos la cookie y redirigimos a la pagina de inicio
	res.clearCookie('remember-me'); 
	res.clearCookie('remember-me.sig');
	goToIndex(res, req);
  } else {
	//Cambiamos el token en la cookie y en la BD, despues se le logea al usuario
	newOrUpdateCookie(cookie, cookieDATA.idUser, 3, cookieDATA.serie);
	userValido(pathUser, cookieDATA.idUser, isActive, req, res);
  }
}

var checkCookie = function(idUser, req, res){
  var cookies = new Cookies(req, res, keys );
  var remember = cookies.get("remember-me", {signed: true});
  var cookieDATA = null;
  
  if(typeof remember != "undefined") {
	cookieDATA = utils.createCookieDATA(remember);
	
	//Los registros de cookie solo pueden ser manipulados por el dueño de la cuenta
	if(cookieDATA.idUser != idUser) return false;
	else if(req.body.rememberMe == 'on')
		newOrUpdateCookie(cookies, idUser, 3, cookieDATA.serie);
	else {
		//Las cookies relacionadas con Remember Me y el registro en la BD son borradas
		db.gestionCookie(2, cookieDATA);	
		res.clearCookie('remember-me'); 
		res.clearCookie('remember-me.sig');
	}
  } else if(req.body.rememberMe == 'on')
	newOrUpdateCookie(cookies, idUser, 1, null);
  
  return true;
}

//Arrays con las funciones controladoras de la BD
var handlersBD = {valid: userValido, noValid: userInvalido, error: errorLoginDB}; //Login y registros
var handlersAction = {valid: userValido, noValid: hashInvalido, error: errorActionDB}; //Acciones de validacion, invalidacion, ...

/** Handlers de las peticiones de paginas de la web */
// Devuelve la pagina de inicio
function index(req, res){
  //Definimos los parametros de la sesion del usuario
  if(typeof req.session.userId == "undefined")
	resetSession(req);
  
  if(req.session.userId != -1 && req.session.pathUser != null)
	res.redirect('/users/' + req.session.pathUser);
  else {
	if(req.session.rememberMe){
		//Comprobamos si nos han enviado una cookie, si es asi es una peticion de remember me
		var cookie = new Cookies(req, res, keys);
		var remember = cookie.get("remember-me", {signed: true});
		
		if(typeof remember == "undefined"){
			goToIndex(res, req);
		} else {
			var cookieDATA = utils.createCookieDATA(remember);
			db.findCookieAndValid(res, req, cookie, cookieDATA, validarLoginCookie);
		}
	} else
		goToIndex(res, req);
  }
}

//Comprueba si existe y es valido el usuario y la contraseña
function comprobarUser(req, res){ 
  req.body.passLogin = utils.generatedSecureString(key_pass, req.body.passLogin); //Encriptamos la contraseña
  db.verificarUser(handlersBD, checkCookie, req, res); //Comprobamos que el usuario este dado de alta, si lo esta se logea, si no se se realizara otra accion
}

//Si no existe el usuario introducido, se da de alta en la base de datos
function registrarUser(req, res){
  //Para realizar un registro, se debe aceptar las condiciones
  if(req.body.checkCondiciones == 'on'){
    req.body.passR = utils.generatedSecureString(key_pass, req.body.passR); //Encriptamos la contraseña
	db.registrarUser(handlersBD, req, res); //Comprobamos que el usuario introducido no esta dado de alta, si no lo esta se da de alta y se loguea
  } else 
	errorLoginDB('Para poder registrarse debe aceptar las condiciones.', res);
}

//Muestra la pagina personal del usuario
function login(req, res){
  if(req.session.userId == -2){
	res.setHeader('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	res.render('Agenda/index.ejs', {mensaje: req.session.pathUser, isActive: false});
  } else {
    //Siempre que se inicie una sesion debe comprobarse que existe su directorio personal
	var userDATA = utils.createUserDATA(req);
	db.preparePageUser(userDATA);
	res.setHeader('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	res.render('Agenda/index.ejs', {mensaje: req.session.pathUser, isActive: true});
  }
}

//Cierra la sesion y vuelve a la pagina de inicio
function logout(req, res){
  resetSession(req);
  deleteCookie(res, req);
  res.redirect('/');
}

function performAction(req, res){
  var action = req.params.action;
  
  switch(action){
	case 'validation':
		db.validarUser(handlersAction, req.params.hash, req, res);
		break;
  }
}

//Paginas validas en el servidor pero sus valores no lo son (usuario incorrecto, hash incorrecto, etc)
function notPageFound(req, res){
  res.write("No se ha encontrado la pagina solicitada.");
  res.end();
}

//Paginas no validas en el servidor
function notFound(req, res){
  res.writeHead(404, {"Content-Type": "text/html"});
  res.write("404 Not Found");
  res.end();
}

/** Funciones auxiliares */
function resetSession(req){
  req.session.userId = -1;
  req.session.pathUser = null;
  req.session.thisByLogging = false;
  req.session.isActive = false;
  req.session.rememberMe = req.session.rememberMe || true;
  req.session.isCheckRememberMe = req.session.isCheckRememberMe || false;
  req.session.cookie.expires = false;
}

function goToIndex(res, req){
  res.setHeader('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  res.render('index.ejs', { 
	title: 'Express'
	, nombre: 'Cristian Durán Bellón'
	, years: '23'
	, isCheck: req.session.isCheckRememberMe
	, variables: {
		var1: '1'
		, var2: '2'
		, var3: '3'
	}
  });
}

function newOrUpdateCookie(cookies, idUser, type, serie){
  //Definicion de variables
  var expires = new Date(new Date().getTime() + 604800000); // 7 dias
  var cookieDATA = utils.createCookieDATA(null, idUser, serie);
  var str = utils.encriptarEnBase64(idUser + ':' + cookieDATA.serie + ':' + cookieDATA.token);
	
  //Creamos una cookie que ayuda a realizar la gestion del Remember Me, y damos de alta en la BD
  cookies.set('remember-me', str, {expires: expires, signed: true});
  db.gestionCookie(type, cookieDATA);
}

function deleteCookie(res, req) {
  //Borramos la cookie si existe y su registro en la BD
  var cookies = new Cookies(req, res, keys );
  var remember = cookies.get("remember-me", {signed: true});
  
  if(typeof remember != "undefined"){
	var cookieDATA = utils.createCookieDATA(remember);
	db.gestionCookie(2, cookieDATA);	
	res.clearCookie('remember-me'); 
	res.clearCookie('remember-me.sig');
	req.session.isCheckRememberMe = true;
  } else 
	req.session.isCheckRememberMe = false;
	
  req.session.rememberMe = false;
}

/** Exports **/
//Metodos
exports.index = index;
exports.comprobarUser = comprobarUser;
exports.login = login;
exports.logout = logout;
exports.registrarUser = registrarUser;
exports.performAction = performAction;
exports.notPageFound = notPageFound;
exports.notFound = notFound;