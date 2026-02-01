'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { collegeSchema, type CollegeInput } from '@/lib/validations/college';
import { createCollege, updateCollege } from '@/lib/actions/colleges';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CollegeFormProps {
  initialData?: {
    id: string;
    name: string;
    websiteUrl?: string | null;
  };
  mode: 'create' | 'edit';
}

export function CollegeForm({ initialData, mode }: CollegeFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CollegeInput>({
    resolver: zodResolver(collegeSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          websiteUrl: initialData.websiteUrl || '',
        }
      : undefined,
  });

  const onSubmit = async (data: CollegeInput) => {
    setError('');
    setLoading(true);

    try {
      if (mode === 'create') {
        await createCollege(data);
        toast.success('Collège créé avec succès');
        router.push('/colleges');
      } else if (initialData) {
        await updateCollege(initialData.id, data);
        toast.success('Collège modifié avec succès');
        router.push(`/colleges/${initialData.id}`);
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
          {mode === 'create' ? 'Nouveau Collège' : 'Modifier le Collège'}
        </CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Créer un nouveau collège dans le système'
            : 'Modifier les informations du collège'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du collège *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="École Supérieure de Technologie"
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Site web (optionnel)</Label>
            <Input
              id="websiteUrl"
              type="url"
              {...register('websiteUrl')}
              placeholder="https://example.com"
              disabled={loading}
            />
            {errors.websiteUrl && (
              <p className="text-sm text-red-600">{errors.websiteUrl.message}</p>
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
                ? 'Créer le collège'
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
