import { useState } from "react";
import { introductionVideoSource } from "@/services/introduction-video";

function VideoPlayer({
  source,
}: {
  source: NonNullable<ReturnType<typeof introductionVideoSource>>;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className="about-video">
      <div className="about-video-player">
        {source.kind === "youtube" ? (
          <iframe
            src={source.url}
            title="Video giới thiệu Hội Doanh nghiệp Phường Tân Sơn"
            loading="lazy"
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            style={{ width: "100%", height: "100%", border: 0 }}
          />
        ) : (
          <video
            src={source.url}
            controls
            playsInline
            preload="none"
            onError={() => setFailed(true)}
            aria-label="Video giới thiệu Hội Doanh nghiệp Phường Tân Sơn"
          >
            Trình duyệt chưa hỗ trợ phát video.
          </video>
        )}
      </div>
      <figcaption>Video giới thiệu Hội Doanh nghiệp Phường Tân Sơn</figcaption>
      {failed && (
        <p role="status">
          Chưa phát được video. Vui lòng kiểm tra kết nối hoặc{" "}
          <a
            href={source.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            mở video tại đây
          </a>
          .
        </p>
      )}
    </figure>
  );
}

export default function IntroductionVideo({ url }: { url?: string }) {
  const source = introductionVideoSource(url);
  return source ? <VideoPlayer key={source.url} source={source} /> : null;
}
