import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { getTeacher } from '@/lib/actions/teachers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil } from 'lucide-react';

interface TeacherPageProps {
  params: Promise<{ id: string }>;
}

export default async function TeacherPage({ params }: TeacherPageProps) {
  const { authorized } = await requireRole([UserRole.ADMIN, UserRole.DEPARTMENT_HEAD]);
  if (!authorized) redirect('/unauthorized');

  const { id } = await params;
  const teacher = await getTeacher(id);
  if (!teacher) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{teacher.prenom} {teacher.nom}</h1>
          <p className="text-gray-600 mt-2">Détails de l&apos;enseignant</p>
        </div>
        <Button asChild>
          <Link href={`/teachers/${id}/edit`}><Pencil className="h-4 w-4 mr-2" />Modifier</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Informations personnelles</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><p className="text-sm text-gray-600">Nom complet</p><p className="font-medium">{teacher.prenom} {teacher.nom}</p></div>
            <div><p className="text-sm text-gray-600">Email</p><p className="font-medium">{teacher.mail}</p></div>
            <div><p className="text-sm text-gray-600">Téléphone</p><p className="font-medium">{teacher.tel}</p></div>
            <div><p className="text-sm text-gray-600">Indice</p><p className="font-medium">{teacher.indice}</p></div>
            <div><p className="text-sm text-gray-600">Date de fonction</p><p className="font-medium">{new Date(teacher.dateFunction).toLocaleDateString('fr-FR')}</p></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Affectation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Département</p>
              <p className="font-medium">{teacher.department.name}</p>
              <p className="text-xs text-gray-500">{teacher.department.college.name}</p>
            </div>
            {teacher.subject && (
              <div>
                <p className="text-sm text-gray-600">Matière</p>
                <p className="font-medium">{teacher.subject.name}</p>
                {teacher.subject.classroom && (
                  <p className="text-xs text-gray-500">Salle: {teacher.subject.classroom.name}</p>
                )}
              </div>
            )}
            {teacher.headOfDepartment && (
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm font-medium text-blue-800">Responsable du département: {teacher.headOfDepartment.name}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
