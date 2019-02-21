-- Tabla: remember_me
-- En ambos triggers se establece la fecha de caducidad para dentro de 8 dias, las cookies duran 7 dias, pero en la base de datos
-- se quedan un dia mas, para evitar que el registro sea borrado antes que la cookie.

-- Inserccion de un nuevo registro
CREATE TRIGGER rm__crear_fecha_caducidad BEFORE INSERT ON remember_me
FOR EACH ROW SET NEW.caducidad = ADDDATE(CURRENT_DATE, INTERVAL 8 DAY);

-- Actualiza la fecha de caducidad
CREATE TRIGGER rm__actualizar_fecha_caducidad BEFORE UPDATE ON remember_me
FOR EACH ROW SET NEW.caducidad = ADDDATE(CURRENT_DATE, INTERVAL 8 DAY);