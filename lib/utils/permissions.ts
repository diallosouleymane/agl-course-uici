import { UserRole } from '../generated/prisma';
import { prisma } from '../prisma';

export interface UserWithRole {
  id: string;
  role: UserRole;
}

/**
 * Check if user can manage colleges (ADMIN only)
 */
export function canManageColleges(user: UserWithRole | null): boolean {
  return user?.role === UserRole.ADMIN;
}

/**
 * Check if user can manage a specific department
 * ADMIN can manage all departments
 * DEPARTMENT_HEAD can manage their own department
 */
export async function canManageDepartment(
  user: UserWithRole | null,
  departmentId: string
): Promise<boolean> {
  if (!user) return false;

  if (user.role === UserRole.ADMIN) {
    return true;
  }

  if (user.role === UserRole.DEPARTMENT_HEAD) {
    // Check if user is the head of this department
    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id },
      include: { headOfDepartment: true },
    });

    return teacher?.headOfDepartment?.id === departmentId;
  }

  return false;
}

/**
 * Check if user can manage teachers in a department
 * ADMIN can manage all teachers
 * DEPARTMENT_HEAD can manage teachers in their department
 */
export async function canManageTeachers(
  user: UserWithRole | null,
  departmentId?: string
): Promise<boolean> {
  if (!user) return false;

  if (user.role === UserRole.ADMIN) {
    return true;
  }

  if (user.role === UserRole.DEPARTMENT_HEAD && departmentId) {
    return await canManageDepartment(user, departmentId);
  }

  return false;
}

/**
 * Check if user can manage students
 * ADMIN can manage all students
 * DEPARTMENT_HEAD can view students but typically not manage them
 */
export function canManageStudents(user: UserWithRole | null): boolean {
  return user?.role === UserRole.ADMIN;
}

/**
 * Check if user can manage subjects
 * ADMIN can manage all subjects
 * DEPARTMENT_HEAD can manage subjects in their department
 */
export async function canManageSubjects(
  user: UserWithRole | null,
  departmentId?: string
): Promise<boolean> {
  if (!user) return false;

  if (user.role === UserRole.ADMIN) {
    return true;
  }

  if (user.role === UserRole.DEPARTMENT_HEAD && departmentId) {
    return await canManageDepartment(user, departmentId);
  }

  return false;
}

/**
 * Check if user can manage classrooms
 * ADMIN only
 */
export function canManageClassrooms(user: UserWithRole | null): boolean {
  return user?.role === UserRole.ADMIN;
}

/**
 * Check if user can manage grades
 * ADMIN can manage all grades
 * DEPARTMENT_HEAD can manage grades in their department
 */
export async function canManageGrades(
  user: UserWithRole | null,
  departmentId?: string
): Promise<boolean> {
  if (!user) return false;

  if (user.role === UserRole.ADMIN) {
    return true;
  }

  if (user.role === UserRole.DEPARTMENT_HEAD && departmentId) {
    return await canManageDepartment(user, departmentId);
  }

  return false;
}

/**
 * Check if user can view reports
 * ADMIN can view all reports
 * DEPARTMENT_HEAD can view reports for their department
 */
export async function canViewReports(
  user: UserWithRole | null,
  departmentId?: string
): Promise<boolean> {
  if (!user) return false;

  if (user.role === UserRole.ADMIN) {
    return true;
  }

  if (user.role === UserRole.DEPARTMENT_HEAD) {
    if (!departmentId) return true; // Can view general reports
    return await canManageDepartment(user, departmentId);
  }

  return false;
}

/**
 * Get user's department if they are a department head
 */
export async function getUserDepartment(userId: string): Promise<string | null> {
  const teacher = await prisma.teacher.findUnique({
    where: { userId },
    include: { headOfDepartment: true },
  });

  return teacher?.headOfDepartment?.id || null;
}
