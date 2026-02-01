'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { subjectSchema, type SubjectInput } from '@/lib/validations/subject';
import { createSubject, updateSubject } from '@/lib/actions/subjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SubjectFormProps {
  initialData?: {
    id: string;
    name: string;
    code: string;
    classroomId: string;
    departmentId: string;
  };
  classrooms: { id: string; name: string; capacity: number }[];
  departments: { id: string; name: string }[];
  mode: 'create' | 'edit';
}

export function SubjectForm({ initialData, classrooms, departments, mode }: SubjectFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubjectInput>({
    resolver: zodResolver(subjectSchema),
    defaultValues: initialData
      ? { name: initialData.name, code: initialData.code, classroomId: initialData.classroomId, departmentId: initialData.departmentId }
      : undefined,
  });

  const onSubmit = async (data: SubjectInput) => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'create') {
        await createSubject(data);
        toast.success('Matière créée avec succès');
        router.push('/subjects');
      } else if (initialData) {
        await updateSubject(initialData.id, data);
        toast.success('Matière modifiée avec succès');
        router.push(`/subjects/${initialData.id}`);
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
        <CardTitle>{mode === 'create' ? 'Nouvelle Matière' : 'Modifier la Matière'}</CardTitle>
        <CardDescription>
          {mode === 'create' ? 'Créer une nouvelle matière' : 'Modifier les informations de la matière'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la matière *</Label>
            <Input id="name" {...register('name')} placeholder="Mathématiques" disabled={loading} />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Code *</Label>
            <Input id="code" {...register('code')} placeholder="MATH-101" disabled={loading} />
            {errors.code && <p className="text-sm text-red-600">{errors.code.message}</p>}
            <p className="text-xs text-gray-500">Majuscules, chiffres et tirets uniquement</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="departmentId">Département *</Label>
            <select id="departmentId" {...register('departmentId')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" disabled={loading}>
              <option value="">Sélectionner un département</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            {errors.departmentId && <p className="text-sm text-red-600">{errors.departmentId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="classroomId">Salle de cours *</Label>
            <select id="classroomId" {...register('classroomId')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" disabled={loading}>
              <option value="">Sélectionner une salle</option>
              {classrooms.map((room) => (
                <option key={room.id} value={room.id}>{room.name} (capacité: {room.capacity})</option>
              ))}
            </select>
            {errors.classroomId && <p className="text-sm text-red-600">{errors.classroomId.message}</p>}
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? (mode === 'create' ? 'Création...' : 'Enregistrement...') : (mode === 'create' ? 'Créer la matière' : 'Enregistrer les modifications')}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>Annuler</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
