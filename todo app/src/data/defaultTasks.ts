import type { Todo } from '../types/todo'

export const defaultTasks: Todo[] = [
  {
    id: 'sample-1',
    text: 'Design the dashboard layout',
    completed: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
  },
  {
    id: 'sample-2',
    text: 'Write the first round of task filters',
    completed: false,
    createdAt: Date.now() - 1000 * 60 * 35,
  },
  {
    id: 'sample-3',
    text: 'Test the mobile layout on a narrow screen',
    completed: false,
    createdAt: Date.now() - 1000 * 60 * 10,
  },
]