
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

# Task-Project-Management API

A comprehensive **Task & Project Management API** built with **NestJS**, **Prisma**, and **PostgreSQL**. Includes JWT authentication, file uploads via Cloudinary, admin controls, and role-based access control.

## 🚀 Features

- **Authentication & Authorization**
  - JWT access & refresh tokens (15m access, 7d refresh)
  - Email verification on registration
  - Password reset flow via email
  - Role-based access control (USER / ADMIN)
  - Token blacklist on logout

- **File Management**
  - File uploads to Cloudinary (images, PDFs, documents)
  - User avatar support
  - Task attachments support
  - Automatic file validation (MIME types)

- **Project Management**
  - Create, read, update, delete projects
  - Assign members to projects
  - Owner-based access control

- **Task Management**
  - Create tasks with priority and status
  - Assign multiple users to tasks
  - Task status workflow (TODO → IN_PROGRESS → IN_REVIEW → DONE / BLOCKED / CANCELLED)
  - Priority levels (LOW / MEDIUM / HIGH / URGENT)
  - File attachments on tasks
  - Move tasks between projects

- **Admin Dashboard**
  - User management (view, role assignment, deletion)
  - Project oversight
  - Task monitoring
  - Dashboard statistics

- **Security & Performance**
  - Rate limiting (global throttler)
  - Helmet for secure HTTP headers
  - Input validation & sanitization
  - CORS enabled

- **API Documentation**
  - Swagger/OpenAPI docs available at `/api/docs`

---

## 📋 Prerequisites

- **Node.js** (>= 18.x)
- **npm** or **yarn**
- **PostgreSQL** (>= 12.x)
- **Cloudinary Account** (for file uploads)
- **Mailtrap Account** (for email sending)

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/abdullrahmanx/Task-Project-management.git
cd task-nest
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```dotenv
# Database
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/task_db

# JWT Secrets
JWT_ACCESS_SECRET=your_secure_access_secret_key_here
JWT_REFRESH_SECRET=your_secure_refresh_secret_key_here

# Frontend URL (used for email links and CORS)
FRONTEND_URL=http://localhost:3001

# Server Port
PORT=3000

# Mailtrap Email Service
MAILTRAP_HOST=smtp.mailtrap.io
MAILTRAP_USER=your_mailtrap_username
MAILTRAP_PASS=your_mailtrap_password

# Cloudinary
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4. Setup Database

Generate Prisma client and run migrations:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (development)
npx prisma migrate dev --name init

# For production, use:
npx prisma migrate deploy
```

### 5. Start the server

**Development with watch mode:**
```bash
npm run start:dev
```

**Production:**
```bash
npm run build
npm run start:prod
```

Server will run on `http://localhost:3000` (or specified PORT).

---

## 📚 Database Schema

### Models

- **User** – Users with roles, avatars, and authentication tokens
- **Project** – Projects with owner and members
- **Task** – Tasks with status, priority, files, and assigned users
- **Blacklist** – Logout token blacklist

### Enums

- **Role**: `USER`, `ADMIN`
- **TaskStatus**: `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`, `BLOCKED`, `CANCELLED`
- **TaskPriority**: `LOW`, `MEDIUM`, `HIGH`, `URGENT`

See `prisma/schema.prisma` for full schema definition.

---

## 🔌 API Endpoints

### Interactive Docs
- **Swagger UI**: `GET /api/docs`

All protected endpoints require: `Authorization: Bearer <accessToken>`

---

### 🔐 Auth (`/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register new user (name, email, password) |
| GET | `/auth/verify-email/:token` | ❌ | Verify email address |
| POST | `/auth/login` | ❌ | Login (email, password) → returns accessToken + refreshToken |
| POST | `/auth/refresh-token` | ❌ | Refresh access token |
| POST | `/auth/logout` | ✅ | Logout & blacklist token |
| POST | `/auth/forgot-password` | ❌ | Send password reset email |
| POST | `/auth/reset-password/:token` | ❌ | Reset password with token |
| PUT | `/auth/change-password` | ✅ | Change password (currentPassword, newPassword) |

**Example: Register**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

---

### 👤 Users (`/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/me` | ✅ | Get current user profile |
| PUT | `/users/me` | ✅ | Update profile (with optional avatar upload) |
| DELETE | `/users/me` | ✅ | Delete user account (requires password) |

**Example: Update Profile with Avatar**
```bash
curl -X PUT http://localhost:3000/users/me \
  -H "Authorization: Bearer <token>" \
  -F "avatar=@/path/to/avatar.jpg" \
  -F "name=Jane Doe" \
  -F "email=jane@example.com"
```

---

### 📁 Projects (`/projects`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/projects` | ✅ | Create project |
| GET | `/projects` | ✅ | List projects (with pagination) |
| GET | `/projects/:id` | ✅ | Get project details |
| PUT | `/projects/:id` | ✅ | Update project (owner only) |
| DELETE | `/projects/:id` | ✅ | Delete project (owner only) |

