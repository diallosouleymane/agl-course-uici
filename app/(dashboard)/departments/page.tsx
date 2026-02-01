import Link from 'next/link';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { redirect } from 'next/navigation';
import { listDepartments } from '@/lib/actions/departments';
import { DepartmentsTable } from '@/components/tables/departments-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function DepartmentsPage() {
  const { authorized } = await requireRole([UserRole.ADMIN, UserRole.DEPARTMENT_HEAD]);

  if (!authorized) {
    redirect('/unauthorized');
  }

  const { departments } = await listDepartments();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Départements</h1>
          <p className="text-gray-600 mt-2">
            Gérer les départements des collèges
          </p>
        </div>
        <Button asChild>
          <Link href="/departments/new">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau département
          </Link>
        </Button>
      </div>

      <DepartmentsTable departments={departments} />
    </div>
  );
}
