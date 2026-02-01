'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Building2,
  BookOpen,
  Users,
  GraduationCap,
  DoorOpen,
  FileText,
  BarChart3,
  Home,
  ClipboardList,
} from 'lucide-react';

interface AppSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

const navigationItems = [
  {
    title: 'Tableau de bord',
    href: '/dashboard',
    icon: Home,
    roles: ['ADMIN', 'DEPARTMENT_HEAD', 'TEACHER', 'STUDENT'],
  },
  {
    title: 'Collèges',
    href: '/colleges',
    icon: Building2,
    roles: ['ADMIN'],
  },
  {
    title: 'Départements',
    href: '/departments',
    icon: BookOpen,
    roles: ['ADMIN', 'DEPARTMENT_HEAD'],
  },
  {
    title: 'Salles de classe',
    href: '/classrooms',
    icon: DoorOpen,
    roles: ['ADMIN'],
  },
  {
    title: 'Matières',
    href: '/subjects',
    icon: FileText,
    roles: ['ADMIN', 'DEPARTMENT_HEAD'],
  },
  {
    title: 'Enseignants',
    href: '/teachers',
    icon: Users,
    roles: ['ADMIN', 'DEPARTMENT_HEAD'],
  },
  {
    title: 'Étudiants',
    href: '/students',
    icon: GraduationCap,
    roles: ['ADMIN'],
  },
  {
    title: 'Notes',
    href: '/grades',
    icon: ClipboardList,
    roles: ['ADMIN', 'DEPARTMENT_HEAD'],
  },
  {
    title: 'Rapports',
    href: '/reports',
    icon: BarChart3,
    roles: ['ADMIN', 'DEPARTMENT_HEAD'],
  },
];

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const userRole = user.role || 'STUDENT';

  const filteredNavigation = navigationItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold">Gestion Académique</h1>
        <p className="text-xs text-gray-400 mt-1">
          {userRole === 'ADMIN' && 'Administrateur'}
          {userRole === 'DEPARTMENT_HEAD' && 'Responsable'}
          {userRole === 'TEACHER' && 'Enseignant'}
          {userRole === 'STUDENT' && 'Étudiant'}
        </p>
      </div>

      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-400 truncate">{user.email}</p>
      </div>
    </aside>
  );
}
