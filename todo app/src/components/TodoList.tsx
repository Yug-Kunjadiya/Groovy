import type { Todo, TodoFilter } from '../types/todo'
import { IconList, IconSpark } from './Icons'
import { TodoItem } from './TodoItem'

interface TodoListProps {
  todos: Todo[]
  filter: TodoFilter
  totalCount: number
  onToggleTodo: (id: string) => void
  onDeleteTodo: (id: string) => void
}

export function TodoList({
  todos,
  filter,
  totalCount,
  onToggleTodo,
  onDeleteTodo,
}: TodoListProps) {
  const isEmpty = todos.length === 0

  return (
    <section className="surface soft-ring rounded-[1.75rem] p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            <IconList className="h-3.5 w-3.5 text-cyan-200" />
            Task board
          </div>
          <h2 className="mt-3 text-lg font-bold text-white">Your tasks</h2>
          <p className="text-sm text-slate-400">
            {filter === 'all'
              ? `${totalCount} task${totalCount === 1 ? '' : 's'} in the list`
              : `${todos.length} ${filter} task${todos.length === 1 ? '' : 's'} shown`}
          </p>
        </div>
      </div>

      {isEmpty ? (
        <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/5 px-6 py-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-200">
            <IconSpark className="h-6 w-6" />
          </div>
          <p className="text-lg font-semibold text-white">No tasks in this filter.</p>
          <p className="mt-2 text-sm text-slate-400">
            Add a new item or switch filters to bring tasks back into view.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggleTodo={onToggleTodo}
              onDeleteTodo={onDeleteTodo}
            />
          ))}
        </ul>
      )}
    </section>
  )
}