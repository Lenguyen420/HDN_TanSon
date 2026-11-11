import { useEffect, useRef, useState } from "react";
import type { BannerItem } from "@/datas/types";

export default function Banner({ banners }: { banners: BannerItem[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    if (banners.length < 2 || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % banners.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [paused, banners.length]);

  return (
    <section
      className="banner"
      aria-label="Hoạt động nổi bật"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setPaused(false);
      }}
      onTouchStart={(event) => {
        touchStart.current = event.touches[0].clientX;
        setPaused(true);
      }}
      onTouchCancel={() => { touchStart.current = null; setPaused(false); }}
      onTouchEnd={(event) => {
        if (touchStart.current !== null) {
          const distance = touchStart.current - event.changedTouches[0].clientX;
          if (banners.length > 1 && Math.abs(distance) > 40) {
            setActive((current) => (current + (distance > 0 ? 1 : banners.length - 1)) % banners.length);
          }
        }
        touchStart.current = null;
        setPaused(false);
      }}
    >
      <div className="banner-track" style={{ transform: `translateX(-${active * 100}%)` }}>
        {banners.map(({ image, alt }, index) => (
          <div className="banner-slide" key={image} aria-hidden={index !== active}>
            <img src={image} alt={alt} loading={index === 0 ? "eager" : "lazy"} draggable={false} />
          </div>
        ))}
      </div>
      <div className="banner-dots">
        {banners.map((banner, index) => (
          <button
            key={banner.image}
            type="button"
            aria-label={`Xem banner ${index + 1}`}
            aria-pressed={active === index}
            className={active === index ? "is-active" : ""}
            onClick={() => setActive(index)}
          ><span /></button>
        ))}
      </div>
    </section>
  );
}
