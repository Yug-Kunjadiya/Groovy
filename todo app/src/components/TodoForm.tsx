import { useState, type FormEvent } from 'react'
import { IconPlus, IconSpark } from './Icons'

interface TodoFormProps {
  onAddTodo: (text: string) => void
}

export function TodoForm({ onAddTodo }: TodoFormProps) {
  const [taskText, setTaskText] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onAddTodo(taskText)
    setTaskText('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.24)] sm:p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-200">
          <IconSpark className="h-5 w-5" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-100" htmlFor="todo-input">
            Add a task
          </label>
          <p className="text-xs text-slate-400">Capture something while it is top of mind.</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="todo-input"
          type="text"
          value={taskText}
          onChange={(event) => setTaskText(event.target.value)}
          placeholder="Plan tomorrow's sprint review"
          className="min-h-12 flex-1 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/20"
        />
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-200/60"
        >
          <IconPlus className="h-4 w-4" />
          Add task
        </button>
      </div>
    </form>
  )
}