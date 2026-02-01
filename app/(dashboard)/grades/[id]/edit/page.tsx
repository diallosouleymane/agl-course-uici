import { notFound, redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { getGrade } from '@/lib/actions/grades';
import { prisma } from '@/lib/prisma';
import { GradeForm } from '@/components/forms/grade-form';

interface EditGradePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGradePage({ params }: EditGradePageProps) {
  const { authorized } = await requireRole([UserRole.ADMIN, UserRole.DEPARTMENT_HEAD, UserRole.TEACHER]);
  if (!authorized) redirect('/unauthorized');

  const { id } = await params;
  const [grade, students, subjects] = await Promise.all([
    getGrade(id),
    prisma.student.findMany({ orderBy: { nom: 'asc' }, select: { id: true, nom: true, prenom: true } }),
    prisma.subject.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, code: true } }),
  ]);

  if (!grade) notFound();

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Modifier la Note</h1>
        <p className="text-gray-600 mt-2">Modifier la note de {grade.student.prenom} {grade.student.nom}</p>
      </div>
      <GradeForm mode="edit" initialData={{
        id: grade.id,
        studentId: grade.studentId,
        subjectId: grade.subjectId,
        value: Number(grade.value),
        maxValue: Number(grade.maxValue),
        date: grade.date,
      }} students={students} subjects={subjects} />
    </div>
  );
}
