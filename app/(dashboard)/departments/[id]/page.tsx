import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { getDepartment } from '@/lib/actions/departments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Users, BookOpen } from 'lucide-react';

interface DepartmentPageProps {
  params: Promise<{ id: string }>;
}

export default async function DepartmentPage({ params }: DepartmentPageProps) {
  const { authorized } = await requireRole([UserRole.ADMIN, UserRole.DEPARTMENT_HEAD]);

  if (!authorized) {
    redirect('/unauthorized');
  }

  const { id } = await params;
  const department = await getDepartment(id);

  if (!department) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{department.name}</h1>
          <p className="text-gray-600 mt-2">
            Département de {department.college.name}
          </p>
        </div>
        <Button asChild>
          <Link href={`/departments/${id}/edit`}>
            <Pencil className="h-4 w-4 mr-2" />
            Modifier
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations Générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Nom</p>
              <p className="font-medium">{department.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Collège</p>
              <p className="font-medium">{department.college.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Responsable</p>
              {department.headTeacher ? (
                <p className="font-medium">
                  {department.headTeacher.prenom} {department.headTeacher.nom}
                </p>
              ) : (
                <p className="text-gray-400">Non assigné</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">Enseignants</span>
              </div>
              <span className="text-2xl font-bold">{department.teachers.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">Matières</span>
              </div>
              <span className="text-2xl font-bold">{department.subjects.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enseignants</CardTitle>
          <CardDescription>
            Liste des enseignants de ce département
          </CardDescription>
        </CardHeader>
        <CardContent>
          {department.teachers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucun enseignant dans ce département
            </p>
          ) : (
            <div className="space-y-2">
              {department.teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {teacher.prenom} {teacher.nom}
                    </p>
                    <p className="text-sm text-gray-600">
                      {teacher.subject.name} • {teacher.mail}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/teachers/${teacher.id}`}>Voir</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Matières</CardTitle>
          <CardDescription>
            Liste des matières enseignées dans ce département
          </CardDescription>
        </CardHeader>
        <CardContent>
          {department.subjects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucune matière dans ce département
            </p>
          ) : (
            <div className="space-y-2">
              {department.subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{subject.name}</p>
                    <p className="text-sm text-gray-600">
                      Code: {subject.code} • Salle: {subject.classroom.name} •{' '}
                      {subject._count.enrollments} étudiant(s)
                    </p>
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
