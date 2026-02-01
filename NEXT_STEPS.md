# Prochaines Étapes - Guide Pratique

## 🎯 Que Faire Maintenant?

### Option A: Tester l'Application (30 min)

1. **Configurer PostgreSQL** (suivre INSTALLATION.md)
2. **Lancer l'app**:
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   pnpm dev
   ```
3. **Tester**:
   - Se connecter en admin
   - Créer un nouveau collège
   - Créer un département
   - Voir le dashboard
   - Explorer les diagrammes UML

### Option B: Compléter l'Interface (1-2 jours)

Créer les pages manquantes en suivant ce guide.

---

## 📝 Template Rapide pour Nouvelle Entité

### 1. Créer le Formulaire (components/forms/entity-form.tsx)

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { entitySchema, type EntityInput } from '@/lib/validations/entity';
import { createEntity, updateEntity } from '@/lib/actions/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface EntityFormProps {
  initialData?: any;
  mode: 'create' | 'edit';
}

export function EntityForm({ initialData, mode }: EntityFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EntityInput>({
    resolver: zodResolver(entitySchema),
    defaultValues: initialData || {},
  });

  const onSubmit = async (data: EntityInput) => {
    setError('');
    setLoading(true);

    try {
      if (mode === 'create') {
        await createEntity(data);
        router.push('/entities');
      } else if (initialData) {
        await updateEntity(initialData.id, data);
        router.push(`/entities/${initialData.id}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Nouveau' : 'Modifier'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Vos champs ici */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              {...register('name')}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

### 2. Créer le Tableau (components/tables/entities-table.tsx)

```typescript
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { deleteEntity } from '@/lib/actions/entities';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Eye, Pencil, Trash2 } from 'lucide-react';

interface EntitiesTableProps {
  entities: any[];
}

export function EntitiesTable({ entities }: EntitiesTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    setError('');

    try {
      await deleteEntity(deleteId);
      setDeleteId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              {/* Autres colonnes */}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                  Aucun élément trouvé
                </TableCell>
              </TableRow>
            ) : (
              entities.map((entity) => (
                <TableRow key={entity.id}>
                  <TableCell className="font-medium">{entity.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/entities/${entity.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/entities/${entity.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(entity.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr? Cette action est irréversible.
              {error && <p className="text-red-600 mt-2">{error}</p>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

### 3. Créer la Page Liste

```typescript
// app/(dashboard)/entities/page.tsx
import Link from 'next/link';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { redirect } from 'next/navigation';
import { listEntities } from '@/lib/actions/entities';
import { EntitiesTable } from '@/components/tables/entities-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function EntitiesPage() {
  const { authorized } = await requireRole([UserRole.ADMIN]);

  if (!authorized) {
    redirect('/unauthorized');
  }

  const { entities } = await listEntities();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Entities</h1>
          <p className="text-gray-600 mt-2">
            Description
          </p>
        </div>
        <Button asChild>
          <Link href="/entities/new">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau
          </Link>
        </Button>
      </div>

      <EntitiesTable entities={entities} />
    </div>
  );
}
```

### 4. Créer la Page New

```typescript
// app/(dashboard)/entities/new/page.tsx
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { redirect } from 'next/navigation';
import { EntityForm } from '@/components/forms/entity-form';

export default async function NewEntityPage() {
  const { authorized } = await requireRole([UserRole.ADMIN]);

  if (!authorized) {
    redirect('/unauthorized');
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nouveau</h1>
        <p className="text-gray-600 mt-2">
          Créer un nouvel élément
        </p>
      </div>

      <EntityForm mode="create" />
    </div>
  );
}
```

### 5. Créer la Page [id]

```typescript
// app/(dashboard)/entities/[id]/page.tsx
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { getEntity } from '@/lib/actions/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil } from 'lucide-react';

interface EntityPageProps {
  params: Promise<{ id: string }>;
}

