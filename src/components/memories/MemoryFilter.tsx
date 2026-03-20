import { cn } from '../../lib/utils'
import { FILTERS } from '../../lib/constants'

interface MemoryFilterProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
}

export function MemoryFilter({ activeFilter, onFilterChange }: MemoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={cn(
            'px-4 py-2 rounded-full text-sm transition-all cursor-pointer',
            activeFilter === filter.value
              ? 'bg-ssu-blue text-cream'
              : 'bg-navy-lighter text-text-secondary hover:bg-navy-lighter/80 hover:text-cream'
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}
