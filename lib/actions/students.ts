'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { studentSchema, enrollmentSchema, type StudentInput, type EnrollmentInput } from '@/lib/validations/student';
import { getSession } from '@/lib/auth-utils';
import { canManageStudents } from '@/lib/utils/permissions';
import { UserRole } from '@/lib/generated/prisma';
import { hashPassword } from 'better-auth/crypto';

export async function createStudent(data: StudentInput & { createUser?: boolean; password?: string }) {
  const session = await getSession();

  if (!session || !canManageStudents({ id: session.user.id, role: session.user.role as UserRole })) {
    throw new Error('Non autorisé');
  }

  const validated = studentSchema.parse(data);

  let userId = validated.userId;

  if (data.createUser && data.password) {
    const hashedPassword = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: validated.mail,
        name: `${validated.prenom} ${validated.nom}`,
        password: hashedPassword,
        emailVerified: true,
        role: UserRole.STUDENT,
      },
    });
    userId = user.id;
  }

  if (!userId) {
    throw new Error('userId est requis ou createUser doit être activé');
  }

  const student = await prisma.student.create({
    data: {
      userId,
      nom: validated.nom,
      prenom: validated.prenom,
      tel: validated.tel,
      mail: validated.mail,
      anneeEntree: validated.anneeEntree,
    },
  });

  revalidatePath('/students');
  return student;
}

export async function updateStudent(id: string, data: Partial<StudentInput>) {
  const session = await getSession();

  if (!session || !canManageStudents({ id: session.user.id, role: session.user.role as UserRole })) {
    throw new Error('Non autorisé');
  }

  const student = await prisma.student.update({
    where: { id },
    data,
  });

  revalidatePath('/students');
  revalidatePath(`/students/${id}`);
  return student;
}

export async function deleteStudent(id: string) {
  const session = await getSession();

  if (!session || !canManageStudents({ id: session.user.id, role: session.user.role as UserRole })) {
    throw new Error('Non autorisé');
  }

  await prisma.student.delete({
    where: { id },
  });

  revalidatePath('/students');
}

export async function getStudent(id: string) {
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: true,
      enrollments: {
        include: {
          subject: {
            include: {
              department: true,
              classroom: true,
            },
          },
        },
      },
      grades: {
        include: {
          subject: true,
        },
        orderBy: {
          date: 'desc',
        },
      },
    },
  });

  return student;
}

export async function listStudents(anneeEntree?: number, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  const where = anneeEntree ? { anneeEntree } : {};

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip,
      take: limit,
      orderBy: { nom: 'asc' },
      include: {
        user: true,
        _count: {
          select: {
            enrollments: true,
            grades: true,
          },
        },
      },
    }),
    prisma.student.count({ where }),
  ]);

  return {
    students,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function enrollStudent(data: EnrollmentInput) {
  const session = await getSession();

  if (!session || !canManageStudents({ id: session.user.id, role: session.user.role as UserRole })) {
    throw new Error('Non autorisé');
  }

  const validated = enrollmentSchema.parse(data);

  const enrollment = await prisma.enrollment.create({
    data: validated,
  });

  revalidatePath('/students');
  revalidatePath(`/students/${validated.studentId}`);
  return enrollment;
}

export async function unenrollStudent(studentId: string, subjectId: string) {
  const session = await getSession();

  if (!session || !canManageStudents({ id: session.user.id, role: session.user.role as UserRole })) {
    throw new Error('Non autorisé');
  }

  // Check if student has grades for this subject
  const gradeCount = await prisma.grade.count({
    where: { studentId, subjectId },
  });

  if (gradeCount > 0) {
    throw new Error('Impossible de désinscrire un étudiant qui a des notes pour cette matière');
  }

  await prisma.enrollment.delete({
    where: {
      studentId_subjectId: {
        studentId,
        subjectId,
      },
    },
  });

  revalidatePath('/students');
  revalidatePath(`/students/${studentId}`);
}

export async function getEnrollments(studentId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: {
      subject: {
        include: {
          department: true,
          classroom: true,
        },
      },
    },
  });

  return enrollments;
}
