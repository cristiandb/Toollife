/*---------------------------------------------------------------------------------
SOCKET, Creacion y Handlers
---------------------------------------------------------------------------------*/
var socket = io.connect('http://localhost:3000/index');

/*---------------------------------------------------------------------------------
VALORES POR DEFECTO PARA LOS ELEMENTOS DE LA PAGINA
---------------------------------------------------------------------------------*/
$(document).ready(function(){
  $('#loginAceptar').click(function(event){ do_submit('flogin', 'passLogin'); });
  $('#registroAceptar').click(function(event){ do_submit('fregistro', 'passR'); });
});

/*---------------------------------------------------------------------------------
HANDLERS
---------------------------------------------------------------------------------*/
function do_submit(formID, txtPassID){
  //Generamos el hash y el hidden
  var hash = hex_sha1($('#' + txtPassID).val());
  jQuery('<input/>', {
    id: txtPassID,
	name: txtPassID,
    type: 'hidden',
    value: hash
  }).appendTo('#' + formID);

  //Realizamos submit
  $('#' + txtPassID).attr('disabled','disabled');
  $('#' + formID).submit();
  $('#' + formID).find(":hidden").remove();
  $('#' + txtPassID).removeAttr('disabled');
}

/*---------------------------------------------------------------------------------
FUNCIONES AUXILIARES
---------------------------------------------------------------------------------*/