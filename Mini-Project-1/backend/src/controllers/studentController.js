import StudentModel from '../models/studentModel.js';

// Simple helper for email format validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Simple helper for phone validation (basic format check)
const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
  return phoneRegex.test(phone);
};

class StudentController {
  // GET /api/students
  static async getAllStudents(req, res, next) {
    try {
      const { search } = req.query;
      const students = await StudentModel.getAll(search);
      res.status(200).json({
        success: true,
        count: students.length,
        data: students,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/students/:id
  static async getStudentById(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID format.',
        });
      }

      const student = await StudentModel.getById(id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: `Student with ID ${id} not found.`,
        });
      }

      res.status(200).json({
        success: true,
        data: student,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/students
  static async createStudent(req, res, next) {
    try {
      const { name, email, phone, course } = req.body;

      // Input Validation
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Name is required.' });
      }
      if (!email || !email.trim()) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
      }
      if (!isValidEmail(email)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      }
      if (!phone || !phone.trim()) {
        return res.status(400).json({ success: false, message: 'Phone number is required.' });
      }
      if (!isValidPhone(phone)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid phone number (7-20 digits).' });
      }
      if (!course || !course.trim()) {
        return res.status(400).json({ success: false, message: 'Course is required.' });
      }

      // Check if email already exists
      const existingStudent = await StudentModel.findByEmail(email.trim().toLowerCase());
      if (existingStudent) {
        return res.status(409).json({
          success: false,
          message: 'A student with this email address already exists.',
        });
      }

      const newStudent = await StudentModel.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        course: course.trim(),
      });

      res.status(201).json({
        success: true,
        message: 'Student added successfully!',
        data: newStudent,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/students/:id
  static async updateStudent(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID format.',
        });
      }

      const { name, email, phone, course } = req.body;

      // Input Validation
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Name is required.' });
      }
      if (!email || !email.trim()) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
      }
      if (!isValidEmail(email)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      }
      if (!phone || !phone.trim()) {
        return res.status(400).json({ success: false, message: 'Phone number is required.' });
      }
      if (!isValidPhone(phone)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid phone number.' });
      }
      if (!course || !course.trim()) {
        return res.status(400).json({ success: false, message: 'Course is required.' });
      }

      // Check if student exists
      const student = await StudentModel.getById(id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: `Student with ID ${id} not found.`,
        });
      }

      // Check if email is taken by another student
      const existingStudent = await StudentModel.findByEmail(email.trim().toLowerCase());
      if (existingStudent && existingStudent.id !== id) {
        return res.status(409).json({
          success: false,
          message: 'This email is already in use by another student.',
        });
      }

      const updatedStudent = await StudentModel.update(id, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        course: course.trim(),
      });

      res.status(200).json({
        success: true,
        message: 'Student updated successfully!',
        data: updatedStudent,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/students/:id
  static async deleteStudent(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID format.',
        });
      }

      const deletedStudent = await StudentModel.delete(id);
      if (!deletedStudent) {
        return res.status(404).json({
          success: false,
          message: `Student with ID ${id} not found.`,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Student record deleted successfully!',
        data: deletedStudent,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default StudentController;
