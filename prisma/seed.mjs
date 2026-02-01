import 'dotenv/config';
import pg from 'pg';
import { hashPassword } from 'better-auth/crypto';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function query(sql, params = []) {
  const res = await pool.query(sql, params);
  return res.rows;
}

function cuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function upsertUser(email, name, password, role) {
  const hashed = await hashPassword(password);
  const userId = cuid();
  const rows = await query(
    `INSERT INTO "user" (id, email, name, password, "emailVerified", role, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, true, $5, now(), now())
     ON CONFLICT (email) DO UPDATE SET password = $4
     RETURNING id, email`,
    [userId, email, name, hashed, role]
  );
  const user = rows[0];
  const accountId = cuid();
  // Create Account entry for credential provider (required by better-auth)
  await query(
    `INSERT INTO "account" (id, "userId", provider, "providerAccountId", "accountId", "providerId", password, "createdAt", "updatedAt")
     VALUES ($1, $2, 'credential', $3, $4, 'credential', $5, now(), now())
     ON CONFLICT (provider, "providerAccountId") DO NOTHING`,
    [accountId, user.id, user.id, accountId, hashed]
  );
  return user;
}

async function main() {
  console.log('Starting seed...');

  // Admin
  const admin = await upsertUser('admin@school.com', 'Administrateur', 'admin123', 'ADMIN');
  console.log('Admin:', admin.email);

  // Colleges
  await query(`INSERT INTO "College" (id, name, "websiteUrl", "createdAt", "updatedAt") VALUES ($1, $2, $3, now(), now()) ON CONFLICT (id) DO NOTHING`,
    ['college-1', 'Ecole Superieure de Technologie', 'https://est.example.com']);
  await query(`INSERT INTO "College" (id, name, "websiteUrl", "createdAt", "updatedAt") VALUES ($1, $2, $3, now(), now()) ON CONFLICT (id) DO NOTHING`,
    ['college-2', 'Institut des Sciences Appliquees', 'https://isa.example.com']);
  console.log('Colleges created');

  // Departments
  await query(`INSERT INTO "Department" (id, name, "collegeId", "createdAt", "updatedAt") VALUES ($1, $2, $3, now(), now()) ON CONFLICT (id) DO NOTHING`,
    ['dept-info', 'Informatique', 'college-1']);
  await query(`INSERT INTO "Department" (id, name, "collegeId", "createdAt", "updatedAt") VALUES ($1, $2, $3, now(), now()) ON CONFLICT (id) DO NOTHING`,
    ['dept-math', 'Mathematiques', 'college-1']);
  await query(`INSERT INTO "Department" (id, name, "collegeId", "createdAt", "updatedAt") VALUES ($1, $2, $3, now(), now()) ON CONFLICT (id) DO NOTHING`,
    ['dept-physics', 'Physique', 'college-2']);
  console.log('Departments created');

  // Classrooms
  await query(`INSERT INTO "Classroom" (id, name, capacity, location, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, now(), now()) ON CONFLICT (id) DO NOTHING`,
    ['room-a101', 'A101', 30, 'Batiment A, 1er etage']);
  await query(`INSERT INTO "Classroom" (id, name, capacity, location, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, now(), now()) ON CONFLICT (id) DO NOTHING`,
    ['room-a102', 'A102', 40, 'Batiment A, 1er etage']);
  await query(`INSERT INTO "Classroom" (id, name, capacity, location, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, now(), now()) ON CONFLICT (id) DO NOTHING`,
    ['room-b201', 'B201', 25, 'Batiment B, 2eme etage']);
  console.log('Classrooms created');

  // Subjects
  await query(`INSERT INTO "Subject" (id, code, name, "classroomId", "departmentId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, now(), now()) ON CONFLICT (code) DO NOTHING`,
    ['sub-algo', 'INFO-101', 'Algorithmique et Structures de Donnees', 'room-a101', 'dept-info']);
  await query(`INSERT INTO "Subject" (id, code, name, "classroomId", "departmentId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, now(), now()) ON CONFLICT (code) DO NOTHING`,
    ['sub-web', 'INFO-201', 'Developpement Web', 'room-a102', 'dept-info']);
  await query(`INSERT INTO "Subject" (id, code, name, "classroomId", "departmentId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, now(), now()) ON CONFLICT (code) DO NOTHING`,
    ['sub-calc', 'MATH-101', 'Calcul Differentiel et Integral', 'room-b201', 'dept-math']);
  console.log('Subjects created');

  // Teachers
  const teacherUser1 = await upsertUser('j.dupont@school.com', 'Jean Dupont', 'teacher123', 'TEACHER');
  const teacherUser2 = await upsertUser('m.martin@school.com', 'Marie Martin', 'teacher123', 'DEPARTMENT_HEAD');
  console.log('Teacher users created');

  const [teacher1] = await query(
    `INSERT INTO "Teacher" (id, "userId", nom, prenom, tel, mail, "dateFunction", indice, "departmentId", "subjectId", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now(), now())
     ON CONFLICT ("userId") DO UPDATE SET nom = $3
     RETURNING id`,
    ['teacher-1', teacherUser1.id, 'Dupont', 'Jean', '+33612345678', 'j.dupont@school.com', '2020-09-01', 'A500', 'dept-info', 'sub-algo']
  );

  const [teacher2] = await query(
    `INSERT INTO "Teacher" (id, "userId", nom, prenom, tel, mail, "dateFunction", indice, "departmentId", "subjectId", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now(), now())
     ON CONFLICT ("userId") DO UPDATE SET nom = $3
     RETURNING id`,
    ['teacher-2', teacherUser2.id, 'Martin', 'Marie', '+33687654321', 'm.martin@school.com', '2018-09-01', 'A650', 'dept-info', 'sub-web']
  );
  console.log('Teachers created');

  await query(`UPDATE "Department" SET "headTeacherId" = $1 WHERE id = 'dept-info'`, [teacher2.id]);
  console.log('Department head assigned');

  // Students
  const studentUser1 = await upsertUser('p.bernard@student.com', 'Pierre Bernard', 'student123', 'STUDENT');
  const studentUser2 = await upsertUser('s.dubois@student.com', 'Sophie Dubois', 'student123', 'STUDENT');

  const [student1] = await query(
    `INSERT INTO "Student" (id, "userId", nom, prenom, tel, mail, "anneeEntree", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, now(), now())
     ON CONFLICT ("userId") DO UPDATE SET nom = $3
     RETURNING id`,
    ['student-1', studentUser1.id, 'Bernard', 'Pierre', '+33698765432', 'p.bernard@student.com', 2023]
  );

  const [student2] = await query(
    `INSERT INTO "Student" (id, "userId", nom, prenom, tel, mail, "anneeEntree", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, now(), now())
     ON CONFLICT ("userId") DO UPDATE SET nom = $3
     RETURNING id`,
    ['student-2', studentUser2.id, 'Dubois', 'Sophie', '+33623456789', 's.dubois@student.com', 2023]
  );
  console.log('Students created');

  // Enrollments
  await query(`INSERT INTO "Enrollment" (id, "studentId", "subjectId", "enrolledAt") VALUES ($1, $2, $3, now()) ON CONFLICT ("studentId", "subjectId") DO NOTHING`,
    ['enroll-1', student1.id, 'sub-algo']);
  await query(`INSERT INTO "Enrollment" (id, "studentId", "subjectId", "enrolledAt") VALUES ($1, $2, $3, now()) ON CONFLICT ("studentId", "subjectId") DO NOTHING`,
    ['enroll-2', student1.id, 'sub-web']);
  await query(`INSERT INTO "Enrollment" (id, "studentId", "subjectId", "enrolledAt") VALUES ($1, $2, $3, now()) ON CONFLICT ("studentId", "subjectId") DO NOTHING`,
    ['enroll-3', student2.id, 'sub-algo']);
  console.log('Enrollments created');

  // Grades
  await query(`INSERT INTO "Grade" (id, "studentId", "subjectId", value, "maxValue", date, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, now(), now()) ON CONFLICT DO NOTHING`,
    ['grade-1', student1.id, 'sub-algo', 16.5, 20, '2024-11-15']);
  await query(`INSERT INTO "Grade" (id, "studentId", "subjectId", value, "maxValue", date, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, now(), now()) ON CONFLICT DO NOTHING`,
    ['grade-2', student1.id, 'sub-web', 14, 20, '2024-11-20']);
  await query(`INSERT INTO "Grade" (id, "studentId", "subjectId", value, "maxValue", date, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, now(), now()) ON CONFLICT DO NOTHING`,
    ['grade-3', student2.id, 'sub-algo', 18, 20, '2024-11-15']);
  console.log('Grades created');

  console.log('\nSeed completed!');
  console.log('\nComptes de test:');
  console.log('  Admin:     admin@school.com / admin123');
  console.log('  Teacher:   j.dupont@school.com / teacher123');
  console.log('  Dept Head: m.martin@school.com / teacher123');
  console.log('  Student:   p.bernard@student.com / student123');
  console.log('  Student:   s.dubois@student.com / student123');
}

main()
  .catch(e => { console.error('Error:', e); process.exit(1); })
  .finally(() => pool.end());
