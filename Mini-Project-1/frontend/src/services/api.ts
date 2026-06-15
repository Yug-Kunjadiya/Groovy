import axios from 'axios';
import { Student, StudentInput, ApiResponse } from '../types/student';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const studentApi = {
  // Get all students (with optional search)
  getAll: async (search?: string): Promise<ApiResponse<Student[]>> => {
    const response = await api.get<ApiResponse<Student[]>>('/students', {
      params: search ? { search } : {},
    });
    return response.data;
  },

  // Get a specific student
  getById: async (id: number): Promise<ApiResponse<Student>> => {
    const response = await api.get<ApiResponse<Student>>(`/students/${id}`);
    return response.data;
  },

  // Create a new student
  create: async (student: StudentInput): Promise<ApiResponse<Student>> => {
    const response = await api.post<ApiResponse<Student>>('/students', student);
    return response.data;
  },

  // Update an existing student
  update: async (id: number, student: StudentInput): Promise<ApiResponse<Student>> => {
    const response = await api.put<ApiResponse<Student>>(`/students/${id}`, student);
    return response.data;
  },

  // Delete a student
  delete: async (id: number): Promise<ApiResponse<Student>> => {
    const response = await api.delete<ApiResponse<Student>>(`/students/${id}`);
    return response.data;
  },
};

export default api;
