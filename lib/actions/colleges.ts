'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { collegeSchema, type CollegeInput } from '@/lib/validations/college';
import { getSession } from '@/lib/auth-utils';
import { canManageColleges } from '@/lib/utils/permissions';
import { UserRole } from '@/lib/generated/prisma';

export async function createCollege(data: CollegeInput) {
  const session = await getSession();

  if (!session || !canManageColleges({ id: session.user.id, role: session.user.role as UserRole })) {
    throw new Error('Non autorisé');
  }

  const validated = collegeSchema.parse(data);

  const college = await prisma.college.create({
    data: {
      name: validated.name,
      websiteUrl: validated.websiteUrl || null,
    },
  });

  revalidatePath('/colleges');
  return college;
}

export async function updateCollege(id: string, data: Partial<CollegeInput>) {
  const session = await getSession();

  if (!session || !canManageColleges({ id: session.user.id, role: session.user.role as UserRole })) {
    throw new Error('Non autorisé');
  }

  const college = await prisma.college.update({
    where: { id },
    data: {
      name: data.name,
      websiteUrl: data.websiteUrl || null,
    },
  });

  revalidatePath('/colleges');
  revalidatePath(`/colleges/${id}`);
  return college;
}

export async function deleteCollege(id: string) {
  const session = await getSession();

  if (!session || !canManageColleges({ id: session.user.id, role: session.user.role as UserRole })) {
    throw new Error('Non autorisé');
  }

  // Check if college has departments
  const departmentCount = await prisma.department.count({
    where: { collegeId: id },
  });

  if (departmentCount > 0) {
    throw new Error('Impossible de supprimer un collège qui contient des départements');
  }

  await prisma.college.delete({
    where: { id },
  });

  revalidatePath('/colleges');
}

export async function getCollege(id: string) {
  const college = await prisma.college.findUnique({
    where: { id },
    include: {
      departments: {
        include: {
          _count: {
            select: {
              teachers: true,
              subjects: true,
            },
          },
        },
      },
    },
  });

  return college;
}

export async function listColleges(page = 1, limit = 50) {
  const skip = (page - 1) * limit;

  const [colleges, total] = await Promise.all([
    prisma.college.findMany({
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            departments: true,
          },
        },
      },
    }),
    prisma.college.count(),
  ]);

  return {
    colleges,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
