import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { SubjectForm } from '@/components/forms/subject-form';

export default async function NewSubjectPage() {
  const { authorized } = await requireRole([UserRole.ADMIN, UserRole.DEPARTMENT_HEAD]);
  if (!authorized) redirect('/unauthorized');

  const [classrooms, departments] = await Promise.all([
    prisma.classroom.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, capacity: true } }),
    prisma.department.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nouvelle Matière</h1>
        <p className="text-gray-600 mt-2">Créer une nouvelle matière</p>
      </div>
      <SubjectForm mode="create" classrooms={classrooms} departments={departments} />
    </div>
  );
}
