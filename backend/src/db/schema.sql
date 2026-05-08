CREATE DATABASE IF NOT EXISTS sgec_dbau;
USE sgec_dbau;

-- Services de la DBAU
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    nom VARCHAR(100) NOT NULL
);

-- Motifs de visite
CREATE TABLE IF NOT EXISTS motifs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(255) NOT NULL,
    service_id INT NOT NULL,
    FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Avis visiteurs (anonyme)
CREATE TABLE IF NOT EXISTS avis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    date_soumission DATETIME DEFAULT CURRENT_TIMESTAMP,
    note_accueil INT NOT NULL CHECK (note_accueil BETWEEN 1 AND 5),
    note_temps_attente INT NOT NULL CHECK (note_temps_attente BETWEEN 1 AND 5),
    note_amabilite INT NOT NULL CHECK (note_amabilite BETWEEN 1 AND 5),
    note_clarte INT NOT NULL CHECK (note_clarte BETWEEN 1 AND 5),
    note_proprete INT NOT NULL CHECK (note_proprete BETWEEN 1 AND 5),
    note_globale INT NOT NULL CHECK (note_globale BETWEEN 1 AND 5),
    commentaire VARCHAR(800),
    traite BOOLEAN DEFAULT FALSE
);

-- Table de liaison avis <-> motifs
CREATE TABLE IF NOT EXISTS avis_motifs (
    avis_id INT NOT NULL,
    motif_id INT NOT NULL,
    PRIMARY KEY (avis_id, motif_id),
    FOREIGN KEY (avis_id) REFERENCES avis(id) ON DELETE CASCADE,
    FOREIGN KEY (motif_id) REFERENCES motifs(id)
);

-- Administrateurs
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL
);

-- Responsables de service
CREATE TABLE IF NOT EXISTS responsables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    service_id INT NOT NULL,
    FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Insertion des services
INSERT INTO services (code, nom) VALUES
('SAUA', 'Service des Affaires Universitaires et Académiques'),
('SAF', 'Service des Affaires Financières'),
('SA', 'Service des Archives'),
('SIS', 'Service de l''Informatique et des Statistiques');

-- Insertion des motifs de visite
INSERT INTO motifs (libelle, service_id) VALUES
('Dépôt de dossier de bourse', 1),
('Réclamation bourse', 1),
('Demande de renseignements académiques', 1),
('Retrait de documents (SAUA)', 1),
('Paiement de bourse', 2),
('Problème de virement', 2),
('Demande de renseignements financiers', 2),
('Retrait de documents (SAF)', 2),
('Dépôt de documents archivés', 3),
('Consultation d''archives', 3),
('Demande de renseignements archives', 3),
('Problème informatique', 4),
('Demande d''accès système', 4),
('Autre demande', 4);

-- Insertion d'un admin par défaut (mot de passe: admin123)
INSERT INTO admins (email, mot_de_passe, nom) VALUES
('admin@dbau.bj', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf9R8L5C/K1F6BvCgVZZXR5PepqS', 'Administrateur DBAU');

-- Insertion des responsables de service (mot de passe: responsable123)
INSERT INTO responsables (email, mot_de_passe, nom, service_id) VALUES
('saua@dbau.bj', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf9R8L5C/K1F6BvCgVZZXR5PepqS', 'Responsable SAUA', 1),
('saf@dbau.bj', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf9R8L5C/K1F6BvCgVZZXR5PepqS', 'Responsable SAF', 2),
('sa@dbau.bj', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf9R8L5C/K1F6BvCgVZZXR5PepqS', 'Responsable SA', 3),
('sis@dbau.bj', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf9R8L5C/K1F6BvCgVZZXR5PepqS', 'Responsable SIS', 4);