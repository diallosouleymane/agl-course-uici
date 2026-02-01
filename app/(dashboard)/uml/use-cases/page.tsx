import { DiagramViewer } from '@/components/uml/diagram-viewer';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { redirect } from 'next/navigation';

const useCaseDiagram = `
graph TD
    Admin[👤 Administrateur]
    DeptHead[👤 Responsable Département]

    Admin --> UC1[Gérer Collèges]
    Admin --> UC2[Gérer Départements]
    Admin --> UC3[Gérer Salles de Classe]
    Admin --> UC4[Gérer Matières]
    Admin --> UC5[Gérer Enseignants]
    Admin --> UC6[Gérer Étudiants]
    Admin --> UC7[Gérer Notes]
    Admin --> UC8[Consulter Rapports]

    DeptHead --> UC9[Gérer Enseignants Département]
    DeptHead --> UC10[Gérer Matières Département]
    DeptHead --> UC11[Saisir Notes Département]
    DeptHead --> UC12[Consulter Rapports Département]

    UC1 -.include.-> UC13[Créer]
    UC1 -.include.-> UC14[Modifier]
    UC1 -.include.-> UC15[Supprimer]
    UC1 -.include.-> UC16[Consulter]

    UC7 -.extend.-> UC17[Calculer Moyennes]
    UC7 -.extend.-> UC18[Normaliser Notes]
`;

export default async function UseCasesPage() {
  const { authorized } = await requireRole([UserRole.ADMIN, UserRole.DEPARTMENT_HEAD]);

  if (!authorized) {
    redirect('/unauthorized');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Diagrammes de Cas d'Utilisation</h1>
        <p className="text-gray-600 mt-2">
          Vue d'ensemble des interactions entre acteurs et système
        </p>
      </div>

      <DiagramViewer diagram={useCaseDiagram} />

      <div className="space-y-6 mt-8">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Acteurs Principaux</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-600 mb-2">Administrateur</h4>
              <p className="text-sm text-gray-700">
                Gestion complète du système: collèges, départements, salles, matières,
                enseignants, étudiants, notes et rapports.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-green-600 mb-2">Responsable de Département</h4>
              <p className="text-sm text-gray-700">
                Gestion limitée à son département: enseignants, matières, saisie de notes
                et consultation de rapports.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Cas d'Utilisation Détaillés</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">UC1 - Gérer Collèges</h4>
              <p className="text-sm text-gray-700">
                L'administrateur peut créer, modifier, supprimer et consulter les collèges.
                La suppression est impossible si le collège contient des départements.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">UC5 - Gérer Enseignants</h4>
              <p className="text-sm text-gray-700">
                L'administrateur crée un enseignant en l'assignant à un département et UNE matière.
                Un compte utilisateur peut être créé automatiquement.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">UC7 - Gérer Notes</h4>
              <p className="text-sm text-gray-700">
                Saisie de notes pour les étudiants. Le système vérifie que l'étudiant est inscrit
                à la matière et que value ≤ maxValue. Calcul automatique des moyennes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
