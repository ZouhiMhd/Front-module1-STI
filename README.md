# MedExpert - Plateforme de Validation de Cas Cliniques

MedExpert est une application web moderne permettant aux experts médicaux de valider, réviser et classifier des cas cliniques.

## Procédure Complète : De la Réception à l'Exécution

Suivez ces étapes scrupuleusement pour lancer le projet.

### 1. Prérequis

Assurez-vous d'avoir installé :
*   **Node.js** (v18 ou supérieur)
*   **npm** (v9 ou supérieur)
*   **PostgreSQL** (ou un accès à une base de données Render/Neon)

### 2. Installation

Clonez le projet et installez les dépendances :

```bash
git clone <votre-repo-url>
cd Front-module1-STI
npm install
```


### 3. Configuration de l'Environnement

Créez un fichier **.env.local** à la racine du projet en copiant l'exemple :

```bash
cp .env.example .env.local
```

Remplissez les variables suivantes dans .env.local :

```bash
# URL de connexion à votre base de données PostgreSQL
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Clés secrètes (générez-les avec: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=votre_secret_jwt_ici
BETTER_AUTH_SECRET=votre_secret_auth_ici

# URL de base
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 34. Initialisation de la Base de Données

Poussez le schéma de la base de données vers votre instance PostgreSQL :
```bash
npm run db:push
```

### 5. Génération des Données de Test (Mock Data)

Générez les cas cliniques fictifs. Cette étape crée le fichier **public/data.json**.
Note : Le script respecte la structure stricte et n'inclut pas de champ de classification pré-calculé.

```bash
npm run data:generate
```

### 6. Lancement de l'Application

Lancez le serveur de développement :

```basj
npm run dev

```
Ouvrez votre navigateur sur http://localhost:3000.
