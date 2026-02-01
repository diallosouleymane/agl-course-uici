'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { deleteTeacher } from '@/lib/actions/teachers';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Teacher {
  id: string;
  nom: string;
  prenom: string;
  mail: string;
  tel: string;
  indice: string;
  department: { name: string } | null;
  subject: { name: string; code: string } | null;
}

export function TeachersTable({ teachers }: { teachers: Teacher[] }) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setError('');
    try {
      await deleteTeacher(deleteId);
      setDeleteId(null);
      toast.success('Enseignant supprimé avec succès');
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
              <TableHead>Indice</TableHead>
              <TableHead>Département</TableHead>
              <TableHead>Matière</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">Aucun enseignant trouvé</TableCell>
              </TableRow>
            ) : (
              teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">{teacher.prenom} {teacher.nom}</TableCell>
                  <TableCell>{teacher.mail}</TableCell>
                  <TableCell>{teacher.tel}</TableCell>
                  <TableCell>{teacher.indice}</TableCell>
                  <TableCell>{teacher.department?.name || '-'}</TableCell>
                  <TableCell>{teacher.subject ? `${teacher.subject.name} (${teacher.subject.code})` : '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild><Link href={`/teachers/${teacher.id}`}><Eye className="h-4 w-4" /></Link></Button>
                      <Button variant="ghost" size="sm" asChild><Link href={`/teachers/${teacher.id}/edit`}><Pencil className="h-4 w-4" /></Link></Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(teacher.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
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
              Êtes-vous sûr de vouloir supprimer cet enseignant ? Cette action est irréversible.
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
