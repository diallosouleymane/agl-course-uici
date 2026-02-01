import { DiagramViewer } from '@/components/uml/diagram-viewer';
import { requireRole } from '@/lib/auth-utils';
import { UserRole } from '@/lib/generated/prisma';
import { redirect } from 'next/navigation';

const classDiagram = `
classDiagram
    class User {
        +String id
        +String email
        +String name
        +UserRole role
        +DateTime createdAt
    }

    class College {
        +String id
        +String name
        +String websiteUrl
        +DateTime createdAt
    }

    class Department {
        +String id
        +String name
        +String collegeId
        +String headTeacherId
    }

    class Teacher {
        +String id
        +String userId
        +String nom
        +String prenom
        +String tel
        +String mail
        +DateTime dateFunction
        +String indice
        +String departmentId
        +String subjectId
    }

    class Student {
        +String id
        +String userId
        +String nom
        +String prenom
        +String tel
        +String mail
        +Int anneeEntree
    }

    class Subject {
        +String id
        +String name
        +String code
        +String classroomId
        +String departmentId
    }

    class Classroom {
        +String id
        +String name
        +Int capacity
        +String location
    }

    class Enrollment {
        +String id
        +String studentId
        +String subjectId
        +DateTime enrolledAt
    }

    class Grade {
        +String id
        +String studentId
        +String subjectId
        +Decimal value
        +Decimal maxValue
        +DateTime date
    }

    User "1" --> "0..1" Teacher : has
    User "1" --> "0..1" Student : has
    College "1" --> "*" Department : contains
    Department "1" --> "*" Teacher : employs
    Department "1" <-- "0..1" Teacher : headed by
    Department "1" --> "*" Subject : offers
    Classroom "1" --> "*" Subject : hosts
    Subject "1" --> "*" Teacher : taught by
    Subject "1" --> "*" Enrollment : has
    Subject "1" --> "*" Grade : has
    Student "1" --> "*" Enrollment : enrolled in
    Student "1" --> "*" Grade : receives
    Teacher "1" --> "1" Subject : teaches
`;

export default async function ClassDiagramPage() {
  const { authorized } = await requireRole([UserRole.ADMIN, UserRole.DEPARTMENT_HEAD]);

  if (!authorized) {
    redirect('/unauthorized');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Diagramme de Classes</h1>
        <p className="text-gray-600 mt-2">
          Modèle de données complet avec 9 entités
        </p>
      </div>

      <DiagramViewer diagram={classDiagram} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Règles de Gestion</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Un enseignant enseigne <strong>UNE seule matière</strong></li>
            <li>• Une matière se déroule toujours dans la <strong>même salle</strong></li>
            <li>• Le responsable de département doit être un <strong>enseignant du département</strong></li>
            <li>• Un étudiant peut suivre <strong>plusieurs matières</strong></li>
            <li>• Une note: <strong>value ≤ maxValue</strong></li>
            <li>• Capacité d'une salle: <strong>&gt; 0</strong></li>
            <li>• Année d'entrée: <strong>≤ année courante</strong></li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Cardinalités</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• College <strong>1 ---&gt; *</strong> Department</li>
            <li>• Department <strong>1 ---&gt; *</strong> Teacher</li>
            <li>• Department <strong>1 ---&gt; *</strong> Subject</li>
            <li>• Classroom <strong>1 ---&gt; *</strong> Subject</li>
            <li>• Teacher <strong>1 ---&gt; 1</strong> Subject (enseigne)</li>
            <li>• Student <strong>* &lt;---&gt; *</strong> Subject (via Enrollment)</li>
            <li>• Student <strong>1 ---&gt; *</strong> Grade</li>
            <li>• Subject <strong>1 ---&gt; *</strong> Grade</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
