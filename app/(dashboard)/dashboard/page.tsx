import { getSession } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, Building2, BookOpen, DoorOpen, FileText, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

async function getStats() {
  const [
    collegesCount,
    departmentsCount,
    teachersCount,
    studentsCount,
    subjectsCount,
    classroomsCount,
    gradesCount,
  ] = await Promise.all([
    prisma.college.count(),
    prisma.department.count(),
    prisma.teacher.count(),
    prisma.student.count(),
    prisma.subject.count(),
    prisma.classroom.count(),
    prisma.grade.count(),
  ]);

  return {
    collegesCount,
    departmentsCount,
    teachersCount,
    studentsCount,
    subjectsCount,
    classroomsCount,
    gradesCount,
  };
}

export default async function DashboardPage() {
  const session = await getSession();
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Bienvenue, {session?.user.name || 'Utilisateur'}
        </h1>
        <p className="text-gray-600 mt-2">
          Vue d'ensemble du système de gestion académique
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collèges</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.collegesCount}</div>
            <p className="text-xs text-muted-foreground">
              Établissements enregistrés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Départements</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.departmentsCount}</div>
            <p className="text-xs text-muted-foreground">
              Départements actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enseignants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teachersCount}</div>
            <p className="text-xs text-muted-foreground">
              Enseignants actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Étudiants</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.studentsCount}</div>
            <p className="text-xs text-muted-foreground">
              Étudiants inscrits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matières</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.subjectsCount}</div>
            <p className="text-xs text-muted-foreground">
              Matières enseignées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salles</CardTitle>
            <DoorOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.classroomsCount}</div>
            <p className="text-xs text-muted-foreground">
              Salles de classe
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notes</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.gradesCount}</div>
            <p className="text-xs text-muted-foreground">
              Notes enregistrées
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">État Système</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">✓ Opérationnel</div>
            <p className="text-xs text-blue-700">
              Tous les services actifs
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Accès Rapides</CardTitle>
            <CardDescription>
              Actions fréquemment utilisées
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {session?.user.role === 'ADMIN' && (
              <>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/colleges/new">
                    <Building2 className="mr-2 h-4 w-4" />
                    Nouveau collège
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/students/new">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Nouvel étudiant
                  </Link>
                </Button>
              </>
            )}
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/grades/new">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Saisir une note
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/reports">
                <FileText className="mr-2 h-4 w-4" />
                Consulter les rapports
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documentation</CardTitle>
            <CardDescription>
              Ressources et guides
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/uml">
                <FileText className="mr-2 h-4 w-4" />
                Diagrammes UML
              </Link>
            </Button>
            <div className="pt-4 text-sm text-gray-600 space-y-1">
              <p>📚 README.md - Vue d'ensemble</p>
              <p>🔧 INSTALLATION.md - Guide PostgreSQL</p>
              <p>📋 TODO.md - Tâches à faire</p>
              <p>🏗️ ARCHITECTURE.md - Notes techniques</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>État d'Implémentation</CardTitle>
          <CardDescription>
            Fonctionnalités disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">✓ Fonctionnel</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Authentification complète</li>
                <li>• Gestion des collèges</li>
                <li>• Gestion des départements</li>
                <li>• Backend complet (CRUD)</li>
                <li>• Calculs de moyennes</li>
                <li>• Diagrammes UML</li>
                <li>• Protection RBAC</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-amber-600">⚠ En Développement</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Interface salles de classe</li>
                <li>• Interface matières</li>
                <li>• Interface enseignants</li>
                <li>• Interface étudiants</li>
                <li>• Interface notes</li>
                <li>• Rapports graphiques</li>
                <li>• Fiches signalétiques</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
