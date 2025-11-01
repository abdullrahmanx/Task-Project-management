
## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

## Task-Project-management (NestJS + Prisma)

This repository contains a Task & Project management API built with NestJS and Prisma (PostgreSQL). The API provides authentication (JWT with refresh tokens), user management, project management, task management, and admin operations.

Main features
- JWT access & refresh tokens, email verification, password reset flows
- Role-based admin guard (ADMIN / USER)
- Rate limiting via @nestjs/throttler
- Prisma ORM with PostgreSQL datasource
- Nodemailer (Mailtrap) email templates for verification and password reset

## Quick start

Requirements
- Node.js (>= 18 recommended)
- npm
- PostgreSQL

1) Install dependencies

```cmd
npm install
```

2) Create a .env file (see example below)

3) Generate Prisma client and run migrations (dev)

```cmd
npx prisma generate
npx prisma migrate dev --name init
```

4) Start the app (development)

```cmd
npm run start
```

The server will listen on PORT (default 3000). CORS is enabled for FRONTEND_URL (defaults to http://localhost:3001).

## Environment variables
Create a `.env` file at the project root. Example values:

```dotenv
# Database
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/task_db

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Frontend URL used in email links and CORS
FRONTEND_URL=http://localhost:3001

# Port (optional)
PORT=3000

# Mailtrap (used by nodemailer in src/common/utils/email.ts)
MAILTRAP_HOST=smtp.mailtrap.io
MAILTRAP_USER=your_mailtrap_user
MAILTRAP_PASS=your_mailtrap_pass
```

Notes
- If you already have migrations in `prisma/migrations`, `npx prisma migrate deploy` is suitable for production.

## API Endpoints (summary)
Below are the main controllers and endpoints. All endpoints that require authentication use the `Authorization: Bearer <token>` header.

Auth (`/auth`)
- POST /auth/register – Register (body: name, email, password)
- GET /auth/verify-email/:token – Verify email link
- POST /auth/login – Login (body: email, password) -> returns accessToken + refreshToken
- POST /auth/refresh-token – Refresh access token (body: { refreshToken })
- POST /auth/logout – (Auth) Logout (uses header authorization)
- POST /auth/forgot-password – Send reset link (body: { email })
- POST /auth/reset-password/:token – Reset password (body: { newPassword })
- PUT /auth/change-password – (Auth) Change password (body: currentPassword, newPassword)

Users (`/users`)
- GET /users/me – (Auth) Get profile
- PUT /users/me – (Auth) Update profile
- DELETE /users/me – (Auth) Delete profile (body: { password })

Projects (`/projects`) (Auth required)
- POST /projects – Create project
- GET /projects – List projects (pagination)
- GET /projects/:id – Get project
- PUT /projects/:id – Update project
- DELETE /projects/:id – Delete project

Tasks (`/tasks`) (Auth required)
- POST /tasks – Create task
- GET /tasks – List tasks (filters + pagination)
- GET /tasks/:id – Get task
- PUT /tasks/:id – Update task
- PUT /tasks/status/:id – Update status/priority
- PUT /tasks/move-task/:id – Move task to another project or users
- DELETE /tasks/:id – Delete task

Admin (`/admin`) (Auth + AdminGuard)
- GET /admin/dashboard – Dashboard stats
- GET /admin/users – List users
- GET /admin/users/:id – Get user
- PUT /admin/role/:id – Update user role
- DELETE /admin/users/:id – Delete user
- GET /admin/projects – Admin list projects
- GET /admin/projects/:id – Admin get project
- PUT /admin/projects/:id – Admin update
- DELETE /admin/projects/:id – Admin delete
- GET /admin/tasks – Admin list tasks
- GET /admin/tasks/:id – Admin get task
- PUT /admin/tasks/:id – Admin update
- DELETE /admin/tasks/:id – Admin delete

## Security / Behavior notes
- Rate limiting applied globally via ThrottlerModule in `AppModule`.
- Helmet is enabled in `main.ts` for secure HTTP headers.
- JWT access tokens expire in ~15 minutes; refresh tokens are stored (hashed) in DB.
- Logout blacklists access tokens by saving them to `blacklist` model in the database.

## Database schema (Prisma)
Key models are `User`, `Project`, `Task`, and `Blacklist`. See `prisma/schema.prisma` for full definitions and enums (TaskStatus, TaskPriority, Role).

## Email
Email sending uses Mailtrap credentials via environment variables (`MAILTRAP_HOST`, `MAILTRAP_USER`, `MAILTRAP_PASS`). The code lives in `src/common/utils/email.ts` and has templates for verification and password reset.

## Tests
- Unit/e2e tests are configured with Jest (see `test/` and `jest` scripts in `package.json`). Run:

```cmd
npm run test
npm run test:e2e
```

## Contributing / Next steps
- Add OpenAPI / Swagger docs (nestjs/swagger is installed — you can mount Swagger in `main.ts`)
- Add CI pipeline (optional) and clearer migration / seeding scripts
- Add more unit/e2e tests for controllers and services

## Contact
If you want me to expand the README with example requests (curl / Postman collections), or to generate Swagger docs and add a short developer guide, tell me which you'd like next and I will proceed.

---
Generated README: summarized endpoints, environment, and setup steps for this repo.
