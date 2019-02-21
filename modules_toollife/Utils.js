/** Module dependencies */
var fs = require('fs');
var path = require('path');
var sanitize = require('validator').sanitize;
var rimraf = require('rimraf');
var crypto = require('crypto');
var color = require("ansi-color").set;
var mapping = null;

/** Funciones */
function createMapping(){
  mapping = {224: 'a', 225: 'a', 226: 'a', 227: 'a', 228: 'a', 229: 'a', 230: 'a',
			 231: 'c', 232: 'e', 233: 'e', 234: 'e', 235: 'e', 236: 'i', 237: 'i', 
			 238: 'i', 239: 'i', 242: 'o', 243: 'o', 244: 'o', 245: 'o', 246: 'o', 
			 249: 'u', 250: 'u', 251: 'u', 252: 'u'};
}
//Quita espacios de una cadena
function trim(cadena){
  cadena = sanitize(cadena).trim();
  var str = '';
  var cont = 0;
  
  while(cont < cadena.length){
	if(cadena.charAt(cont) != ' ')
		str += cadena.charAt(cont);
		
	cont++;
  }

  return str;
}

//Quita acentos y tildes de letras en minuscula en una cadena, se emplea para limpiar las urls
function quitarTildesMinusculas(str){
  if(mapping == null)
	return null;
	
  var aux = "";
  for(var i = 0, j = str.length; i < j; i++) {
    if(mapping[str.charCodeAt(i)])
		aux += mapping[str.charCodeAt(i)];
    else
		aux += str.charAt(i);
  }
  
  return aux;
}

//Crea el directorio personal del usuario indicado
function createDirectory(userDATA){
  var dir = 'public/users/' + userDATA.pathUser;
  var infoPath = 'public/users/' + userDATA.pathUser + '/info.json';
  var text = userDATAToString(userDATA);
  
  fs.stat(dir, function(err, stat) {
    if(err == null){
		//SI existe, comprobamos que existe el archivo info.json
		if (!path.existsSync(infoPath))
			fs.writeFileSync(infoPath, text, encoding ='utf8');   
    } else {
		//NO existe, creamos el info.json y el directorio del usuario
		fs.mkdir(dir, function(error){
			if(!error)
				fs.writeFileSync(infoPath, text, encoding ='utf8');
		}); 
    }
  });
}

//Se realiza un borrado recursivo de todo el pathUser
function eliminarDirUsuario(pathUser){
  var dir = 'public/users/' + pathUser;
  rimraf(dir, function (error){
	if(error){
		/* Si por algun motivo no se puede borrar el directorio, creamos un timeout que lo vuelva
		   a intentar dentro de media hora. Un error puede ser que haya muchos usuarios accediendo
		   al directorio */
		setTimeout(function (){
			eliminarDirUsuario(pathUser)
		}, 1000 * 60 * 30);
	}
  });
}

function trimFirstAndLast(cadena){
  var str = sanitize(sanitize(cadena).rtrim()).ltrim();
  
  if(str.length == 0)
	return null;
	
  return str;
}

function random(inf, sup) {
  var nump = sup - inf; 
  var rnd = Math.random() * nump;
  rnd = Math.round(rnd);
  return parseInt(inf) + rnd;
} 

function generateHash(type){
  var charCode, hex, numR, maxCharacters, minN, maxN;
  var hash = '';
  
  switch(type){
	case 1: 
		maxCharacters = 4;
		minN = 10000;
		maxN = 99999;
		break;
	case 2:
		maxCharacters = 5;
		minN = 1000;
		maxN = 9999;
		break;
  }
	
  for(var repeat = 0; repeat < maxCharacters; repeat ++){
	charCode = random(97, 122);
	hex = charCode.toString(16).toUpperCase();
	hash += hex;
  }
	
  numR = random(minN, maxN);
  hash += numR.toString(16).toUpperCase();
  
  return hash;
}

function encriptarEnBase64(str){
  var cipher = crypto.createCipher("aes-256-cbc", 'social_diary_2012');
  var crypted = cipher.update(str,'utf8','base64');
  crypted += cipher.final('base64');

  return crypted;
}

