import { prisma } from '../lib/prisma';
import { UserRole } from '../lib/generated/prisma/client';
import { hashPassword } from 'better-auth/crypto';

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const hashedPassword = await hashPassword('admin123');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@school.com' },
    update: {},
    create: {
      email: 'admin@school.com',
      name: 'Administrateur',
      password: hashedPassword,
      emailVerified: true,
      role: UserRole.ADMIN,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create colleges
  const college1 = await prisma.college.upsert({
    where: { id: 'college-1' },
    update: {},
    create: {
      id: 'college-1',
      name: 'École Supérieure de Technologie',
      websiteUrl: 'https://est.example.com',
    },
  });

  const college2 = await prisma.college.upsert({
    where: { id: 'college-2' },
    update: {},
    create: {
      id: 'college-2',
      name: 'Institut des Sciences Appliquées',
      websiteUrl: 'https://isa.example.com',
    },
  });

  console.log('✅ Colleges created:', college1.name, college2.name);

  // Create departments
  const deptInfo = await prisma.department.upsert({
    where: { id: 'dept-info' },
    update: {},
    create: {
      id: 'dept-info',
      name: 'Informatique',
      collegeId: college1.id,
    },
  });

  const deptMath = await prisma.department.upsert({
    where: { id: 'dept-math' },
    update: {},
    create: {
      id: 'dept-math',
      name: 'Mathématiques',
      collegeId: college1.id,
    },
  });

  const deptPhysics = await prisma.department.upsert({
    where: { id: 'dept-physics' },
    update: {},
    create: {
      id: 'dept-physics',
      name: 'Physique',
      collegeId: college2.id,
    },
  });

  console.log('✅ Departments created:', deptInfo.name, deptMath.name, deptPhysics.name);

  // Create classrooms
  const classroom1 = await prisma.classroom.upsert({
    where: { id: 'room-a101' },
    update: {},
    create: {
      id: 'room-a101',
      name: 'A101',
      capacity: 30,
      location: 'Bâtiment A, 1er étage',
    },
  });

  const classroom2 = await prisma.classroom.upsert({
    where: { id: 'room-a102' },
    update: {},
    create: {
      id: 'room-a102',
      name: 'A102',
      capacity: 40,
      location: 'Bâtiment A, 1er étage',
    },
  });

  const classroom3 = await prisma.classroom.upsert({
    where: { id: 'room-b201' },
    update: {},
    create: {
      id: 'room-b201',
      name: 'B201',
      capacity: 25,
      location: 'Bâtiment B, 2ème étage',
    },
  });

  console.log('✅ Classrooms created:', classroom1.name, classroom2.name, classroom3.name);

  // Create subjects
  const subjectAlgo = await prisma.subject.upsert({
    where: { code: 'INFO-101' },
    update: {},
    create: {
      code: 'INFO-101',
      name: 'Algorithmique et Structures de Données',
      classroomId: classroom1.id,
      departmentId: deptInfo.id,
    },
  });

  const subjectWeb = await prisma.subject.upsert({
    where: { code: 'INFO-201' },
    update: {},
    create: {
      code: 'INFO-201',
      name: 'Développement Web',
      classroomId: classroom2.id,
      departmentId: deptInfo.id,
    },
  });

  const subjectCalc = await prisma.subject.upsert({
    where: { code: 'MATH-101' },
    update: {},
    create: {
      code: 'MATH-101',
      name: 'Calcul Différentiel et Intégral',
      classroomId: classroom3.id,
      departmentId: deptMath.id,
    },
  });

  console.log('✅ Subjects created:', subjectAlgo.name, subjectWeb.name, subjectCalc.name);

  // Create teacher users
  const teacherUser1 = await prisma.user.upsert({
    where: { email: 'j.dupont@school.com' },
    update: {},
    create: {
      email: 'j.dupont@school.com',
      name: 'Jean Dupont',
      password: await hashPassword('teacher123'),
      emailVerified: true,
      role: UserRole.TEACHER,
    },
  });

  const teacherUser2 = await prisma.user.upsert({
    where: { email: 'm.martin@school.com' },
    update: {},
    create: {
      email: 'm.martin@school.com',
      name: 'Marie Martin',
      password: await hashPassword('teacher123'),
      emailVerified: true,
      role: UserRole.DEPARTMENT_HEAD,
    },
  });

  console.log('✅ Teacher users created');

  // Create teachers
  const teacher1 = await prisma.teacher.upsert({
    where: { userId: teacherUser1.id },
    update: {},
    create: {
      userId: teacherUser1.id,
      nom: 'Dupont',
      prenom: 'Jean',
      tel: '+33612345678',
      mail: 'j.dupont@school.com',
      dateFunction: new Date('2020-09-01'),
      indice: 'A500',
      departmentId: deptInfo.id,
      subjectId: subjectAlgo.id,
    },
  });

  const teacher2 = await prisma.teacher.upsert({
    where: { userId: teacherUser2.id },
    update: {},
    create: {
      userId: teacherUser2.id,
      nom: 'Martin',
      prenom: 'Marie',
      tel: '+33687654321',
      mail: 'm.martin@school.com',
      dateFunction: new Date('2018-09-01'),
      indice: 'A650',
      departmentId: deptInfo.id,
      subjectId: subjectWeb.id,
    },
  });

  console.log('✅ Teachers created:', teacher1.nom, teacher2.nom);

  // Set department head
  await prisma.department.update({
    where: { id: deptInfo.id },
    data: {
      headTeacherId: teacher2.id,
    },
  });

  console.log('✅ Department head assigned');

  // Create student users
  const studentUser1 = await prisma.user.upsert({
    where: { email: 'p.bernard@student.com' },
    update: {},
    create: {
      email: 'p.bernard@student.com',
      name: 'Pierre Bernard',
      password: await hashPassword('student123'),
      emailVerified: true,
      role: UserRole.STUDENT,
    },
  });

  const studentUser2 = await prisma.user.upsert({
    where: { email: 's.dubois@student.com' },
    update: {},
    create: {
      email: 's.dubois@student.com',
      name: 'Sophie Dubois',
      password: await hashPassword('student123'),
      emailVerified: true,
      role: UserRole.STUDENT,
    },
  });

  console.log('✅ Student users created');

  // Create students
  const student1 = await prisma.student.upsert({
    where: { userId: studentUser1.id },
    update: {},
    create: {
      userId: studentUser1.id,
      nom: 'Bernard',
      prenom: 'Pierre',
      tel: '+33698765432',
      mail: 'p.bernard@student.com',
      anneeEntree: 2023,
    },
  });

  const student2 = await prisma.student.upsert({
    where: { userId: studentUser2.id },
    update: {},
    create: {
      userId: studentUser2.id,
      nom: 'Dubois',
      prenom: 'Sophie',
      tel: '+33623456789',
      mail: 's.dubois@student.com',
      anneeEntree: 2023,
    },
  });

  console.log('✅ Students created:', student1.nom, student2.nom);

  // Create enrollments
  await prisma.enrollment.upsert({
    where: {
      studentId_subjectId: {
        studentId: student1.id,
        subjectId: subjectAlgo.id,
      },
    },
    update: {},
    create: {
      studentId: student1.id,
      subjectId: subjectAlgo.id,
    },
  });

  await prisma.enrollment.upsert({
    where: {
      studentId_subjectId: {
        studentId: student1.id,
        subjectId: subjectWeb.id,
      },
    },
    update: {},
    create: {
      studentId: student1.id,
      subjectId: subjectWeb.id,
    },
  });

  await prisma.enrollment.upsert({
    where: {
      studentId_subjectId: {
        studentId: student2.id,
        subjectId: subjectAlgo.id,
      },
    },
    update: {},
    create: {
      studentId: student2.id,
      subjectId: subjectAlgo.id,
    },
  });

  console.log('✅ Enrollments created');

  // Create some grades
  await prisma.grade.upsert({
    where: { id: 'grade-1' },
    update: {},
    create: {
      id: 'grade-1',
      studentId: student1.id,
      subjectId: subjectAlgo.id,
      value: 16.5,
      maxValue: 20,
      date: new Date('2024-11-15'),
    },
  });

  await prisma.grade.upsert({
    where: { id: 'grade-2' },
    update: {},
    create: {
      id: 'grade-2',
      studentId: student1.id,
      subjectId: subjectWeb.id,
      value: 14,
      maxValue: 20,
      date: new Date('2024-11-20'),
    },
  });

  await prisma.grade.upsert({
    where: { id: 'grade-3' },
    update: {},
    create: {
      id: 'grade-3',
      studentId: student2.id,
      subjectId: subjectAlgo.id,
      value: 18,
      maxValue: 20,
      date: new Date('2024-11-15'),
    },
  });

  console.log('✅ Grades created');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
