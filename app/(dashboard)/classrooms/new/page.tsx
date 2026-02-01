import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { redirect } from 'next/navigation';
import { ClassroomForm } from '@/components/forms/classroom-form';

export default async function NewClassroomPage() {
  const { authorized } = await requireRole([UserRole.ADMIN, UserRole.DEPARTMENT_HEAD]);
  if (!authorized) redirect('/unauthorized');

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nouvelle Salle</h1>
        <p className="text-gray-600 mt-2">Créer une nouvelle salle de cours</p>
      </div>
      <ClassroomForm mode="create" />
    </div>
  );
}
