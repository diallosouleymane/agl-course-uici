import { notFound, redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { getDepartment } from '@/lib/actions/departments';
import { listColleges } from '@/lib/actions/colleges';
import { DepartmentForm } from '@/components/forms/department-form';

interface EditDepartmentPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDepartmentPage({ params }: EditDepartmentPageProps) {
  const { authorized } = await requireRole([UserRole.ADMIN]);

  if (!authorized) {
    redirect('/unauthorized');
  }

  const { id } = await params;
  const [department, { colleges }] = await Promise.all([
    getDepartment(id),
    listColleges(),
  ]);

  if (!department) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Modifier le Département</h1>
        <p className="text-gray-600 mt-2">
          Modifier les informations de {department.name}
        </p>
      </div>

      <DepartmentForm mode="edit" initialData={department} colleges={colleges} />
    </div>
  );
}
