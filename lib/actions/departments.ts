'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { departmentSchema, type DepartmentInput } from '@/lib/validations/department';
import { getSession } from '@/lib/auth-utils';
import { canManageDepartment } from '@/lib/utils/permissions';
import { UserRole } from '@/lib/generated/prisma';

export async function createDepartment(data: DepartmentInput) {
  const session = await getSession();

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Non autorisé');
  }

  const validated = departmentSchema.parse(data);

  const department = await prisma.department.create({
    data: {
      name: validated.name,
      collegeId: validated.collegeId,
      headTeacherId: validated.headTeacherId || null,
    },
  });

  revalidatePath('/departments');
  revalidatePath('/colleges');
  return department;
}

export async function updateDepartment(id: string, data: Partial<DepartmentInput>) {
  const session = await getSession();

  if (!session) {
    throw new Error('Non autorisé');
  }

  const authorized = await canManageDepartment(
    { id: session.user.id, role: session.user.role as UserRole },
    id
  );

  if (!authorized) {
    throw new Error('Non autorisé');
  }

  const department = await prisma.department.update({
    where: { id },
    data: {
      name: data.name,
      collegeId: data.collegeId,
      headTeacherId: data.headTeacherId || null,
    },
  });

  revalidatePath('/departments');
  revalidatePath(`/departments/${id}`);
  return department;
}

export async function assignHeadTeacher(departmentId: string, teacherId: string) {
  const session = await getSession();

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Non autorisé');
  }

  // Verify teacher belongs to this department
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
  });

  if (!teacher || teacher.departmentId !== departmentId) {
    throw new Error('L\'enseignant doit appartenir à ce département');
  }

  const department = await prisma.department.update({
    where: { id: departmentId },
    data: {
      headTeacherId: teacherId,
    },
  });

  revalidatePath('/departments');
  revalidatePath(`/departments/${departmentId}`);
  return department;
}

export async function deleteDepartment(id: string) {
  const session = await getSession();

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Non autorisé');
  }

  // Check if department has teachers
  const teacherCount = await prisma.teacher.count({
    where: { departmentId: id },
  });

  if (teacherCount > 0) {
    throw new Error('Impossible de supprimer un département qui contient des enseignants');
  }

  // Check if department has subjects
  const subjectCount = await prisma.subject.count({
    where: { departmentId: id },
  });

  if (subjectCount > 0) {
    throw new Error('Impossible de supprimer un département qui contient des matières');
  }

  await prisma.department.delete({
    where: { id },
  });

  revalidatePath('/departments');
  revalidatePath('/colleges');
}

export async function getDepartment(id: string) {
  const department = await prisma.department.findUnique({
    where: { id },
    include: {
      college: true,
      headTeacher: {
        include: {
          user: true,
        },
      },
      teachers: {
        include: {
          user: true,
          subject: true,
        },
      },
      subjects: {
        include: {
          classroom: true,
          _count: {
            select: {
              teachers: true,
              enrollments: true,
            },
          },
        },
      },
    },
  });

  return department;
}

export async function listDepartments(collegeId?: string, page = 1, limit = 50) {
  const skip = (page - 1) * limit;

  const where = collegeId ? { collegeId } : {};

  const [departments, total] = await Promise.all([
    prisma.department.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      include: {
        college: true,
        headTeacher: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            teachers: true,
            subjects: true,
          },
        },
      },
    }),
    prisma.department.count({ where }),
  ]);

  return {
    departments,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
