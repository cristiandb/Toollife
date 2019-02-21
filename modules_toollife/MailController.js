/** Module dependencies && Variables */
var nodemailer = require("nodemailer");
var fs = require('fs');
var ejs = require('ejs');

/** Funciones */
function enviarCorreo(emailDATA){
  var smtpTransport = createSMTPTransport();
  var mailOptions = createMailOptions(emailDATA);

  fs.readFile(emailDATA.template, 'utf-8', function(err, content) {
    if(!err) {
		//Realizamos un render sobre la template para el correo
		mailOptions.html = ejs.render(content, {locals: {name:emailDATA.name, hash: emailDATA.hash}});
		smtpTransport.sendMail(mailOptions, function(error, response){
			//Si no se envio el correo se vuelve a intentar dentro de 5 minutos
			if(error) {
				setTimeout(function() {
					enviarCorreo(emailDATA);
				}, 1000 * 60 * 5);
			}

			smtpTransport.close();
		});
    }
  });
}

/** Funciones auxiliares */
function createSMTPTransport(){
  var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
	host: 'smtp.gmail.com',
    port: 465,
	secureConnection: true,
    ssl: true,
    use_authentication: true,
	user: 'kratos.dp@gmail.com',
    pass: 'tacens_69'
  });
  
  return smtpTransport;
}

function createMailOptions(emailDATA){
  var sender = emailDATA.name + " " + emailDATA.surname + " <" + emailDATA.to + ">";
  var mailOptions = {
    from: "Toollife <kratos.dp@gmail.com>",
    to: sender,
	replyTo: "Toollife <kratos.dp@gmail.com>",
    subject: emailDATA.subject, 
	generateTextFromHTML: true,
	html: null
  }
  
  return mailOptions;
}

/** Exports */
exports.enviarCorreo = enviarCorreo;