# Guide d'Installation - Système de Gestion Académique

## Prérequis

- Node.js 20+ et pnpm
- PostgreSQL 14+
- Git

## Étape 1: Cloner et Installer les Dépendances

Les dépendances sont déjà installées dans ce projet:
- React Hook Form + Zod (validation formulaires)
- Recharts (graphiques)
- Mermaid.js (diagrammes UML)
- Date-fns (manipulation dates)
- Better-auth (authentification)
- Prisma (ORM)

## Étape 2: Configuration PostgreSQL

### 2.1 Installation PostgreSQL

**Fedora/RHEL:**
```bash
sudo dnf install postgresql-server postgresql-contrib
sudo postgresql-setup --initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### 2.2 Configuration de l'Authentification

1. Modifier le fichier de configuration PostgreSQL:

**Fedora:** `/var/lib/pgsql/data/pg_hba.conf`

Changer les lignes suivantes de `ident` à `md5`:
```
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

2. Redémarrer PostgreSQL:
```bash
sudo systemctl restart postgresql
```

### 2.3 Créer la Base de Données

1. Se connecter en tant que postgres:
```bash
sudo -u postgres psql
```

2. Créer l'utilisateur et la base de données:
```sql
-- Créer un utilisateur
CREATE USER school_admin WITH ENCRYPTED PASSWORD 'SecurePassword123!';

-- Créer la base de données
CREATE DATABASE school_db OWNER school_admin;

-- Donner tous les privilèges
GRANT ALL PRIVILEGES ON DATABASE school_db TO school_admin;

-- Quitter
\q
```

3. Tester la connexion:
```bash
psql -h localhost -U school_admin -d school_db -W
```

## Étape 3: Configuration du Projet

### 3.1 Mettre à jour le fichier .env

Modifier le fichier `.env` à la racine du projet:

```env
DATABASE_URL=postgresql://school_admin:SecurePassword123!@localhost:5432/school_db
BETTER_AUTH_SECRET=dD9HO9MTfVWn6dxEz2Crlx2fioTmp5NK
BETTER_AUTH_URL=http://localhost:3000
NODE_ENV=development
```

**Important:** Remplacez `SecurePassword123!` par le mot de passe que vous avez choisi.

### 3.2 Exécuter les Migrations

```bash
# Générer le client Prisma (déjà fait normalement)
npx prisma generate

# Créer et appliquer la migration initiale
npx prisma migrate dev --name init
```

Cette commande va:
- Créer les tables dans la base de données
- Appliquer toutes les contraintes et relations
- Générer les types TypeScript

### 3.3 Peupler la Base de Données

```bash
npx prisma db seed
```

Cette commande va créer:
- 1 utilisateur administrateur
- 2 collèges
- 3 départements
- 3 salles de classe
- 3 matières
- 2 enseignants (dont 1 responsable)
- 2 étudiants
- Inscriptions et notes de test

## Étape 4: Vérification

### 4.1 Explorer la Base de Données

```bash
npx prisma studio
```

Cela ouvre une interface web sur http://localhost:5555 pour explorer les données.

### 4.2 Vérifier les Données Créées

Dans Prisma Studio, vérifiez:
- **User**: 5 utilisateurs (1 admin, 2 teachers, 2 students)
- **College**: 2 collèges
- **Department**: 3 départements
- **Classroom**: 3 salles
- **Subject**: 3 matières
- **Teacher**: 2 enseignants
- **Student**: 2 étudiants
- **Enrollment**: 3 inscriptions
- **Grade**: 3 notes

## Étape 5: Lancer l'Application

```bash
pnpm dev
```

L'application sera accessible sur http://localhost:3000

## Comptes de Test

Une fois l'application démarrée, vous pourrez vous connecter avec:

### Administrateur
- Email: admin@school.com
- Mot de passe: admin123
- Rôle: Accès complet au système

### Responsable de Département
- Email: m.martin@school.com
- Mot de passe: teacher123
- Rôle: Gestion du département Informatique

### Enseignant
- Email: j.dupont@school.com
- Mot de passe: teacher123
- Rôle: Enseignant en Algorithmique

### Étudiants
- Email: p.bernard@student.com / Mot de passe: student123
- Email: s.dubois@student.com / Mot de passe: student123

## Dépannage

### Erreur: "Authentication failed"

1. Vérifiez que PostgreSQL est démarré:
```bash
sudo systemctl status postgresql
```

2. Vérifiez que le fichier `pg_hba.conf` est bien configuré en `md5`

3. Testez la connexion manuellement:
```bash
psql -h localhost -U school_admin -d school_db -W
```

### Erreur: "Database does not exist"

Recréez la base de données:
```bash
sudo -u postgres psql
DROP DATABASE IF EXISTS school_db;
CREATE DATABASE school_db OWNER school_admin;
\q
```

Puis relancez les migrations:
```bash
npx prisma migrate dev --name init
```

### Erreur: "Prisma Client not generated"

Régénérez le client:
```bash
npx prisma generate
```

### Réinitialiser Complètement la Base

Si vous voulez repartir de zéro:
```bash
# Supprimer et recréer la base
npx prisma migrate reset

# Cela va:
# 1. Supprimer toutes les données
# 2. Réappliquer toutes les migrations
# 3. Exécuter le seed automatiquement
```

## Prochaines Étapes

Après l'installation, consultez le README.md pour:
- La structure du projet
- L'état d'avancement de l'implémentation
- Les phases restantes à développer

## Support

Pour des problèmes spécifiques:
1. Vérifiez les logs de PostgreSQL: `sudo journalctl -u postgresql -n 50`
2. Vérifiez les logs Prisma dans la console
3. Consultez la documentation Prisma: https://www.prisma.io/docs
