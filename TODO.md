# TODO - Système de Gestion Académique

## ✅ Complété (Phases 1.1, 1.2, 1.3)

- [x] Schéma Prisma avec 9 modèles
- [x] Relations et contraintes DB
- [x] Fichier de seed avec données test
- [x] Configuration better-auth avec rôles
- [x] Middleware de protection des routes
- [x] Fonctions RBAC (permissions.ts)
- [x] Schémas de validation Zod (7 fichiers)
- [x] Fonctions de calcul de moyennes
- [x] Documentation (README.md + INSTALLATION.md)

## 🔄 Phase 1.4 - Layouts et Authentification

### Pages d'Authentification
- [ ] `app/(auth)/layout.tsx` - Layout pages auth (minimal, sans sidebar)
- [ ] `app/(auth)/login/page.tsx` - Page de connexion avec formulaire
- [ ] `app/(auth)/register/page.tsx` (optionnel) - Inscription
- [ ] `app/unauthorized/page.tsx` - Page d'erreur accès refusé

### Layout Dashboard
- [ ] `app/(dashboard)/layout.tsx` - Layout principal avec sidebar
- [ ] `components/layout/app-sidebar.tsx` - Navigation avec menu basé sur rôle
- [ ] `components/layout/header.tsx` - Header avec info utilisateur et déconnexion
- [ ] `components/layout/user-nav.tsx` - Dropdown menu utilisateur

### API Routes Better-Auth
- [ ] `app/api/auth/[...all]/route.ts` - Routes API better-auth

## 📋 Phase 2.1 - CRUD Colleges

### Server Actions
- [ ] `lib/actions/colleges.ts`:
  - [ ] createCollege(data) avec validation Zod
  - [ ] updateCollege(id, data)
  - [ ] deleteCollege(id) - vérifier qu'il n'a pas de départements
  - [ ] getCollege(id)
  - [ ] listColleges(page, limit)

### Components
- [ ] `components/forms/college-form.tsx` - Formulaire (react-hook-form + Zod)
- [ ] `components/tables/colleges-table.tsx` - Tableau avec tri/filtrage/pagination

### Pages
- [ ] `app/(dashboard)/colleges/page.tsx` - Liste des collèges
- [ ] `app/(dashboard)/colleges/new/page.tsx` - Créer un collège
- [ ] `app/(dashboard)/colleges/[id]/page.tsx` - Détails collège
- [ ] `app/(dashboard)/colleges/[id]/edit/page.tsx` - Modifier collège

## 📋 Phase 2.2 - CRUD Departments

### Server Actions
- [ ] `lib/actions/departments.ts`:
  - [ ] createDepartment(data)
  - [ ] updateDepartment(id, data)
  - [ ] assignHeadTeacher(deptId, teacherId) - vérifier que l'enseignant est du département
  - [ ] deleteDepartment(id)
  - [ ] getDepartment(id)
  - [ ] listDepartments(collegeId?, page, limit)

### Components
- [ ] `components/forms/department-form.tsx`
- [ ] `components/tables/departments-table.tsx`

### Pages
- [ ] `app/(dashboard)/departments/page.tsx`
- [ ] `app/(dashboard)/departments/new/page.tsx`
- [ ] `app/(dashboard)/departments/[id]/page.tsx`
- [ ] `app/(dashboard)/departments/[id]/edit/page.tsx`

## 📋 Phase 2.3 - CRUD Classrooms

### Server Actions
- [ ] `lib/actions/classrooms.ts`:
  - [ ] createClassroom(data) - validation capacity > 0
  - [ ] updateClassroom(id, data)
  - [ ] deleteClassroom(id) - vérifier qu'aucune matière n'utilise cette salle
  - [ ] getClassroom(id)
  - [ ] listClassrooms(page, limit)

### Components
- [ ] `components/forms/classroom-form.tsx`
- [ ] `components/tables/classrooms-table.tsx`

### Pages
- [ ] `app/(dashboard)/classrooms/page.tsx`
- [ ] `app/(dashboard)/classrooms/new/page.tsx`
- [ ] `app/(dashboard)/classrooms/[id]/page.tsx`
- [ ] `app/(dashboard)/classrooms/[id]/edit/page.tsx`

## 📋 Phase 2.4 - CRUD Subjects

### Server Actions
- [ ] `lib/actions/subjects.ts`:
  - [ ] createSubject(data)
  - [ ] updateSubject(id, data)
  - [ ] deleteSubject(id) - vérifier qu'aucun enseignant/note n'est lié
  - [ ] getSubject(id)
  - [ ] listSubjects(departmentId?, page, limit)

### Components
- [ ] `components/forms/subject-form.tsx`
- [ ] `components/tables/subjects-table.tsx`

