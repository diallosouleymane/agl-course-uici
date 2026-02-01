import Link from 'next/link';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { redirect } from 'next/navigation';
import { listSubjects } from '@/lib/actions/subjects';
import { SubjectsTable } from '@/components/tables/subjects-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function SubjectsPage() {
  const { authorized } = await requireRole([UserRole.ADMIN, UserRole.DEPARTMENT_HEAD]);
  if (!authorized) redirect('/unauthorized');

  const { subjects } = await listSubjects();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Matières</h1>
          <p className="text-gray-600 mt-2">Gérer les matières enseignées</p>
        </div>
        <Button asChild>
          <Link href="/subjects/new"><Plus className="h-4 w-4 mr-2" />Nouvelle matière</Link>
        </Button>
      </div>
      <SubjectsTable subjects={subjects} />
    </div>
  );
}
