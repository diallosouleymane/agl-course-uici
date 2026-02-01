import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { GradeForm } from '@/components/forms/grade-form';

export default async function NewGradePage() {
  const { authorized } = await requireRole([UserRole.ADMIN, UserRole.DEPARTMENT_HEAD, UserRole.TEACHER]);
  if (!authorized) redirect('/unauthorized');

  const [students, subjects] = await Promise.all([
    prisma.student.findMany({ orderBy: { nom: 'asc' }, select: { id: true, nom: true, prenom: true } }),
    prisma.subject.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, code: true } }),
  ]);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nouvelle Note</h1>
        <p className="text-gray-600 mt-2">Attribuer une note à un étudiant</p>
      </div>
      <GradeForm mode="create" students={students} subjects={subjects} />
    </div>
  );
}
