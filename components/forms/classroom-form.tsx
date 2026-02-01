'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { classroomSchema, type ClassroomInput } from '@/lib/validations/classroom';
import { createClassroom, updateClassroom } from '@/lib/actions/classrooms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ClassroomFormProps {
  initialData?: {
    id: string;
    name: string;
    capacity: number;
    location?: string | null;
  };
  mode: 'create' | 'edit';
}

export function ClassroomForm({ initialData, mode }: ClassroomFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClassroomInput>({
    resolver: zodResolver(classroomSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          capacity: initialData.capacity,
          location: initialData.location || '',
        }
      : { capacity: 30 },
  });

  const onSubmit = async (data: ClassroomInput) => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'create') {
        await createClassroom(data);
        toast.success('Salle créée avec succès');
        router.push('/classrooms');
      } else if (initialData) {
        await updateClassroom(initialData.id, data);
        toast.success('Salle modifiée avec succès');
        router.push(`/classrooms/${initialData.id}`);
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
        <CardTitle>{mode === 'create' ? 'Nouvelle Salle' : 'Modifier la Salle'}</CardTitle>
        <CardDescription>
          {mode === 'create' ? 'Créer une nouvelle salle de cours' : 'Modifier les informations de la salle'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la salle *</Label>
            <Input id="name" {...register('name')} placeholder="Salle A101" disabled={loading} />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacité *</Label>
            <Input id="capacity" type="number" {...register('capacity', { valueAsNumber: true })} placeholder="30" disabled={loading} />
            {errors.capacity && <p className="text-sm text-red-600">{errors.capacity.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Emplacement (optionnel)</Label>
            <Input id="location" {...register('location')} placeholder="Bâtiment A, 1er étage" disabled={loading} />
            {errors.location && <p className="text-sm text-red-600">{errors.location.message}</p>}
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? (mode === 'create' ? 'Création...' : 'Enregistrement...') : (mode === 'create' ? 'Créer la salle' : 'Enregistrer les modifications')}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>Annuler</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
