DROP DATABASE IF EXISTS sgec_dbau;

CREATE DATABASE IF NOT EXISTS sgec_dbau;

USE sgec_dbau;

CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    nom VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS motifs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(255) NOT NULL,
    service_id INT NOT NULL,
    FOREIGN KEY (service_id) REFERENCES services (id)
);

CREATE TABLE IF NOT EXISTS avis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    date_soumission DATETIME DEFAULT CURRENT_TIMESTAMP,
    note_accueil INT NOT NULL CHECK (note_accueil BETWEEN 1 AND 5),
    note_temps_attente INT NOT NULL CHECK (
        note_temps_attente BETWEEN 1 AND 5
    ),
    note_amabilite INT NOT NULL CHECK (
        note_amabilite BETWEEN 1 AND 5
    ),
    note_clarte INT NOT NULL CHECK (note_clarte BETWEEN 1 AND 5),
    note_proprete INT NOT NULL CHECK (note_proprete BETWEEN 1 AND 5),
    note_globale INT NOT NULL CHECK (note_globale BETWEEN 1 AND 5),
    commentaire VARCHAR(800),
    traite BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS avis_motifs (
    avis_id INT NOT NULL,
    motif_id INT NOT NULL,
    PRIMARY KEY (avis_id, motif_id),
    FOREIGN KEY (avis_id) REFERENCES avis (id) ON DELETE CASCADE,
    FOREIGN KEY (motif_id) REFERENCES motifs (id)
);

CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS responsables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    service_id INT NOT NULL,
    FOREIGN KEY (service_id) REFERENCES services (id)
);

INSERT IGNORE INTO
    services (code, nom)
VALUES (
        'SAUA',
        'Service des Affaires Universitaires et Académiques'
    ),
    (
        'SAF',
        'Service des Affaires Financières'
    ),
    ('SA', 'Service des Archives'),
    (
        'SIS',
        'Service de l''Informatique et des Statistiques'
    );

INSERT IGNORE INTO
    motifs (libelle, service_id)
VALUES (
        'Dépôt de dossier de bourse',
        1
    ),
    ('Réclamation bourse', 1),
    (
        'Demande de renseignements académiques',
        1
    ),
    (
        'Retrait de documents (SAUA)',
        1
    ),
    ('Paiement de bourse', 2),
    ('Problème de virement', 2),
    (
        'Demande de renseignements financiers',
        2
    ),
    (
        'Retrait de documents (SAF)',
        2
    ),
    (
        'Dépôt de documents archivés',
        3
    ),
    ('Consultation d''archives', 3),
    (
        'Demande de renseignements archives',
        3
    ),
    ('Problème informatique', 4),
    ('Demande d''accès système', 4),
    ('Autre demande', 4);

INSERT IGNORE INTO
    admins (email, mot_de_passe, nom)
VALUES (
        'admin@dbau.bj',
        '$2b$10$M0yZklxzqSJ01wW92bSxTuvBUvkCU5r186i2KkfZgWm3ISbQmXR1e',
        'Administrateur DBAU'
    );

INSERT IGNORE INTO
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

