export default function EventSearch({ value, onChange, placeholder = "Tìm sự kiện, địa điểm, người chủ trì…" }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="event-workspace-search"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="7" /><path d="m16 16 5 5" /></svg><span className="sr-only">Tìm kiếm sự kiện</span><input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>;
}
