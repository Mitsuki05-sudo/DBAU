# DBAU
Système d'avis des visiteurs à la DBAU
1. Présentation du système:
La Direction des Bourse et d'Aides Universitaires (DBAU) accueille quotidiennement des étudiants et des usagers pour diverses démarches administratives : dossiers de bourse, attestations, réclamations, virements et renseignements. Afin d'améliorer la qualité du service rendu et d'identifier les points d'insatisfaction, il est nécessaire de disposer d'un outil de collecte et d'analyse des avis visiteurs.

1.1 Objectifs
•Recueillir des retours anonymes et structurés de chaque visiteur
•Analyser la satisfaction par service, par motif de visite et par critère
•Fournir à la direction un tableau de bord clair et exportable
•Détecter rapidement les sources d'insatisfaction pour y remédier

1.2 Architecture du Système
Le système est organisé en deux espaces distincts et complémentaires :

 # ESPACE VISITEUR (Public)	  
Accès via QR Code — aucune authentification requise.
Permets à chaque visiteur de noter son expérience en 3 étapes simples.

# ESPACE ADMINISTRATEUR (Privé)
Accès sécurisé par email + mot de passe.
Offre à l'administrateur un tableau de bord complet avec filtres et export PDF.

1.3 Référentiel des Services
Les motifs de visite sont automatiquement reliés à l'un des quatre services de la DBAU, selon la correspondance suivante :

# Sigle||	                             Nom complet du service	                        
  SAUA	                   Service des Allocations d'Études Universitaires et des Archives
  SAF                      Service Administratif et Financier
  SA                       Sécrétariat Administratif
  SIS                      Service Informatique et des Statistiques
  ---                      Sans service rattaché

2. Espace Visiteur — Parcours de Saisie
Accès : QR Code affiché dans les locaux de la DBAU (sortie, hall, guichets).
Anonymat total garanti — aucune donnée personnelle collectée.

Étape 1 — Sélection du ou des Motif(s) de Visite
Le visiteur choisit le ou les raisons de sa venue parmi une liste de cases à cocher (choix multiples autorisés). Chaque motif est automatiquement associé à un service en base de données, de façon transparente pour l'usager.

# Motif affiché au visiteur                                           Service associé
Déposer un dossier de bourse                                               SAUA 
Retirer une attestation                                                    SAUA
Réclamation / problème de paiement                                         SAUA
Faire un recours                                                           SAUA 
Consulter des archives                                                     SAUA
Changement de situation                                                    SAUA
Vérifier un virement                                                       SAF
Problème compte bancaire                                                   SAF
Attestation de paiement                                                    SAF
Déposer une facture / frais                                                SAF
Déposer un courrier                                                        SA
Prendre un rendez-vous                                                     SA
Récupérer un document signé                                                SA
Problème plateforme en ligne                                               SIS
Correction données personnelles                                            SIS
Accès / mot de passe                                                       SIS
Simple renseignement (pas de service précis)                               Aucun service

Étape 2 — Notation par Étoiles
Le visiteur évalue son expérience selon 6 critères distincts, chacun noté de 1 à 5 étoiles. Cette granularité permet d'identifier précisément les points forts et les axes d'amélioration de chaque service.

# N°                   Critère d'évaluation                          Echelle
1                      Accueil et prise en charge                    ★ ★ ★ ★ ★  (1 à 5)
2                      Temps d'attente                               ★ ★ ★ ★ ★  (1 à 5)
3                      Amabilité du personnel                        ★ ★ ★ ★ ★  (1 à 5)
4                      Clarté des informations reçues                ★ ★ ★ ★ ★  (1 à 5)
5                      Propreté des lieux                            ★ ★ ★ ★ ★  (1 à 5)
6                      Satisfaction globale                          ★ ★ ★ ★ ★  (1 à 5)

Étape 3 — Commentaire Libre
Un champ de texte libre permet au visiteur de partager un détail ou une suggestion. Ce champ est entièrement facultatif et anonyme.

Libellé affiché : "Un détail à partager ? (facultatif, anonyme)"

Ce commentaire sera consultable dans l'espace administrateur, associé au service et motif correspondants.

Validation & Message de Confirmation
Après avoir rempli les étapes 1 et 2 (l'étape 3 étant facultative), le visiteur soumet son avis via le bouton :

# ✔  ENVOYER MON AVIS

Message affiché après envoi :
"Merci ! Votre avis a bien été enregistré et nous aide à améliorer la DBAU."

Règles de Sécurité & Confidentialité — Espace Visiteur
✔	Aucune authentification requise pour accéder au formulaire.
✔	Aucune donnée personnelle collectée (nom, email, téléphone, adresse IP affichée à l'utilisateur).
✔	Anonymat garanti et affiché clairement sur le formulaire.
✔	Un avis par session — limitation technique des soumissions abusives.
✔	Accès uniquement via le QR Code officiel affiché dans les locaux.