INSERT IGNORE INTO
    avis (
        session_id,
        date_soumission,
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
        'uid-001',
        NOW() - INTERVAL 0 DAY,
        5,
        4,
        5,
        4,
        5,
        5,
        'Service excellent, personnel très accueillant.',
        FALSE
    ),
    (
        'uid-002',
        NOW() - INTERVAL 0 DAY,
        4,
        3,
        4,
        4,
        4,
        4,
        'Bon service, attente un peu longue.',
        FALSE
    ),
    (
        'uid-003',
        NOW() - INTERVAL 1 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        'Parfait ! Tout s''est bien passé.',
        FALSE
    ),
    (
        'uid-004',
        NOW() - INTERVAL 1 DAY,
        3,
        2,
        4,
        3,
        4,
        3,
        NULL,
        FALSE
    ),
    (
        'uid-005',
        NOW() - INTERVAL 1 DAY,
        4,
        4,
        5,
        4,
        4,
        4,
        'Personnel aimable et compétent.',
        FALSE
    ),
    (
        'uid-006',
        NOW() - INTERVAL 2 DAY,
        2,
        1,
        3,
        2,
        3,
        2,
        'Trop d''attente pour un simple renseignement.',
        FALSE
    ),
    (
        'uid-007',
        NOW() - INTERVAL 2 DAY,
        5,
        4,
        5,
        5,
        5,
        5,
        'Très bonne expérience.',
        FALSE
    ),
    (
        'uid-008',
        NOW() - INTERVAL 2 DAY,
        4,
        3,
        4,
        4,
        3,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-009',
        NOW() - INTERVAL 3 DAY,
        3,
        3,
        3,
        3,
        4,
        3,
        'Service acceptable.',
        FALSE
    ),
    (
        'uid-010',
        NOW() - INTERVAL 3 DAY,
        5,
        5,
        5,
        4,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-011',
        NOW() - INTERVAL 3 DAY,
        4,
        4,
        4,
        4,
        4,
        4,
        'Bon accueil, informations claires.',
        FALSE
    ),
    (
        'uid-012',
        NOW() - INTERVAL 4 DAY,
        1,
        1,
        2,
        1,
        3,
        1,
        'Service déplorable. Mon dossier a été perdu.',
        FALSE
    ),
    (
        'uid-013',
        NOW() - INTERVAL 4 DAY,
        4,
        3,
        5,
        4,
        4,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-014',
        NOW() - INTERVAL 4 DAY,
        5,
        4,
        5,
        5,
        5,
        5,
        'Excellent. Merci à toute l''équipe.',
        FALSE
    ),
    (
        'uid-015',
        NOW() - INTERVAL 5 DAY,
        3,
        2,
        3,
        3,
        3,
        3,
        'Délai d''attente trop long.',
        FALSE
    ),
    (
        'uid-016',
        NOW() - INTERVAL 5 DAY,
        4,
        4,
        4,
        4,
        4,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-017',
        NOW() - INTERVAL 5 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        'Parfait. Je recommande vivement.',
        FALSE
    ),
    (
        'uid-018',
        NOW() - INTERVAL 6 DAY,
        4,
        3,
        4,
        5,
        4,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-019',
        NOW() - INTERVAL 6 DAY,
        2,
        2,
        3,
        2,
        3,
        2,
        'Personnel peu disponible.',
        FALSE
    ),
    (
        'uid-020',
        NOW() - INTERVAL 6 DAY,
        5,
        4,
        5,
        4,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-021',
        NOW() - INTERVAL 7 DAY,
        4,
        4,
        4,
        4,
        4,
        4,
        'Service satisfaisant.',
        FALSE
    ),
    (
        'uid-022',
        NOW() - INTERVAL 7 DAY,
        3,
        3,
        4,
        3,
        4,
        3,
        NULL,
        FALSE
    ),
    (
        'uid-023',
        NOW() - INTERVAL 7 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        'Impeccable ! Traitement rapide.',
        FALSE
    ),
    (
        'uid-024',
        NOW() - INTERVAL 8 DAY,
        4,
        3,
        4,
        4,
        3,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-025',
        NOW() - INTERVAL 8 DAY,
        1,
        1,
        1,
        2,
        2,
        1,
        'Inacceptable. Attente de 3h.',
        FALSE
    ),
    (
        'uid-026',
        NOW() - INTERVAL 8 DAY,
        5,
        4,
        5,
        5,
        5,
        5,
        'Très professionnel.',
        FALSE
    ),
    (
        'uid-027',
        NOW() - INTERVAL 9 DAY,
        4,
        4,
        4,
        3,
        4,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-028',
        NOW() - INTERVAL 9 DAY,
        3,
        2,
        4,
        3,
        3,
        3,
        'Attente longue mais personnel sympathique.',
        FALSE
    ),
    (
        'uid-029',
        NOW() - INTERVAL 9 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-030',
        NOW() - INTERVAL 10 DAY,
        4,
        3,
        5,
        4,
        4,
        4,
        'Bonne prise en charge.',
        FALSE
    ),
    (
        'uid-031',
        NOW() - INTERVAL 10 DAY,
        2,
        1,
        2,
        2,
        3,
        2,
        'Informations contradictoires.',
        FALSE
    ),
    (
        'uid-032',
        NOW() - INTERVAL 11 DAY,
        5,
        4,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-033',
        NOW() - INTERVAL 11 DAY,
        4,
        4,
        4,
        4,
        4,
        4,
        'Bonne expérience.',
        FALSE
    ),
    (
        'uid-034',
        NOW() - INTERVAL 12 DAY,
        3,
        3,
        3,
        3,
        3,
        3,
        NULL,
        FALSE
    ),
    (
        'uid-035',
        NOW() - INTERVAL 12 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        'Excellent ! Problème de virement réglé rapidement.',
        FALSE
    ),
    (
        'uid-036',
        NOW() - INTERVAL 13 DAY,
        4,
        3,
        4,
        4,
        4,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-037',
        NOW() - INTERVAL 13 DAY,
        2,
        2,
        3,
        2,
        3,
        2,
        'Pas assez de guichets ouverts.',
        FALSE
    ),
    (
        'uid-038',
        NOW() - INTERVAL 14 DAY,
        5,
        4,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-039',
        NOW() - INTERVAL 14 DAY,
        4,
        4,
        5,
        4,
        4,
        4,
        'Très bon accueil.',
        FALSE
    ),
    (
        'uid-040',
        NOW() - INTERVAL 15 DAY,
        3,
        2,
        3,
        3,
        4,
        3,
        NULL,
        FALSE
    ),
    (
        'uid-041',
        NOW() - INTERVAL 15 DAY,
        1,
        1,
        2,
        1,
        2,
        1,
        'Très mauvaise expérience.',
        FALSE
    ),
    (
        'uid-042',
        NOW() - INTERVAL 16 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-043',
        NOW() - INTERVAL 16 DAY,
        4,
        4,
        4,
        4,
        4,
        4,
        'Service de qualité.',
        FALSE
    ),
    (
        'uid-044',
        NOW() - INTERVAL 17 DAY,
        3,
        3,
        4,
        3,
        4,
        3,
        NULL,
        FALSE
    ),
    (
        'uid-045',
        NOW() - INTERVAL 17 DAY,
        5,
        4,
        5,
        5,
        5,
        5,
        'Traitement rapide de mon dossier.',
        FALSE
    ),
    (
        'uid-046',
        NOW() - INTERVAL 18 DAY,
        4,
        3,
        4,
        4,
        4,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-047',
        NOW() - INTERVAL 18 DAY,
        2,
        2,
        3,
        2,
        3,
        2,
        'Service à améliorer.',
        FALSE
    ),
    (
        'uid-048',
        NOW() - INTERVAL 19 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-049',
        NOW() - INTERVAL 19 DAY,
        4,
        4,
        5,
        4,
        4,
        4,
        'Excellente prise en charge.',
        FALSE
    ),
    (
        'uid-050',
        NOW() - INTERVAL 20 DAY,
        3,
        3,
        3,
        3,
        4,
        3,
        NULL,
        FALSE
    ),
    (
        'uid-051',
        NOW() - INTERVAL 20 DAY,
        1,
        2,
        2,
        1,
        3,
        2,
        'Système informatique en panne.',
        FALSE
    ),
    (
        'uid-052',
        NOW() - INTERVAL 21 DAY,
        5,
        4,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-053',
        NOW() - INTERVAL 21 DAY,
        4,
        4,
        4,
        4,
        4,
        4,
        'Bon service.',
        FALSE
    ),
    (
        'uid-054',
        NOW() - INTERVAL 22 DAY,
        3,
        3,
        4,
        3,
        4,
        3,
        NULL,
        FALSE
    ),
    (
        'uid-055',
        NOW() - INTERVAL 22 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        'Service irréprochable.',
        FALSE
    ),
    (
        'uid-056',
        NOW() - INTERVAL 23 DAY,
        4,
        3,
        4,
        4,
        3,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-057',
        NOW() - INTERVAL 23 DAY,
        2,
        1,
        3,
        2,
        3,
        2,
        'Attente interminable.',
        FALSE
    ),
    (
        'uid-058',
        NOW() - INTERVAL 24 DAY,
        5,
        4,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-059',
        NOW() - INTERVAL 24 DAY,
        4,
        4,
        4,
        4,
        4,
        4,
        'Satisfait.',
        FALSE
    ),
    (
        'uid-060',
        NOW() - INTERVAL 25 DAY,
        3,
        3,
        3,
        3,
        3,
        3,
        NULL,
        FALSE
    ),
    (
        'uid-061',
        NOW() - INTERVAL 25 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        'Rien à redire.',
        FALSE
    ),
    (
        'uid-062',
        NOW() - INTERVAL 26 DAY,
        4,
        3,
        4,
        4,
        4,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-063',
        NOW() - INTERVAL 26 DAY,
        2,
        2,
        2,
        2,
        3,
        2,
        'Service insuffisant.',
        FALSE
    ),
    (
        'uid-064',
        NOW() - INTERVAL 27 DAY,
        5,
        4,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-065',
        NOW() - INTERVAL 27 DAY,
        4,
        4,
        4,
        4,
        4,
        4,
        'Bon accueil.',
        FALSE
    ),
    (
        'uid-066',
        NOW() - INTERVAL 28 DAY,
        3,
        2,
        3,
        3,
        4,
        3,
        NULL,
        FALSE
    ),
    (
        'uid-067',
        NOW() - INTERVAL 28 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-068',
        NOW() - INTERVAL 29 DAY,
        4,
        3,
        5,
        4,
        4,
        4,
        'Personnel aimable.',
        FALSE
    ),
    (
        'uid-069',
        NOW() - INTERVAL 29 DAY,
        1,
        1,
        2,
        2,
        2,
        1,
        'Mon dossier n''avance pas.',
        FALSE
    ),
    (
        'uid-070',
        NOW() - INTERVAL 30 DAY,
        5,
        4,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-071',
        NOW() - INTERVAL 31 DAY,
        4,
        4,
        4,
        4,
        4,
        4,
        'Service honnête.',
        FALSE
    ),
    (
        'uid-072',
        NOW() - INTERVAL 32 DAY,
        3,
        3,
        4,
        3,
        4,
        3,
        NULL,
        FALSE
    ),
    (
        'uid-073',
        NOW() - INTERVAL 33 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        'Expérience positive.',
        FALSE
    ),
    (
        'uid-074',
        NOW() - INTERVAL 34 DAY,
        4,
        3,
        4,
        4,
        3,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-075',
        NOW() - INTERVAL 35 DAY,
        2,
        2,
        3,
        2,
        3,
        2,
        'Service lent.',
        FALSE
    ),
    (
        'uid-076',
        NOW() - INTERVAL 36 DAY,
        5,
        4,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-077',
        NOW() - INTERVAL 37 DAY,
        4,
        4,
        4,
        4,
        4,
        4,
        'Très satisfait.',
        FALSE
    ),
    (
        'uid-078',
        NOW() - INTERVAL 38 DAY,
        3,
        3,
        3,
        3,
        4,
        3,
        NULL,
        FALSE
    ),
    (
        'uid-079',
        NOW() - INTERVAL 39 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        'Tout s''est bien déroulé.',
        FALSE
    ),
    (
        'uid-080',
        NOW() - INTERVAL 40 DAY,
        1,
        1,
        1,
        1,
        2,
        1,
        'Personnel absent à l''ouverture.',
        TRUE
    ),
    (
        'uid-081',
        NOW() - INTERVAL 41 DAY,
        5,
        4,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-082',
        NOW() - INTERVAL 42 DAY,
        4,
        4,
        5,
        4,
        4,
        4,
        'Bon service.',
        FALSE
    ),
    (
        'uid-083',
        NOW() - INTERVAL 43 DAY,
        3,
        2,
        3,
        3,
        3,
        3,
        NULL,
        FALSE
    ),
    (
        'uid-084',
        NOW() - INTERVAL 44 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        'Service irréprochable.',
        FALSE
    ),
    (
        'uid-085',
        NOW() - INTERVAL 45 DAY,
        4,
        4,
        4,
        4,
        4,
        4,
        NULL,
        TRUE
    ),
    (
        'uid-086',
        NOW() - INTERVAL 46 DAY,
        2,
        2,
        3,
        2,
        3,
        2,
        'Amélioration nécessaire.',
        TRUE
    ),
    (
        'uid-087',
        NOW() - INTERVAL 47 DAY,
        5,
        4,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-088',
        NOW() - INTERVAL 48 DAY,
        4,
        3,
        4,
        4,
        4,
        4,
        'Personnel compétent.',
        FALSE
    ),
    (
        'uid-089',
        NOW() - INTERVAL 49 DAY,
        3,
        3,
        3,
        3,
        4,
        3,
        NULL,
        FALSE
    ),
    (
        'uid-090',
        NOW() - INTERVAL 50 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-091',
        NOW() - INTERVAL 51 DAY,
        1,
        1,
        2,
        1,
        2,
        1,
        'Comportement irrespectueux.',
        TRUE
    ),
    (
        'uid-092',
        NOW() - INTERVAL 52 DAY,
        4,
        4,
        4,
        4,
        4,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-093',
        NOW() - INTERVAL 53 DAY,
        5,
        4,
        5,
        5,
        5,
        5,
        'Tout était en ordre.',
        FALSE
    ),
    (
        'uid-094',
        NOW() - INTERVAL 54 DAY,
        4,
        3,
        4,
        4,
        3,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-095',
        NOW() - INTERVAL 55 DAY,
        3,
        2,
        4,
        3,
        4,
        3,
        NULL,
        FALSE
    ),
    (
        'uid-096',
        NOW() - INTERVAL 56 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        'Service exemplaire.',
        FALSE
    ),
    (
        'uid-097',
        NOW() - INTERVAL 57 DAY,
        2,
        1,
        2,
        2,
        3,
        2,
        'Manque de clarté.',
        TRUE
    ),
    (
        'uid-098',
        NOW() - INTERVAL 58 DAY,
        4,
        4,
        4,
        4,
        4,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-099',
        NOW() - INTERVAL 59 DAY,
        5,
        4,
        5,
        5,
        5,
        5,
        'Très bonne prise en charge.',
        FALSE
    ),
    (
        'uid-100',
        NOW() - INTERVAL 60 DAY,
        4,
        3,
        4,
        4,
        4,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-101',
        NOW() - INTERVAL 61 DAY,
        3,
        3,
        3,
        3,
        3,
        3,
        NULL,
        FALSE
    ),
    (
        'uid-102',
        NOW() - INTERVAL 62 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-103',
        NOW() - INTERVAL 63 DAY,
        4,
        4,
        4,
        4,
        4,
        4,
        'Bon service.',
        FALSE
    ),
    (
        'uid-104',
        NOW() - INTERVAL 64 DAY,
        1,
        1,
        1,
        1,
        2,
        1,
        NULL,
        TRUE
    ),
    (
        'uid-105',
        NOW() - INTERVAL 65 DAY,
        5,
        4,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-106',
        NOW() - INTERVAL 66 DAY,
        4,
        3,
        5,
        4,
        4,
        4,
        'Personnel sympa.',
        FALSE
    ),
    (
        'uid-107',
        NOW() - INTERVAL 67 DAY,
        3,
        2,
        3,
        3,
        3,
        3,
        NULL,
        FALSE
    ),
    (
        'uid-108',
        NOW() - INTERVAL 68 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-109',
        NOW() - INTERVAL 69 DAY,
        4,
        4,
        4,
        4,
        4,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-110',
        NOW() - INTERVAL 70 DAY,
        2,
        2,
        3,
        2,
        3,
        2,
        'Service à améliorer.',
        TRUE
    ),
    (
        'uid-111',
        NOW() - INTERVAL 71 DAY,
        5,
        4,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-112',
        NOW() - INTERVAL 72 DAY,
        4,
        4,
        4,
        4,
        4,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-113',
        NOW() - INTERVAL 73 DAY,
        3,
        3,
        4,
        3,
        4,
        3,
        NULL,
        FALSE
    ),
    (
        'uid-114',
        NOW() - INTERVAL 74 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-115',
        NOW() - INTERVAL 75 DAY,
        4,
        3,
        4,
        4,
        3,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-116',
        NOW() - INTERVAL 76 DAY,
        1,
        1,
        2,
        1,
        2,
        1,
        NULL,
        TRUE
    ),
    (
        'uid-117',
        NOW() - INTERVAL 77 DAY,
        5,
        4,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-118',
        NOW() - INTERVAL 78 DAY,
        4,
        4,
        4,
        4,
        4,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-119',
        NOW() - INTERVAL 79 DAY,
        3,
        2,
        3,
        3,
        3,
        3,
        NULL,
        FALSE
    ),
    (
        'uid-120',
        NOW() - INTERVAL 80 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-121',
        NOW() - INTERVAL 81 DAY,
        4,
        4,
        4,
        4,
        4,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-122',
        NOW() - INTERVAL 82 DAY,
        2,
        1,
        2,
        2,
        3,
        2,
        NULL,
        TRUE
    ),
    (
        'uid-123',
        NOW() - INTERVAL 83 DAY,
        5,
        4,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-124',
        NOW() - INTERVAL 84 DAY,
        4,
        3,
        4,
        4,
        4,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-125',
        NOW() - INTERVAL 85 DAY,
        3,
        3,
        3,
        3,
        4,
        3,
        NULL,
        FALSE
    ),
    (
        'uid-126',
        NOW() - INTERVAL 86 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-127',
        NOW() - INTERVAL 87 DAY,
        4,
        4,
        5,
        4,
        4,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-128',
        NOW() - INTERVAL 88 DAY,
        1,
        1,
        1,
        1,
        2,
        1,
        NULL,
        TRUE
    ),
    (
        'uid-129',
        NOW() - INTERVAL 89 DAY,
        5,
        4,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-130',
        NOW() - INTERVAL 2 DAY,
        4,
        4,
        4,
        4,
        4,
        4,
        'Archives bien organisées.',
        FALSE
    ),
    (
        'uid-131',
        NOW() - INTERVAL 3 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-132',
        NOW() - INTERVAL 4 DAY,
        3,
        3,
        4,
        3,
        4,
        3,
        NULL,
        FALSE
    ),
    (
        'uid-133',
        NOW() - INTERVAL 5 DAY,
        4,
        3,
        4,
        4,
        3,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-134',
        NOW() - INTERVAL 6 DAY,
        5,
        4,
        5,
        5,
        5,
        5,
        'Accès aux archives facilité.',
        FALSE
    ),
    (
        'uid-135',
        NOW() - INTERVAL 7 DAY,
        2,
        2,
        3,
        2,
        3,
        2,
        'Difficile de trouver les documents.',
        FALSE
    ),
    (
        'uid-136',
        NOW() - INTERVAL 1 DAY,
        4,
        4,
        5,
        4,
        4,
        4,
        'Problème informatique résolu rapidement.',
        FALSE
    ),
    (
        'uid-137',
        NOW() - INTERVAL 2 DAY,
        3,
        3,
        3,
        3,
        3,
        3,
        NULL,
        FALSE
    ),
    (
        'uid-138',
        NOW() - INTERVAL 3 DAY,
        5,
        4,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-139',
        NOW() - INTERVAL 4 DAY,
        1,
        2,
        2,
        1,
        2,
        2,
        'Système d''information défaillant.',
        FALSE
    ),
    (
        'uid-140',
        NOW() - INTERVAL 5 DAY,
        4,
        4,
        4,
        4,
        4,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-141',
        NOW() - INTERVAL 6 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        'Assistance informatique efficace.',
        FALSE
    ),
    (
        'uid-142',
        NOW() - INTERVAL 0 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        'Très bonne journée.',
        FALSE
    ),
    (
        'uid-143',
        NOW() - INTERVAL 1 DAY,
        3,
        3,
        4,
        3,
        4,
        3,
        NULL,
        FALSE
    ),
    (
        'uid-144',
        NOW() - INTERVAL 2 DAY,
        4,
        3,
        4,
        4,
        3,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-145',
        NOW() - INTERVAL 3 DAY,
        4,
        4,
        4,
        4,
        4,
        4,
        'Dossier traité dans les délais.',
        FALSE
    ),
    (
        'uid-146',
        NOW() - INTERVAL 4 DAY,
        2,
        2,
        3,
        2,
        3,
        2,
        NULL,
        FALSE
    ),
    (
        'uid-147',
        NOW() - INTERVAL 5 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-148',
        NOW() - INTERVAL 6 DAY,
        4,
        3,
        5,
        4,
        4,
        4,
        'Paiement effectué sans problème.',
        FALSE
    ),
    (
        'uid-149',
        NOW() - INTERVAL 7 DAY,
        3,
        2,
        3,
        3,
        3,
        3,
        NULL,
        FALSE
    ),
    (
        'uid-150',
        NOW() - INTERVAL 8 DAY,
        5,
        4,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-151',
        NOW() - INTERVAL 9 DAY,
        4,
        4,
        4,
        4,
        4,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-152',
        NOW() - INTERVAL 10 DAY,
        1,
        1,
        2,
        2,
        2,
        1,
        'Virement toujours pas effectué.',
        FALSE
    ),
    (
        'uid-153',
        NOW() - INTERVAL 11 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-154',
        NOW() - INTERVAL 12 DAY,
        4,
        3,
        4,
        4,
        4,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-155',
        NOW() - INTERVAL 13 DAY,
        3,
        3,
        3,
        3,
        4,
        3,
        NULL,
        FALSE
    ),
    (
        'uid-156',
        NOW() - INTERVAL 14 DAY,
        5,
        4,
        5,
        5,
        5,
        5,
        'Service financier irréprochable.',
        FALSE
    ),
    (
        'uid-157',
        NOW() - INTERVAL 15 DAY,
        4,
        4,
        4,
        4,
        4,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-158',
        NOW() - INTERVAL 16 DAY,
        2,
        1,
        3,
        2,
        3,
        2,
        NULL,
        FALSE
    ),
    (
        'uid-159',
        NOW() - INTERVAL 17 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-160',
        NOW() - INTERVAL 18 DAY,
        1,
        1,
        1,
        1,
        2,
        1,
        'Service archives désorganisé.',
        TRUE
    ),
    (
        'uid-161',
        NOW() - INTERVAL 19 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-162',
        NOW() - INTERVAL 20 DAY,
        4,
        4,
        4,
        4,
        4,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-163',
        NOW() - INTERVAL 21 DAY,
        3,
        3,
        3,
        3,
        3,
        3,
        NULL,
        FALSE
    ),
    (
        'uid-164',
        NOW() - INTERVAL 22 DAY,
        5,
        4,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-165',
        NOW() - INTERVAL 23 DAY,
        4,
        3,
        4,
        4,
        3,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-166',
        NOW() - INTERVAL 24 DAY,
        2,
        2,
        3,
        2,
        3,
        2,
        NULL,
        TRUE
    ),
    (
        'uid-167',
        NOW() - INTERVAL 25 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-168',
        NOW() - INTERVAL 26 DAY,
        4,
        4,
        4,
        4,
        4,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-169',
        NOW() - INTERVAL 27 DAY,
        3,
        2,
        3,
        3,
        4,
        3,
        NULL,
        FALSE
    ),
    (
        'uid-170',
        NOW() - INTERVAL 28 DAY,
        5,
        4,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-171',
        NOW() - INTERVAL 29 DAY,
        4,
        4,
        4,
        4,
        4,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-172',
        NOW() - INTERVAL 30 DAY,
        1,
        1,
        2,
        1,
        2,
        1,
        NULL,
        TRUE
    ),
    (
        'uid-173',
        NOW() - INTERVAL 35 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-174',
        NOW() - INTERVAL 40 DAY,
        4,
        4,
        4,
        4,
        4,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-175',
        NOW() - INTERVAL 45 DAY,
        3,
        3,
        3,
        3,
        3,
        3,
        NULL,
        FALSE
    ),
    (
        'uid-176',
        NOW() - INTERVAL 50 DAY,
        5,
        4,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-177',
        NOW() - INTERVAL 55 DAY,
        4,
        3,
        4,
        4,
        4,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-178',
        NOW() - INTERVAL 60 DAY,
        2,
        2,
        3,
        2,
        3,
        2,
        NULL,
        TRUE
    ),
    (
        'uid-179',
        NOW() - INTERVAL 65 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-180',
        NOW() - INTERVAL 70 DAY,
        4,
        4,
        4,
        4,
        4,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-181',
        NOW() - INTERVAL 75 DAY,
        3,
        2,
        3,
        3,
        3,
        3,
        NULL,
        FALSE
    ),
    (
        'uid-182',
        NOW() - INTERVAL 80 DAY,
        5,
        4,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    ),
    (
        'uid-183',
        NOW() - INTERVAL 85 DAY,
        4,
        4,
        4,
        4,
        4,
        4,
        NULL,
        FALSE
    ),
    (
        'uid-184',
        NOW() - INTERVAL 89 DAY,
        1,
        1,
        1,
        1,
        1,
        1,
        NULL,
        TRUE
    ),
    (
        'uid-185',
        NOW() - INTERVAL 88 DAY,
        5,
        5,
        5,
        5,
        5,
        5,
        NULL,
        FALSE
    );

