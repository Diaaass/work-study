/**
 * Seed script — создаёт администратора если его ещё нет в БД.
 * Запуск: node prisma/seed.js
 *   или:  npx prisma db seed
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@workstud.kz';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';
const ADMIN_NAME     = process.env.ADMIN_NAME     || 'Администратор';

const TEST_STUDENT = {
  email:      'student@workstud.kz',
  password:   'Student123!',
  name:       'Ян Невский',
  university: 'Astana IT University',
  major:      'Software Engineering',
  phone:      '+7 (777) 123-4567',
  skills:     ['JavaScript', 'React', 'Node.js', 'TypeScript'],
};

async function main() {
  // Admin
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

  if (existing) {
    if (existing.role === 'admin') {
      console.log(`✅ Админ уже существует: ${ADMIN_EMAIL}`);
    } else {
      await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: { role: 'admin', isVerified: true },
      });
      console.log('✅ Роль обновлена до admin.');
    }
  } else {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const admin = await prisma.user.create({
      data: {
        name: ADMIN_NAME, email: ADMIN_EMAIL,
        password: hashedPassword, role: 'admin', isVerified: true,
      },
    });
    console.log('✅ Администратор создан:');
    console.log(`   Email:    ${admin.email}`);
    console.log(`   Пароль:   ${ADMIN_PASSWORD}`);
    console.log('');
    console.log('⚠️  Смените пароль после первого входа!');
  }

  // Test student
  const existingStudent = await prisma.user.findUnique({ where: { email: TEST_STUDENT.email } });
  if (!existingStudent) {
    const hashed = await bcrypt.hash(TEST_STUDENT.password, 10);
    await prisma.user.create({
      data: {
        name: TEST_STUDENT.name,
        email: TEST_STUDENT.email,
        password: hashed,
        role: 'student',
        isVerified: true,
        university: TEST_STUDENT.university,
        major: TEST_STUDENT.major,
        phone: TEST_STUDENT.phone,
        skills: TEST_STUDENT.skills,
      },
    });
    console.log('✅ Тестовый студент создан:');
    console.log(`   Email:    ${TEST_STUDENT.email}`);
    console.log(`   Пароль:   ${TEST_STUDENT.password}`);
  } else {
    console.log(`✅ Тестовый студент уже существует: ${TEST_STUDENT.email}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при создании администратора:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
