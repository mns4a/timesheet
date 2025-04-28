
CREATE TABLE `timesheets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` text,
  `rate` decimal(10,2) DEFAULT NULL,
  `total_time` int DEFAULT NULL,
  `total_cost` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `username` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `line_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `timesheet_id` int DEFAULT NULL,
  `date` date DEFAULT NULL,
  `minutes` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `timesheet_id` (`timesheet_id`),
  CONSTRAINT `line_items_ibfk_1` FOREIGN KEY (`timesheet_id`) REFERENCES `timesheets` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;