INSERT IGNORE INTO
    avis_motifs (avis_id, motif_id)
SELECT a.id, 1
FROM avis a
WHERE
    a.session_id IN (
        'uid-001',
        'uid-003',
        'uid-005',
        'uid-007',
        'uid-009',
        'uid-014',
        'uid-017',
        'uid-021',
        'uid-023',
        'uid-026',
        'uid-029',
        'uid-033',
        'uid-042',
        'uid-043',
        'uid-045',
        'uid-047',
        'uid-052',
        'uid-053',
        'uid-142',
        'uid-143',
        'uid-144',
        'uid-145'
    );

INSERT IGNORE INTO
    avis_motifs (avis_id, motif_id)
SELECT a.id, 2
FROM avis a
WHERE
    a.session_id IN (
        'uid-012',
        'uid-015',
        'uid-019',
        'uid-025',
        'uid-031',
        'uid-037',
        'uid-041',
        'uid-069',
        'uid-080',
        'uid-091'
    );

INSERT IGNORE INTO
    avis_motifs (avis_id, motif_id)
SELECT a.id, 3
FROM avis a
WHERE
    a.session_id IN (
        'uid-004',
        'uid-008',
        'uid-013',
        'uid-016',
        'uid-022',
        'uid-027',
        'uid-034',
        'uid-036',
        'uid-039',
        'uid-046',
        'uid-055',
        'uid-059',
        'uid-064',
        'uid-065'
    );

