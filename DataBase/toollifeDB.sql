CREATE SCHEMA IF NOT EXISTS `toollifeDB` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;

CREATE  TABLE IF NOT EXISTS `toollifeDB`.`Usuarios` (
  `idUser` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `email` VARCHAR(75) NOT NULL ,
  `password` VARCHAR(32) NOT NULL ,
  `isActive` TINYINT(1) NULL DEFAULT false ,
  PRIMARY KEY (`idUser`) ,
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) )
ENGINE = InnoDB;

CREATE  TABLE IF NOT EXISTS `toollifeDB`.`Perfil` (
  `idUser` INT UNSIGNED NOT NULL ,
  `nombre` VARCHAR(35) NOT NULL ,
  `apellidos` VARCHAR(75) NOT NULL ,
  `pathUser` VARCHAR(115) NOT NULL ,
  PRIMARY KEY (`idUser`) ,
  INDEX `fk_Usuarios` (`idUser` ASC) ,
  UNIQUE INDEX `pathUser_UNIQUE` (`pathUser` ASC) ,
  CONSTRAINT `fk_Usuarios`
    FOREIGN KEY (`idUser` )
    REFERENCES `toollifeDB`.`Usuarios` (`idUser` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

CREATE  TABLE IF NOT EXISTS `toollifeDB`.`en_tramite` (
  `code` TINYINT UNSIGNED NOT NULL ,
  `idUser` INT UNSIGNED NOT NULL ,
  `hash` VARCHAR(15) NOT NULL ,
  `fecha` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY (`hash`) ,
  INDEX `fk_usuarios` (`idUser` ASC) ,
  UNIQUE INDEX `code_UNIQUE` (`code` ASC, `idUser` ASC) ,
    FOREIGN KEY (`idUser` )
    REFERENCES `toollifeDB`.`Usuarios` (`idUser` )
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB;

CREATE  TABLE IF NOT EXISTS `toollifeDB`.`remember_me` (
  `idUser` INT UNSIGNED NOT NULL ,
  `serie` VARCHAR(15) NOT NULL ,
  `token` VARCHAR(8) NOT NULL ,
  `caducidad` DATE NULL ,
  PRIMARY KEY (`serie`, `token`, `idUser`) ,
  UNIQUE INDEX `serie_UNIQUE` (`serie` ASC, `idUser` ASC) ,
  INDEX `fk_usuarios` (`idUser` ASC) ,
    FOREIGN KEY (`idUser` )
    REFERENCES `toollifeDB`.`Usuarios` (`idUser` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;