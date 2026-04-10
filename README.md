# Work&Study

AI-driven internship matching platform for university students in Kazakhstan.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite 7 + nginx
- **Backend**: Node.js + Express 5 + Prisma ORM
- **Database**: PostgreSQL 16
- **Auth**: JWT
- **Email**: Resend
- **Infrastructure**: Docker + Docker Compose

---

## Быстрый старт для разработки

Требования: [Docker Desktop](https://www.docker.com/products/docker-desktop/) + Node.js 20+

```bash
# 1. Клонируй репозиторий
git clone <repo-url>
cd work-study

# 2. Создай .env в папке backend
cp backend/.env.example backend/.env

# 3. Запусти базу данных через Docker (только БД, быстро)
docker-compose up -d

# 4. Запусти бэкенд
cd backend && npm install && npx prisma migrate deploy && npm run dev

# 5. В другом терминале — запусти фронтенд
cd frontend && npm install && npm run dev
```

После запуска:
- **Фронтенд**: http://localhost:5173
- **Бэкенд API**: http://localhost:8000
- **Health check**: http://localhost:8000/health

Остановить БД: `docker-compose down`
Остановить + удалить данные БД: `docker-compose down -v`

---

## Деплой на сервер (продакшн)

```bash
# Поднимает всё: БД + бэкенд + фронтенд
docker-compose -f docker-compose.prod.yml up --build -d
```

---

## Локальная разработка (без Docker)

### Backend

```bash
cd backend
npm install
cp .env.example .env   # заполни DATABASE_URL своей локальной БД
npx prisma migrate dev
npm run dev            # http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

---

## API Endpoints

### Auth
| Метод | Путь | Доступ | Описание |
|-------|------|--------|----------|
| POST | `/api/v1/auth/register` | Public | Регистрация |
| POST | `/api/v1/auth/login` | Public | Логин |
| GET | `/api/v1/auth/me` | Auth | Текущий пользователь |

### Internships
| Метод | Путь | Доступ | Описание |
|-------|------|--------|----------|
| GET | `/api/v1/internships` | Public | Список стажировок |
| GET | `/api/v1/internships/:id` | Public | Стажировка по ID |
| POST | `/api/v1/internships` | HR, Admin | Создать стажировку |
| PATCH | `/api/v1/internships/:id` | HR, Admin | Обновить стажировку |
| PATCH | `/api/v1/internships/:id/moderate` | Admin | Модерация |

### Applications
| Метод | Путь | Доступ | Описание |
|-------|------|--------|----------|
| POST | `/api/v1/applications` | Student | Подать заявку |
| GET | `/api/v1/applications/my` | Student | Мои заявки |
| GET | `/api/v1/applications/internship/:id` | HR, Admin | Заявки на стажировку |
| PATCH | `/api/v1/applications/:id` | HR, Admin | Обновить статус заявки |

### Users
| Метод | Путь | Доступ | Описание |
|-------|------|--------|----------|
| GET | `/api/v1/users` | Admin | Все пользователи |
| PATCH | `/api/v1/users/:id/block` | Admin | Блокировка/разблокировка |
| PATCH | `/api/v1/users/profile` | Student | Обновить профиль |

---

## Роли

| Роль | Описание |
|------|----------|
| `student` | Ищет стажировки, подаёт заявки, управляет профилем |
| `hr` | Публикует стажировки, рассматривает заявки |
| `admin` | Модерация стажировок, управление пользователями |

---

## Структура проекта

```
work-study/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Схема БД
│   ├── src/
│   │   ├── config/            # Prisma client
│   │   ├── middleware/        # Auth, Role
│   │   └── modules/
│   │       ├── auth/
│   │       ├── users/
│   │       ├── internships/
│   │       ├── applications/
│   │       └── matching/      # AI-matching (в разработке)
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/               # API клиент (готов к подключению бэка)
│   │   ├── components/
│   │   ├── pages/
│   │   └── mock/              # Mock-данные (временно)
│   ├── nginx.conf
│   └── Dockerfile
└── docker-compose.yml
```
