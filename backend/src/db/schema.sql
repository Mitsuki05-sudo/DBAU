DROP DATABASE IF EXISTS sgec_dbau;
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
INSERT INTO
    admins (email, mot_de_passe, nom)
VALUES (
        'admin@dbau.bj',
        '$2b$10$M0yZklxzqSJ01wW92bSxTuvBUvkCU5r186i2KkfZgWm3ISbQmXR1e',
        'Administrateur DBAU'
    );

-- Insertion des responsables de service (mot de passe: responsable123)
INSERT INTO
    responsables (
        email,
        mot_de_passe,
        nom,
        service_id
    )
VALUES (
        'saua@dbau.bj',
        '$2b$10$K4eeAlMoD0BJfAFRtOwosO8eesooji2mII4di.DXz02gG4nutjv86',
        'Responsable SAUA',
        1
    ),
    (
        'saf@dbau.bj',
        '$2b$10$K4eeAlMoD0BJfAFRtOwosO8eesooji2mII4di.DXz02gG4nutjv86',
        'Responsable SAF',
        2
    ),
    (
        'sa@dbau.bj',
        '$2b$10$K4eeAlMoD0BJfAFRtOwosO8eesooji2mII4di.DXz02gG4nutjv86',
        'Responsable SA',
        3
    ),
    (
        'sis@dbau.bj',
        '$2b$10$K4eeAlMoD0BJfAFRtOwosO8eesooji2mII4di.DXz02gG4nutjv86',
        'Responsable SIS',
        4
    );

-- Insertion d'avis de test
INSERT INTO
    avis (
        session_id,
        note_accueil,
        note_temps_attente,
        note_amabilite,
        note_clarte,
        note_proprete,
        note_globale,
        commentaire,
        traite
    )