INSERT IGNORE INTO
    avis_motifs (avis_id, motif_id)
SELECT a.id, 4
FROM avis a
WHERE
    a.session_id IN (
        'uid-002',
        'uid-010',
        'uid-011',
        'uid-018',
        'uid-020',
        'uid-024',
        'uid-028',
        'uid-030',
        'uid-032',
        'uid-038',
        'uid-040',
        'uid-044',
        'uid-048',
        'uid-049'
    );

INSERT IGNORE INTO
    avis_motifs (avis_id, motif_id)
SELECT a.id, 5
FROM avis a
WHERE
    a.session_id IN (
        'uid-050',
        'uid-051',
        'uid-056',
        'uid-057',
        'uid-058',
        'uid-146',
        'uid-147',
        'uid-148',
        'uid-149',
        'uid-150',
        'uid-151',
        'uid-152',
        'uid-153',
        'uid-154'
    );

INSERT IGNORE INTO
    avis_motifs (avis_id, motif_id)
SELECT a.id, 6
FROM avis a
WHERE
    a.session_id IN (
        'uid-006',
        'uid-060',
        'uid-063',
        'uid-066',
        'uid-075',
        'uid-085',
        'uid-155',
        'uid-156',
        'uid-157',
        'uid-158'
    );

INSERT IGNORE INTO
    avis_motifs (avis_id, motif_id)