function generatedSecureString(key, str){
  //Generamos el hash en md5 concatenando la cadena con una key
  var md5sum = crypto.createHash('md5');
  md5sum.update(key + str);
  var ss = md5sum.digest('hex');

  return ss;
}

function desencriptarEnBase64(str){
  var decipher = crypto.createDecipher('aes-256-cbc','social_diary_2012');
  var dec = decipher.update(str,'base64','utf8');
  dec += decipher.final('utf8');

  return dec;
}

function stringToHexadecimal(str){
  return str.toString(16).toUpperCase();
}

function createUserDATA(req){
  var active = (req.session.isActive == 0)? false : true;
  var userDATA = { 
	idUser: req.session.userId, 
	pathUser: req.session.pathUser,
	isActive: active
  };
  
  return userDATA;
}

function createCookieDATA(strBase64, idUser, serie, token){
  if(strBase64){
	//Decodificamos la cadena y obtenemos los valores
	var str = desencriptarEnBase64(strBase64);
	var values = str.split(':');

	if(values.length != 3)
		return null;
	else {
		idUser = values[0];
		serie = values[1];
		token = values[2];
	}
  }

  var cookieDATA = {
	idUser: idUser,
	serie: serie || random(10000000, 99999999),
	token: token || random(10000000, 99999999)
  };
  
  return cookieDATA;
}

function createUserDataWithParameters(idUser, pathUser, isActive){
  var active = (isActive == 0)? false : true;
  var userDATA = { 
	idUser: idUser, 
	pathUser: pathUser,
	isActive: active
  };
  
  return userDATA;
}

function updateFileInfo(userDATA){
  var infoPath = 'public/users/' + userDATA.pathUser + '/info.json';
  var text = userDATAToString(userDATA);
  fs.writeFileSync(infoPath, text, encoding ='utf8');
}

function getFechaStringForLog(){
  var fecha = new Date();
  var dia = (fecha.getDate() < 10)? '0' + fecha.getDate() : fecha.getDate();
  var mes = ((fecha.getMonth() + 1) < 10)? '0' + (fecha.getMonth() + 1) : (fecha.getMonth() + 1);
  var sec = (fecha.getSeconds() < 10)? '0' + fecha.getSeconds() : fecha.getSeconds();
  var hora = (fecha.getHours() < 10)? '0' + fecha.getHours() : fecha.getHours();
  var min = (fecha.getMinutes() < 10)? '0' + fecha.getMinutes() : fecha.getMinutes();
  
  var strD = dia + '/' + mes + '/' + fecha.getFullYear();
  var strH = hora + ':' + min + ":" + sec;
  return color(('[' + strD + ' ' + strH + ']'), 'green');
}

/** Funciones auxiliares */
function userDATAToString(userDATA){
  var text = "{\n     \"userId\": " + userDATA.idUser;
  text += "\n   , \"pathUser\": \"" + userDATA.pathUser + "\"";
  text += "\n   , \"isActive\": " + userDATA.isActive;
  text += "\n}";
			
  return text;
}

/** Exports */
exports.createMapping = createMapping;
exports.trim = trim;
exports.quitarTildesMinusculas = quitarTildesMinusculas;
exports.createDirectory = createDirectory;
exports.trimFirstAndLast = trimFirstAndLast;
exports.random = random;
exports.generateHash = generateHash;
exports.createUserDATA = createUserDATA;
exports.createUserDataWithParameters = createUserDataWithParameters;
exports.eliminarDirUsuario = eliminarDirUsuario;
exports.updateFileInfo = updateFileInfo;
exports.encriptarEnBase64 = encriptarEnBase64;
exports.desencriptarEnBase64 = desencriptarEnBase64;
exports.generatedSecureString = generatedSecureString;
exports.stringToHexadecimal = stringToHexadecimal;
exports.createCookieDATA = createCookieDATA;
exports.getFechaStringForLog = getFechaStringForLog;