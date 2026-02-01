import Link from 'next/link';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { redirect } from 'next/navigation';
import { listTeachers } from '@/lib/actions/teachers';
import { TeachersTable } from '@/components/tables/teachers-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function TeachersPage() {
  const { authorized } = await requireRole([UserRole.ADMIN, UserRole.DEPARTMENT_HEAD]);
  if (!authorized) redirect('/unauthorized');

  const { teachers } = await listTeachers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enseignants</h1>
          <p className="text-gray-600 mt-2">Gérer les enseignants</p>
        </div>
        <Button asChild>
          <Link href="/teachers/new"><Plus className="h-4 w-4 mr-2" />Nouvel enseignant</Link>
        </Button>
      </div>
      <TeachersTable teachers={teachers} />
    </div>
  );
}
