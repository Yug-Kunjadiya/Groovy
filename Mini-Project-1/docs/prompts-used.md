# Prompts Documentation (Mini-Project-1)

This document contains a structured log of the primary prompts and instructions used in generating the various parts of the **Student Management CRUD Application**. Approximately 80% of the codebase was produced using these targeted prompts.

---

## 1. Project Initialization & Setup
**Prompt:**
> "Initialize a new React + TypeScript project using Vite named `frontend` in a non-interactive mode. Then install dependencies including `axios` for HTTP requests, `lucide-react` for premium layout icon assets, and configure `tailwindcss` with `postcss` and `autoprefixer` using standard ESM configuration files."

---

## 2. Database Schema Generation
**Prompt:**
> "Design a PostgreSQL schema for a database named `student_db` and a table `students` containing the fields: `id` (serial primary key), `name` (varchar 100), `email` (varchar 100 unique), `phone` (varchar 20), `course` (varchar 100), and `created_at` (timestamp with timezone). Provide sample data inserting 5 Indian students with clean mock data."

---

## 3. Backend MVC Boilerplate
**Prompt:**
> "Create a Node.js + Express backend using native ES Modules (`type: "module"`). Structure the app in an MVC folder architecture: `src/config/db.js` for `pg.Pool` connection, `src/models/studentModel.js` for SQL queries using parameterized arguments to prevent injection, `src/controllers/studentController.js` to handle request validation and response mapping, `src/routes/studentRoutes.js` for REST routes, and `src/middleware/errorMiddleware.js` to translate Postgres error codes (like 23505 duplicate keys) into friendly HTTP status codes."

---

## 4. Input Validation & Error Middleware
**Prompt:**
> "Write Express controller methods for students CRUD operations. Ensure that:
> 1. Email inputs are verified via regex and checked for duplication.
> 2. Phone inputs are validated (7-20 digits format).
> 3. Errors are directed to a global middleware.
> 4. Database integrity issues return 409 Conflict (duplicate email) or 400 Bad Request, while not-found items return 404."

---

## 5. Frontend UI Component Assembly
**Prompt:**
> "Design a premium dashboard layout for Student Management using Tailwind CSS. Create the following React components:
> 1. `StudentTable.tsx`: Displays lists, icons, badges, email/phone layouts, and actions (edit/delete buttons). Handles loading states and an empty state fallback.
> 2. `StudentForm.tsx`: A side-sheet or modal popup form that acts dynamically as both Add Student and Edit Student. Includes live regex validations and displays field errors.
> 3. `DeleteModal.tsx`: A soft-red modal confirmation checking if the user wants to permanently remove the student.
> 4. `Dashboard.tsx`: Displays stats cards (Total Students, Active Courses count) and manages active states, notifications, and debounced searching."
