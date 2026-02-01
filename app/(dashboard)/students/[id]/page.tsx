import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { getStudent } from '@/lib/actions/students';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, GraduationCap, BookOpen } from 'lucide-react';

interface StudentPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentPage({ params }: StudentPageProps) {
  const { authorized } = await requireRole([UserRole.ADMIN, UserRole.DEPARTMENT_HEAD, UserRole.TEACHER]);
  if (!authorized) redirect('/unauthorized');

  const { id } = await params;
  const student = await getStudent(id);
  if (!student) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{student.prenom} {student.nom}</h1>
          <p className="text-gray-600 mt-2">Promotion {student.anneeEntree}</p>
        </div>
        <Button asChild>
          <Link href={`/students/${id}/edit`}><Pencil className="h-4 w-4 mr-2" />Modifier</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Informations personnelles</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><p className="text-sm text-gray-600">Nom complet</p><p className="font-medium">{student.prenom} {student.nom}</p></div>
            <div><p className="text-sm text-gray-600">Email</p><p className="font-medium">{student.mail}</p></div>
            <div><p className="text-sm text-gray-600">Téléphone</p><p className="font-medium">{student.tel}</p></div>
            <div><p className="text-sm text-gray-600">Année d&apos;entrée</p><p className="font-medium">{student.anneeEntree}</p></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Statistiques</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-blue-500" /><span className="text-sm text-gray-600">Matières inscrites</span></div>
              <span className="text-2xl font-bold">{student.enrollments.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-green-500" /><span className="text-sm text-gray-600">Notes</span></div>
              <span className="text-2xl font-bold">{student.grades.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inscriptions</CardTitle>
          <CardDescription>Matières auxquelles l&apos;étudiant est inscrit</CardDescription>
        </CardHeader>
        <CardContent>
          {student.enrollments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune inscription</p>
          ) : (
            <div className="space-y-2">
              {student.enrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{enrollment.subject.name}</p>
                    <p className="text-sm text-gray-600">{enrollment.subject.department.name} - Salle: {enrollment.subject.classroom?.name || 'N/A'}</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/subjects/${enrollment.subject.id}`}>Voir</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
          <CardDescription>Historique des notes de l&apos;étudiant</CardDescription>
        </CardHeader>
        <CardContent>
          {student.grades.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune note</p>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 text-sm font-medium">Matière</th>
                    <th className="text-center p-3 text-sm font-medium">Note</th>
                    <th className="text-center p-3 text-sm font-medium">Sur</th>
                    <th className="text-center p-3 text-sm font-medium">/20</th>
                    <th className="text-right p-3 text-sm font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {student.grades.map((grade) => (
                    <tr key={grade.id} className="border-b">
                      <td className="p-3">{grade.subject.name}</td>
                      <td className="p-3 text-center font-medium">{Number(grade.value)}</td>
                      <td className="p-3 text-center">{Number(grade.maxValue)}</td>
                      <td className="p-3 text-center font-medium">{((Number(grade.value) / Number(grade.maxValue)) * 20).toFixed(1)}</td>
                      <td className="p-3 text-right text-sm text-gray-600">{new Date(grade.date).toLocaleDateString('fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
