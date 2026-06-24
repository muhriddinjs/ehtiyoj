"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";

type Place = {
  id: number;
  name: string;
  lat: number;
  lon: number;
  distM: number;
  tags: string[];
};

type Props = {
  lat: number;
  lon: number;
  places: Place[];
  type: "masjid" | "hojatxona";
  nearest?: number;
  selectedPlace?: Place | null;
};

declare global {
  interface Window {
    ymaps: any;
  }
}

export default function YandexMap({ lat, lon, places, type, nearest, selectedPlace }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const placemarkRefs = useRef<Map<number, any>>(new Map());
  const [loaded, setLoaded] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || "";

  // Yandex Maps skriptini yuklash (bir marta)
  useEffect(() => {
    if (window.ymaps) {
      window.ymaps.ready(() => setLoaded(true));
      return;
    }
    // Allaqachon yuklanmoqda bo'lsa qayta qo'shmaymiz
    const existingScript = document.getElementById("ymaps-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        window.ymaps?.ready(() => setLoaded(true));
      });
      return;
    }
    const script = document.createElement("script");
    script.id = "ymaps-script";
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=uz_UZ`;
    script.async = true;
    script.onload = () => {
      window.ymaps.ready(() => setLoaded(true));
    };
    document.head.appendChild(script);
  }, [apiKey]);

  // Xaritani yaratish
  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    
    const currentPlacemarkRefs = placemarkRefs.current;

    // Eski xaritani tozalash
    if (mapInstanceRef.current) {
      mapInstanceRef.current.destroy();
    }

    const ymaps = window.ymaps;

    mapInstanceRef.current = new ymaps.Map(mapRef.current, {
      center: [lat, lon],
      zoom: 15,
      controls: ["zoomControl"],
      type: "yandex#map",
    });

    // Xarita uslubi
    mapInstanceRef.current.options.set({
      suppressMapOpenBlock: true,
    });

    // Foydalanuvchi pozitsiyasi
    const userPlacemark = new ymaps.Placemark(
      [lat, lon],
      { hintContent: "Siz bu yerdasiz" },
      {
        preset: "islands#blueDotIcon",
        iconColor: "#38BDF8",
      }
    );
    mapInstanceRef.current.geoObjects.add(userPlacemark);

    // Joylar markerları
    const color = type === "masjid" ? "#34D399" : "#38BDF8";

    places.forEach((place) => {
      const isNearest = place.id === nearest;
      const dist = place.distM < 1000
        ? `${place.distM} m`
        : `${(place.distM / 1000).toFixed(1)} km`;

      const placemark = new ymaps.Placemark(
        [place.lat, place.lon],
        {
          balloonContentHeader: `<strong>${place.name}</strong>`,
          balloonContentBody: `<span style="color:#64748B;font-size:13px">${dist} • ${place.tags.join(", ")}</span>`,
          hintContent: place.name,
        },
        {
          preset: isNearest ? "islands#redIcon" : "islands#blueIcon",
          iconColor: isNearest ? "#F43F5E" : color,
        }
      );
      mapInstanceRef.current.geoObjects.add(placemark);
      placemarkRefs.current.set(place.id, placemark);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
        currentPlacemarkRefs.clear();
      }
    };
  }, [loaded, lat, lon, places, type, nearest]);

  // Tanlangan joyga o'tish
  useEffect(() => {
    if (!selectedPlace || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    map.setCenter([selectedPlace.lat, selectedPlace.lon], 17, {
      duration: 500,
    });
    // Balloon ochish
    const placemark = placemarkRefs.current.get(selectedPlace.id);
    if (placemark) {
      placemark.balloon.open();
    }
  }, [selectedPlace]);

  if (!loaded) {
    return (
      <div
        className="shimmer"
        style={{
          height: 240,
          borderRadius: 20,
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--muted)",
          fontSize: 13,
        }}
      >
        🗺 Xarita yuklanmoqda...
      </div>
    );
  }

  return (
    <div
      className="map-container"
      style={{ height: 240 }}
    >
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
