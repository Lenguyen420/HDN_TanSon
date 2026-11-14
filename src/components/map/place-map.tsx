import { useEffect, useRef, useState } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { validCoordinates, type LocalGoPlace } from "@/services/localgo";
import { localGoMap } from "@/datas/map";

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
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map>(),
    layer = useRef<L.LayerGroup>(),
    tiles = useRef<L.TileLayer>();
  const pick = useRef(onPick),
    select = useRef(onSelect);
  pick.current = onPick;
  select.current = onSelect;
  const [tileError, setTileError] = useState(false);
  useEffect(() => {
    if (!container.current) return;
    const [lng, lat] = localGoMap.center;
    const instance = L.map(container.current, {
      scrollWheelZoom: false,
    }).setView([lat, lng], 14);
    map.current = instance;
    layer.current = L.layerGroup().addTo(instance);
    tiles.current = L.tileLayer(localGoMap.tileUrl, {
      maxZoom: 19,
      attribution: localGoMap.attribution,
      referrerPolicy: "strict-origin-when-cross-origin",
      // Only request visible tiles; let the browser honour the tile cache.
      updateWhenIdle: true,
      keepBuffer: 1,
    })
      .on("tileerror", () => setTileError(true))
      .addTo(instance);
    instance.on("click", (event: L.LeafletMouseEvent) => {
      pick.current?.([
        Number(event.latlng.lng.toFixed(6)),
        Number(event.latlng.lat.toFixed(6)),
      ]);
    });
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => instance.invalidateSize())
        : undefined;
    observer?.observe(container.current);
    const timer = setTimeout(() => instance.invalidateSize(), 100);
    return () => {
      clearTimeout(timer);
      observer?.disconnect();
      instance.remove();
      map.current = undefined;
      layer.current = undefined;
      tiles.current = undefined;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !layer.current) return;
    layer.current.clearLayers();
    const points: L.LatLngTuple[] = [];
    const icon = L.divIcon({
      className: "localgo-pin",
      html: '<span aria-hidden="true">●</span>',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
    for (const place of places) {
      if (!validCoordinates(place.location.coordinates)) continue;
      const [lng, lat] = place.location.coordinates;
      points.push([lat, lng]);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "localgo-popup";
      button.textContent = `${place.name} · Xem chi tiết`;
      button.addEventListener("click", () => select.current?.(place));
      L.marker([lat, lng], { icon, title: place.name, alt: place.name })
        .bindPopup(button)
        .addTo(layer.current);
    }
    if (coordinates && validCoordinates(coordinates)) {
      const [lng, lat] = coordinates;
      points.push([lat, lng]);
      const marker = L.marker([lat, lng], {
        icon,
        title: "Vị trí địa điểm",
        alt: "Vị trí địa điểm",
        draggable: Boolean(pick.current),
      }).addTo(layer.current);
      marker.on("dragend", () => {
        const position = marker.getLatLng();
        pick.current?.([
          Number(position.lng.toFixed(6)),
          Number(position.lat.toFixed(6)),
        ]);
      });
    }
    if (points.length)
      map.current.fitBounds(L.latLngBounds(points), {
        padding: [30, 30],
        maxZoom: 16,
      });
    else {
      const [lng, lat] = localGoMap.center;
      map.current.setView([lat, lng], 14);
    }
  }, [places, coordinates]);

  return (
    <div className="localgo-map-wrap">
      <div
        ref={container}
        className="localgo-map"
        role="region"
        aria-label={
          onPick
            ? "Chạm bản đồ để chọn địa điểm"
            : "Bản đồ OpenStreetMap địa điểm LocalGo"
        }
      />
      {tileError && (
        <div className="localgo-hint" role="status">
          Chưa tải được nền bản đồ. Bạn vẫn có thể xem địa điểm hoặc nhập tọa độ
          thủ công.{" "}
          <button
            type="button"
            onClick={() => {
              setTileError(false);
              tiles.current?.redraw();
            }}
          >
            Tải lại bản đồ
          </button>
        </div>
      )}
    </div>
  );
}
