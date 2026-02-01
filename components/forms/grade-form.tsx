'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { createGrade, updateGrade } from '@/lib/actions/grades';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const gradeFormSchema = z.object({
  studentId: z.string().min(1, "L'étudiant est requis"),
  subjectId: z.string().min(1, 'La matière est requise'),
  value: z.number().nonnegative('La note ne peut pas être négative'),
  maxValue: z.number().positive('La note maximale doit être positive'),
  date: z.string().optional(),
}).refine((data) => data.value <= data.maxValue, {
  message: 'La note ne peut pas dépasser la note maximale',
  path: ['value'],
});

type GradeFormData = z.infer<typeof gradeFormSchema>;

interface GradeFormProps {
  initialData?: {
    id: string;
    studentId: string;
    subjectId: string;
    value: number;
    maxValue: number;
    date: Date;
  };
  students: { id: string; nom: string; prenom: string }[];
  subjects: { id: string; name: string; code: string }[];
  mode: 'create' | 'edit';
}

export function GradeForm({ initialData, students, subjects, mode }: GradeFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GradeFormData>({
    resolver: zodResolver(gradeFormSchema),
    defaultValues: initialData
      ? {
          studentId: initialData.studentId,
          subjectId: initialData.subjectId,
          value: initialData.value,
          maxValue: initialData.maxValue,
          date: new Date(initialData.date).toISOString().split('T')[0],
        }
      : { maxValue: 20, date: new Date().toISOString().split('T')[0] },
  });

  const onSubmit = async (data: GradeFormData) => {
    setError('');
    setLoading(true);
    try {
      const payload = {
        studentId: data.studentId,
        subjectId: data.subjectId,
        value: data.value,
        maxValue: data.maxValue,
        date: data.date ? new Date(data.date) : new Date(),
      };

      if (mode === 'create') {
        await createGrade(payload);
        toast.success('Note attribuée avec succès');
        router.push('/grades');
      } else if (initialData) {
        await updateGrade(initialData.id, payload);
        toast.success('Note modifiée avec succès');
        router.push('/grades');
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
        <CardTitle>{mode === 'create' ? 'Nouvelle Note' : 'Modifier la Note'}</CardTitle>
        <CardDescription>
          {mode === 'create' ? 'Attribuer une note à un étudiant' : 'Modifier la note'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentId">Étudiant *</Label>
            <select id="studentId" {...register('studentId')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" disabled={loading || mode === 'edit'}>
              <option value="">Sélectionner un étudiant</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.prenom} {s.nom}</option>)}
            </select>
            {errors.studentId && <p className="text-sm text-red-600">{errors.studentId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subjectId">Matière *</Label>
            <select id="subjectId" {...register('subjectId')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" disabled={loading || mode === 'edit'}>
              <option value="">Sélectionner une matière</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
            {errors.subjectId && <p className="text-sm text-red-600">{errors.subjectId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Note *</Label>
              <Input id="value" type="number" step="0.01" {...register('value', { valueAsNumber: true })} disabled={loading} />
              {errors.value && <p className="text-sm text-red-600">{errors.value.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxValue">Note maximale *</Label>
              <Input id="maxValue" type="number" step="0.01" {...register('maxValue', { valueAsNumber: true })} disabled={loading} />
              {errors.maxValue && <p className="text-sm text-red-600">{errors.maxValue.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register('date')} disabled={loading} />
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? (mode === 'create' ? 'Création...' : 'Enregistrement...') : (mode === 'create' ? 'Attribuer la note' : 'Enregistrer')}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>Annuler</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
