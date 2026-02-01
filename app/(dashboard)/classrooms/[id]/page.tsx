import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { getClassroom } from '@/lib/actions/classrooms';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, MapPin, Users, BookOpen } from 'lucide-react';

interface ClassroomPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClassroomPage({ params }: ClassroomPageProps) {
  const { authorized } = await requireRole([UserRole.ADMIN, UserRole.DEPARTMENT_HEAD]);
  if (!authorized) redirect('/unauthorized');

  const { id } = await params;
  const classroom = await getClassroom(id);
  if (!classroom) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{classroom.name}</h1>
          <p className="text-gray-600 mt-2">Détails de la salle</p>
        </div>
        <Button asChild>
          <Link href={`/classrooms/${id}/edit`}><Pencil className="h-4 w-4 mr-2" />Modifier</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Capacité</p>
                <p className="text-2xl font-bold">{classroom.capacity}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Emplacement</p>
                <p className="text-lg font-medium">{classroom.location || 'Non renseigné'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Matières</p>
                <p className="text-2xl font-bold">{classroom.subjects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Matières dans cette salle</CardTitle>
          <CardDescription>Liste des matières enseignées dans cette salle</CardDescription>
        </CardHeader>
        <CardContent>
          {classroom.subjects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune matière dans cette salle</p>
          ) : (
            <div className="space-y-2">
              {classroom.subjects.map((subject) => (
                <div key={subject.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{subject.name}</p>
                    <p className="text-sm text-gray-600">{subject.code} - {subject.department.name}</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/subjects/${subject.id}`}>Voir</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
