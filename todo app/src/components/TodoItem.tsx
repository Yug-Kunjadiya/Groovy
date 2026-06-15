import type { Todo } from '../types/todo'
import { IconCheck, IconTrash } from './Icons'

interface TodoItemProps {
  todo: Todo
  onToggleTodo: (id: string) => void
  onDeleteTodo: (id: string) => void
}

export function TodoItem({ todo, onToggleTodo, onDeleteTodo }: TodoItemProps) {
  return (
    <li className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/10 sm:p-5">
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => onToggleTodo(todo.id)}
          className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition focus:outline-none focus:ring-2 focus:ring-cyan-400/40 ${
            todo.completed
              ? 'border-emerald-400/30 bg-emerald-400/15 text-emerald-200'
              : 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200 hover:border-cyan-300/40 hover:bg-cyan-400/15'
          }`}
          aria-label={`Mark ${todo.text} as ${todo.completed ? 'incomplete' : 'complete'}`}
        >
          <IconCheck className="h-5 w-5" />
        </button>

        <label className="flex flex-1 cursor-pointer items-start gap-4">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggleTodo(todo.id)}
          className="sr-only"
          aria-label={`Mark ${todo.text} as ${todo.completed ? 'incomplete' : 'complete'}`}
        />

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-medium leading-6 text-slate-100 sm:text-base ${
              todo.completed ? 'text-slate-400 line-through decoration-cyan-300/60' : ''
            }`}
          >
            {todo.text}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {new Date(todo.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            {todo.completed ? 'Completed' : 'In progress'}
          </div>
        </div>
        </label>

      <button
        type="button"
        onClick={() => onDeleteTodo(todo.id)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/80 text-slate-300 transition hover:-translate-y-0.5 hover:border-rose-400/50 hover:bg-rose-500/10 hover:text-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400/30"
        aria-label={`Delete ${todo.text}`}
      >
        <IconTrash className="h-4.5 w-4.5" />
      </button>
      </div>
    </li>
  )
}