# Work&Study

Платформа для поиска стажировок для студентов Казахстана.  
React 19 + TypeScript · Express 5 · Prisma · PostgreSQL 16 · Docker

---

## Быстрый старт (5 минут)

### Нужно установить

| Инструмент | Ссылка |
|---|---|
| **Docker Desktop** | https://www.docker.com/products/docker-desktop/ |
| Git | https://git-scm.com |

> Node.js и PostgreSQL устанавливать **не нужно** — всё запускается в контейнерах.

---

### Шаги

```bash
# 1. Клонировать репозиторий
git clone <URL_РЕПОЗИТОРИЯ>
cd work-study

# 2. Создать файл конфигурации
cp .env.example .env

# 3. Запустить проект
docker compose up --build
```

Первый запуск занимает **3–5 минут** (скачивает Node, nginx, PostgreSQL).

После успешного запуска открой браузер:

| Адрес | Что |
|---|---|
| **http://localhost** | Фронтенд (React) |
| http://localhost:8000 | API бэкенда |

> **Порт 80 должен быть свободен.** Если занят — смотри раздел «Изменить порт» ниже.

---

## Тестовые аккаунты

После запуска в БД автоматически создаются демо-данные:

| Роль | Email | Пароль |
|---|---|---|
| **Администратор** | admin@workstud.kz | Admin123! |
| HR (Kaspi.kz) | hr.kaspi@workstud.kz | Hr123456! |
| HR (Kolesa Group) | hr.kolesa@workstud.kz | Hr123456! |
| HR (2GIS) | hr.2gis@workstud.kz | Hr123456! |
| HR (Jusan Bank) | hr.jusan@workstud.kz | Hr123456! |
| HR (Freedom Finance) | hr.freedom@workstud.kz | Hr123456! |
| HR (Beeline) | hr.beeline@workstud.kz | Hr123456! |

Студентом можно зарегистрироваться через кнопку **«Регистрация»**.  
Email-подтверждение **не требуется** — аккаунт активируется сразу.

---

## Конфигурация `.env`

Файл `.env` работает из коробки без изменений.  
Опциональные сервисы — включаются по мере необходимости:

### Cloudinary (загрузка аватарок и резюме)

1. Зарегистрируйся на [cloudinary.com](https://cloudinary.com) (бесплатно)
2. Скопируй `Cloud Name`, `API Key`, `API Secret` из Dashboard
3. Вставь в `.env` и перезапусти: `docker compose up --build`

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abc123...
```

### Gmail SMTP (письма верификации и сброса пароля)

По умолчанию `AUTO_VERIFY=true` — письма не нужны.  
Если нужны реальные письма:

1. Включи двухфакторку в Google-аккаунте
2. Создай «Пароль приложения»: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Вставь в `.env`:

```env
AUTO_VERIFY=false
GMAIL_USER=your@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

### Telegram Bot (уведомления о статусах заявок)

1. Напиши `@BotFather` в Telegram → `/newbot`
2. Вставь токен в `.env`:

```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdef...
TELEGRAM_BOT_USERNAME=YourBotName
```

---

##  Полезные команды

```bash
# Запустить в фоне (без логов в терминале)
docker compose up -d --build

# Посмотреть логи всех сервисов
docker compose logs -f

# Логи только бэкенда
docker compose logs -f backend

# Остановить
docker compose down

# Полный сброс (удалить данные БД)
docker compose down -v
```

---

## Изменить порт

Если порт 80 занят, отредактируй `docker-compose.yml`:

```yaml
  frontend:
    ports:
      - "3000:80"   # было "80:80" → теперь открывай http://localhost:3000
```

---

## Разработка (с горячей перезагрузкой)

Если нужна активная разработка с hot-reload:

```bash
# 1. Запустить только БД
docker compose up db -d

# 2. Бэкенд
cd backend
cp .env.example .env
# В .env поставь: DATABASE_URL=postgresql://postgres:postgres@localhost:5433/workstudy?schema=public
npm install
npx prisma migrate deploy
node prisma/seed.js && node prisma/seed-internships.js
npm run dev        # → http://localhost:8000

# 3. Фронтенд (новый терминал)
cd frontend
cp .env.example .env
# В .env поставь: VITE_API_URL=http://localhost:8000/api/v1
npm install
npm run dev        # → http://localhost:5173
```

---

## Стек

| | Технология |
|---|---|
| Фронтенд | React 19, TypeScript, Vite 7, React Router 7, i18next (ru / en / kk) |
| Бэкенд | Node.js 20, Express 5, Prisma ORM |
| База данных | PostgreSQL 16 |
| Авторизация | JWT + bcrypt + email-верификация |
| Файлы | Cloudinary |
| Письма | Gmail SMTP (nodemailer) |
| Уведомления | Telegram Bot API |
| PDF / CV | @react-pdf/renderer + Roboto TTF |
| Деплой | Docker + nginx |

---

## 📁 Структура

```
work-study/
├── docker-compose.yml            # Полный стек: БД + бэкенд + фронтенд
├── .env.example                  # Шаблон конфигурации → скопировать в .env
├── backend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── modules/              # auth, users, internships, applications, support, upload
│   │   └── services/             # email, cloudinary, telegram
│   └── prisma/
│       ├── schema.prisma
│       ├── migrations/
│       ├── seed.js               # admin-аккаунт
│       └── seed-internships.js   # 16 стажировок от 6 компаний
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── public/fonts/             # Roboto TTF (для генерации PDF/CV)
    └── src/
        ├── pages/                # student/, hr/, admin/, auth/, support/
        ├── components/
        └── i18n/                 # Переводы ru / en / kk
```

---

## Роли

| Роль | Возможности |
|---|---|
| **student** | Поиск стажировок, подача заявок, профиль, генерация CV (PDF) |
| **hr** | Создание и управление вакансиями, просмотр заявок, обратная связь |
| **admin** | Управление пользователями, модерация вакансий, поддержка |
