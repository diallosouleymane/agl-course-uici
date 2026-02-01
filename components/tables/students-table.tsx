'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { deleteStudent } from '@/lib/actions/students';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Student {
  id: string;
  nom: string;
  prenom: string;
  mail: string;
  tel: string;
  anneeEntree: number;
  _count?: { enrollments: number; grades: number };
}

export function StudentsTable({ students }: { students: Student[] }) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setError('');
    try {
      await deleteStudent(deleteId);
      setDeleteId(null);
      toast.success('Étudiant supprimé avec succès');
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
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead className="text-center">Année</TableHead>
              <TableHead className="text-center">Inscriptions</TableHead>
              <TableHead className="text-center">Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">Aucun étudiant trouvé</TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.prenom} {student.nom}</TableCell>
                  <TableCell>{student.mail}</TableCell>
                  <TableCell>{student.tel}</TableCell>
                  <TableCell className="text-center">{student.anneeEntree}</TableCell>
                  <TableCell className="text-center">{student._count?.enrollments || 0}</TableCell>
                  <TableCell className="text-center">{student._count?.grades || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild><Link href={`/students/${student.id}`}><Eye className="h-4 w-4" /></Link></Button>
                      <Button variant="ghost" size="sm" asChild><Link href={`/students/${student.id}/edit`}><Pencil className="h-4 w-4" /></Link></Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(student.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
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
              Êtes-vous sûr de vouloir supprimer cet étudiant ? Cette action est irréversible.
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
