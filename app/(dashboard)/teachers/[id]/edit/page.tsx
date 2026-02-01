import { notFound, redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { getTeacher } from '@/lib/actions/teachers';
import { prisma } from '@/lib/prisma';
import { TeacherForm } from '@/components/forms/teacher-form';

interface EditTeacherPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTeacherPage({ params }: EditTeacherPageProps) {
  const { authorized } = await requireRole([UserRole.ADMIN, UserRole.DEPARTMENT_HEAD]);
  if (!authorized) redirect('/unauthorized');

  const { id } = await params;
  const [teacher, departments, subjects] = await Promise.all([
    getTeacher(id),
    prisma.department.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.subject.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, code: true } }),
  ]);

  if (!teacher) notFound();

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Modifier l&apos;Enseignant</h1>
        <p className="text-gray-600 mt-2">Modifier les informations de {teacher.prenom} {teacher.nom}</p>
      </div>
      <TeacherForm mode="edit" initialData={teacher} departments={departments} subjects={subjects} />
    </div>
  );
}
