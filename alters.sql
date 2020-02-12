ALTER TABLE Images ADD size int;

CREATE TABLE `games_images` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `gameId` int(11)  unsigned NOT NULL,
    `imageId` int(11)  unsigned NOT NULL,
    `created` DATETIME DEFAULT NULL,
    `modified` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

