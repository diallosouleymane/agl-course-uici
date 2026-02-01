import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { TeacherForm } from '@/components/forms/teacher-form';

export default async function NewTeacherPage() {
  const { authorized } = await requireRole([UserRole.ADMIN, UserRole.DEPARTMENT_HEAD]);
  if (!authorized) redirect('/unauthorized');

  const [departments, subjects] = await Promise.all([
    prisma.department.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.subject.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, code: true } }),
  ]);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nouvel Enseignant</h1>
        <p className="text-gray-600 mt-2">Ajouter un nouvel enseignant</p>
      </div>
      <TeacherForm mode="create" departments={departments} subjects={subjects} />
    </div>
  );
}
