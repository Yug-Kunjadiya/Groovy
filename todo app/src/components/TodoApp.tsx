import { useMemo, useState } from 'react'
import { defaultTasks } from '../data/defaultTasks'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import type { Todo, TodoFilter } from '../types/todo'
import { IconCheck, IconList, IconSpark } from './Icons'
import { TodoFilters } from './TodoFilters'
import { TodoForm } from './TodoForm'
import { TodoList } from './TodoList'

const STORAGE_KEY = 'modern-react-todo'

export default function TodoApp() {
  const [todos, setTodos] = useLocalStorageState<Todo[]>(STORAGE_KEY, defaultTasks)
  const [filter, setFilter] = useState<TodoFilter>('all')

  const filteredTodos = useMemo(() => {
    if (filter === 'active') {
      return todos.filter((todo) => !todo.completed)
    }

    if (filter === 'completed') {
      return todos.filter((todo) => todo.completed)
    }

    return todos
  }, [filter, todos])

  const counts = useMemo(
    () => ({
      all: todos.length,
      active: todos.filter((todo) => !todo.completed).length,
      completed: todos.filter((todo) => todo.completed).length,
    }),
    [todos],
  )

  const handleAddTodo = (text: string) => {
    const trimmedText = text.trim()

    if (!trimmedText) {
      return
    }

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: trimmedText,
      completed: false,
      createdAt: Date.now(),
    }

    setTodos((currentTodos) => [newTodo, ...currentTodos])
  }

  const handleToggleTodo = (id: string) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    )
  }

  const handleDeleteTodo = (id: string) => {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id))
  }

  return (
    <main className="app-shell min-h-screen text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <section className="glass-panel px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <div className="absolute -left-16 top-8 h-44 w-44 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -right-20 top-16 h-52 w-52 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-8">
            <header className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                <IconSpark className="h-3.5 w-3.5" />
                React Todo
              </div>

              <div className="space-y-3">
                <h1 className="max-w-lg text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                  A focused todo app with a clean workflow.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  Add tasks, complete the work that matters, and switch between all,
                  active, and completed items without losing the thread.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <StatCard
                  label="All tasks"
                  value={counts.all}
                  icon={<IconList className="h-4 w-4" />}
                  accent="from-cyan-400/25 to-cyan-500/10"
                />
                <StatCard
                  label="Active"
                  value={counts.active}
                  icon={<IconSpark className="h-4 w-4" />}
                  accent="from-amber-400/25 to-amber-500/10"
                />
                <StatCard
                  label="Completed"
                  value={counts.completed}
                  icon={<IconCheck className="h-4 w-4" />}
                  accent="from-emerald-400/25 to-emerald-500/10"
                />
              </div>
            </header>

            <div className="surface soft-ring rounded-[1.75rem] p-4 sm:p-5">
              <TodoForm onAddTodo={handleAddTodo} />
              <TodoFilters filter={filter} counts={counts} onFilterChange={setFilter} />
            </div>
          </div>

          <div className="relative mt-6 sm:mt-8">
            <TodoList
              todos={filteredTodos}
              filter={filter}
              totalCount={counts.all}
              onToggleTodo={handleToggleTodo}
              onDeleteTodo={handleDeleteTodo}
            />
          </div>
        </section>
      </div>
    </main>
  )
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string
  value: number
  icon: React.ReactNode
  accent: string
}) {
  return (
    <div className={`surface overflow-hidden rounded-2xl bg-gradient-to-br ${accent} px-4 py-4`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/50 text-white/90">
          {icon}
        </div>
      </div>
    </div>
  )
}