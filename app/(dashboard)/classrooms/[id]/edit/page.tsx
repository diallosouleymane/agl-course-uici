import { notFound, redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { getClassroom } from '@/lib/actions/classrooms';
import { ClassroomForm } from '@/components/forms/classroom-form';

interface EditClassroomPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditClassroomPage({ params }: EditClassroomPageProps) {
  const { authorized } = await requireRole([UserRole.ADMIN, UserRole.DEPARTMENT_HEAD]);
  if (!authorized) redirect('/unauthorized');

  const { id } = await params;
  const classroom = await getClassroom(id);
  if (!classroom) notFound();

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Modifier la Salle</h1>
        <p className="text-gray-600 mt-2">Modifier les informations de {classroom.name}</p>
      </div>
      <ClassroomForm mode="edit" initialData={classroom} />
    </div>
  );
}
