# SGEC - Système de Gestion des Évaluations et Commentaires

Système web d'avis des visiteurs à la **Direction des Bourses et Aides Universitaires (DBAU)**, République du Bénin.

## 📋 Description

Le SGEC est une application web permettant de collecter, centraliser et analyser les avis des visiteurs de la DBAU de manière anonyme, sécurisée et organisée par service. Les usagers accèdent au formulaire via un QR Code affiché dans les locaux.

## 🏛️ Services concernés

- **SAUA** - Service des Affaires Universitaires et Académiques
- **SAF** - Service des Affaires Financières
- **SA** - Service des Archives
- **SIS** - Service de l'Informatique et des Statistiques

## 👥 Acteurs du système

| Acteur | Rôle |
|--------|------|
| **Visiteur** | Usager qui soumet un avis anonyme via QR Code |
| **Administrateur** | Vue globale, gestion des avis, export des rapports |
| **Responsable de service** | Vue restreinte aux avis de son service uniquement |

## 🛠️ Stack technique

- **Frontend** : React + TypeScript + Vite
- **Backend** : Node.js + Express + TypeScript
- **Base de données** : MySQL
- **Authentification** : JWT + bcrypt
- **Librairies** : Recharts (graphiques), QRCode.react, jsPDF (exports)

## 🚀 Installation

### Prérequis

- Node.js (v18 ou supérieur)
- MySQL (v8 ou supérieur)
- Git

### Étapes

```bash
# Cloner le projet
git clone <url-du-repo>
cd DBAU

# Installer les dépendances du frontend
npm install

# Installer les dépendances du backend
cd server
npm install
cd ..

# Configurer la base de données
# Importer le fichier server/src/db/schema.sql dans MySQL

# Lancer le frontend
npm run dev

# Lancer le backend (dans un autre terminal)
cd server
npm run dev

✅ Fonctionnalités
Visiteur (F-01 à F-05)
Accès au formulaire via QR Code, sans authentification

Sélection du motif de visite

Notation sur 6 critères (1 à 5 étoiles)

Commentaire libre anonyme (800 caractères max)

Protection contre la double soumission

Administrateur (F-06 à F-15)
Connexion sécurisée (email + mot de passe hashé)

Tableau de bord avec KPIs globaux

Filtres par période, service, motif, note

Analyse détaillée par service et par critère

Suivi des avis négatifs avec marquage "traité"

Export PDF des rapports

Génération et impression du QR Code

Responsable de service (F-16 à F-17)
Connexion sécurisée avec redirection automatique

Tableau de bord limité à son service

Isolation stricte des données entre services