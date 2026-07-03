"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";

export type PlaceValue = {
  place_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
};

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
};

const DEFAULT_CENTER: [number, number] = [-34.6037, -58.3816]; // Buenos Aires
const DEFAULT_ZOOM = 4;
const SELECTED_ZOOM = 16;

export default function PlaceAutocomplete({
  value,
  onChange,
}: {
  value: PlaceValue | null;
  onChange: (place: PlaceValue) => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);

  const [query, setQuery] = useState(value?.name ?? "");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Inicializar el mapa una sola vez
  useEffect(() => {
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !mapContainerRef.current || mapRef.current) return;
      leafletRef.current = L;

      // Fix conocido: los íconos default de Leaflet no resuelven bien con
      // bundlers, así que apuntamos directo a un CDN.
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const initialCenter: [number, number] = value ? [value.lat, value.lng] : DEFAULT_CENTER;
      const initialZoom = value ? SELECTED_ZOOM : DEFAULT_ZOOM;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      if (value) {
        markerRef.current = L.marker(initialCenter).addTo(map);
      }

      map.on("click", async (e: any) => {
        const { lat, lng } = e.latlng;
        setSearching(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          const place: PlaceValue = {
            place_id: String(data.place_id ?? `${lat},${lng}`),
            name: data.name || data.display_name?.split(",")[0] || "Ubicación elegida",
            address: data.display_name ?? "",
            lat,
            lng,
          };
          placeMarker(lat, lng);
          setQuery(place.name);
          onChange(place);
        } catch (err) {
          console.error("Error al obtener el lugar:", err);
        } finally {
          setSearching(false);
        }
      });

      mapRef.current = map;
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function placeMarker(lat: number, lng: number) {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng]).addTo(map);
    }
    map.setView([lat, lng], SELECTED_ZOOM);
  }

  async function handleSearch(text: string) {
    setQuery(text);
    if (text.trim().length < 3) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=5`
      );
      const data: NominatimResult[] = await res.json();
      setResults(data);
      setShowResults(true);
    } catch (err) {
      console.error("Error al buscar el lugar:", err);
    } finally {
      setSearching(false);
    }
  }

  function selectResult(r: NominatimResult) {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    const place: PlaceValue = {
      place_id: String(r.place_id),
      name: r.name || r.display_name.split(",")[0],
      address: r.display_name,
      lat,
      lng,
    };
    setQuery(place.name);
    setShowResults(false);
    setResults([]);
    placeMarker(lat, lng);
    onChange(place);
  }

  return (
    <div>
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-parchment-dim" />
        <input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          className="input-field pl-9"
          placeholder="Buscá una cafetería o negocio..."
        />
        {searching && (
          <Loader2
            size={15}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-parchment-dim animate-spin"
          />
        )}
        {showResults && results.length > 0 && (
          <ul className="absolute z-30 mt-1.5 w-full bg-ink-soft border border-parchment-dim/25 rounded-sm shadow-xl max-h-56 overflow-y-auto">
            {results.map((r) => (
              <li key={r.place_id}>
                <button
                  type="button"
                  onClick={() => selectResult(r)}
                  className="w-full text-left px-4 py-2.5 text-sm text-parchment hover:bg-parchment/5 transition-colors truncate"
                >
                  {r.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="font-mono text-[11px] text-parchment-dim mt-2 mb-2">
        O tocá directamente el mapa para marcar el lugar
      </p>

      <div
        ref={mapContainerRef}
        className="w-full h-56 rounded-sm overflow-hidden border border-parchment-dim/20"
      />
    </div>
  );
}
