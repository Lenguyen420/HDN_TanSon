import { useEffect, useRef, useState } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { LocalGoPlace } from "@/services/localgo";
const center: L.LatLngTuple = [10.811, 106.632];
const noPlaces: LocalGoPlace[] = [];
interface Props {
  places?: LocalGoPlace[];
  coordinates?: [number, number];
  onPick?: (coordinates: [number, number]) => void;
  onSelect?: (place: LocalGoPlace) => void;
}
export default function PlaceMap({
  places = noPlaces,
  coordinates,
  onPick,
  onSelect,
}: Props) {
  const container = useRef<HTMLDivElement>(null),
    map = useRef<L.Map>(),
    layer = useRef<L.LayerGroup>();
  const pick = useRef(onPick),
    select = useRef(onSelect);
  pick.current = onPick;
  select.current = onSelect;
  const [tileError, setTileError] = useState(false);
  useEffect(() => {
    if (!container.current) return;
    const instance = L.map(container.current, {
      scrollWheelZoom: false,
    }).setView(center, 14);
    map.current = instance;
    layer.current = L.layerGroup().addTo(instance);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    })
      .on("tileerror", () => setTileError(true))
      .addTo(instance);
    instance.on("click", (event: L.LeafletMouseEvent) =>
      pick.current?.([
        Number(event.latlng.lng.toFixed(6)),
        Number(event.latlng.lat.toFixed(6)),
      ]),
    );
    const resize = () => instance.invalidateSize();
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(resize)
        : undefined;
    observer?.observe(container.current);
    const timer = setTimeout(resize, 100);
    return () => {
      clearTimeout(timer);
      observer?.disconnect();
      instance.remove();
      map.current = undefined;
    };
  }, []);
  useEffect(() => {
    if (!map.current || !layer.current) return;
    layer.current.clearLayers();
    const points: L.LatLngTuple[] = [];
    for (const place of places) {
      const [lng, lat] = place.location.coordinates;
      points.push([lat, lng]);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "localgo-popup";
      button.textContent = `${place.name} · Xem chi tiết`;
      button.addEventListener("click", () => select.current?.(place));
      L.marker([lat, lng], {
        icon: L.divIcon({
          className: "localgo-pin",
          html: '<span aria-hidden="true">●</span>',
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        }),
        title: place.name,
        alt: place.name,
      })
        .bindPopup(button)
        .addTo(layer.current);
    }
    if (coordinates) {
      const [lng, lat] = coordinates;
      points.push([lat, lng]);
      L.circleMarker([lat, lng], {
        radius: 10,
        color: "#fff",
        weight: 3,
        fillColor: "#0879c8",
        fillOpacity: 1,
      }).addTo(layer.current);
    }
    if (points.length)
      map.current.fitBounds(L.latLngBounds(points), {
        padding: [30, 30],
        maxZoom: 16,
      });
  }, [places, coordinates]);
  return (
    <div className="localgo-map-wrap">
      <div
        ref={container}
        className="localgo-map"
        role="region"
        aria-label={
          onPick ? "Chạm bản đồ để chọn địa điểm" : "Bản đồ địa điểm LocalGo"
        }
      />
      {tileError && (
        <p className="localgo-hint" role="status">
          Chưa tải được nền bản đồ. Bạn vẫn có thể xem danh sách hoặc nhập tọa
          độ bên dưới.
        </p>
      )}
    </div>
  );
}
