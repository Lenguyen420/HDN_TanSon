import { useState } from "react";
import introductionVideoUrl from "@/assets/video/gioi-thieu.mp4";

export default function IntroductionVideo() {
  const [failed, setFailed] = useState(false);

  return (
    <figure className="about-video">
      <div className="about-video-player">
        <video
          src={introductionVideoUrl}
          controls
          playsInline
          preload="none"
          onError={() => setFailed(true)}
          aria-label="Video giới thiệu Hội Doanh nghiệp Phường Tân Sơn"
        >
          Trình duyệt chưa hỗ trợ phát video.
        </video>
      </div>
      <figcaption>Video giới thiệu Hội Doanh nghiệp Phường Tân Sơn</figcaption>
      {failed && (
        <p role="status">
          Chưa phát được video. Vui lòng kiểm tra kết nối hoặc{" "}
          <a href={introductionVideoUrl} target="_blank" rel="noopener noreferrer">
            mở video tại đây
          </a>.
        </p>
      )}
    </figure>
  );
}
