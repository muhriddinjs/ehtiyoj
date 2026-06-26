"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState, useCallback } from "react";
import { MapTrifold, Crosshair } from "@phosphor-icons/react";

type Place = {
  id: number;
  name: string;
  lat: number;
  lon: number;
  distM: number;
  tags: string[];
  address?: string;
  phone?: string;
  openingHours?: string;
  website?: string;
};

export type RouteInfo = {
  lengthM: number;
  timeMin: number;
  mode: "auto" | "pedestrian";
  placeName: string;
};

type Props = {
  lat: number;
  lon: number;
  places: Place[];
  type: "masjid" | "hojatxona";
  nearest?: number;
  selectedPlace?: Place | null;
  navigateTo?: Place | null;
  routeMode?: "auto" | "pedestrian";
  onRouteReady?: (info: RouteInfo | null) => void;
  onCenterUser?: () => void;
  pickMode?: boolean;
  onPick?: (lat: number, lon: number) => void;
  height?: string;
};

declare global {
  interface Window {
    ymaps: any;
  }
}

export default function YandexMap({
  lat, lon, places, type, nearest,
  selectedPlace, navigateTo, routeMode = "auto",
  onRouteReady, onCenterUser, pickMode, onPick, height = "55vh",
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const placemarkRefs = useRef<Map<number, any>>(new Map());
  const routeRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || "";

  // Yo'nalishni tozalash
  const clearRoute = useCallback(() => {
    if (routeRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.geoObjects.remove(routeRef.current);
      routeRef.current = null;
    }
  }, []);

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
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=uz_UZ&load=package.full`;
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
    }, {
      // POI (dokon, restoran, kafe...) interaktivligini o'chirish
      yandexMapDisablePoiInteractivity: true,
    });

    // Xarita uslubi
    mapInstanceRef.current.options.set({
      suppressMapOpenBlock: true,
    });

    // Custom marker ikonkalari
    const markerConfig = type === "masjid"
      ? { normal: "/markers/mosque-marker.svg", active: "/markers/mosque-marker-active.svg" }
      : { normal: "/markers/toilet-marker.svg", active: "/markers/toilet-marker-active.svg" };
    const normalSize = [36, 48] as [number, number];
    const activeSize = [40, 54] as [number, number];

    // Foydalanuvchi pozitsiyasi — custom icon
    const userPlacemark = new ymaps.Placemark(
      [lat, lon],
      { hintContent: "Siz bu yerdasiz" },
      {
        iconLayout: "default#image",
        iconImageHref: "/markers/user-marker.svg",
        iconImageSize: [24, 24],
        iconImageOffset: [-12, -12],
        zIndex: 1000,
      }
    );
    mapInstanceRef.current.geoObjects.add(userPlacemark);

    // Joylar markerları — custom SVG ikonkalar
    places.forEach((place) => {
      const isNearest = place.id === nearest;
      const dist = place.distM < 1000
        ? `${place.distM} m`
        : `${(place.distM / 1000).toFixed(1)} km`;

      const iconSize = isNearest ? activeSize : normalSize;
      const iconHref = isNearest ? markerConfig.active : markerConfig.normal;

      const placemark = new ymaps.Placemark(
        [place.lat, place.lon],
        {
          balloonContentHeader: `<strong>${place.name}</strong>`,
          balloonContentBody: `
            <div style="font-size:13px; color:var(--text); line-height: 1.5;">
              <div style="color:#64748B; margin-bottom:6px;">${dist} • ${place.tags.join(", ")}</div>
              ${place.address ? `<div style="margin-bottom:4px;">📍 ${place.address}</div>` : ""}
              ${place.openingHours ? `<div style="margin-bottom:4px;">🕒 ${place.openingHours}</div>` : ""}
              ${place.phone ? `<div style="margin-bottom:4px;">📞 <a href="tel:${place.phone}" style="color:#0EA5E9; text-decoration:none;">${place.phone}</a></div>` : ""}
              ${place.website ? `<div style="margin-bottom:4px;">🌐 <a href="${place.website.startsWith('http') ? place.website : `https://${place.website}`}" target="_blank" style="color:#0EA5E9; text-decoration:none;">Veb-sayt</a></div>` : ""}
            </div>
          `,
          hintContent: place.name,
        },
        {
          iconLayout: "default#image",
          iconImageHref: iconHref,
          iconImageSize: iconSize,
          iconImageOffset: [-iconSize[0] / 2, -iconSize[1]],
          zIndex: isNearest ? 900 : 100,
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
        routeRef.current = null;
      }
    };
  }, [loaded, lat, lon, places, type, nearest]);

  // Pick mode — xaritaga bosib joy tanlash
  const pickMarkerRef = useRef<any>(null);
  useEffect(() => {
    if (!loaded || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const ymaps = window.ymaps;

    const el = map.container.getElement() as HTMLElement;
    if (pickMode) {
      el.style.cursor = "crosshair";
      const handler = (e: any) => {
        const coords = e.get("coords");
        const [pLat, pLon] = coords;
        if (pickMarkerRef.current) {
          map.geoObjects.remove(pickMarkerRef.current);
        }
        const marker = new ymaps.Placemark(coords, { hintContent: "Tanlangan joy" }, {
          preset: "islands#redDotIcon",
          zIndex: 2000,
        });
        map.geoObjects.add(marker);
        pickMarkerRef.current = marker;
        onPick?.(pLat, pLon);
      };
      map.events.add("click", handler);
      return () => {
        map.events.remove("click", handler);
        el.style.cursor = "";
        if (pickMarkerRef.current) {
          map.geoObjects.remove(pickMarkerRef.current);
          pickMarkerRef.current = null;
        }
      };
    }
  }, [loaded, pickMode, onPick]);

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

  // Yo'nalish chizish
  useEffect(() => {
    if (!loaded || !mapInstanceRef.current) return;

    // Eski yo'nalishni tozalash
    clearRoute();

    if (!navigateTo) {
      onRouteReady?.(null);
      return;
    }

    const ymaps = window.ymaps;
    const map = mapInstanceRef.current;

    if (!ymaps.multiRouter) {
      console.error("Yandex Maps multiRouter is not loaded.");
      // Callback with fallback info if routing module fails to load
      onRouteReady?.({
        lengthM: navigateTo.distM,
        timeMin: Math.max(1, Math.round(navigateTo.distM / (routeMode === "auto" ? 500 : 80))),
        mode: routeMode,
        placeName: navigateTo.name,
      });
      return;
    }

    try {
      const multiRoute = new ymaps.multiRouter.MultiRoute(
        {
          referencePoints: [
            [lat, lon],
            [navigateTo.lat, navigateTo.lon],
          ],
          params: {
            routingMode: routeMode === "auto" ? "auto" : "pedestrian",
            results: 1,
          },
        },
        {
          // Yo'nalish chizig'i uslubi
          routeActiveStrokeWidth: 6,
          routeActiveStrokeColor: routeMode === "auto" ? "#0EA5E9" : "#059669",
          routeActiveStrokeStyle: "solid",
          wayPointStartVisible: false,
          wayPointFinishVisible: false,
          pinVisible: false,
          boundsAutoApply: true,
        }
      );

      // Yo'nalish tayyor bo'lganda ma'lumotlarni olish
      multiRoute.model.events.add("requestsuccess", () => {
      try {
        const activeRoute = multiRoute.getActiveRoute();
        if (activeRoute) {
          const props = activeRoute.properties.getAll();
          const lengthM = Math.round(props.distance.value);
          const timeSec = Math.round(props.duration.value);
          const timeMin = Math.max(1, Math.round(timeSec / 60));

          onRouteReady?.({
            lengthM,
            timeMin,
            mode: routeMode,
            placeName: navigateTo.name,
          });
        }
      } catch {
        // Ma'lumot olishda xatolik
        onRouteReady?.({
          lengthM: navigateTo.distM,
          timeMin: Math.max(1, Math.round(navigateTo.distM / (routeMode === "auto" ? 500 : 80))),
          mode: routeMode,
          placeName: navigateTo.name,
        });
      }
    });

      map.geoObjects.add(multiRoute);
      routeRef.current = multiRoute;

      // Xaritani yo'nalishga moslashtirish
      map.setBounds(
        [
          [Math.min(lat, navigateTo.lat) - 0.003, Math.min(lon, navigateTo.lon) - 0.003],
          [Math.max(lat, navigateTo.lat) + 0.003, Math.max(lon, navigateTo.lon) + 0.003],
        ],
        { duration: 400, checkZoomRange: true }
      );
    } catch (err) {
      console.error("Error creating route:", err);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, navigateTo, routeMode, lat, lon, clearRoute]);

  if (!loaded) {
    return (
      <div
        className="shimmer"
        style={{
          height,
          borderRadius: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 10,
          color: "var(--muted)",
          fontSize: 13,
        }}
      >
        <MapTrifold size={32} weight="duotone" style={{ color: "var(--muted)", opacity: 0.5 }} />
        Xarita yuklanmoqda...
      </div>
    );
  }

  return (
    <div
      style={{ height, overflow: "hidden", position: "relative" }}
    >
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

      {/* Meni topish tugmasi */}
      <button
        onClick={() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter([lat, lon], 16, { duration: 400 });
          }
          onCenterUser?.();
        }}
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          width: 40,
          height: 40,
          borderRadius: 12,
          border: "1px solid var(--border)",
          background: "var(--surface)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#0EA5E9",
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          zIndex: 10,
          transition: "transform 0.15s",
        }}
        aria-label="Meni topish"
        title="Joylashuvimga qaytish"
      >
        <Crosshair size={20} weight="bold" />
      </button>
    </div>
  );
}
