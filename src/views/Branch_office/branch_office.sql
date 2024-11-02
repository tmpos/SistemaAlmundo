CREATE TABLE IF NOT EXISTS `branch_office` (
  `id` int(11) AUTO_INCREMENT PRIMARY KEY,
  `name` TEXT(250) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `usuario` text(250) COLLATE utf8_spanish_ci NOT NULL
);