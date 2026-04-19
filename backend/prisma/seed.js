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

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

  if (existing) {
    if (existing.role === 'admin') {
      console.log(`✅ Админ уже существует: ${ADMIN_EMAIL}`);
    } else {
      console.log(`⚠️  Пользователь ${ADMIN_EMAIL} существует, но роль: ${existing.role}. Обновляю до admin...`);
      await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: { role: 'admin', isVerified: true },
      });
      console.log('✅ Роль обновлена до admin.');
    }
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await prisma.user.create({
    data: {
      name:       ADMIN_NAME,
      email:      ADMIN_EMAIL,
      password:   hashedPassword,
      role:       'admin',
      isVerified: true,
    },
  });

  console.log('✅ Администратор создан:');
  console.log(`   Email:    ${admin.email}`);
  console.log(`   Пароль:   ${ADMIN_PASSWORD}`);
  console.log(`   ID:       ${admin.id}`);
  console.log('');
  console.log('⚠️  Смените пароль после первого входа!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при создании администратора:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
