-- Student Management CRUD Application PostgreSQL Schema

-- 1. Create Database (Uncomment if running manually outside target DB)
-- CREATE DATABASE student_db;

-- 2. Connect to Database
-- \c student_db;

-- 3. Create Students Table
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    course VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Insert Sample Data
INSERT INTO students (name, email, phone, course) VALUES
('Aarav Mehta', 'aarav.mehta@example.com', '+91 98765 43210', 'Computer Science'),
('Diya Sharma', 'diya.sharma@example.com', '+91 98765 43211', 'Data Science'),
('Kabir Patel', 'kabir.patel@example.com', '+91 98765 43212', 'Artificial Intelligence'),
('Ananya Iyer', 'ananya.iyer@example.com', '+91 98765 43213', 'Software Engineering'),
('Vihaan Gupta', 'vihaan.gupta@example.com', '+91 98765 43214', 'Cyber Security')
ON CONFLICT (email) DO NOTHING;
