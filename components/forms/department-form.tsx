'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { departmentSchema, type DepartmentInput } from '@/lib/validations/department';
import { createDepartment, updateDepartment } from '@/lib/actions/departments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DepartmentFormProps {
  initialData?: {
    id: string;
    name: string;
    collegeId: string;
    headTeacherId?: string | null;
  };
  colleges: Array<{
    id: string;
    name: string;
  }>;
  mode: 'create' | 'edit';
}

export function DepartmentForm({ initialData, colleges, mode }: DepartmentFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DepartmentInput>({
    resolver: zodResolver(departmentSchema),
    defaultValues: initialData ? { ...initialData, headTeacherId: initialData.headTeacherId ?? undefined } : { collegeId: colleges[0]?.id },
  });

  const collegeId = watch('collegeId');

  const onSubmit = async (data: DepartmentInput) => {
    setError('');
    setLoading(true);

    try {
      if (mode === 'create') {
        await createDepartment(data);
        toast.success('Département créé avec succès');
        router.push('/departments');
      } else if (initialData) {
        await updateDepartment(initialData.id, data);
        toast.success('Département modifié avec succès');
        router.push(`/departments/${initialData.id}`);
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
        <CardTitle>
          {mode === 'create' ? 'Nouveau Département' : 'Modifier le Département'}
        </CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Créer un nouveau département dans un collège'
            : 'Modifier les informations du département'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du département *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Informatique"
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="collegeId">Collège *</Label>
            <Select
              value={collegeId}
              onValueChange={(value) => setValue('collegeId', value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un collège" />
              </SelectTrigger>
              <SelectContent>
                {colleges.map((college) => (
                  <SelectItem key={college.id} value={college.id}>
                    {college.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.collegeId && (
              <p className="text-sm text-red-600">{errors.collegeId.message}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading
                ? mode === 'create'
                  ? 'Création...'
                  : 'Enregistrement...'
                : mode === 'create'
                ? 'Créer le département'
                : 'Enregistrer les modifications'}
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