SELECT a.id, 7
FROM avis a
WHERE
    a.session_id IN (
        'uid-061',
        'uid-062',
        'uid-067',
        'uid-068',
        'uid-070',
        'uid-071',
        'uid-072',
        'uid-073',
        'uid-074',
        'uid-076',
        'uid-159',
        'uid-160',
        'uid-161',
        'uid-162'
    );

INSERT IGNORE INTO
    avis_motifs (avis_id, motif_id)
SELECT a.id, 9
FROM avis a
WHERE
    a.session_id IN (
        'uid-077',
        'uid-078',
        'uid-079',
        'uid-081',
        'uid-082',
        'uid-130',
        'uid-131',
        'uid-132',
        'uid-133',
        'uid-134',
        'uid-135',
        'uid-163',
        'uid-164',
        'uid-165'
    );

INSERT IGNORE INTO
    avis_motifs (avis_id, motif_id)
SELECT a.id, 10
FROM avis a
WHERE
    a.session_id IN (
        'uid-083',
        'uid-084',
        'uid-086',
        'uid-087',
        'uid-088',
        'uid-089',
        'uid-090',
        'uid-166',
        'uid-167',
        'uid-168',
        'uid-169',
        'uid-170'
    );

INSERT IGNORE INTO
    avis_motifs (avis_id, motif_id)
