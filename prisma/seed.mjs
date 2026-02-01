import 'dotenv/config';
import pg from 'pg';
import crypto from 'node:crypto';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function hashPwd(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function query(sql, params = []) {
  const res = await pool.query(sql, params);
  return res.rows;
}

async function upsertUser(email, name, password, role) {
  const hashed = await hashPwd(password);
  const rows = await query(
    `INSERT INTO "User" (id, email, name, password, "emailVerified", role, "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, true, $4, now(), now())
     ON CONFLICT (email) DO UPDATE SET name = $2
     RETURNING id, email`,
    [email, name, hashed, role]
  );
  return rows[0];
}

async function main() {
  console.log('🌱 Starting seed...');

  // Admin
  const admin = await upsertUser('admin@school.com', 'Administrateur', 'admin123', 'ADMIN');
  console.log('✅ Admin:', admin.email);

  // Colleges
  await query(`INSERT INTO "College" (id, name, "websiteUrl", "createdAt", "updatedAt") VALUES ($1, $2, $3, now(), now()) ON CONFLICT (id) DO NOTHING`,
    ['college-1', 'École Supérieure de Technologie', 'https://est.example.com']);
  await query(`INSERT INTO "College" (id, name, "websiteUrl", "createdAt", "updatedAt") VALUES ($1, $2, $3, now(), now()) ON CONFLICT (id) DO NOTHING`,
    ['college-2', 'Institut des Sciences Appliquées', 'https://isa.example.com']);
  console.log('✅ Colleges created');

  // Departments
  await query(`INSERT INTO "Department" (id, name, "collegeId", "createdAt", "updatedAt") VALUES ($1, $2, $3, now(), now()) ON CONFLICT (id) DO NOTHING`,
    ['dept-info', 'Informatique', 'college-1']);
  await query(`INSERT INTO "Department" (id, name, "collegeId", "createdAt", "updatedAt") VALUES ($1, $2, $3, now(), now()) ON CONFLICT (id) DO NOTHING`,
    ['dept-math', 'Mathématiques', 'college-1']);
  await query(`INSERT INTO "Department" (id, name, "collegeId", "createdAt", "updatedAt") VALUES ($1, $2, $3, now(), now()) ON CONFLICT (id) DO NOTHING`,
    ['dept-physics', 'Physique', 'college-2']);
  console.log('✅ Departments created');

  // Classrooms
  await query(`INSERT INTO "Classroom" (id, name, capacity, location, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, now(), now()) ON CONFLICT (id) DO NOTHING`,
    ['room-a101', 'A101', 30, 'Bâtiment A, 1er étage']);
  await query(`INSERT INTO "Classroom" (id, name, capacity, location, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, now(), now()) ON CONFLICT (id) DO NOTHING`,
    ['room-a102', 'A102', 40, 'Bâtiment A, 1er étage']);
  await query(`INSERT INTO "Classroom" (id, name, capacity, location, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, now(), now()) ON CONFLICT (id) DO NOTHING`,
    ['room-b201', 'B201', 25, 'Bâtiment B, 2ème étage']);
  console.log('✅ Classrooms created');

  // Subjects
  await query(`INSERT INTO "Subject" (id, code, name, "classroomId", "departmentId", "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, now(), now()) ON CONFLICT (code) DO NOTHING`,
    ['INFO-101', 'Algorithmique et Structures de Données', 'room-a101', 'dept-info']);
  await query(`INSERT INTO "Subject" (id, code, name, "classroomId", "departmentId", "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, now(), now()) ON CONFLICT (code) DO NOTHING`,
    ['INFO-201', 'Développement Web', 'room-a102', 'dept-info']);
  await query(`INSERT INTO "Subject" (id, code, name, "classroomId", "departmentId", "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, now(), now()) ON CONFLICT (code) DO NOTHING`,
    ['MATH-101', 'Calcul Différentiel et Intégral', 'room-b201', 'dept-math']);
  console.log('✅ Subjects created');

  // Get subject IDs
  const subjects = await query(`SELECT id, code FROM "Subject"`);
  const subjectAlgo = subjects.find(s => s.code === 'INFO-101');
  const subjectWeb = subjects.find(s => s.code === 'INFO-201');

  // Teachers
  const teacherUser1 = await upsertUser('j.dupont@school.com', 'Jean Dupont', 'teacher123', 'TEACHER');
  const teacherUser2 = await upsertUser('m.martin@school.com', 'Marie Martin', 'teacher123', 'DEPARTMENT_HEAD');
  console.log('✅ Teacher users created');

  const [teacher1] = await query(
    `INSERT INTO "Teacher" (id, "userId", nom, prenom, tel, mail, "dateFunction", indice, "departmentId", "subjectId", "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, now(), now())
     ON CONFLICT ("userId") DO UPDATE SET nom = $2
     RETURNING id`,
    [teacherUser1.id, 'Dupont', 'Jean', '+33612345678', 'j.dupont@school.com', '2020-09-01', 'A500', 'dept-info', subjectAlgo.id]
  );

  const [teacher2] = await query(
    `INSERT INTO "Teacher" (id, "userId", nom, prenom, tel, mail, "dateFunction", indice, "departmentId", "subjectId", "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, now(), now())
     ON CONFLICT ("userId") DO UPDATE SET nom = $2
     RETURNING id`,
    [teacherUser2.id, 'Martin', 'Marie', '+33687654321', 'm.martin@school.com', '2018-09-01', 'A650', 'dept-info', subjectWeb.id]
  );
  console.log('✅ Teachers created');

  // Set department head
  await query(`UPDATE "Department" SET "headTeacherId" = $1 WHERE id = 'dept-info'`, [teacher2.id]);
  console.log('✅ Department head assigned');

  // Students
  const studentUser1 = await upsertUser('p.bernard@student.com', 'Pierre Bernard', 'student123', 'STUDENT');
  const studentUser2 = await upsertUser('s.dubois@student.com', 'Sophie Dubois', 'student123', 'STUDENT');

  const [student1] = await query(
    `INSERT INTO "Student" (id, "userId", nom, prenom, tel, mail, "anneeEntree", "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, now(), now())
     ON CONFLICT ("userId") DO UPDATE SET nom = $2
     RETURNING id`,
    [studentUser1.id, 'Bernard', 'Pierre', '+33698765432', 'p.bernard@student.com', 2023]
  );

  const [student2] = await query(
    `INSERT INTO "Student" (id, "userId", nom, prenom, tel, mail, "anneeEntree", "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, now(), now())
     ON CONFLICT ("userId") DO UPDATE SET nom = $2
     RETURNING id`,
    [studentUser2.id, 'Dubois', 'Sophie', '+33623456789', 's.dubois@student.com', 2023]
  );
  console.log('✅ Students created');

  // Enrollments
  await query(`INSERT INTO "Enrollment" (id, "studentId", "subjectId", "enrolledAt") VALUES (gen_random_uuid(), $1, $2, now()) ON CONFLICT ("studentId", "subjectId") DO NOTHING`,
    [student1.id, subjectAlgo.id]);
  await query(`INSERT INTO "Enrollment" (id, "studentId", "subjectId", "enrolledAt") VALUES (gen_random_uuid(), $1, $2, now()) ON CONFLICT ("studentId", "subjectId") DO NOTHING`,
    [student1.id, subjectWeb.id]);
  await query(`INSERT INTO "Enrollment" (id, "studentId", "subjectId", "enrolledAt") VALUES (gen_random_uuid(), $1, $2, now()) ON CONFLICT ("studentId", "subjectId") DO NOTHING`,
    [student2.id, subjectAlgo.id]);
  console.log('✅ Enrollments created');

  // Grades
  await query(`INSERT INTO "Grade" (id, "studentId", "subjectId", value, "maxValue", date, "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, now()) ON CONFLICT DO NOTHING`,
    [student1.id, subjectAlgo.id, 16.5, 20, '2024-11-15']);
  await query(`INSERT INTO "Grade" (id, "studentId", "subjectId", value, "maxValue", date, "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, now()) ON CONFLICT DO NOTHING`,
    [student1.id, subjectWeb.id, 14, 20, '2024-11-20']);
  await query(`INSERT INTO "Grade" (id, "studentId", "subjectId", value, "maxValue", date, "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, now()) ON CONFLICT DO NOTHING`,
    [student2.id, subjectAlgo.id, 18, 20, '2024-11-15']);
  console.log('✅ Grades created');

  console.log('\n🎉 Seed completed!');
  console.log('\n📋 Comptes de test:');
  console.log('  Admin:     admin@school.com / admin123');
  console.log('  Teacher:   j.dupont@school.com / teacher123');
  console.log('  Dept Head: m.martin@school.com / teacher123');
  console.log('  Student:   p.bernard@student.com / student123');
  console.log('  Student:   s.dubois@student.com / student123');
}

main()
  .catch(e => { console.error('❌ Error:', e); process.exit(1); })
  .finally(() => pool.end());
