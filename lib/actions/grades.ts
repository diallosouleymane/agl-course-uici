'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { gradeSchema, type GradeInput } from '@/lib/validations/grade';
import { getSession } from '@/lib/auth-utils';
import { canManageGrades } from '@/lib/utils/permissions';
import { UserRole } from '@/lib/generated/prisma';

export async function createGrade(data: GradeInput) {
  const session = await getSession();

  if (!session) {
    throw new Error('Non autorisé');
  }

  // Get subject to check department
  const subject = await prisma.subject.findUnique({
    where: { id: data.subjectId },
  });

  if (!subject) {
    throw new Error('Matière introuvable');
  }

  const authorized = await canManageGrades(
    { id: session.user.id, role: session.user.role as UserRole },
    subject.departmentId
  );

  if (!authorized) {
    throw new Error('Non autorisé');
  }

  // Verify student is enrolled in this subject
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_subjectId: {
        studentId: data.studentId,
        subjectId: data.subjectId,
      },
    },
  });

  if (!enrollment) {
    throw new Error('L\'étudiant n\'est pas inscrit à cette matière');
  }

  const validated = gradeSchema.parse(data);

  const grade = await prisma.grade.create({
    data: {
      studentId: validated.studentId,
      subjectId: validated.subjectId,
      value: validated.value,
      maxValue: validated.maxValue,
      date: validated.date || new Date(),
    },
  });

  revalidatePath('/grades');
  revalidatePath(`/students/${validated.studentId}`);
  return grade;
}

export async function updateGrade(id: string, data: Partial<GradeInput>) {
  const session = await getSession();

  if (!session) {
    throw new Error('Non autorisé');
  }

  const grade = await prisma.grade.findUnique({
    where: { id },
    include: {
      subject: true,
    },
  });

  if (!grade) {
    throw new Error('Note introuvable');
  }

  const authorized = await canManageGrades(
    { id: session.user.id, role: session.user.role as UserRole },
    grade.subject.departmentId
  );

  if (!authorized) {
    throw new Error('Non autorisé');
  }

  const updated = await prisma.grade.update({
    where: { id },
    data,
  });

  revalidatePath('/grades');
  revalidatePath(`/students/${grade.studentId}`);
  return updated;
}

export async function deleteGrade(id: string) {
  const session = await getSession();

  if (!session) {
    throw new Error('Non autorisé');
  }

  const grade = await prisma.grade.findUnique({
    where: { id },
    include: {
      subject: true,
    },
  });

  if (!grade) {
    throw new Error('Note introuvable');
  }

  const authorized = await canManageGrades(
    { id: session.user.id, role: session.user.role as UserRole },
    grade.subject.departmentId
  );

  if (!authorized) {
    throw new Error('Non autorisé');
  }

  await prisma.grade.delete({
    where: { id },
  });

  revalidatePath('/grades');
  revalidatePath(`/students/${grade.studentId}`);
}

export async function getGrade(id: string) {
  const grade = await prisma.grade.findUnique({
    where: { id },
    include: {
      student: true,
      subject: {
        include: {
          department: true,
        },
      },
    },
  });

  return grade;
}

export async function listGrades(studentId?: string, subjectId?: string, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  const where: any = {};

  if (studentId) where.studentId = studentId;
  if (subjectId) where.subjectId = subjectId;

  const [grades, total] = await Promise.all([
    prisma.grade.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: 'desc' },
      include: {
        student: true,
        subject: true,
      },
    }),
    prisma.grade.count({ where }),
  ]);

  return {
    grades,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getStudentGrades(studentId: string) {
  const grades = await prisma.grade.findMany({
    where: { studentId },
    include: {
      subject: {
        include: {
          department: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  });

  return grades;
}

export async function getSubjectGrades(subjectId: string) {
  const grades = await prisma.grade.findMany({
    where: { subjectId },
    include: {
      student: true,
    },
    orderBy: [
      { student: { nom: 'asc' } },
      { date: 'desc' },
    ],
  });

  return grades;
}
