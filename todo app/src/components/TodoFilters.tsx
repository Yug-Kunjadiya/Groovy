import type { TodoFilter } from '../types/todo'
import { IconCheck, IconFilter, IconList, IconSpark } from './Icons'

interface Counts {
  all: number
  active: number
  completed: number
}

interface TodoFiltersProps {
  filter: TodoFilter
  counts: Counts
  onFilterChange: (filter: TodoFilter) => void
}

const filters: Array<{ key: TodoFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
]

const filterIcons: Record<TodoFilter, React.ReactNode> = {
  all: <IconList className="h-4 w-4" />,
  active: <IconSpark className="h-4 w-4" />,
  completed: <IconCheck className="h-4 w-4" />,
}

export function TodoFilters({ filter, counts, onFilterChange }: TodoFiltersProps) {
  return (
    <div className="mt-5 space-y-4 rounded-[1.5rem] border border-white/10 bg-slate-950/30 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-cyan-200">
            <IconFilter className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              Filter tasks
            </h2>
            <p className="text-xs text-slate-400">
              {counts.active} active · {counts.completed} completed
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {filters.map((item) => {
          const isSelected = filter === item.key

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onFilterChange(item.key)}
              className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-400/40 ${
                isSelected
                  ? 'border-cyan-300/40 bg-cyan-400 text-slate-950 shadow-[0_10px_30px_rgba(34,211,238,0.2)]'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/15 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className={isSelected ? 'text-slate-950' : 'text-cyan-200'}>{filterIcons[item.key]}</span>
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}