**Example: Create Project**
```bash
curl -X POST http://localhost:3000/projects \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Project",
    "description": "Project description",
    "userIds": ["user-id-1", "user-id-2"]
  }'
```

---

### ✅ Tasks (`/tasks`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/tasks` | ✅ | Create task (with optional file) |
| GET | `/tasks` | ✅ | List tasks (filters: status, priority, projectId) |
| GET | `/tasks/:id` | ✅ | Get task details |
| PUT | `/tasks/:id` | ✅ | Update task (with optional file) |
| PUT | `/tasks/status/:id` | ✅ | Update status & priority |
| PUT | `/tasks/move-task/:id` | ✅ | Move task to another project |
| DELETE | `/tasks/:id` | ✅ | Delete task |

**Example: Create Task with File**
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Authorization: Bearer <token>" \
  -F "title=New Task" \
  -F "description=Task description" \
  -F "priority=HIGH" \
  -F "status=TODO" \
  -F "dueDate=2025-12-31" \
  -F "projectId=project-id" \
  -F "userIds=user-id-1,user-id-2" \
  -F "file=@/path/to/document.pdf"
```

**Example: Update Task Status**
```bash
curl -X PUT http://localhost:3000/tasks/status/task-id \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS",
    "priority": "HIGH"
  }'
```

---

### 🛡️ Admin (`/admin`)

**Requires**: JWT Token + ADMIN Role

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Dashboard stats |
| GET | `/admin/users` | List all users (paginated) |
| GET | `/admin/users/:id` | Get user by ID |
| PUT | `/admin/role/:id` | Update user role |
| DELETE | `/admin/users/:id` | Delete user |
| GET | `/admin/projects` | List all projects |
| GET | `/admin/projects/:id` | Get project by ID |
| PUT | `/admin/projects/:id` | Update project |
| DELETE | `/admin/projects/:id` | Delete project |
| GET | `/admin/tasks` | List all tasks |
| GET | `/admin/tasks/:id` | Get task by ID |
| PUT | `/admin/tasks/:id` | Update task |
| DELETE | `/admin/tasks/:id` | Delete task |

---

## 🔒 Security Features

- **JWT with Expiry**: Access tokens valid for 15 minutes, refresh tokens for 7 days
- **Password Hashing**: bcryptjs with salt rounds = 10
- **Rate Limiting**: Global throttle (10 requests per 60 seconds)
- **Helmet**: Secure HTTP headers enabled
- **CORS**: Configured for specified frontend URL
- **Token Blacklist**: Tokens added to blacklist on logout
- **Role-Based Access**: Admin guard for protected endpoints
- **Input Validation**: Class validator on all DTOs
- **File Validation**: MIME type checks on uploads

---

## 📦 Available Scripts

```bash
# Development
npm run start              # Start in normal mode
npm run start:dev         # Start with watch mode
npm run start:debug       # Start with debugger

# Production
npm run build             # Build for production
npm run start:prod        # Run production build

# Code Quality
npm run lint              # Run ESLint with fixes
npm run format            # Format code with Prettier

# Testing
npm run test              # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:cov         # Run tests with coverage
npm run test:e2e         # Run end-to-end tests
```

---

## 🔧 Configuration Files

- **`tsconfig.json`** – TypeScript configuration
- **`nest-cli.json`** – NestJS CLI configuration
- **`eslint.config.mjs`** – ESLint rules
- **`prisma/schema.prisma`** – Database schema

---

## 📁 Project Structure

```
src/
├── auth/              # Authentication module
├── users/             # User management module
├── projects/          # Project management module
├── tasks/             # Task management module
├── admin/             # Admin operations module
├── cloudinary/        # File upload service
├── common/            # Shared utilities, guards, decorators
├── prisma/            # Prisma service
├── app.module.ts      # Root module
└── main.ts            # Entry point

prisma/
├── schema.prisma      # Database schema
└── migrations/        # Database migrations
```

---

## 🚀 Uploading to GitHub

### Prerequisites
- [Git](https://git-scm.com/downloads) installed
- [GitHub Account](https://github.com/signup)
- GitHub repository created (empty, without README or .gitignore)

### Step-by-Step Guide

#### 1. Initialize Git in your project (if not already done)
```bash
cd path/to/task-nest
git init
```

#### 2. Add a `.gitignore` file
Create a `.gitignore` file in the root directory with:

```plaintext
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Environment
.env
.env.local
.env.*.local

# Build & dist
dist/
build/
coverage/

# IDE
.vscode/
.idea/
*.swp
*.swo
*.iml

# OS
.DS_Store
Thumbs.db