### Pages
- [ ] `app/(dashboard)/subjects/page.tsx`
- [ ] `app/(dashboard)/subjects/new/page.tsx`
- [ ] `app/(dashboard)/subjects/[id]/page.tsx`
- [ ] `app/(dashboard)/subjects/[id]/edit/page.tsx`

## 📋 Phase 2.5 - CRUD Teachers

### Server Actions
- [ ] `lib/actions/teachers.ts`:
  - [ ] createTeacher(data) - créer User si userId non fourni
  - [ ] updateTeacher(id, data)
  - [ ] deleteTeacher(id) - vérifier qu'il n'est pas responsable de département
  - [ ] getTeacher(id)
  - [ ] listTeachers(departmentId?, page, limit)
  - [ ] linkToUser(teacherId, userId)

### Components
- [ ] `components/forms/teacher-form.tsx` - sélection département + matière
- [ ] `components/tables/teachers-table.tsx`

### Pages
- [ ] `app/(dashboard)/teachers/page.tsx`
- [ ] `app/(dashboard)/teachers/new/page.tsx`
- [ ] `app/(dashboard)/teachers/[id]/page.tsx`
- [ ] `app/(dashboard)/teachers/[id]/edit/page.tsx`
- [ ] `app/(dashboard)/teachers/[id]/card/page.tsx` - Fiche signalétique

## 📋 Phase 2.6 - CRUD Students

### Server Actions
- [ ] `lib/actions/students.ts`:
  - [ ] createStudent(data) - créer User si userId non fourni
  - [ ] updateStudent(id, data)
  - [ ] deleteStudent(id) - supprimer enrollments et grades
  - [ ] getStudent(id)
  - [ ] listStudents(anneeEntree?, page, limit)
  - [ ] enrollStudent(studentId, subjectId) - créer Enrollment
  - [ ] unenrollStudent(studentId, subjectId)
  - [ ] getEnrollments(studentId)

### Components
- [ ] `components/forms/student-form.tsx`
- [ ] `components/forms/enrollment-form.tsx` - inscrire à des matières
- [ ] `components/tables/students-table.tsx`
- [ ] `components/tables/enrollments-table.tsx`

### Pages
- [ ] `app/(dashboard)/students/page.tsx`
- [ ] `app/(dashboard)/students/new/page.tsx`
- [ ] `app/(dashboard)/students/[id]/page.tsx`
- [ ] `app/(dashboard)/students/[id]/edit/page.tsx`
- [ ] `app/(dashboard)/students/[id]/enrollments/page.tsx` - Gérer inscriptions
- [ ] `app/(dashboard)/students/[id]/card/page.tsx` - Fiche signalétique

## 📋 Phase 3 - Gestion des Notes

### Server Actions
- [ ] `lib/actions/grades.ts`:
  - [ ] createGrade(data) - vérifier que l'étudiant est inscrit à la matière
  - [ ] updateGrade(id, data)
  - [ ] deleteGrade(id)
  - [ ] getGrade(id)
  - [ ] listGrades(studentId?, subjectId?, page, limit)
  - [ ] getStudentGrades(studentId) - toutes les notes d'un étudiant
  - [ ] getSubjectGrades(subjectId) - toutes les notes d'une matière

### Components
- [ ] `components/forms/grade-form.tsx` - validation value <= maxValue
- [ ] `components/forms/grade-bulk-form.tsx` - saisie groupée par matière
- [ ] `components/tables/grades-table.tsx`

### Pages
- [ ] `app/(dashboard)/grades/page.tsx` - Interface de saisie groupée
- [ ] `app/(dashboard)/grades/new/page.tsx` - Saisie individuelle
- [ ] `app/(dashboard)/students/[id]/grades/page.tsx` - Notes par étudiant

## 📋 Phase 4.1 - Rapports et Statistiques

### Composants Rapports
- [ ] `components/reports/subject-average-chart.tsx` - Recharts
- [ ] `components/reports/department-average-chart.tsx` - Recharts
- [ ] `components/reports/student-report-card.tsx` - Bulletin de notes
- [ ] `components/reports/missing-grades-list.tsx`
- [ ] `components/cards/stats-card.tsx` - Carte statistique réutilisable

### Pages Rapports
- [ ] `app/(dashboard)/reports/page.tsx` - Dashboard des rapports
- [ ] `app/(dashboard)/reports/subject-averages/page.tsx` - Moyennes par matière
- [ ] `app/(dashboard)/reports/department-averages/page.tsx` - Comparaison départements
- [ ] `app/(dashboard)/reports/student-averages/page.tsx` - Classement étudiants
- [ ] `app/(dashboard)/reports/missing-grades/page.tsx` - Suivi notes manquantes

## 📋 Phase 4.2 - Fiches Signalétiques

### Composants
- [ ] `components/cards/identification-card.tsx` - Composant réutilisable
- [ ] CSS print-friendly avec @media print

