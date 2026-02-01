import { headers } from 'next/headers';
import { auth } from './auth';
import { UserRole } from './generated/prisma';

export async function getSession() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: new Headers(headersList),
    });
    return session;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  return session;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await getSession();

  if (!session) {
    return { authorized: false, session: null };
  }

  const userRole = session.user.role as UserRole;

  if (!allowedRoles.includes(userRole)) {
    return { authorized: false, session };
  }

  return { authorized: true, session };
}
