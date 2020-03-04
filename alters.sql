ALTER TABLE Images MODIFY COLUMN `format` enum('png','jpg','jpeg','gif', 'svg') CHARACTER SET utf8 DEFAULT NULL;

CREATE TABLE `games_images` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `gameId` int(11)  unsigned NOT NULL,
    `imageId` int(11)  unsigned NOT NULL,
    `created` DATETIME DEFAULT NULL,
    `modified` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Audio` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(200) DEFAULT NULL,
  `description` text,
  `created` datetime DEFAULT NULL,
  `format` enum('docx','doc','pdf','mp3','wav') CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `owner` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8

CREATE TABLE `Video` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(200) DEFAULT NULL,
  `description` text,
  `created` datetime DEFAULT NULL,
  `format` enum('docx','doc','pdf','mp3','wav') CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `owner` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8

ALTER TABLE Images ADD width int;

--ALTER TABLE Images DROP COLUMN width;

-- CREATE TABLE `ImagesSizes` (
--   `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
--   `imageId` int(11) unsigned NOT NULL,
--   `size` ENUM('s', 'm', 'l', 'o') NOT NULL,
--   `created` datetime DEFAULT NULL,
--   `modified` datetime DEFAULT NULL,
--   PRIMARY KEY (`id`)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
