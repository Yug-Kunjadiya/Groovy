export interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  course: string;
  created_at: string;
}

export type StudentInput = Omit<Student, 'id' | 'created_at'>;

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
}
