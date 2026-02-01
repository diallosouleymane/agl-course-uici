# Notes Architecturales - Système de Gestion Académique

## Protection des Routes (Next.js 16)

### ❌ Ancienne Approche (middleware.ts)

Dans les versions précédentes de Next.js, on utilisait un fichier `middleware.ts` global pour intercepter toutes les requêtes et vérifier l'authentification:

```typescript
// ❌ NE PLUS UTILISER
export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.redirect('/login');
  }
}
```

**Problèmes:**
- Exécuté sur toutes les routes (overhead)
- Difficile à maintenir pour des règles complexes
- Limitations avec les edge functions

### ✅ Nouvelle Approche (Server-Side Protection)

**Next.js 16 recommande la vérification de session côté serveur dans les layouts:**

```typescript
// app/(dashboard)/layout.tsx
export default async function DashboardLayout({ children }) {
  const session = await getSession(); // Vérification côté serveur

  if (!session) {
    redirect('/login'); // Redirection si non authentifié
  }

  return <div>{children}</div>;
}
```

**Avantages:**
- Protection au niveau du layout (plus granulaire)
- Pas d'overhead sur les routes publiques
- Meilleure performance
- Code plus clair et maintenable

## Structure de l'Authentification

### Fichiers Clés

1. **`lib/auth.ts`** - Configuration better-auth
   - Setup du client better-auth
   - Configuration email/password
   - Gestion des sessions (7 jours)

2. **`lib/auth-client.ts`** - Client auth pour composants client
   - Export du client pour usage dans 'use client'
   - Méthodes: signIn, signOut, etc.

3. **`lib/auth-utils.ts`** - Utilitaires serveur
   - `getSession()` - Récupérer la session actuelle
   - `requireAuth()` - Requiert authentification
   - `requireRole(roles)` - Requiert un rôle spécifique

4. **`app/api/auth/[...all]/route.ts`** - Routes API
   - Handler better-auth pour Next.js
   - Gère: login, logout, refresh, etc.

### Flux d'Authentification

```
1. Utilisateur accède à / (app/page.tsx)
   ↓
2. getSession() vérifie la session
   ↓
3a. Session existe → redirect('/dashboard')
3b. Pas de session → redirect('/login')
   ↓
4. Page de login (app/(auth)/login/page.tsx)
   ↓
5. Soumission formulaire → authClient.signIn.email()
   ↓
6. API route (/api/auth/...) traite la requête
   ↓
7. Session créée → redirect vers dashboard
   ↓
8. Dashboard layout vérifie la session
   ↓
9. Affiche le contenu avec sidebar/header
```

### Protection par Rôle

Pour protéger une page selon le rôle:

```typescript
// app/(dashboard)/colleges/page.tsx
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { redirect } from 'next/navigation';

export default async function CollegesPage() {
  const { authorized } = await requireRole([UserRole.ADMIN]);

  if (!authorized) {
    redirect('/unauthorized');
  }

  // Reste du code...
}
```

## Structure des Layouts

### Layout Hierarchy

```
app/layout.tsx (Root)
├── app/(auth)/layout.tsx (Auth pages - redirect si déjà connecté)
│   └── app/(auth)/login/page.tsx
│
└── app/(dashboard)/layout.tsx (Protected - redirect si non connecté)
    ├── app/(dashboard)/dashboard/page.tsx
    ├── app/(dashboard)/colleges/...
    ├── app/(dashboard)/departments/...
    └── etc.
```

### Route Groups

Les parenthèses `(auth)` et `(dashboard)` sont des **route groups** de Next.js:
- Ne font pas partie de l'URL
- Permettent d'organiser les layouts
- `(auth)` → URLs: `/login`, `/register`
- `(dashboard)` → URLs: `/dashboard`, `/colleges`, etc.

## Composants Client vs Server

### Server Components (par défaut)

```typescript
// Peut utiliser getSession() directement
export default async function Page() {
  const session = await getSession();
  return <div>{session.user.name}</div>;
}
```

**Utiliser pour:**
- Layouts
- Pages avec données serveur
- Protection de routes

### Client Components ('use client')

