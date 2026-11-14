import type { LocalGoHours } from "@/services/localgo";
const days = [
  "Chủ nhật",
  "Thứ hai",
  "Thứ ba",
  "Thứ tư",
  "Thứ năm",
  "Thứ sáu",
  "Thứ bảy",
];
export default function OpeningHours({
  value,
  onChange,
}: {
  value: LocalGoHours[];
  onChange: (value: LocalGoHours[]) => void;
}) {
  const update = (index: number, patch: Partial<LocalGoHours>) =>
    onChange(
      value.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  return (
    <section className="localgo-section">
      <h2>Giờ hoạt động</h2>
      {value.map((hours, index) => (
        <div className="localgo-hours" key={index}>
          <label>
            Ngày
            <select
              value={hours.day}
              onChange={(e) => update(index, { day: Number(e.target.value) })}
            >
              {days.map((day, i) => (
                <option key={i} value={i}>
                  {day}
                </option>
              ))}
            </select>
          </label>
          <label>
            Mở cửa
            <input
              type="time"
              required
              value={hours.open}
              onChange={(e) => update(index, { open: e.target.value })}
            />
          </label>
          <label>
            Đóng cửa
            <input
              type="time"
              required
              value={hours.close}
              onChange={(e) => update(index, { close: e.target.value })}
            />
          </label>
          <button
            type="button"
            onClick={() => onChange(value.filter((_, i) => i !== index))}
            aria-label={`Xóa giờ hoạt động ${index + 1}`}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        disabled={value.length >= 21}
        onClick={() =>
          onChange([...value, { day: 1, open: "08:00", close: "17:00" }])
        }
      >
        + Thêm giờ hoạt động
      </button>
    </section>
  );
}
