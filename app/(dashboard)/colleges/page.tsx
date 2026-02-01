import Link from 'next/link';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { redirect } from 'next/navigation';
import { listColleges } from '@/lib/actions/colleges';
import { CollegesTable } from '@/components/tables/colleges-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function CollegesPage() {
  const { authorized } = await requireRole([UserRole.ADMIN]);

  if (!authorized) {
    redirect('/unauthorized');
  }

  const { colleges } = await listColleges();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Collèges</h1>
          <p className="text-gray-600 mt-2">
            Gérer les collèges du système
          </p>
        </div>
        <Button asChild>
          <Link href="/colleges/new">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau collège
          </Link>
        </Button>
      </div>

      <CollegesTable colleges={colleges} />
    </div>
  );
}