VALUES (
        'sess_0001',
        5,
        4,
        5,
        5,
        5,
        5,
        'Personnel accueillant et rapide.',
        TRUE
    ),
    (
        'sess_0002',
        4,
        3,
        4,
        4,
        4,
        4,
        'Bonne prise en charge.',
        FALSE
    ),
    (
        'sess_0003',
        2,
        2,
        3,
        2,
        3,
        2,
        'Temps d attente trop long.',
        FALSE
    ),
    (
        'sess_0004',
        5,
        5,
        5,
        5,
        5,
        5,
        'Excellent service.',
        TRUE
    ),
    (
        'sess_0005',
        3,
        2,
        3,
        3,
        4,
        3,
        'Organisation moyenne.',
        FALSE
    ),
    (
        'sess_0006',
        4,
        4,
        5,
        4,
        5,
        4,
        'Personnel respectueux.',
        TRUE
    ),
    (
        'sess_0007',
        1,
        2,
        2,
        1,
        3,
        1,
        'Mauvaise expérience.',
        FALSE
    ),
    (
        'sess_0008',
        5,
        4,
        5,
        5,
        4,
        5,
        'Très satisfait du service.',
        TRUE
    ),
    (
        'sess_0009',
        4,
        5,
        4,
        5,
        5,
        5,
        'Accueil parfait.',
        TRUE
    ),
    (
        'sess_0010',
        3,
        3,
        3,
        4,
        4,
        3,
        'Correct dans l ensemble.',
        FALSE
    ),
    (
        'sess_0011',
        5,
        5,
        4,
        5,
        5,
        5,
        'Traitement rapide du dossier.',
        TRUE
    ),
    (
        'sess_0012',
        4,
        4,
        4,
        4,
        4,
        4,
        'Personnel poli.',
        TRUE
    ),
    (
        'sess_0013',
        2,
        3,
        2,
        2,
        3,
        2,
        'Informations peu claires.',
        FALSE
    ),
    (
        'sess_0014',
        5,
        5,
        5,
        5,
        5,
        5,
        'Je recommande ce service.',
        TRUE
    ),
    (
        'sess_0015',
        3,
        2,
        4,
        3,
        4,
        3,
        'Attente longue.',
        FALSE
    ),
    (
        'sess_0016',
        4,
        4,
        5,
        4,
        5,
        4,
        'Bonne orientation.',
        TRUE
    ),
    (
        'sess_0017',
        1,
        1,
        2,
        1,
        2,
        1,
        'Service désorganisé.',
        FALSE
    ),
    (
        'sess_0018',
        5,
        4,
        5,
        5,
        5,
        5,
        'Personnel compétent.',
        TRUE
    ),
    (
        'sess_0019',
        4,
        5,
        5,
        4,
        5,
        5,
        'Satisfait de ma visite.',
        TRUE
    ),
    (
        'sess_0020',
        3,
        3,
        3,
        3,
        3,
        3,
        'Service acceptable.',
        FALSE
    ),
    (
        'sess_0021',
        5,
        5,
        5,
        5,
        5,
        5,
        'Accueil chaleureux.',
        TRUE
    ),
    (
        'sess_0022',
        4,
        4,
        4,
        4,
        5,
        4,
        'Locaux propres.',
        TRUE
    ),
    (
        'sess_0023',
        2,
        2,
        2,
        3,
        3,
        2,
        'Difficulté à obtenir des réponses.',
        FALSE
    ),
    (
        'sess_0024',
        5,
        5,
        5,
        4,
        5,
        5,
        'Très bonne organisation.',
        TRUE
    ),
    (
        'sess_0025',
        3,
        3,
        4,
        3,
        4,
        3,
        'Service moyen.',
        FALSE
    ),
    (
        'sess_0026',
        4,
        5,
        5,
        4,
        5,
        5,
        'Excellent accompagnement.',
        TRUE
    ),
    (
        'sess_0027',
        1,
        2,
        1,
        1,
        2,
        1,
        'Accueil froid.',
        FALSE
    ),
    (
        'sess_0028',
        5,
        5,
        5,
        5,
        5,
        5,
        'Parfait du début à la fin.',
        TRUE
    ),
    (
        'sess_0029',
        4,
        4,
        5,
        4,
        4,
        4,
        'Personnel aimable.',
        TRUE
    ),
    (
        'sess_0030',
        2,
        3,
        2,
        2,
        3,
        2,
        'Manque d organisation.',
        FALSE
    ),
    (
        'sess_0031',
        5,
        4,
        5,
        5,
        5,
        5,
        'Rapidité appréciée.',
        TRUE
    ),
    (
        'sess_0032',
        4,
        3,
        4,
        4,
        4,
        4,
        'Bonne assistance.',
        TRUE
    ),
    (
        'sess_0033',
        2,
        2,
        2,
        2,
        3,
        2,
        'Temps d attente excessif.',
        FALSE
    ),
    (
        'sess_0034',
        5,
        5,
        5,
        5,
        5,
        5,
        'Très satisfait.',
        TRUE
    ),
    (
        'sess_0035',
        3,
        4,
        3,
        3,
        4,
        3,
        'Correct.',
        FALSE
    ),
    (
        'sess_0036',
        4,
        5,
        5,
        4,
        5,
        5,
        'Excellent accueil.',
        TRUE
    ),
    (
        'sess_0037',
        1,
        1,
        2,
        1,
        2,
        1,
        'Aucune orientation.',
        FALSE
    ),
    (
        'sess_0038',
        5,
        5,
        5,
        5,
        5,
        5,
        'Personnel efficace.',
        TRUE
    ),
    (
        'sess_0039',
        4,
        4,
        4,
        5,
        5,
        4,
        'Bonne communication.',
        TRUE
    ),
    (
        'sess_0040',
        2,
        3,
        3,
        2,
        3,
        2,
        'Peu satisfait.',
        FALSE
    );

INSERT INTO
    avis_motifs (avis_id, motif_id)
VALUES (1, 1),
    (2, 2),
    (3, 3),
    (4, 5),
    (5, 6),
    (6, 7),
    (7, 8),
    (8, 9),
    (9, 10),
    (10, 11),
    (11, 12),
    (12, 13),
    (13, 14),
    (14, 1),
    (15, 2),
    (16, 3),
    (17, 4),
    (18, 5),
    (19, 6),
    (20, 7),
    (21, 8),
    (22, 9),
    (23, 10),
    (24, 11),
    (25, 12),
    (26, 13),
    (27, 14),
    (28, 1),
    (29, 2),
    (30, 3),
    (31, 4),
    (32, 5),
    (33, 6),
    (34, 7),
    (35, 8),
    (36, 9),
    (37, 10),
    (38, 11),
    (39, 12),
    (40, 13);