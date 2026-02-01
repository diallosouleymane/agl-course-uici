import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { getSubject } from '@/lib/actions/subjects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, BookOpen, Users, MapPin } from 'lucide-react';

interface SubjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { authorized } = await requireRole([UserRole.ADMIN, UserRole.DEPARTMENT_HEAD, UserRole.TEACHER]);
  if (!authorized) redirect('/unauthorized');

  const { id } = await params;
  const subject = await getSubject(id);
  if (!subject) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{subject.name}</h1>
          <p className="text-gray-600 mt-2">Code: {subject.code}</p>
        </div>
        <Button asChild>
          <Link href={`/subjects/${id}/edit`}><Pencil className="h-4 w-4 mr-2" />Modifier</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Département</p>
                <p className="text-lg font-medium">{subject.department.name}</p>
                <p className="text-xs text-gray-500">{subject.department.college.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Salle</p>
                <p className="text-lg font-medium">{subject.classroom.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Inscrits</p>
                <p className="text-2xl font-bold">{subject._count?.enrollments || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enseignants</CardTitle>
          <CardDescription>Enseignants de cette matière</CardDescription>
        </CardHeader>
        <CardContent>
          {subject.teachers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucun enseignant assigné</p>
          ) : (
            <div className="space-y-2">
              {subject.teachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{teacher.prenom} {teacher.nom}</p>
                    <p className="text-sm text-gray-600">{teacher.mail}</p>
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
          <CardTitle>Étudiants inscrits</CardTitle>
          <CardDescription>Liste des étudiants inscrits à cette matière</CardDescription>
        </CardHeader>
        <CardContent>
          {subject.enrollments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucun étudiant inscrit</p>
          ) : (
            <div className="space-y-2">
              {subject.enrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{enrollment.student.prenom} {enrollment.student.nom}</p>
                    <p className="text-sm text-gray-600">{enrollment.student.mail}</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/students/${enrollment.student.id}`}>Voir</Link>
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
