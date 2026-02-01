import { notFound, redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { getCollege } from '@/lib/actions/colleges';
import { CollegeForm } from '@/components/forms/college-form';

interface EditCollegePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCollegePage({ params }: EditCollegePageProps) {
  const { authorized } = await requireRole([UserRole.ADMIN]);

  if (!authorized) {
    redirect('/unauthorized');
  }

  const { id } = await params;
  const college = await getCollege(id);

  if (!college) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Modifier le Collège</h1>
        <p className="text-gray-600 mt-2">
          Modifier les informations de {college.name}
        </p>
      </div>

      <CollegeForm mode="edit" initialData={college} />
    </div>
  );
}
