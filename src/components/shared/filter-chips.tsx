interface FilterChipsProps<T extends string> { options: { value: T; label: string }[]; value: T; onChange: (value: T) => void; label: string; }
export default function FilterChips<T extends string>({ options, value, onChange, label }: FilterChipsProps<T>) {
  return <div className="filter-chips" role="group" aria-label={label}>{options.map((option) => <button key={option.value} type="button" aria-pressed={value === option.value} className={value === option.value ? "is-selected" : ""} onClick={() => onChange(option.value)}>{option.label}</button>)}</div>;
}
