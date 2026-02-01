import Link from 'next/link';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { redirect } from 'next/navigation';
import { listClassrooms } from '@/lib/actions/classrooms';
import { ClassroomsTable } from '@/components/tables/classrooms-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function ClassroomsPage() {
  const { authorized } = await requireRole([UserRole.ADMIN, UserRole.DEPARTMENT_HEAD]);
  if (!authorized) redirect('/unauthorized');

  const { classrooms } = await listClassrooms();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Salles de cours</h1>
          <p className="text-gray-600 mt-2">Gérer les salles de cours</p>
        </div>
        <Button asChild>
          <Link href="/classrooms/new"><Plus className="h-4 w-4 mr-2" />Nouvelle salle</Link>
        </Button>
      </div>
      <ClassroomsTable classrooms={classrooms} />
    </div>
  );
}
