CREATE TABLE IF NOT EXISTS `leads` (
  `id` int(11) AUTO_INCREMENT PRIMARY KEY,
  `date` TEXT(250) NOT NULL,
  `name` TEXT(250) NOT NULL,
  `agent` TEXT(250) NOT NULL,
  `email` TEXT(250) NOT NULL,
  `phone` TEXT(250) NOT NULL,
  `branch_office` TEXT(250) NOT NULL,
  `contact_method` TEXT(250) NOT NULL,
  `service_type` TEXT(250) NOT NULL,
  `destiny` TEXT(250) NOT NULL,
  `markup` TEXT(250) NOT NULL,
  `state` TEXT(250) NOT NULL,
  `note` TEXT(250) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `imagen` text(250) COLLATE utf8_spanish_ci NOT NULL,
  `usuario` text(250) COLLATE utf8_spanish_ci NOT NULL
);