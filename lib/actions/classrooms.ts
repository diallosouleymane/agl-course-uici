'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { classroomSchema, type ClassroomInput } from '@/lib/validations/classroom';
import { getSession } from '@/lib/auth-utils';
import { canManageClassrooms } from '@/lib/utils/permissions';
import { UserRole } from '@/lib/generated/prisma';

export async function createClassroom(data: ClassroomInput) {
  const session = await getSession();

  if (!session || !canManageClassrooms({ id: session.user.id, role: session.user.role as UserRole })) {
    throw new Error('Non autorisé');
  }

  const validated = classroomSchema.parse(data);

  const classroom = await prisma.classroom.create({
    data: validated,
  });

  revalidatePath('/classrooms');
  return classroom;
}

export async function updateClassroom(id: string, data: Partial<ClassroomInput>) {
  const session = await getSession();

  if (!session || !canManageClassrooms({ id: session.user.id, role: session.user.role as UserRole })) {
    throw new Error('Non autorisé');
  }

  const classroom = await prisma.classroom.update({
    where: { id },
    data,
  });

  revalidatePath('/classrooms');
  revalidatePath(`/classrooms/${id}`);
  return classroom;
}

export async function deleteClassroom(id: string) {
  const session = await getSession();

  if (!session || !canManageClassrooms({ id: session.user.id, role: session.user.role as UserRole })) {
    throw new Error('Non autorisé');
  }

  const subjectCount = await prisma.subject.count({
    where: { classroomId: id },
  });

  if (subjectCount > 0) {
    throw new Error('Impossible de supprimer une salle utilisée par des matières');
  }

  await prisma.classroom.delete({
    where: { id },
  });

  revalidatePath('/classrooms');
}

export async function getClassroom(id: string) {
  const classroom = await prisma.classroom.findUnique({
    where: { id },
    include: {
      subjects: {
        include: {
          department: true,
        },
      },
    },
  });

  return classroom;
}

export async function listClassrooms(page = 1, limit = 50) {
  const skip = (page - 1) * limit;

  const [classrooms, total] = await Promise.all([
    prisma.classroom.findMany({
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            subjects: true,
          },
        },
      },
    }),
    prisma.classroom.count(),
  ]);

  return {
    classrooms,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
