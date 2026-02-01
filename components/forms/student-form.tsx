'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { createStudent, updateStudent } from '@/lib/actions/students';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const studentFormSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  tel: z.string().regex(/^\+?[0-9]{10,15}$/, 'Numéro de téléphone invalide'),
  mail: z.string().email('Email invalide'),
  anneeEntree: z.number().int().min(2000).max(new Date().getFullYear()),
  createUser: z.boolean().optional(),
  password: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentFormSchema>;

interface StudentFormProps {
  initialData?: {
    id: string;
    nom: string;
    prenom: string;
    tel: string;
    mail: string;
    anneeEntree: number;
  };
  mode: 'create' | 'edit';
}

export function StudentForm({ initialData, mode }: StudentFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: initialData
      ? { nom: initialData.nom, prenom: initialData.prenom, tel: initialData.tel, mail: initialData.mail, anneeEntree: initialData.anneeEntree }
      : { anneeEntree: new Date().getFullYear(), createUser: true },
  });

  const createUser = watch('createUser');

  const onSubmit = async (data: StudentFormData) => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'create') {
        await createStudent({
          nom: data.nom, prenom: data.prenom, tel: data.tel, mail: data.mail, anneeEntree: data.anneeEntree,
          createUser: data.createUser, password: data.password,
        });
        toast.success('Étudiant créé avec succès');
        router.push('/students');
      } else if (initialData) {
        await updateStudent(initialData.id, {
          nom: data.nom, prenom: data.prenom, tel: data.tel, mail: data.mail, anneeEntree: data.anneeEntree,
        });
        toast.success('Étudiant modifié avec succès');
        router.push(`/students/${initialData.id}`);
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
        <CardTitle>{mode === 'create' ? 'Nouvel Étudiant' : "Modifier l'Étudiant"}</CardTitle>
        <CardDescription>
          {mode === 'create' ? 'Ajouter un nouvel étudiant' : "Modifier les informations de l'étudiant"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input id="nom" {...register('nom')} placeholder="Martin" disabled={loading} />
              {errors.nom && <p className="text-sm text-red-600">{errors.nom.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom *</Label>
              <Input id="prenom" {...register('prenom')} placeholder="Marie" disabled={loading} />
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
              <Input id="mail" type="email" {...register('mail')} placeholder="marie.martin@email.com" disabled={loading} />
              {errors.mail && <p className="text-sm text-red-600">{errors.mail.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="anneeEntree">Année d&apos;entrée *</Label>
            <Input id="anneeEntree" type="number" {...register('anneeEntree', { valueAsNumber: true })} disabled={loading} />
            {errors.anneeEntree && <p className="text-sm text-red-600">{errors.anneeEntree.message}</p>}
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
              {loading ? (mode === 'create' ? 'Création...' : 'Enregistrement...') : (mode === 'create' ? "Créer l'étudiant" : 'Enregistrer')}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>Annuler</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
