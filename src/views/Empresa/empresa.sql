CREATE TABLE IF NOT EXISTS `empresa` (
  `id` int(11) AUTO_INCREMENT PRIMARY KEY,
  `alerta` TEXT,
  `nombre` TEXT,
  `legal` TEXT,
  `telefono` TEXT,
  `email` TEXT,
  `direccion` TEXT,
  `actualizacion` TEXT,
  `bloqueo` TEXT,
  `token` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `imagen` text(250) COLLATE utf8_spanish_ci NOT NULL,
  `usuario` text(250) COLLATE utf8_spanish_ci NOT NULL
);