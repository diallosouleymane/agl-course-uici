'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { createTeacher, updateTeacher } from '@/lib/actions/teachers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const teacherFormSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  tel: z.string().regex(/^\+?[0-9]{10,15}$/, 'Numéro de téléphone invalide'),
  mail: z.string().email('Email invalide'),
  dateFunction: z.string().min(1, 'La date de fonction est requise'),
  indice: z.string().min(1, "L'indice est requis"),
  departmentId: z.string().min(1, 'Le département est requis'),
  subjectId: z.string().min(1, 'La matière est requise'),
  createUser: z.boolean().optional(),
  password: z.string().optional(),
});

type TeacherFormData = z.infer<typeof teacherFormSchema>;

interface TeacherFormProps {
  initialData?: {
    id: string;
    nom: string;
    prenom: string;
    tel: string;
    mail: string;
    dateFunction: Date;
    indice: string;
    departmentId: string;
    subjectId: string;
  };
  departments: { id: string; name: string }[];
  subjects: { id: string; name: string; code: string }[];
  mode: 'create' | 'edit';
}

export function TeacherForm({ initialData, departments, subjects, mode }: TeacherFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: initialData
      ? {
          nom: initialData.nom,
          prenom: initialData.prenom,
          tel: initialData.tel,
          mail: initialData.mail,
          dateFunction: new Date(initialData.dateFunction).toISOString().split('T')[0],
          indice: initialData.indice,
          departmentId: initialData.departmentId,
          subjectId: initialData.subjectId,
        }
      : { createUser: true },
  });

  const createUser = watch('createUser');

  const onSubmit = async (data: TeacherFormData) => {
    setError('');
    setLoading(true);
    try {
      const payload = {
        nom: data.nom,
        prenom: data.prenom,
        tel: data.tel,
        mail: data.mail,
        dateFunction: new Date(data.dateFunction),
        indice: data.indice,
        departmentId: data.departmentId,
        subjectId: data.subjectId,
        createUser: data.createUser,
        password: data.password,
      };

      if (mode === 'create') {
        await createTeacher(payload);
        toast.success('Enseignant créé avec succès');
        router.push('/teachers');
      } else if (initialData) {
        await updateTeacher(initialData.id, {
          nom: data.nom,
          prenom: data.prenom,
          tel: data.tel,
          mail: data.mail,
          dateFunction: new Date(data.dateFunction),
          indice: data.indice,
          departmentId: data.departmentId,
          subjectId: data.subjectId,
        });
        toast.success('Enseignant modifié avec succès');
        router.push(`/teachers/${initialData.id}`);
      }
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Nouvel Enseignant' : "Modifier l'Enseignant"}</CardTitle>
        <CardDescription>
          {mode === 'create' ? 'Ajouter un nouvel enseignant' : "Modifier les informations de l'enseignant"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input id="nom" {...register('nom')} placeholder="Dupont" disabled={loading} />
              {errors.nom && <p className="text-sm text-red-600">{errors.nom.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom *</Label>
              <Input id="prenom" {...register('prenom')} placeholder="Jean" disabled={loading} />
              {errors.prenom && <p className="text-sm text-red-600">{errors.prenom.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tel">Téléphone *</Label>
              <Input id="tel" {...register('tel')} placeholder="+33612345678" disabled={loading} />
              {errors.tel && <p className="text-sm text-red-600">{errors.tel.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="mail">Email *</Label>
              <Input id="mail" type="email" {...register('mail')} placeholder="jean.dupont@email.com" disabled={loading} />
              {errors.mail && <p className="text-sm text-red-600">{errors.mail.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFunction">Date de fonction *</Label>
              <Input id="dateFunction" type="date" {...register('dateFunction')} disabled={loading} />
              {errors.dateFunction && <p className="text-sm text-red-600">{errors.dateFunction.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="indice">Indice *</Label>
              <Input id="indice" {...register('indice')} placeholder="A1" disabled={loading} />
              {errors.indice && <p className="text-sm text-red-600">{errors.indice.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departmentId">Département *</Label>
              <select id="departmentId" {...register('departmentId')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" disabled={loading}>
                <option value="">Sélectionner un département</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              {errors.departmentId && <p className="text-sm text-red-600">{errors.departmentId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="subjectId">Matière *</Label>
              <select id="subjectId" {...register('subjectId')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" disabled={loading}>
                <option value="">Sélectionner une matière</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
              </select>
              {errors.subjectId && <p className="text-sm text-red-600">{errors.subjectId.message}</p>}
            </div>
          </div>

          {mode === 'create' && (
            <>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="createUser" {...register('createUser')} className="rounded" />
                <Label htmlFor="createUser">Créer un compte utilisateur</Label>
              </div>
              {createUser && (
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe *</Label>
                  <Input id="password" type="password" {...register('password')} placeholder="Mot de passe" disabled={loading} />
                </div>
              )}
            </>
          )}

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? (mode === 'create' ? 'Création...' : 'Enregistrement...') : (mode === 'create' ? "Créer l'enseignant" : 'Enregistrer')}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>Annuler</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
