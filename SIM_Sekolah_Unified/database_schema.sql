

CREATE DATABASE IF NOT EXISTS sim_sekolah CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sim_sekolah;

-- Tabel User
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(255) NOT NULL,
  `nip` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','guru') NOT NULL DEFAULT 'guru',
  `wali_kelas` tinyint(1) NOT NULL DEFAULT '0',
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nip` (`nip`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Kelas
CREATE TABLE IF NOT EXISTS `kelas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_guru` int DEFAULT NULL,
  `nama_kelas` varchar(255) NOT NULL,
  `tingkat` enum('7','8','9') NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_guru` (`id_guru`),
  CONSTRAINT `kelas_ibfk_1` FOREIGN KEY (`id_guru`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Siswa
CREATE TABLE IF NOT EXISTS `siswa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nis` varchar(255) NOT NULL,
  `nama` varchar(255) NOT NULL,
  `alamat` text NOT NULL,
  `ibu` varchar(255) NOT NULL,
  `ayah` varchar(255) NOT NULL,
  `wali` varchar(255) NOT NULL,
  `kontak_wali` varchar(255) NOT NULL,
  `id_kelas` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nis` (`nis`),
  KEY `id_kelas` (`id_kelas`),
  CONSTRAINT `siswa_ibfk_1` FOREIGN KEY (`id_kelas`) REFERENCES `kelas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Mata Pelajaran
CREATE TABLE IF NOT EXISTS `mata_pelajaran` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mata_pelajaran` varchar(255) NOT NULL,
  `kkm` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Guru Mata Pelajaran
CREATE TABLE IF NOT EXISTS `guru_mata_pelajaran` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_guru` int NOT NULL,
  `id_mapel` int NOT NULL,
  `id_kelas` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `guru_mata_pelajaran_id_guru_id_mapel_id_kelas` (`id_guru`,`id_mapel`,`id_kelas`),
  KEY `id_mapel` (`id_mapel`),
  KEY `id_kelas` (`id_kelas`),
  CONSTRAINT `guru_mata_pelajaran_ibfk_1` FOREIGN KEY (`id_guru`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `guru_mata_pelajaran_ibfk_2` FOREIGN KEY (`id_mapel`) REFERENCES `mata_pelajaran` (`id`) ON DELETE CASCADE,
  CONSTRAINT `guru_mata_pelajaran_ibfk_3` FOREIGN KEY (`id_kelas`) REFERENCES `kelas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Penilaian
CREATE TABLE IF NOT EXISTS `penilaian` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_siswa` int NOT NULL,
  `id_mapel` int NOT NULL,
  `id_guru` int NOT NULL,
  `semester` enum('ganjil','genap') NOT NULL,
  `nilai_harian_1` decimal(5,2) DEFAULT NULL,
  `nilai_harian_2` decimal(5,2) DEFAULT NULL,
  `nilai_harian_3` decimal(5,2) DEFAULT NULL,
  `nilai_UTS` decimal(5,2) DEFAULT NULL,
  `nilai_harian_4` decimal(5,2) DEFAULT NULL,
  `nilai_harian_5` decimal(5,2) DEFAULT NULL,
  `nilai_harian_6` decimal(5,2) DEFAULT NULL,
  `nilai_UAS` decimal(5,2) DEFAULT NULL,
  `nilai_Akhir` decimal(5,2) DEFAULT NULL,
  `update_terakhir` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `penilaian_id_siswa_id_mapel_semester` (`id_siswa`,`id_mapel`,`semester`),
  KEY `id_mapel` (`id_mapel`),
  KEY `id_guru` (`id_guru`),
  CONSTRAINT `penilaian_ibfk_1` FOREIGN KEY (`id_siswa`) REFERENCES `siswa` (`id`) ON DELETE CASCADE,
  CONSTRAINT `penilaian_ibfk_2` FOREIGN KEY (`id_mapel`) REFERENCES `mata_pelajaran` (`id`) ON DELETE CASCADE,
  CONSTRAINT `penilaian_ibfk_3` FOREIGN KEY (`id_guru`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Rapot
CREATE TABLE IF NOT EXISTS `rapot` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_siswa` int NOT NULL,
  `tahun_ajaran` varchar(255) NOT NULL,
  `semester` enum('ganjil','genap') NOT NULL,
  `sakit` int NOT NULL DEFAULT '0',
  `izin` int NOT NULL DEFAULT '0',
  `alpha` int NOT NULL DEFAULT '0',
  `catatan_wali_kelas` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rapot_id_siswa_tahun_ajaran_semester` (`id_siswa`,`tahun_ajaran`,`semester`),
  CONSTRAINT `rapot_ibfk_1` FOREIGN KEY (`id_siswa`) REFERENCES `siswa` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
