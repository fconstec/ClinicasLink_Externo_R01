// Adicione este bloco logo no topo do arquivo:
declare global {
  interface Window {
    google: any;
  }
}

import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ClinicCard from "../components/ClinicCard";
import { Clinic } from "../components/HomePage/types";
import { GOOGLE_MAPS_LOADER_OPTIONS } from "../config/googleMapsConfig";
import { API_BASE_URL } from "@/api/apiBase";

const defaultPosition = { lat: -23.55052, lng: -46.633308 };
const userIconUrl = "https://cdn-icons-png.flaticon.com/512/64/64113.png";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "400px",
  maxHeight: "700px"
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// Função universal: aceita snake_case e camelCase dos campos
function getClinicLatLng(clinic: any): { lat: number, lng: number } | null {
  const s = clinic.settings || clinic;

  // Snake_case (backend)
  if (
    s.latitude_map !== null && s.latitude_map !== undefined &&
    s.longitude_map !== null && s.longitude_map !== undefined &&
    !isNaN(Number(s.latitude_map)) && !isNaN(Number(s.longitude_map))
  ) {
    return { lat: Number(s.latitude_map), lng: Number(s.longitude_map) };
  }
  if (
    s.latitude_address !== null && s.latitude_address !== undefined &&
    s.longitude_address !== null && s.longitude_address !== undefined &&
    !isNaN(Number(s.latitude_address)) && !isNaN(Number(s.longitude_address))
  ) {
    return { lat: Number(s.latitude_address), lng: Number(s.longitude_address) };
  }

  // CamelCase (frontend/supabase)
  if (
    s.latitudeMap !== null && s.latitudeMap !== undefined &&
    s.longitudeMap !== null && s.longitudeMap !== undefined &&
    !isNaN(Number(s.latitudeMap)) && !isNaN(Number(s.longitudeMap))
  ) {
    return { lat: Number(s.latitudeMap), lng: Number(s.longitudeMap) };
  }
  if (
    s.latitudeAddress !== null && s.latitudeAddress !== undefined &&
    s.longitudeAddress !== null && s.longitudeAddress !== undefined &&
    !isNaN(Number(s.latitudeAddress)) && !isNaN(Number(s.longitudeAddress))
  ) {
    return { lat: Number(s.latitudeAddress), lng: Number(s.longitudeAddress) };
  }

  // Fallback: latitude/longitude padrão
  if (
    s.latitude !== null && s.latitude !== undefined &&
    s.longitude !== null && s.longitude !== undefined &&
    !isNaN(Number(s.latitude)) && !isNaN(Number(s.longitude))
  ) {
    return { lat: Number(s.latitude), lng: Number(s.longitude) };
  }

  return null;
}

