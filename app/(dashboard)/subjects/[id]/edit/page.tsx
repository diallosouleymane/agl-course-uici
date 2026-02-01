import { notFound, redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { getSubject } from '@/lib/actions/subjects';
import { prisma } from '@/lib/prisma';
import { SubjectForm } from '@/components/forms/subject-form';

interface EditSubjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSubjectPage({ params }: EditSubjectPageProps) {
  const { authorized } = await requireRole([UserRole.ADMIN, UserRole.DEPARTMENT_HEAD]);
  if (!authorized) redirect('/unauthorized');

  const { id } = await params;
  const [subject, classrooms, departments] = await Promise.all([
    getSubject(id),
    prisma.classroom.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, capacity: true } }),
    prisma.department.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ]);

  if (!subject) notFound();

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Modifier la Matière</h1>
        <p className="text-gray-600 mt-2">Modifier les informations de {subject.name}</p>
      </div>
      <SubjectForm mode="edit" initialData={subject} classrooms={classrooms} departments={departments} />
    </div>
  );
}
