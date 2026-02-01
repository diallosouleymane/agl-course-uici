import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { redirect } from 'next/navigation';
import { listColleges } from '@/lib/actions/colleges';
import { DepartmentForm } from '@/components/forms/department-form';

export default async function NewDepartmentPage() {
  const { authorized } = await requireRole([UserRole.ADMIN]);

  if (!authorized) {
    redirect('/unauthorized');
  }

  const { colleges } = await listColleges();

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nouveau Département</h1>
        <p className="text-gray-600 mt-2">
          Créer un nouveau département dans un collège
        </p>
      </div>

      <DepartmentForm mode="create" colleges={colleges} />
    </div>
  );
}
