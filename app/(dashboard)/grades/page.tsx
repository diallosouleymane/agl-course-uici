import Link from 'next/link';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { redirect } from 'next/navigation';
import { listGrades } from '@/lib/actions/grades';
import { GradesTable } from '@/components/tables/grades-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function GradesPage() {
  const { authorized } = await requireRole([UserRole.ADMIN, UserRole.DEPARTMENT_HEAD, UserRole.TEACHER]);
  if (!authorized) redirect('/unauthorized');

  const { grades } = await listGrades();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notes</h1>
          <p className="text-gray-600 mt-2">Gérer les notes des étudiants</p>
        </div>
        <Button asChild>
          <Link href="/grades/new"><Plus className="h-4 w-4 mr-2" />Nouvelle note</Link>
        </Button>
      </div>
      <GradesTable grades={grades.map(g => ({ ...g, value: Number(g.value), maxValue: Number(g.maxValue) }))} />
    </div>
  );
}