SELECT a.id, 12
FROM avis a
WHERE
    a.session_id IN (
        'uid-092',
        'uid-093',
        'uid-094',
        'uid-095',
        'uid-096',
        'uid-136',
        'uid-137',
        'uid-138',
        'uid-139',
        'uid-140',
        'uid-141',
        'uid-171',
        'uid-172'
    );

INSERT IGNORE INTO
    avis_motifs (avis_id, motif_id)
SELECT a.id, 13
FROM avis a
WHERE
    a.session_id IN (
        'uid-097',
        'uid-098',
        'uid-099',
        'uid-100',
        'uid-101',
        'uid-173',
        'uid-174',
        'uid-175',
        'uid-176'
    );

INSERT IGNORE INTO
    avis_motifs (avis_id, motif_id)
SELECT a.id, 14
FROM avis a
WHERE
    a.session_id IN (
        'uid-102',
        'uid-103',
        'uid-104',
        'uid-105',
        'uid-106',
        'uid-107',
        'uid-108',
        'uid-109',
        'uid-110',
        'uid-111',
        'uid-112',
        'uid-113',
        'uid-114',
        'uid-115',
        'uid-116',
        'uid-117',
        'uid-118',
        'uid-119',
        'uid-120',
        'uid-177',
        'uid-178',
        'uid-179',
        'uid-180',
        'uid-181',
        'uid-182',
        'uid-183',
        'uid-184',
        'uid-185'
    );