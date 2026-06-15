import pool from '../config/db.js';

class StudentModel {
  // Get all students (with optional search filter)
  static async getAll(search = '') {
    let queryText = 'SELECT * FROM students';
    let values = [];

    if (search) {
      queryText += ' WHERE name ILIKE $1 OR email ILIKE $1 OR course ILIKE $1 OR phone ILIKE $1';
      values.push(`%${search}%`);
    }

    queryText += ' ORDER BY id DESC';
    const { rows } = await pool.query(queryText, values);
    return rows;
  }

  // Get student by ID
  static async getById(id) {
    const queryText = 'SELECT * FROM students WHERE id = $1';
    const { rows } = await pool.query(queryText, [id]);
    return rows[0] || null;
  }

  // Find student by email (for unique check)
  static async findByEmail(email) {
    const queryText = 'SELECT * FROM students WHERE email = $1';
    const { rows } = await pool.query(queryText, [email]);
    return rows[0] || null;
  }

  // Create a new student
  static async create({ name, email, phone, course }) {
    const queryText = `
      INSERT INTO students (name, email, phone, course)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const { rows } = await pool.query(queryText, [name, email, phone, course]);
    return rows[0];
  }

  // Update student by ID
  static async update(id, { name, email, phone, course }) {
    const queryText = `
      UPDATE students
      SET name = $1, email = $2, phone = $3, course = $4
      WHERE id = $5
      RETURNING *
    `;
    const { rows } = await pool.query(queryText, [name, email, phone, course, id]);
    return rows[0] || null;
  }

  // Delete student by ID
  static async delete(id) {
    const queryText = 'DELETE FROM students WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(queryText, [id]);
    return rows[0] || null;
  }
}

export default StudentModel;
