/**
 * Seed script — создаёт HR-аккаунты и стажировки для демо.
 * Запуск: node prisma/seed-internships.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const HR_PASSWORD = 'Hr123456!';

async function main() {
  console.log('🌱 Создаю HR-пользователей...');

  const hrPassword = await bcrypt.hash(HR_PASSWORD, 10);

  const hrUsers = await Promise.all([
    upsertHR('hr.kaspi@workstud.kz',     'Айгерим Бекова',   'Kaspi.kz'),
    upsertHR('hr.kolesa@workstud.kz',     'Тимур Сатыбалды',  'Kolesa Group'),
    upsertHR('hr.2gis@workstud.kz',       'Дана Нурланова',   '2GIS Kazakhstan'),
    upsertHR('hr.jusan@workstud.kz',      'Алибек Джаксыбек', 'Jusan Bank'),
    upsertHR('hr.freedom@workstud.kz',    'Мадина Алимова',   'Freedom Finance'),
    upsertHR('hr.beeline@workstud.kz',    'Нурсултан Ахметов','Beeline Kazakhstan'),
  ]);

  async function upsertHR(email, name, company) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return existing;
    return prisma.user.create({
      data: { name, email, password: hrPassword, role: 'hr', company, isVerified: true },
    });
  }

  const [kaspi, kolesa, gis, jusan, freedom, beeline] = hrUsers;

  console.log('🌱 Создаю стажировки...');

  const internships = [
    // ── Kaspi.kz ────────────────────────────────────────────────────────────
    {
      title: 'Frontend-разработчик (React)',
      company: 'Kaspi.kz',
      description:
        'Kaspi.kz — крупнейшая технологическая компания Казахстана. Мы ищем студентов, увлечённых фронтенд-разработкой. Вы будете работать над реальными фичами в приложениях, которыми пользуются миллионы людей.\n\nЧто вас ждёт:\n— Разработка UI-компонентов на React\n— Code review с опытными инженерами\n— Участие в планировании спринтов\n— Менторство от Senior-разработчиков',
      requirements: ['Знание JavaScript (ES6+)', 'Базовые знания React', 'Понимание HTML/CSS', 'Умение работать с Git'],
      skills: ['React', 'JavaScript', 'TypeScript', 'Git', 'HTML', 'CSS'],
      city: 'Алматы',
      workType: 'hybrid',
      salary: 150000,
      duration: '3 месяца',
      deadline: new Date('2026-06-30'),
      postedById: kaspi.id,
    },
    {
      title: 'Backend-разработчик (Node.js)',
      company: 'Kaspi.kz',
      description:
        'Присоединяйтесь к команде бэкенд-разработки Kaspi. Вы будете работать над высоконагруженными сервисами, которые обрабатывают миллионы транзакций ежедневно.\n\nЧем предстоит заниматься:\n— Разработка REST API на Node.js\n— Оптимизация запросов к PostgreSQL\n— Написание unit и integration тестов\n— Участие в архитектурных обсуждениях',
      requirements: ['Node.js основы', 'Знание SQL', 'Понимание REST API', 'Английский — B1+'],
      skills: ['Node.js', 'PostgreSQL', 'REST API', 'Docker', 'Jest'],
      city: 'Алматы',
      workType: 'office',
      salary: 180000,
      duration: '6 месяцев',
      deadline: new Date('2026-07-15'),
      postedById: kaspi.id,
    },
    {
      title: 'Data Analyst Intern',
      company: 'Kaspi.kz',
      description:
        'Команда аналитики данных Kaspi ищет стажёра, который поможет извлекать инсайты из огромных массивов данных о транзакциях и поведении пользователей.\n\nВаши задачи:\n— Анализ данных с помощью SQL и Python\n— Построение дашбордов в Tableau\n— Подготовка отчётов для product-команд\n— A/B тестирование гипотез',
      requirements: ['SQL на уровне SELECT + JOIN', 'Python (pandas)', 'Базовая статистика', 'Внимательность к деталям'],
      skills: ['SQL', 'Python', 'Pandas', 'Tableau', 'Excel'],
      city: 'Алматы',
      workType: 'hybrid',
      salary: 130000,
      duration: '4 месяца',
      deadline: new Date('2026-05-31'),
      postedById: kaspi.id,
    },

    // ── Kolesa Group ─────────────────────────────────────────────────────────
    {
      title: 'iOS-разработчик (Swift)',
      company: 'Kolesa Group',
      description:
        'Kolesa Group — разработчик популярных маркетплейсов Kolesa.kz, Krisha.kz и Auto.kz. Наше iOS-приложение используют более 2 млн человек. Мы ищем стажёра, который хочет научиться писать качественный мобильный код.\n\nЧему вы научитесь:\n— Разработка фич в Swift и UIKit/SwiftUI\n— Работа с REST API и Combine\n— Написание unit-тестов\n— App Store publishing process',
      requirements: ['Знание Swift', 'Понимание ООП', 'Базовый UIKit или SwiftUI', 'Mac с Xcode'],
      skills: ['Swift', 'UIKit', 'SwiftUI', 'Xcode', 'Git'],
      city: 'Алматы',
      workType: 'hybrid',
      salary: 160000,
      duration: '3 месяца',
      deadline: new Date('2026-06-01'),
      postedById: kolesa.id,
    },
    {
      title: 'Android-разработчик (Kotlin)',
      company: 'Kolesa Group',
      description:
        'Присоединяйся к Android-команде Kolesa Group. Наши приложения стабильно входят в топ Google Play Казахстана.\n\nЧто предстоит:\n— Разработка на Kotlin + Jetpack Compose\n— Интеграция с REST API через Retrofit\n— Работа с архитектурным паттерном MVVM\n— Участие в code review',
      requirements: ['Kotlin основы', 'Android Studio', 'Понимание MVVM', 'Базовый английский'],
      skills: ['Kotlin', 'Android', 'Jetpack Compose', 'Retrofit', 'MVVM'],
      city: 'Алматы',
      workType: 'office',
      salary: 155000,
      duration: '3 месяца',
      deadline: new Date('2026-06-01'),
      postedById: kolesa.id,
    },
    {
      title: 'QA Engineer Intern',
      company: 'Kolesa Group',
      description:
        'Команда качества Kolesa Group приглашает стажёра. Вы будете обеспечивать качество продуктов, которыми пользуется вся страна.\n\nЗадачи:\n— Ручное тестирование web и мобильных приложений\n— Написание тест-кейсов и баг-репортов\n— Регрессионное тестирование перед релизами\n— Первые шаги в автоматизации (Playwright)',
      requirements: ['Понимание SDLC', 'Внимательность', 'Базовые знания SQL', 'Аналитическое мышление'],
      skills: ['Manual Testing', 'Jira', 'SQL', 'Postman', 'Playwright'],
      city: 'Алматы',
      workType: 'hybrid',
      salary: 110000,
      duration: '3 месяца',
      deadline: new Date('2026-07-01'),
      postedById: kolesa.id,
    },

    // ── 2GIS Kazakhstan ───────────────────────────────────────────────────────
    {
      title: 'GIS/Картографический аналитик',
      company: '2GIS Kazakhstan',
      description:
        '2GIS — городской справочник и навигатор, которому доверяют миллионы. Мы ищем стажёра в команду геоданных.\n\nЧем будете заниматься:\n— Верификация и обновление картографических данных\n— Анализ качества POI (точек интереса)\n— Работа с геоинформационными системами\n— Составление отчётов по покрытию карты',
      requirements: ['Интерес к картографии и городской среде', 'Excel/Google Sheets', 'Внимательность', 'Знание Алматы/Астаны'],
      skills: ['GIS', 'Excel', 'QGIS', 'SQL', 'Python'],
      city: 'Алматы',
      workType: 'office',
      salary: 100000,
      duration: '2 месяца',
      deadline: new Date('2026-05-15'),
      postedById: gis.id,
    },
    {
      title: 'Full-Stack разработчик (Vue.js + Python)',
      company: '2GIS Kazakhstan',
      description:
        'Команда внутренних инструментов 2GIS ищет разностороннего разработчика. Вы будете создавать инструменты для редакторов карт и аналитиков данных.\n\nЧто предстоит:\n— Разработка веб-интерфейсов на Vue.js\n— Backend на FastAPI/Python\n— Работа с геопространственными данными (PostGIS)\n— Интеграция с картографическим API',
      requirements: ['Vue.js или React', 'Python основы', 'SQL', 'Git'],
      skills: ['Vue.js', 'Python', 'FastAPI', 'PostgreSQL', 'PostGIS', 'Docker'],
      city: 'Удалённо',
      workType: 'remote',
      salary: 140000,
      duration: '4 месяца',
      deadline: new Date('2026-08-01'),
      postedById: gis.id,
    },

    // ── Jusan Bank ───────────────────────────────────────────────────────────
    {
      title: 'Финтех-аналитик (Data)',
      company: 'Jusan Bank',
      description:
        'Jusan Bank — один из крупнейших банков Казахстана с современным цифровым банкингом. Присоединяйтесь к команде аналитики и помогайте принимать решения на основе данных.\n\nВаши задачи:\n— Анализ транзакционных данных клиентов\n— Построение предиктивных моделей оттока\n— Визуализация KPI на дашбордах Power BI\n— Участие в разработке скоринговых моделей',
      requirements: ['SQL продвинутый уровень', 'Python (sklearn, pandas)', 'Статистика', 'Английский B1'],
      skills: ['SQL', 'Python', 'Machine Learning', 'Power BI', 'Statistics'],
      city: 'Астана',
      workType: 'hybrid',
      salary: 170000,
      duration: '6 месяцев',
      deadline: new Date('2026-06-15'),
      postedById: jusan.id,
    },
    {
      title: 'UX/UI Designer Intern',
      company: 'Jusan Bank',
      description:
        'Команда дизайна Jusan Bank разрабатывает интерфейсы для мобильного банка, которым пользуются миллионы клиентов. Мы ищем стажёра с горящими глазами и чувством к продукту.\n\nЧто вас ждёт:\n— Прототипирование новых фич в Figma\n— Проведение UX-исследований с пользователями\n— Участие в построении Design System\n— A/B тестирование интерфейсных решений',
      requirements: ['Figma уверенный уровень', 'Понимание UX-принципов', 'Портфолио работ', 'Насмотренность в мобильном дизайне'],
      skills: ['Figma', 'UX Research', 'Prototyping', 'Design Systems', 'Adobe XD'],
      city: 'Астана',
      workType: 'hybrid',
      salary: 120000,
      duration: '3 месяца',
      deadline: new Date('2026-07-01'),
      postedById: jusan.id,
    },
    {
      title: 'Cybersecurity Intern',
      company: 'Jusan Bank',
      description:
        'Отдел информационной безопасности Jusan Bank приглашает стажёра. Банковская сфера — одна из самых требовательных к безопасности, что делает этот опыт особенно ценным.\n\nЗадачи:\n— Мониторинг инцидентов в SIEM-системах\n— Анализ уязвимостей и пентесты\n— Разработка политик безопасности\n— Изучение OWASP и PCI DSS стандартов',
      requirements: ['Основы сетей TCP/IP', 'Linux базовый уровень', 'Интерес к ИБ', 'Английский B1+'],
      skills: ['Linux', 'Network Security', 'SIEM', 'Python', 'OWASP'],
      city: 'Астана',
      workType: 'office',
      salary: 145000,
      duration: '4 месяца',
      deadline: new Date('2026-06-30'),
      postedById: jusan.id,
    },

    // ── Freedom Finance ──────────────────────────────────────────────────────
    {
      title: 'Разработчик мобильных приложений (React Native)',
      company: 'Freedom Finance',
      description:
        'Freedom Finance — международная инвестиционная компания. Наше приложение позволяет инвестировать в акции США, Казахстана и других рынков. Ищем стажёра в мобильную команду.\n\nЗадачи:\n— Разработка фич в React Native\n— Интеграция с trading API\n— Оптимизация производительности приложения\n— Работа с real-time данными (WebSocket)',
      requirements: ['React Native или React', 'JavaScript/TypeScript', 'Понимание REST и WebSocket', 'Интерес к финтеху'],
      skills: ['React Native', 'TypeScript', 'Redux', 'WebSocket', 'REST API'],
      city: 'Алматы',
      workType: 'hybrid',
      salary: 160000,
      duration: '4 месяца',
      deadline: new Date('2026-08-15'),
      postedById: freedom.id,
    },
    {
      title: 'Intern — Финансовый аналитик',
      company: 'Freedom Finance',
      description:
        'Отдел аналитики Freedom Finance ищет стажёра с интересом к финансовым рынкам. Вы будете работать рядом с профессиональными аналитиками и изучать реальные инвестиционные процессы.\n\nЧем займётесь:\n— Анализ финансовой отчётности компаний\n— Мониторинг рынка ценных бумаг\n— Подготовка аналитических записок\n— Работа с Bloomberg Terminal',
      requirements: ['Финансы/Экономика 3+ курс', 'Excel продвинутый', 'Английский B2', 'Интерес к фондовому рынку'],
      skills: ['Excel', 'Bloomberg', 'Financial Modeling', 'Python', 'PowerPoint'],
      city: 'Алматы',
      workType: 'office',
      salary: 120000,
      duration: '3 месяца',
      deadline: new Date('2026-05-30'),
      postedById: freedom.id,
    },

    // ── Beeline Kazakhstan ───────────────────────────────────────────────────
    {
      title: 'DevOps Engineer Intern',
      company: 'Beeline Kazakhstan',
      description:
        'Beeline — один из крупнейших телеком-операторов страны. Команда DevOps управляет инфраструктурой, от которой зависит связь миллионов абонентов. Мы ищем стажёра, который хочет погрузиться в облачные технологии и автоматизацию.\n\nЧему научитесь:\n— CI/CD пайплайны (GitLab CI, Jenkins)\n— Контейнеризация с Docker и Kubernetes\n— Мониторинг (Grafana, Prometheus)\n— Работа с облаком (AWS / Yandex Cloud)',
      requirements: ['Linux уверенный пользователь', 'Bash скрипты', 'Базовый Docker', 'Английский B1'],
      skills: ['Docker', 'Kubernetes', 'Linux', 'CI/CD', 'Grafana', 'Bash'],
      city: 'Алматы',
      workType: 'hybrid',
      salary: 150000,
      duration: '4 месяца',
      deadline: new Date('2026-07-31'),
      postedById: beeline.id,
    },
    {
      title: 'Маркетолог-аналитик (Digital)',
      company: 'Beeline Kazakhstan',
      description:
        'Команда digital-маркетинга Beeline ищет аналитически мыслящего стажёра. Вы будете работать с данными рекламных кампаний и помогать оптимизировать маркетинговые расходы.\n\nЧем займётесь:\n— Анализ эффективности рекламных каналов\n— Настройка и мониторинг Google Analytics / Яндекс.Метрики\n— Подготовка отчётов по CAC, ROAS, LTV\n— A/B тестирование рекламных материалов',
      requirements: ['Google Analytics / GA4', 'Excel / Google Sheets', 'Базовый SQL будет плюсом', 'Аналитическое мышление'],
      skills: ['Google Analytics', 'SQL', 'Excel', 'Facebook Ads', 'Tableau'],
      city: 'Удалённо',
      workType: 'remote',
      salary: 100000,
      duration: '2 месяца',
      deadline: new Date('2026-05-20'),
      postedById: beeline.id,
    },
    {
      title: 'Machine Learning Engineer Intern',
      company: 'Beeline Kazakhstan',
      description:
        'Команда AI/ML Beeline разрабатывает модели для предиктивной аналитики, персонализации тарифов и антифрода. Мы ищем студента последних курсов с сильным ML-бэкграундом.\n\nЗадачи:\n— Разработка и обучение классификационных моделей\n— Feature engineering на реальных телеком-данных\n— MLOps: деплой моделей в production\n— Эксперименты в Jupyter, отчётность через MLflow',
      requirements: ['Python + scikit-learn/PyTorch', 'Математическая статистика', 'SQL', 'Английский B2'],
      skills: ['Python', 'Machine Learning', 'PyTorch', 'SQL', 'MLflow', 'Docker'],
      city: 'Астана',
      workType: 'hybrid',
      salary: 200000,
      duration: '6 месяцев',
      deadline: new Date('2026-09-01'),
      postedById: beeline.id,
    },
  ];

  let created = 0;
  for (const data of internships) {
    const exists = await prisma.internship.findFirst({
      where: { title: data.title, company: data.company },
    });
    if (!exists) {
      await prisma.internship.create({
        data: { ...data, status: 'published' },
      });
      created++;
      console.log(`  ✅ ${data.company} — ${data.title}`);
    } else {
      console.log(`  ⏭️  Уже существует: ${data.company} — ${data.title}`);
    }
  }

  console.log('');
  console.log(`✅ Готово! Создано стажировок: ${created}`);
  console.log('');
  console.log('HR-аккаунты для тестирования:');
  console.log(`  Пароль для всех: ${HR_PASSWORD}`);
  hrUsers.forEach(u => console.log(`  ${u.email}  (${u.company})`));
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
