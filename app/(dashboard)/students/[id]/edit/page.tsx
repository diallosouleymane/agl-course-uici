import { notFound, redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { getStudent } from '@/lib/actions/students';
import { StudentForm } from '@/components/forms/student-form';

interface EditStudentPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditStudentPage({ params }: EditStudentPageProps) {
  const { authorized } = await requireRole([UserRole.ADMIN, UserRole.DEPARTMENT_HEAD]);
  if (!authorized) redirect('/unauthorized');

  const { id } = await params;
  const student = await getStudent(id);
  if (!student) notFound();

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Modifier l&apos;Étudiant</h1>
        <p className="text-gray-600 mt-2">Modifier les informations de {student.prenom} {student.nom}</p>
      </div>
      <StudentForm mode="edit" initialData={student} />
    </div>
  );
}
