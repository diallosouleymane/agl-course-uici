import { prisma } from '../prisma';
import { Decimal } from '../generated/prisma/client';

/**
 * Normalize a grade to a scale of /20
 */
export function normalizeGrade(value: number, maxValue: number): number {
  if (maxValue === 0) return 0;
  return (value / maxValue) * 20;
}

/**
 * Convert Decimal to number
 */
function decimalToNumber(decimal: Decimal): number {
  return parseFloat(decimal.toString());
}

/**
 * Calculate the average grade for a subject across all students
 */
export async function calculateSubjectAverage(subjectId: string): Promise<number> {
  const grades = await prisma.grade.findMany({
    where: { subjectId },
  });

  if (grades.length === 0) return 0;

  const normalizedGrades = grades.map((grade) =>
    normalizeGrade(decimalToNumber(grade.value), decimalToNumber(grade.maxValue))
  );

  const sum = normalizedGrades.reduce((acc, grade) => acc + grade, 0);
  return Math.round((sum / normalizedGrades.length) * 100) / 100;
}

/**
 * Calculate the average grade for a department across all subjects
 */
export async function calculateDepartmentAverage(departmentId: string): Promise<number> {
  const subjects = await prisma.subject.findMany({
    where: { departmentId },
    include: { grades: true },
  });

  if (subjects.length === 0) return 0;

  const subjectAverages = await Promise.all(
    subjects.map((subject) => calculateSubjectAverage(subject.id))
  );

  const validAverages = subjectAverages.filter((avg) => avg > 0);
  if (validAverages.length === 0) return 0;

  const sum = validAverages.reduce((acc, avg) => acc + avg, 0);
  return Math.round((sum / validAverages.length) * 100) / 100;
}

/**
 * Calculate the general average for a student across all their subjects
 */
export async function calculateGeneralAverage(studentId: string): Promise<number> {
  const grades = await prisma.grade.findMany({
    where: { studentId },
  });

  if (grades.length === 0) return 0;

  const normalizedGrades = grades.map((grade) =>
    normalizeGrade(decimalToNumber(grade.value), decimalToNumber(grade.maxValue))
  );

  const sum = normalizedGrades.reduce((acc, grade) => acc + grade, 0);
  return Math.round((sum / normalizedGrades.length) * 100) / 100;
}

/**
 * Calculate average for a student in a specific subject
 */
export async function calculateStudentSubjectAverage(
  studentId: string,
  subjectId: string
): Promise<number> {
  const grades = await prisma.grade.findMany({
    where: {
      studentId,
      subjectId,
    },
  });

  if (grades.length === 0) return 0;

  const normalizedGrades = grades.map((grade) =>
    normalizeGrade(decimalToNumber(grade.value), decimalToNumber(grade.maxValue))
  );

  const sum = normalizedGrades.reduce((acc, grade) => acc + grade, 0);
  return Math.round((sum / normalizedGrades.length) * 100) / 100;
}

/**
 * Get list of subjects where a student is enrolled but has no grades
 */
export async function getMissingGrades(studentId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: {
      subject: true,
    },
  });

  const subjectsWithoutGrades = [];

  for (const enrollment of enrollments) {
    const gradeCount = await prisma.grade.count({
      where: {
        studentId,
        subjectId: enrollment.subjectId,
      },
    });

    if (gradeCount === 0) {
      subjectsWithoutGrades.push(enrollment.subject);
    }
  }

  return subjectsWithoutGrades;
}

/**
 * Get detailed grade statistics for a subject
 */
export async function getSubjectStatistics(subjectId: string) {
  const grades = await prisma.grade.findMany({
    where: { subjectId },
  });

  if (grades.length === 0) {
    return {
      average: 0,
      min: 0,
      max: 0,
      count: 0,
    };
  }

  const normalizedGrades = grades.map((grade) =>
    normalizeGrade(decimalToNumber(grade.value), decimalToNumber(grade.maxValue))
  );

  const average = normalizedGrades.reduce((acc, grade) => acc + grade, 0) / normalizedGrades.length;
  const min = Math.min(...normalizedGrades);
  const max = Math.max(...normalizedGrades);

  return {
    average: Math.round(average * 100) / 100,
    min: Math.round(min * 100) / 100,
    max: Math.round(max * 100) / 100,
    count: grades.length,
  };
}

/**
 * Get student rank in a subject
 */
export async function getStudentRankInSubject(
  studentId: string,
  subjectId: string
): Promise<{ rank: number; total: number } | null> {
  const enrollments = await prisma.enrollment.findMany({
    where: { subjectId },
    select: { studentId: true },
  });

  const studentAverages = await Promise.all(
    enrollments.map(async (enrollment) => ({
      studentId: enrollment.studentId,
      average: await calculateStudentSubjectAverage(enrollment.studentId, subjectId),
    }))
  );

  // Filter students with grades and sort by average descending
  const rankedStudents = studentAverages
    .filter((s) => s.average > 0)
    .sort((a, b) => b.average - a.average);

  const rank = rankedStudents.findIndex((s) => s.studentId === studentId) + 1;

  if (rank === 0) return null;

  return {
    rank,
    total: rankedStudents.length,
  };
}
