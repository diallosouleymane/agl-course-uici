'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { teacherSchema, type TeacherInput } from '@/lib/validations/teacher';
import { getSession } from '@/lib/auth-utils';
import { canManageTeachers } from '@/lib/utils/permissions';
import { UserRole } from '@/lib/generated/prisma';
import { hashPassword } from 'better-auth/crypto';

export async function createTeacher(data: TeacherInput & { createUser?: boolean; password?: string }) {
  const session = await getSession();

  if (!session) {
    throw new Error('Non autorisé');
  }

  const authorized = await canManageTeachers(
    { id: session.user.id, role: session.user.role as UserRole },
    data.departmentId
  );

  if (!authorized) {
    throw new Error('Non autorisé');
  }

  const validated = teacherSchema.parse(data);

  let userId = validated.userId;

  // Create user if requested
  if (data.createUser && data.password) {
    const hashedPassword = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: validated.mail,
        name: `${validated.prenom} ${validated.nom}`,
        password: hashedPassword,
        emailVerified: true,
        role: UserRole.TEACHER,
      },
    });
    userId = user.id;
  }

  if (!userId) {
    throw new Error('userId est requis ou createUser doit être activé');
  }

  const teacher = await prisma.teacher.create({
    data: {
      userId,
      nom: validated.nom,
      prenom: validated.prenom,
      tel: validated.tel,
      mail: validated.mail,
      dateFunction: validated.dateFunction,
      indice: validated.indice,
      departmentId: validated.departmentId,
      subjectId: validated.subjectId,
    },
  });

  revalidatePath('/teachers');
  return teacher;
}

export async function updateTeacher(id: string, data: Partial<TeacherInput>) {
  const session = await getSession();

  if (!session) {
    throw new Error('Non autorisé');
  }

  const teacher = await prisma.teacher.findUnique({ where: { id } });
  if (!teacher) {
    throw new Error('Enseignant introuvable');
  }

  const authorized = await canManageTeachers(
    { id: session.user.id, role: session.user.role as UserRole },
    teacher.departmentId
  );

  if (!authorized) {
    throw new Error('Non autorisé');
  }

  const updated = await prisma.teacher.update({
    where: { id },
    data,
  });

  revalidatePath('/teachers');
  revalidatePath(`/teachers/${id}`);
  return updated;
}

export async function deleteTeacher(id: string) {
  const session = await getSession();

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Non autorisé');
  }

  // Check if teacher is department head
  const isDeptHead = await prisma.department.findFirst({
    where: { headTeacherId: id },
  });

  if (isDeptHead) {
    throw new Error('Impossible de supprimer un enseignant qui est responsable de département');
  }

  await prisma.teacher.delete({
    where: { id },
  });

  revalidatePath('/teachers');
}

export async function getTeacher(id: string) {
  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
      user: true,
      department: {
        include: {
          college: true,
        },
      },
      subject: {
        include: {
          classroom: true,
        },
      },
      headOfDepartment: true,
    },
  });

  return teacher;
}

export async function listTeachers(departmentId?: string, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  const where = departmentId ? { departmentId } : {};

  const [teachers, total] = await Promise.all([
    prisma.teacher.findMany({
      where,
      skip,
      take: limit,
      orderBy: { nom: 'asc' },
      include: {
        user: true,
        department: true,
        subject: true,
      },
    }),
    prisma.teacher.count({ where }),
  ]);

  return {
    teachers,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
