import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { redirect } from 'next/navigation';
import { StudentForm } from '@/components/forms/student-form';

export default async function NewStudentPage() {
  const { authorized } = await requireRole([UserRole.ADMIN, UserRole.DEPARTMENT_HEAD]);
  if (!authorized) redirect('/unauthorized');

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nouvel Étudiant</h1>
        <p className="text-gray-600 mt-2">Ajouter un nouvel étudiant</p>
      </div>
      <StudentForm mode="create" />
    </div>
  );
}
