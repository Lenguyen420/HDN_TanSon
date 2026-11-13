import type { EventResourcePageProps } from "@/components/shared/page-props";
import EventPageLayout from "@/components/shared/event-page-layout";
import EventSummaryCard from "@/components/shared/event-summary-card";
import AppIcon from "@/components/icons";
import { eventToday, eventJoinWindow } from "@/services/event-workspace";
import CheckInForm from "./check-in-form";
export default function EventCheckIn({
  data,
  article,
  onBack,
  onOpenEvent,
  attendance,
  attendanceLoading,
  attendanceError,
  onCheckIn,
  participations = [],
}: EventResourcePageProps) {
  const receipt = attendance[article.id];
  const registration = participations.find(
    (item) => item.eventId === article.id,
  );
  const schedule = eventJoinWindow(article);
  const closed = !!schedule && new Date() >= schedule.end;
  const enabled =
    !closed &&
    !data.isDemo &&
    article.event?.checkInEnabled &&
    article.event.date === eventToday();
  return (
    <EventPageLayout
      title="Điểm danh sự kiện"
      subtitle="Xác nhận tham dự với Ban tổ chức"
      onBack={onBack}
    >
      <EventSummaryCard
        article={article}
        onSelect={(item) => onOpenEvent(item.id, "calendar")}
      />
      {attendanceError && (
        <p className="form-status" role="alert">
          {attendanceError}
        </p>
      )}
      {attendanceLoading ? (
        <p className="event-workspace-empty" role="status">
          Đang kiểm tra điểm danh…
        </p>
      ) : receipt ? (
        <section className="event-attendance-success" role="status">
          <span>
            <AppIcon name="check" />
          </span>
          <h2>Đã điểm danh</h2>
          <p>{receipt.name}</p>
          {receipt.company && <p>{receipt.company}</p>}
          <small>
            {new Date(receipt.checkedAt).toLocaleString("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh",
            })}
          </small>
          <p>Thông tin tham dự đã được lưu trên hệ thống Hội.</p>
        </section>
      ) : enabled ? (
        registration?.registeredAt ? (
          <CheckInForm
            name={registration.name}
            company={registration.company}
            onSubmit={() => onCheckIn(article.id)}
          />
        ) : (
          <div className="event-workspace-empty">
            <h2>Chưa đăng ký tham gia</h2>
            <p>Chưa có thông tin đăng ký sự kiện trên thiết bị này.</p>
            <button
              type="button"
              className="primary-button"
              onClick={() => onOpenEvent(article.id, "calendar")}
            >
              Xem đăng ký tham gia
            </button>
          </div>
        )
      ) : (
        <div className="event-workspace-empty">
          <AppIcon name="calendar" />
          <h2>{closed ? "Đã đóng điểm danh" : "Chưa mở điểm danh"}</h2>
          <p>
            Điểm danh khả dụng trong ngày diễn ra sự kiện khi Ban tổ chức mở
            tiếp nhận.
          </p>
        </div>
      )}
    </EventPageLayout>
  );
}
