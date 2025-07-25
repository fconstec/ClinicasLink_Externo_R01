import React, { useEffect, useRef } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { GOOGLE_MAPS_LOADER_OPTIONS } from "@/config/googleMapsConfig";

const containerStyle = { width: "100%", height: "400px" };
const defaultCenter = { lat: -23.55052, lng: -46.633308 };

type GoogleMapLocationSelectorProps = {
  value: { lat: number; lng: number };
  onChange: (val: { lat: number; lng: number }) => void;
};

function parseLatLng(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const num = typeof val === "string" ? Number(val) : val;
  return typeof num === "number" && !isNaN(num) ? num : null;
}

const GoogleMapLocationSelector: React.FC<GoogleMapLocationSelectorProps> = ({
  value,
  onChange,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);

  const { isLoaded, loadError } = useJsApiLoader(GOOGLE_MAPS_LOADER_OPTIONS);

  useEffect(() => {
    // LOG: veja o valor que chega!
    console.log("MAP PROPS (value):", value);

    if (!isLoaded || loadError) return;
    if (
      !window.google ||
      !window.google.maps ||
      !window.google.maps.marker ||
      !mapRef.current
    ) return;

    if (!mapInstance.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: (parseLatLng(value?.lat) !== null && parseLatLng(value?.lng) !== null)
          ? { lat: Number(value.lat), lng: Number(value.lng) }
          : defaultCenter,
        zoom: 15,
        mapId: GOOGLE_MAPS_LOADER_OPTIONS.mapIds?.[0] || undefined,
      });
    } else {
      // Sempre atualiza o centro se mudar o value!
      if (parseLatLng(value?.lat) !== null && parseLatLng(value?.lng) !== null) {
        mapInstance.current.setCenter({
          lat: Number(value.lat),
          lng: Number(value.lng),
        });
      }
    }
  }, [isLoaded, loadError, value.lat, value.lng]);

  useEffect(() => {
    if (!isLoaded || loadError) return;
    if (!window.google || !window.google.maps || !window.google.maps.marker) return;
    if (!mapInstance.current) return;

    // Remove marcador anterior
    if (markerInstance.current) {
      markerInstance.current.map = null;
      markerInstance.current = null;
    }

    // Só mostra marcador se lat/lng válidos
    if (parseLatLng(value?.lat) !== null && parseLatLng(value?.lng) !== null) {
      const { AdvancedMarkerElement } = window.google.maps.marker;
      const position = { lat: Number(value.lat), lng: Number(value.lng) };

      markerInstance.current = new AdvancedMarkerElement({
        map: mapInstance.current,
        position,
        gmpDraggable: true,
      });

      markerInstance.current.addListener("dragend", (e: any) => {
        if (e && e.latLng) {
          onChange({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        }
      });

      mapInstance.current.setCenter(position);

      mapInstance.current.addListener("click", (e: any) => {
        if (markerInstance.current && e.latLng) {
          markerInstance.current.position = e.latLng;
          onChange({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        }
      });
    }

    return () => {
      if (markerInstance.current) {
        markerInstance.current.map = null;
        markerInstance.current = null;
      }
    };
  }, [isLoaded, loadError, value?.lat, value?.lng, onChange]);

  if (loadError) return <div>Erro ao carregar o mapa.</div>;
  if (!isLoaded) return <div>Carregando mapa...</div>;

  return <div ref={mapRef} style={containerStyle} />;
};

export default GoogleMapLocationSelector;