# Prisma
prisma/dev.db
prisma/dev.db-journal
```

#### 3. Stage and commit your files
```bash
git add .
git commit -m "Initial commit: Task management API with NestJS, Prisma, and Cloudinary"
```

#### 4. Add GitHub as remote
Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your GitHub username and repository name:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

Or if using SSH:
```bash
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
```

#### 5. Push to GitHub
```bash
git push -u origin main
```

#### 6. Verify your repository
Visit `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME` in your browser.

---

### Alternative: Create from GitHub First

#### Option A: GitHub Web Interface
1. Go to [GitHub New Repository](https://github.com/new)
2. Enter repository name: `Task-Project-management`
3. Add description: `Task & Project Management API with NestJS, Prisma, and Cloudinary`
4. Choose **Public** or **Private**
5. **Do NOT** initialize with README, .gitignore, or license
6. Click **Create repository**

Then follow steps 2-5 above.

#### Option B: Using GitHub CLI
```bash
# Install GitHub CLI from https://cli.github.com/

# Authenticate
gh auth login

# Create repository
gh repo create Task-Project-management \
  --source=. \
  --remote=origin \
  --push \
  --private  # or --public
```

---

### After Uploading: Configure Repository

#### 1. Add Repository Secrets (for CI/CD later)
- Go to **Settings** → **Secrets and variables** → **Actions**
- Add secrets for sensitive data:
  - `DATABASE_URL`
  - `JWT_ACCESS_SECRET`
  - `JWT_REFRESH_SECRET`
  - `CLOUDINARY_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
  - `MAILTRAP_HOST`
  - `MAILTRAP_USER`
  - `MAILTRAP_PASS`

#### 2. Create `.github/workflows` (Optional CI/CD)
Create `.github/workflows/ci.yml` for automated testing:

```yaml
name: CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Generate Prisma Client
      run: npx prisma generate
    
    - name: Run migrations
      run: npx prisma migrate deploy
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
    
    - name: Run linter
      run: npm run lint
    
    - name: Run tests
      run: npm run test:cov
    
    - name: Build
      run: npm run build
```

#### 3. Add Branch Protection (Optional)
- Go to **Settings** → **Branches**
- Add rule for `main` branch:
  - Require pull request reviews
  - Require status checks to pass
  - Dismiss stale pull request approvals

---

### Helpful Git Commands

```bash
# Check git status
git status

# View commit history
git log --oneline

# Create a new branch
git checkout -b feature/your-feature-name

# Stage specific files
git add src/auth/auth.controller.ts

# Commit with message
git commit -m "Add file upload to tasks"

# Push changes
git push origin main

# Pull latest changes
git pull origin main

# View remote URL
git remote -v

# Change remote URL
git remote set-url origin https://github.com/NEW_USERNAME/NEW_REPO.git
```

---

### Troubleshooting GitHub Upload

**Issue: Authentication failed**
- Use personal access token instead of password
- Generate token at https://github.com/settings/tokens
- Use token as password when prompted

**Issue: Large files**
- Remove `node_modules` before pushing (add to `.gitignore`)
- Use Git LFS for large files: `git lfs install`

**Issue: Wrong commit pushed**
- Undo last commit (keep changes): `git reset --soft HEAD~1`
- Undo last commit (discard changes): `git reset --hard HEAD~1`
- Force push (use carefully): `git push -f origin main`

**Issue: .env file accidentally committed**
```bash
# Remove .env from tracking (but keep local copy)
git rm --cached .env
git commit -m "Remove .env from tracking"
git push origin main
```

---

## 🚀 Deployment

### Heroku
```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:standard-0
git push heroku main
heroku config:set JWT_ACCESS_SECRET=your_secret
heroku config:set CLOUDINARY_NAME=your_name
# ... set other env vars
```

### Docker (optional)
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "start:prod"]
```

---

## 🐛 Troubleshooting

**Database connection error:**
- Verify `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Check credentials and network access

**Cloudinary upload fails:**
- Verify `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Ensure file size is within limits
- Check allowed MIME types in `cloudinary.service.ts`

**Email not sending:**
- Verify Mailtrap credentials
- Check Mailtrap inbox for test emails
- Ensure `FRONTEND_URL` is correctly set (used in email links)

---

## 📝 Testing

Run Jest tests:

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# End-to-end tests
npm run test:e2e
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/YourFeature`
3. Commit changes: `git commit -m 'Add YourFeature'`
4. Push to branch: `git push origin feature/YourFeature`
5. Open a Pull Request

---

## 📄 License

This project is **UNLICENSED**. See the `package.json` for details.

---

## 📞 Support & Contact

- **GitHub**: [Task-Project-management](https://github.com/abdullrahmanx/Task-Project-management)
- **Issues**: Create an issue on GitHub for bugs or feature requests

---

## 🙏 Acknowledgments

Built with:
- [NestJS](https://nestjs.com/) – Progressive Node.js framework
- [Prisma](https://www.prisma.io/) – Next-generation ORM
- [Cloudinary](https://cloudinary.com/) – Image & file hosting
- [Mailtrap](https://mailtrap.io/) – Email testing & delivery
- [JWT](https://jwt.io/) – Secure token authentication
