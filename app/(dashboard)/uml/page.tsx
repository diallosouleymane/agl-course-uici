import Link from 'next/link';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, GitBranch, Box, Workflow } from 'lucide-react';

export default async function UMLPage() {
  const { authorized } = await requireRole([UserRole.ADMIN, UserRole.DEPARTMENT_HEAD]);

  if (!authorized) {
    redirect('/unauthorized');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Diagrammes UML</h1>
        <p className="text-gray-600 mt-2">
          Documentation technique et modélisation du système
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GitBranch className="h-6 w-6 text-blue-600" />
              <CardTitle>Diagrammes de Cas d'Utilisation</CardTitle>
            </div>
            <CardDescription>
              Cas d'utilisation globaux et spécifiques par acteur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Visualisez les interactions entre les acteurs (Admin, Responsable de département)
              et le système.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/uml/use-cases">Voir les cas d'utilisation</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Workflow className="h-6 w-6 text-green-600" />
              <CardTitle>Diagrammes de Séquence</CardTitle>
            </div>
            <CardDescription>
              Flux de traitement et interactions détaillées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Parcourez les séquences d'exécution pour les opérations principales
              (connexion, création, calculs).
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/uml/sequence">Voir les séquences</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Box className="h-6 w-6 text-purple-600" />
              <CardTitle>Diagramme de Classes</CardTitle>
            </div>
            <CardDescription>
              Structure de la base de données et relations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Modèle complet avec 9 entités, leurs attributs et les relations entre elles.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/uml/class">Voir le diagramme de classes</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-orange-600" />
              <CardTitle>Scénarios Textuels</CardTitle>
            </div>
            <CardDescription>
              Descriptions détaillées des cas d'utilisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Scénarios nominaux et alternatifs pour chaque cas d'utilisation principal.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/uml/scenarios">Voir les scénarios</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
