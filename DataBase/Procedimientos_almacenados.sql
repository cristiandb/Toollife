-- Consulta para saber los amigos y grupos de cada amigo, de un determinado usuario
CREATE PROCEDURE identificar_usuario (IN email VARCHAR(75), IN pass VARCHAR(45))
SELECT p.idUser, p.nombre, p.apellidos, p.pathUser, u.isActive
FROM usuarios u NATURAL JOIN perfil p
WHERE u.email = email and u.password = pass;

-- Los tramites de validacion de cuenta duran un dia, por lo que se resta la fecha actual menos la fecha de alta mas 24 horas
CREATE PROCEDURE obtener_fecha_expiracion_validacion ()
SELECT TIMESTAMPDIFF(SECOND,CURRENT_TIMESTAMP(), ADDTIME(fecha, '24:00:00')) * 1000 as timeout, hash
FROM en_tramite
WHERE code = 1;

-- Borra las registros de cookies que están caducadas
CREATE PROCEDURE borrar_registros_rememberMe_caducadas ()
DELETE FROM remember_me
WHERE caducidad <= CURRENT_DATE;

-- Encuentra y devuelve los datos del usuario identificado por un remember_me
CREATE PROCEDURE buscar_e_identificar_remember_me(IN idUser INT, IN serie VARCHAR(8), IN token VARCHAR(8))
SELECT p.pathUser, u.isActive
FROM remember_me rm NATURAL JOIN usuarios u NATURAL JOIN perfil p
WHERE rm.idUser = idUser AND rm.serie = serie AND rm.token = token;

Insert into usuarios (email, password) values ('kratos.dp@gmail.com', 'tacens_69');
Insert into usuarios (email, password) values ('daniel.caldera@gmail.com', 'tacens_69');
Insert into perfil values (1, 'Cristian', 'Durán Bellón', 'cristian.duranbellon');
Insert into perfil values (2, 'Daniel', 'Caldera García', 'daniel.calderagarcia');
Insert into en_tramite (code, idUser, hash) values (1, 1, '7A7A7A7A186BB');
INSERT INTO remember_me (idUser, serie, token) VALUES (1,3,3);


SELECT CONCAT(HEX('zzzz'), HEX(99999));