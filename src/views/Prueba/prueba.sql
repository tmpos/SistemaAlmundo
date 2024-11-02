CREATE TABLE IF NOT EXISTS `prueba` (
  `id` int(11) AUTO_INCREMENT PRIMARY KEY,
  `nombre` TEXT(250) NOT NULL,
  `direccion` TEXT(250) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `imagen` text(250) COLLATE utf8_spanish_ci NOT NULL,
  `usuario` text(250) COLLATE utf8_spanish_ci NOT NULL
);