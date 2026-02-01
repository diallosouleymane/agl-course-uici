import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { getCollege } from '@/lib/actions/colleges';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, ExternalLink, Building2 } from 'lucide-react';

interface CollegePageProps {
  params: Promise<{ id: string }>;
}

export default async function CollegePage({ params }: CollegePageProps) {
  const { authorized } = await requireRole([UserRole.ADMIN]);

  if (!authorized) {
    redirect('/unauthorized');
  }

  const { id } = await params;
  const college = await getCollege(id);

  if (!college) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{college.name}</h1>
          <p className="text-gray-600 mt-2">Détails du collège</p>
        </div>
        <Button asChild>
          <Link href={`/colleges/${id}/edit`}>
            <Pencil className="h-4 w-4 mr-2" />
            Modifier
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations Générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Nom</p>
              <p className="font-medium">{college.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Site web</p>
              {college.websiteUrl ? (
                <a
                  href={college.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  {college.websiteUrl}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <p className="text-gray-400">Non renseigné</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Date de création</p>
              <p className="font-medium">
                {new Date(college.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">Départements</span>
              </div>
              <span className="text-2xl font-bold">{college.departments.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Départements</CardTitle>
          <CardDescription>
            Liste des départements de ce collège
          </CardDescription>
        </CardHeader>
        <CardContent>
          {college.departments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucun département pour ce collège
            </p>
          ) : (
            <div className="space-y-2">
              {college.departments.map((dept) => (
                <div
                  key={dept.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{dept.name}</p>
                    <p className="text-sm text-gray-600">
                      {dept._count.teachers} enseignant(s) • {dept._count.subjects} matière(s)
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/departments/${dept.id}`}>Voir</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