const SearchResultsPage: React.FC = () => {
  const query = useQuery();
  const navigate = useNavigate();

  const searchTerm = query.get("searchTerm");
  const location = query.get("location");
  const specialty = query.get("specialty");

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [userAccuracy, setUserAccuracy] = useState<number | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(defaultPosition);

  const { isLoaded, loadError } = useJsApiLoader(GOOGLE_MAPS_LOADER_OPTIONS);

  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const userCircleRef = useRef<any>(null);

  // Busca clínicas apenas quando os parâmetros de busca mudam
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.append("searchTerm", searchTerm);
    if (location) params.append("location", location);
    if (specialty) params.append("specialty", specialty);
    fetch(`${API_BASE_URL}/clinics?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        // Debug: veja como chegam os dados
        console.log("Clinics received:", data);
        setClinics(Array.isArray(data) ? data : []);
      })
      .catch(() => setClinics([]))
      .finally(() => setLoading(false));
  }, [searchTerm, location, specialty]);

  // Decide se usa localização real do usuário ou geocodifica a localização informada
  useEffect(() => {
    let isMounted = true;
    const useUserLocation = !location || location.trim() === "" || location.trim().toLowerCase() === "sua localização";
    if (useUserLocation) {
      let watchId: number;
      if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            if (!isMounted) return;
            setUserPosition({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            setUserAccuracy(position.coords.accuracy);
            setMapCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
          },
          (err) => {
            if (!isMounted) return;
            setUserPosition(null);
            setUserAccuracy(null);
            setMapCenter(defaultPosition);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
          }
        );
      }
      return () => {
        isMounted = false;
        if (watchId) navigator.geolocation.clearWatch(watchId);
      };
    } else {
      const fetchGeocode = async () => {
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
              location ?? ""
            )}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
          );
          const data = await response.json();
          if (data.status === "OK" && data.results.length > 0) {
            const { lat, lng } = data.results[0].geometry.location;
            setMapCenter({ lat, lng });
            setUserPosition(null);
            setUserAccuracy(null);
          } else {
            setMapCenter(defaultPosition);
          }
        } catch (e) {
          setMapCenter(defaultPosition);
        }
      };
      fetchGeocode();
    }
    // eslint-disable-next-line
  }, [location]);

  // Renderização dos marcadores das clínicas
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google?.maps?.Marker) return;
    console.log("Rendering clinic markers...", clinics);

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    clinics.forEach((clinic) => {
      const latLng = getClinicLatLng(clinic);
      console.log("Marcador para clínica:", clinic.name, latLng);

      if (!latLng) return;

      const marker = new window.google.maps.Marker({
        map: mapRef.current,
        position: latLng,
        title: clinic.name,
        draggable: false,
      });
      marker.addListener("click", () => setSelectedClinic(clinic));
      markersRef.current.push(marker);
    });

    const bounds = new window.google.maps.LatLngBounds();
    let hasMarker = false;
    if (userPosition) {
      bounds.extend(userPosition);
      hasMarker = true;
    }
    clinics.forEach((clinic) => {
      const latLng = getClinicLatLng(clinic);
      if (latLng) {
        bounds.extend(latLng);
        hasMarker = true;
      }
    });
    if (hasMarker) {
      mapRef.current.fitBounds(bounds);
    } else {
      mapRef.current.setCenter(mapCenter);
      mapRef.current.setZoom(13);
    }

    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [clinics, isLoaded, userPosition, mapCenter]);

  // Marcador do usuário
  useEffect(() => {
    if (
      !isLoaded ||
      !mapRef.current ||
      !window.google?.maps?.Marker ||
      !window.google?.maps?.Size
    )
      return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
      userMarkerRef.current = null;
    }
    if (userCircleRef.current) {
      userCircleRef.current.setMap(null);
      userCircleRef.current = null;
    }
    if (userPosition) {
      userMarkerRef.current = new window.google.maps.Marker({
        map: mapRef.current,
        position: userPosition,
        title: "Sua localização",
        icon: {
          url: userIconUrl,
          scaledSize: new window.google.maps.Size(32, 32)
        }
      });
      if (userAccuracy && window.google?.maps?.Circle) {
        userCircleRef.current = new window.google.maps.Circle({
          strokeColor: "#4285F4",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#4285F4",
          fillOpacity: 0.18,
          map: mapRef.current,
          center: userPosition,
          radius: userAccuracy,
        });
      }
    }
    return () => {
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
      }
      if (userCircleRef.current) {
        userCircleRef.current.setMap(null);
        userCircleRef.current = null;
      }
    };
  }, [userPosition, isLoaded, userAccuracy]);

  const handleGoToDetails = (clinicId: number) => {
    navigate(`/clinica/${clinicId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 flex flex-col">
      <Header />

      <div
        className="flex px-2 md:px-8 gap-4"
        style={{ minHeight: 600, height: 600, maxHeight: 700 }}
      >
        {/* Cards - coluna esquerda */}
        <div className="w-1/4 min-w-[250px] max-w-xs h-full overflow-y-auto flex flex-col gap-4 pr-1">
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : clinics.length === 0 ? (
            <div className="text-center py-8">Nenhuma clínica encontrada.</div>
          ) : (
            clinics.map((clinic) => (
              <div
                key={clinic.id}
                className="cursor-pointer"
                onClick={() => handleGoToDetails(clinic.id)}
              >
                <ClinicCard clinic={clinic} />
              </div>
            ))
          )}
        </div>

        {/* Mapa - lado direito */}
        <div className="flex-1 h-full" style={{ minHeight: 400, height: "100%", position: "relative" }}>
          {isLoaded && !loadError ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={13}
              onLoad={map => { mapRef.current = map; }}
              options={{ mapId: GOOGLE_MAPS_LOADER_OPTIONS.mapIds[0] || undefined }}
            >
            </GoogleMap>
          ) : (
            <div>Carregando mapa...</div>
          )}

          {/* Popup custom para clínica selecionada */}
          {selectedClinic && (
            <div
              style={{
                position: "absolute",
                right: 30,
                top: 30,
                zIndex: 100,
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                padding: 16,
                minWidth: 240,
                maxWidth: 280
              }}
            >
              <b>{selectedClinic.name}</b>
              <br />
              {selectedClinic.address || "Endereço não informado"}
              <br />
              <button
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
                onClick={() => handleGoToDetails(selectedClinic.id)}
              >Ver detalhes</button>
              <button
                className="ml-2 px-2 py-1 text-gray-500"
                onClick={() => setSelectedClinic(null)}
                title="Fechar"
              >×</button>
            </div>
          )}
          {userAccuracy && (
            <div style={{
              position: "absolute",
              left: 40,
              bottom: 40,
              zIndex: 200,
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: 6,
              padding: "4px 10px",
              fontSize: 13,
              color: "#333",
              boxShadow: "0 1px 4px rgba(0,0,0,0.10)"
            }}>
              Precisão da localização: {Math.round(userAccuracy)} metros
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SearchResultsPage;