import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { redirect } from 'next/navigation';
import { CollegeForm } from '@/components/forms/college-form';

export default async function NewCollegePage() {
  const { authorized } = await requireRole([UserRole.ADMIN]);

  if (!authorized) {
    redirect('/unauthorized');
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nouveau Collège</h1>
        <p className="text-gray-600 mt-2">
          Créer un nouveau collège dans le système
        </p>
      </div>

      <CollegeForm mode="create" />
    </div>
  );
}
