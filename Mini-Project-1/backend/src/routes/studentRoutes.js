import express from 'express';
import StudentController from '../controllers/studentController.js';

const router = express.Router();

// Define routes for students CRUD
router.route('/')
  .get(StudentController.getAllStudents)
  .post(StudentController.createStudent);

router.route('/:id')
  .get(StudentController.getStudentById)
  .put(StudentController.updateStudent)
  .delete(StudentController.deleteStudent);

export default router;