```typescript
'use client';
// Doit utiliser authClient
import { authClient } from '@/lib/auth-client';

export default function LoginForm() {
  const handleSubmit = async () => {
    await authClient.signIn.email({ email, password });
  };
}
```

**Utiliser pour:**
- Formulaires interactifs
- Gestion d'état local
- Event handlers
- Composants avec hooks

## Menu de Navigation Dynamique

Le sidebar affiche des liens selon le rôle:

```typescript
// components/layout/app-sidebar.tsx
const navigationItems = [
  { title: 'Dashboard', href: '/dashboard', roles: ['ADMIN', 'DEPARTMENT_HEAD', 'TEACHER', 'STUDENT'] },
  { title: 'Collèges', href: '/colleges', roles: ['ADMIN'] }, // Admin seulement
  { title: 'Départements', href: '/departments', roles: ['ADMIN', 'DEPARTMENT_HEAD'] },
  // etc.
];

const filteredNav = navigationItems.filter(item =>
  item.roles.includes(userRole)
);
```

## Permissions RBAC

### Niveaux de Permission

1. **ADMIN** - Accès complet
   - Gérer collèges, départements, salles, matières
   - Gérer enseignants, étudiants, notes
   - Voir tous les rapports

2. **DEPARTMENT_HEAD** - Gestion département
   - Gérer son département
   - Gérer enseignants de son département
   - Gérer matières de son département
   - Saisir/modifier notes de son département
   - Voir rapports de son département

3. **TEACHER** - Consultation (à implémenter)
   - Voir ses matières
   - Voir ses étudiants
   - Saisir notes pour ses matières (optionnel)

4. **STUDENT** - Consultation (à implémenter)
   - Voir ses notes
   - Voir son bulletin
   - Voir ses matières

### Vérification des Permissions

```typescript
// Dans un server action
import { canManageColleges } from '@/lib/utils/permissions';
import { getSession } from '@/lib/auth-utils';

export async function deleteCollege(id: string) {
  const session = await getSession();

  if (!canManageColleges({ id: session.user.id, role: session.user.role })) {
    throw new Error('Non autorisé');
  }

  // Logique de suppression...
}
```

## Bonnes Pratiques

### ✅ À Faire

1. **Toujours vérifier les permissions côté serveur** (jamais seulement côté client)
2. **Utiliser getSession() dans les server components** pour obtenir la session
3. **Utiliser authClient dans les 'use client'** pour les actions utilisateur
4. **Protéger chaque layout de route group** avec vérification de session
5. **Valider les rôles dans les server actions** avant toute mutation

### ❌ À Éviter

1. **Ne pas se fier uniquement au menu caché** - toujours vérifier côté serveur
2. **Ne pas utiliser getSession() dans un client component** - utiliser authClient
3. **Ne pas créer de middleware global** - utiliser les layouts
4. **Ne pas stocker de données sensibles** dans le localStorage/cookies côté client

## Debugging

### Vérifier la Session

```typescript
// Dans un server component
const session = await getSession();
console.log('Session:', session);
```

### Logs Better-Auth

Les requêtes d'authentification passent par `/api/auth/*`:
- Vérifier la console réseau (Network tab)
- Regarder les cookies (Session tokens)
- Vérifier les headers de requête

### Problèmes Courants

1. **"Session is null" après login**
   - Vérifier que les cookies sont activés
   - Vérifier BETTER_AUTH_URL dans .env
   - Vérifier que la base de données est accessible

2. **Redirect loop**
   - Vérifier que l'(auth) layout redirige si session existe
   - Vérifier que le (dashboard) layout redirige si pas de session

3. **"Unauthorized" alors que l'utilisateur est admin**
   - Vérifier que le rôle est bien stocké dans la session
   - Vérifier la fonction de permission utilisée

## Prochaines Améliorations

- [ ] Ajouter refresh token automatique
- [ ] Implémenter "Remember me"
- [ ] Ajouter 2FA (optionnel)
- [ ] Logger les tentatives de connexion échouées
- [ ] Rate limiting sur les endpoints auth
- [ ] Session persistence avec Redis (production)