export default async function EntityPage({ params }: EntityPageProps) {
  const { authorized } = await requireRole([UserRole.ADMIN]);

  if (!authorized) {
    redirect('/unauthorized');
  }

  const { id } = await params;
  const entity = await getEntity(id);

  if (!entity) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{entity.name}</h1>
          <p className="text-gray-600 mt-2">Détails</p>
        </div>
        <Button asChild>
          <Link href={`/entities/${id}/edit`}>
            <Pencil className="h-4 w-4 mr-2" />
            Modifier
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Nom</p>
            <p className="font-medium">{entity.name}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 6. Créer la Page [id]/edit

```typescript
// app/(dashboard)/entities/[id]/edit/page.tsx
import { notFound, redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { getEntity } from '@/lib/actions/entities';
import { EntityForm } from '@/components/forms/entity-form';

interface EditEntityPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEntityPage({ params }: EditEntityPageProps) {
  const { authorized } = await requireRole([UserRole.ADMIN]);

  if (!authorized) {
    redirect('/unauthorized');
  }

  const { id } = await params;
  const entity = await getEntity(id);

  if (!entity) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Modifier</h1>
        <p className="text-gray-600 mt-2">
          Modifier {entity.name}
        </p>
      </div>

      <EntityForm mode="edit" initialData={entity} />
    </div>
  );
}
```

---

## ⚡ Ordre Recommandé d'Implémentation

### 1. Classrooms (Simple - 1h)

- ✅ Server action déjà créé
- Copier colleges
- 3 champs: name, capacity, location

### 2. Subjects (Moyen - 2h)

- ✅ Server action déjà créé
- Ajouter Select pour classroom + department
- 4 champs: name, code, classroomId, departmentId

### 3. Teachers (Complexe - 3h)

- ✅ Server action déjà créé
- Formulaire avec checkbox "Créer compte utilisateur"
- Si checked, afficher champ password
- 8 champs + user optionnel

### 4. Students (Complexe - 3h)

- ✅ Server action déjà créé
- Même structure que teachers
- Page supplémentaire pour enrollments

### 5. Grades (Complexe - 2h)

- ✅ Server action déjà créé
- Sélectionner étudiant → charger ses matières
- Validation value <= maxValue

---

## 🎨 Composants Shadcn Déjà Disponibles

- ✅ Button
- ✅ Input
- ✅ Label
- ✅ Card
- ✅ Select
- ✅ Table
- ✅ AlertDialog
- ✅ DropdownMenu
- ✅ Badge
- ✅ Separator
- ✅ Textarea

Si besoin d'autres:
```bash
npx shadcn@latest add <component-name>
```

---

## ✅ Checklist par Entité

### Pour Classrooms

- [ ] Copier college-form.tsx → classroom-form.tsx
- [ ] Adapter les champs (name, capacity: number, location)
- [ ] Copier college-table.tsx → classroom-table.tsx
- [ ] Adapter les colonnes
- [ ] Copier les 4 pages de colleges/ → classrooms/
- [ ] Tester: créer, modifier, supprimer

### Pour Subjects

- [ ] Créer subject-form.tsx avec Select (classroom + department)
- [ ] Créer subject-table.tsx
- [ ] Créer les 4 pages
- [ ] Tester

### Pour Teachers

- [ ] Créer teacher-form.tsx avec création user optionnelle
- [ ] Ajouter sélection department + subject (1 seul!)
- [ ] Créer teacher-table.tsx
- [ ] Créer les 4 pages + page fiche signalétique
- [ ] Tester

### Pour Students

- [ ] Créer student-form.tsx avec création user optionnelle
- [ ] Créer student-table.tsx
- [ ] Créer les 5 pages (+ enrollments + grades)
- [ ] Créer page fiche signalétique
- [ ] Tester

### Pour Grades

- [ ] Créer grade-form.tsx avec validation
- [ ] Créer grade-table.tsx
- [ ] Créer les 2 pages
- [ ] Tester vérification enrollment

---

## 🚀 Raccourcis

### Commandes Prisma Studio

Pour manipuler directement la DB pendant le développement:

```bash
npx prisma studio
```

Ouvre http://localhost:5555

### Hot Reload

L'app Next.js recharge automatiquement.
Si problème: Ctrl+C et relancer `pnpm dev`

### Vérifier les Erreurs

```bash
# Type check
npx tsc --noEmit

# Lint
pnpm lint
```

---

## 📚 Documentation Utile

- **shadcn/ui**: https://ui.shadcn.com/
- **React Hook Form**: https://react-hook-form.com/
- **Zod**: https://zod.dev/
- **Prisma**: https://www.prisma.io/docs
- **Better Auth**: https://www.better-auth.com/docs

---

Bon courage! Le plus dur est fait, il ne reste "que" l'interface! 🎉
