import Link from 'next/link';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { redirect } from 'next/navigation';
import { listStudents } from '@/lib/actions/students';
import { StudentsTable } from '@/components/tables/students-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function StudentsPage() {
  const { authorized } = await requireRole([UserRole.ADMIN, UserRole.DEPARTMENT_HEAD]);
  if (!authorized) redirect('/unauthorized');

  const { students } = await listStudents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Étudiants</h1>
          <p className="text-gray-600 mt-2">Gérer les étudiants</p>
        </div>
        <Button asChild>
          <Link href="/students/new"><Plus className="h-4 w-4 mr-2" />Nouvel étudiant</Link>
        </Button>
      </div>
      <StudentsTable students={students} />
    </div>
  );
}
