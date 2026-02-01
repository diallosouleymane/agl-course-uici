# Système de Gestion Académique

Application web de gestion académique pour gérer les cours dispensés dans plusieurs collèges.

## Stack Technique

- **Frontend:** Next.js 16 + React 19
- **UI:** shadcn/ui + Tailwind CSS v4
- **Backend:** Next.js Server Actions + API Routes
- **Base de données:** PostgreSQL + Prisma ORM
- **Authentification:** better-auth (email/password)
- **Validation:** Zod
- **Graphiques:** Recharts
- **Diagrammes UML:** Mermaid.js

## Rôles Utilisateurs

- **ADMIN**: Gestion globale (collèges, départements, enseignants, étudiants, notes)
- **DEPARTMENT_HEAD**: Gestion de son département et des enseignants
- **TEACHER**: Consultation (à implémenter)
- **STUDENT**: Consultation de ses notes (à implémenter)

## État d'Implémentation

### ✅ Phase 1.1 - Schéma Prisma (Complété)

Le schéma de base de données est créé avec 9 modèles:
- User (avec rôles)
- College
- Department
- Teacher
- Student
- Subject
- Classroom
- Enrollment
- Grade

### ⏳ Phase 1.2 - Migration Base de Données (En attente)

**Action requise:** Vous devez configurer PostgreSQL avant de continuer.

1. **Installer PostgreSQL** (si ce n'est pas déjà fait):
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib

   # Fedora
   sudo dnf install postgresql-server postgresql-contrib
   sudo postgresql-setup --initdb
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

2. **Créer la base de données**:
   ```bash
   sudo -u postgres psql
   ```

   Dans le shell PostgreSQL:
   ```sql
   CREATE DATABASE school_db;
   CREATE USER your_username WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE school_db TO your_username;
   \q
   ```

3. **Mettre à jour le fichier .env**:
   ```env
   DATABASE_URL=postgresql://your_username:your_password@localhost:5432/school_db
   ```

4. **Exécuter les migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Peupler la base avec des données de test**:
   ```bash
   npx prisma db seed
   ```

### ✅ Phase 1.3 - Authentification (Complété)

- Configuration better-auth avec rôles
- Protection des routes côté serveur (lib/auth-utils.ts)
- Fonctions de permissions RBAC (lib/utils/permissions.ts)
- Schémas de validation Zod pour toutes les entités
- Fonctions de calcul de moyennes (lib/utils/calculations.ts)

### ✅ Phase 1.4 - Layouts et UI (Complété)

- ✅ API route better-auth (app/api/auth/[...all]/route.ts)
- ✅ Fonctions utilitaires auth (lib/auth-utils.ts)
- ✅ Page de connexion (app/(auth)/login/page.tsx)
- ✅ Page unauthorized (app/unauthorized/page.tsx)
- ✅ Layout dashboard avec sidebar (app/(dashboard)/layout.tsx)
- ✅ Navigation basée sur les rôles (components/layout/app-sidebar.tsx)
- ✅ Header avec menu utilisateur (components/layout/header.tsx)
- ✅ Page dashboard de base (app/(dashboard)/dashboard/page.tsx)

### 📋 Phase 2 - CRUD des Entités (À faire)

Implémenter pour chaque entité:
- Server Actions (lib/actions/)
- Composants formulaires (components/forms/)
- Composants tableaux (components/tables/)
- Pages (app/(dashboard)/[entity]/)

Ordre d'implémentation:
1. Colleges → Departments → Classrooms → Subjects
2. Teachers
3. Students + Enrollments
4. Grades

### 📋 Phase 3 - Gestion des Notes (À faire)

- Interface de saisie de notes
- Validation (étudiant inscrit à la matière)
- Vue des notes par étudiant

### 📋 Phase 4 - Rapports et Calculs (À faire)

- Dashboard des rapports
- Moyennes par matière
- Moyennes par département
- Bulletins de notes
- Fiches signalétiques imprimables

### 📋 Phase 5 - Diagrammes UML (À faire)

- Diagrammes de cas d'utilisation
- Diagrammes de séquence
- Diagramme de classes
- Scénarios textuels

### 📋 Phase 6 - Dashboard Principal (À faire)

- Statistiques clés
- Graphiques
- Accès rapides

## Règles de Gestion

1. ✅ Un enseignant enseigne **UNE seule matière** (contrainte DB)
2. ✅ Une matière se déroule toujours dans la **même salle** (relation classroomId)
3. ⚠️ Le responsable de département doit être un enseignant du département (validation en cours)
4. ✅ Un étudiant suit plusieurs matières (table Enrollment)
5. ✅ Note: value ≤ maxValue (validation Zod + DB)
6. ✅ Année d'entrée ≤ année courante (validation Zod)
7. ✅ Capacité salle > 0 (validation Zod)

## Commandes Utiles

```bash
# Développement
pnpm dev

# Prisma
npx prisma studio           # Explorer la base de données
npx prisma generate         # Générer le client Prisma
npx prisma migrate dev      # Créer et appliquer migrations
npx prisma db seed          # Peupler la base
npx prisma migrate reset    # Réinitialiser la base

# Build
pnpm build
pnpm start
```

## Comptes de Test (après seed)

- **Admin**: admin@school.com / admin123
- **Enseignant/Responsable**: m.martin@school.com / teacher123
- **Enseignant**: j.dupont@school.com / teacher123
- **Étudiant**: p.bernard@student.com / student123
- **Étudiant**: s.dubois@student.com / student123

## Structure du Projet

```
agl-prof-app/
├── app/
│   ├── (auth)/              # Pages d'authentification
│   ├── (dashboard)/         # Pages principales
│   └── api/                 # API routes
├── components/
│   ├── forms/               # Composants formulaires
│   ├── tables/              # Composants tableaux
│   ├── layout/              # Layout components
│   ├── cards/               # Cartes statistiques
│   ├── reports/             # Composants rapports
│   └── uml/                 # Composants diagrammes
├── lib/
│   ├── actions/             # Server Actions
│   ├── validations/         # Schémas Zod ✅
│   ├── utils/               # Utilitaires
│   │   ├── calculations.ts  # Calculs moyennes ✅
│   │   └── permissions.ts   # RBAC ✅
│   ├── auth.ts              # Config better-auth ✅
│   └── prisma.ts            # Client Prisma ✅
├── prisma/
│   ├── schema.prisma        # Schéma DB ✅
│   └── seed.ts              # Données test ✅
└── .env                     # Variables environnement
```

## Prochaines Étapes

1. **Configurer PostgreSQL** (voir instructions INSTALLATION.md)
2. **Exécuter migrations et seed**
3. **Tester l'application** (pnpm dev)
4. **Créer les Server Actions et CRUD** (Phase 2 - voir TODO.md)
5. **Implémenter la gestion des notes** (Phase 3)
6. **Créer les rapports et dashboards** (Phases 4-6)
7. **Ajouter les diagrammes UML** (Phase 5)

## Support

Pour toute question ou problème, référez-vous au plan d'implémentation complet dans le fichier de projet.
