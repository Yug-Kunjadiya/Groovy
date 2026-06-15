# Student Management CRUD Application (Mini-Project-1)

A premium, modern Student Management System built using React, TypeScript, Tailwind CSS, Axios on the frontend, and Node.js, Express.js, PostgreSQL on the backend. This application features full CRUD operations, search filters, state-of-the-art styling, input validation, and proper error handling.

## Table of Contents
1. [Features](#features)
2. [Folder Structure](#folder-structure)
3. [Technologies Used](#technologies-used)
4. [Database Setup](#database-setup)
5. [Backend Installation & Run](#backend-installation--run)
6. [Frontend Installation & Run](#frontend-installation--run)
7. [API Endpoints](#api-endpoints)

---

## Features
- **Add Student**: Multi-field registration form with robust validation (Name, Email, Phone, Course).
- **View Students**: Clean, elegant list layout featuring custom badges and avatar icons.
- **Search**: Debounced real-time filtering by name, email, phone, or course.
- **Update Student**: Populated form with check against email duplicate conflicts.
- **Delete Student**: Soft-red modal warning to confirm permanent record removal.
- **Form Validation**: Strict regex rules for telephone numbers and email syntax.
- **Success & Error States**: Micro-animated notification alerts with auto-dismissals.

---

## Folder Structure
```
Mini-Project-1/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # pg Pool instance
│   │   ├── controllers/
│   │   │   └── studentController.js # API Controller & Validations
│   │   ├── middleware/
│   │   │   └── errorMiddleware.js   # Not Found & DB Error mapper
│   │   ├── models/
│   │   │   └── studentModel.js      # Parameterized queries
│   │   └── routes/
│   │       └── studentRoutes.js     # Express routes mapping
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   ├── schema.sql                   # Database table & sample data
│   └── server.js                    # Express Application Entry
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx        # Container & metrics dashboard
│   │   │   ├── DeleteModal.tsx      # Confirmation dialog
│   │   │   ├── StudentForm.tsx      # Multi-mode input validator
│   │   │   └── StudentTable.tsx     # Student records list table
│   │   ├── services/
│   │   │   └── api.ts               # Axios instance & methods
│   │   ├── types/
│   │   │   └── student.ts           # Types & interfaces
│   │   ├── App.tsx
│   │   ├── index.css                # Base & tailwind layers
│   │   └── main.tsx
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── docs/
    ├── README.md
    ├── architecture.md
    ├── api-documentation.md
    └── prompts-used.md
```

---

## Technologies Used
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Axios, Lucide React
- **Backend**: Node.js, Express, `pg` (node-postgres), Dotenv, Morgan, Cors
- **Database**: PostgreSQL (v18)

---

## Database Setup
1. Open your PostgreSQL terminal/pgAdmin.
2. Create a new database named `student_db`:
   ```sql
   CREATE DATABASE student_db;
   ```
3. Run the schema migrations from `backend/schema.sql`:
   ```bash
   # If psql is in PATH:
   psql -U postgres -d student_db -f backend/schema.sql
   ```
   *Note: If `psql` isn't in your path, copy the contents of `backend/schema.sql` and run them inside your SQL query tool.*

---

## Backend Installation & Run
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and configure your credentials:
   ```bash
   cp .env.example .env
   # Update DB_USER, DB_PASSWORD, and DB_PORT as needed.
   ```
4. Start the development server (runs on port 5000):
   ```bash
   npm run dev
   ```

---

## Frontend Installation & Run
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server (runs on port 5173):
   ```bash
   npm run dev
   ```
4. Open your browser to `http://localhost:5173`.

---

## API Endpoints
- `GET /api/students` - Retrieves all student records (supports `?search=` query).
- `GET /api/students/:id` - Retrieves details of a single student.
- `POST /api/students` - Adds a new student (validates fields).
- `PUT /api/students/:id` - Modifies an existing student.
- `DELETE /api/students/:id` - Permanently deletes a student.