### Pages (déjà listées dans Teachers et Students)
- Layout spécial pour impression
- Bouton d'impression
- Export PDF (optionnel avec jspdf)

## 📋 Phase 5 - Diagrammes UML

### Configuration
- [ ] Installer et configurer Mermaid.js (déjà installé)
- [ ] `components/uml/diagram-viewer.tsx` - Composant de rendu

### Pages UML
- [ ] `app/(dashboard)/uml/page.tsx` - Hub des diagrammes
- [ ] `app/(dashboard)/uml/use-cases/page.tsx` - Cas d'utilisation global
- [ ] `app/(dashboard)/uml/use-cases/admin/page.tsx` - Cas spécifiques admin
- [ ] `app/(dashboard)/uml/use-cases/department-head/page.tsx` - Cas spécifiques responsable
- [ ] `app/(dashboard)/uml/sequence/page.tsx` - Diagrammes de séquence (5+)
- [ ] `app/(dashboard)/uml/class/page.tsx` - Diagramme de classes
- [ ] `app/(dashboard)/uml/scenarios/page.tsx` - Scénarios textuels

### Diagrammes à Créer
- [ ] Cas d'utilisation global (2 acteurs principaux)
- [ ] Cas d'utilisation administrateur (détaillé)
- [ ] Cas d'utilisation responsable département (détaillé)
- [ ] Séquence: Connexion utilisateur
- [ ] Séquence: Création enseignant
- [ ] Séquence: Saisie note avec vérifications
- [ ] Séquence: Calcul moyenne département
- [ ] Séquence: Impression fiche signalétique
- [ ] Diagramme de classes complet (9 entités avec attributs et relations)
- [ ] Scénarios textuels pour chaque cas d'utilisation principal

## 📋 Phase 6 - Dashboard Principal

### Composants
- [ ] `components/cards/stats-card.tsx` (réutilisable depuis Phase 4)
- [ ] `components/charts/enrollment-trend.tsx` - Évolution inscriptions
- [ ] `components/dashboard/quick-actions.tsx` - Accès rapides

### Page Dashboard
- [ ] `app/(dashboard)/page.tsx`:
  - [ ] Statistiques clés (6 cartes):
    - Nombre de collèges
    - Nombre de départements
    - Nombre d'enseignants
    - Nombre d'étudiants
    - Nombre de matières
    - Nombre de notes saisies
  - [ ] Graphique: Évolution des inscriptions par année
  - [ ] Dernières activités (optionnel)
  - [ ] Accès rapides basés sur le rôle

## 🎨 Améliorations UI/UX (Optionnel)

- [ ] Mode sombre/clair (toggle)
- [ ] Loading skeletons pour toutes les pages
- [ ] Animations de transition
- [ ] Toast notifications pour feedback utilisateur
- [ ] Confirmation modals pour suppressions
- [ ] Filtres avancés dans les tableaux
- [ ] Export CSV/Excel des données
- [ ] Recherche globale (CMD+K)

## 🔒 Sécurité (Optionnel mais Recommandé)

- [ ] Rate limiting sur les API routes
- [ ] CSRF protection
- [ ] Validation des permissions côté serveur pour toutes les actions
- [ ] Logs d'audit pour actions sensibles
- [ ] Tests de sécurité

## 🧪 Tests (Optionnel)

- [ ] Tests unitaires pour calculations.ts
- [ ] Tests unitaires pour permissions.ts
- [ ] Tests d'intégration pour server actions
- [ ] Tests E2E avec Playwright

## 📊 Performance (Optionnel)

- [ ] Pagination optimisée avec cursor-based
- [ ] Caching avec React Query ou SWR
- [ ] Optimisation des requêtes Prisma (select, include)
- [ ] Lazy loading pour les composants lourds

## 📝 Documentation (Optionnel)

- [ ] Documentation API des server actions
- [ ] Guide de contribution
- [ ] Guide de déploiement (Vercel, Docker, etc.)
- [ ] Storybook pour composants UI

## Ordre d'Implémentation Recommandé

1. **Phase 1.4** - Layouts et authentification (PRIORITÉ)
2. **Phase 2.1-2.4** - CRUD de base (Colleges → Departments → Classrooms → Subjects)
3. **Phase 2.5** - CRUD Teachers
4. **Phase 2.6** - CRUD Students + Enrollments
5. **Phase 3** - Gestion des notes
6. **Phase 4** - Rapports
7. **Phase 6** - Dashboard principal
8. **Phase 5** - Diagrammes UML (peut être fait en parallèle)

## Notes Importantes

- Toujours tester les permissions RBAC pour chaque action
- Valider côté client (Zod) ET côté serveur
- Utiliser revalidatePath après les mutations
- Gérer les erreurs avec des messages clairs
- Respecter les règles de gestion métier
