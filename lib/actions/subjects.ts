'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { subjectSchema, type SubjectInput } from '@/lib/validations/subject';
import { getSession } from '@/lib/auth-utils';
import { canManageSubjects } from '@/lib/utils/permissions';
import { UserRole } from '@/lib/generated/prisma';

export async function createSubject(data: SubjectInput) {
  const session = await getSession();

  if (!session) {
    throw new Error('Non autorisé');
  }

  const authorized = await canManageSubjects(
    { id: session.user.id, role: session.user.role as UserRole },
    data.departmentId
  );

  if (!authorized) {
    throw new Error('Non autorisé');
  }

  const validated = subjectSchema.parse(data);

  const subject = await prisma.subject.create({
    data: validated,
  });

  revalidatePath('/subjects');
  return subject;
}

export async function updateSubject(id: string, data: Partial<SubjectInput>) {
  const session = await getSession();

  if (!session) {
    throw new Error('Non autorisé');
  }

  const subject = await prisma.subject.findUnique({ where: { id } });
  if (!subject) {
    throw new Error('Matière introuvable');
  }

  const authorized = await canManageSubjects(
    { id: session.user.id, role: session.user.role as UserRole },
    subject.departmentId
  );

  if (!authorized) {
    throw new Error('Non autorisé');
  }

  const updated = await prisma.subject.update({
    where: { id },
    data,
  });

  revalidatePath('/subjects');
  revalidatePath(`/subjects/${id}`);
  return updated;
}

export async function deleteSubject(id: string) {
  const session = await getSession();

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Non autorisé');
  }

  const [teacherCount, enrollmentCount, gradeCount] = await Promise.all([
    prisma.teacher.count({ where: { subjectId: id } }),
    prisma.enrollment.count({ where: { subjectId: id } }),
    prisma.grade.count({ where: { subjectId: id } }),
  ]);

  if (teacherCount > 0) {
    throw new Error('Impossible de supprimer une matière assignée à des enseignants');
  }

  if (enrollmentCount > 0 || gradeCount > 0) {
    throw new Error('Impossible de supprimer une matière avec des inscriptions ou notes');
  }

  await prisma.subject.delete({
    where: { id },
  });

  revalidatePath('/subjects');
}

export async function getSubject(id: string) {
  const subject = await prisma.subject.findUnique({
    where: { id },
    include: {
      classroom: true,
      department: {
        include: {
          college: true,
        },
      },
      teachers: {
        include: {
          user: true,
        },
      },
      enrollments: {
        include: {
          student: true,
        },
      },
      _count: {
        select: {
          enrollments: true,
          grades: true,
        },
      },
    },
  });

  return subject;
}

export async function listSubjects(departmentId?: string, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  const where = departmentId ? { departmentId } : {};

  const [subjects, total] = await Promise.all([
    prisma.subject.findMany({
      where,
      skip,
      take: limit,
      orderBy: { code: 'asc' },
      include: {
        classroom: true,
        department: true,
        _count: {
          select: {
            teachers: true,
            enrollments: true,
          },
        },
      },
    }),
    prisma.subject.count({ where }),
  ]);

  return {
    subjects,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
