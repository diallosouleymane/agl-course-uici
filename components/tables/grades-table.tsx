'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { deleteGrade } from '@/lib/actions/grades';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Grade {
  id: string;
  value: number;
  maxValue: number;
  date: Date;
  student: { id: string; nom: string; prenom: string };
  subject: { id: string; name: string; code: string };
}

export function GradesTable({ grades }: { grades: Grade[] }) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setError('');
    try {
      await deleteGrade(deleteId);
      setDeleteId(null);
      toast.success('Note supprimée avec succès');
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(msg);
      toast.error(msg);
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
              <TableHead>Étudiant</TableHead>
              <TableHead>Matière</TableHead>
              <TableHead className="text-center">Note</TableHead>
              <TableHead className="text-center">Sur</TableHead>
              <TableHead className="text-center">/20</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">Aucune note trouvée</TableCell>
              </TableRow>
            ) : (
              grades.map((grade) => (
                <TableRow key={grade.id}>
                  <TableCell className="font-medium">
                    <Link href={`/students/${grade.student.id}`} className="hover:underline">
                      {grade.student.prenom} {grade.student.nom}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/subjects/${grade.subject.id}`} className="hover:underline">
                      {grade.subject.name} ({grade.subject.code})
                    </Link>
                  </TableCell>
                  <TableCell className="text-center font-medium">{grade.value}</TableCell>
                  <TableCell className="text-center">{grade.maxValue}</TableCell>
                  <TableCell className="text-center font-medium">
                    {((grade.value / grade.maxValue) * 20).toFixed(1)}
                  </TableCell>
                  <TableCell>{new Date(grade.date).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/grades/${grade.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(grade.id)}>
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
              Êtes-vous sûr de vouloir supprimer cette note ? Cette action est irréversible.
              {error && <p className="text-red-600 mt-2">{error}</p>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
