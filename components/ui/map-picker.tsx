"use client";

import * as React from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import Map, {
  Marker,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
  Source,
  Layer,
  MapRef,
  MapLayerMouseEvent,
  MarkerDragEvent,
  ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl, { StyleSpecification } from "maplibre-gl";
import { cn } from "@/lib/utils";

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

interface Location {
  latitude: number;
  longitude: number;
}

interface MapPickerProps {
  mode: "picker" | "display";
  onLocationChange?: (location: Location) => void;
  initialLocation?: Location;
  className?: string;
  hostelLocation?: Location;
}

export function MapPicker({
  mode,
  onLocationChange,
  initialLocation,
  className,
  hostelLocation,
}: MapPickerProps) {
  const [viewport, setViewport] = useState({
    latitude: initialLocation?.latitude || 5.6037,
    longitude: initialLocation?.longitude || -0.187,
    zoom: 12,
  });
  const [marker, setMarker] = useState<Location | null>(
    initialLocation || null
  );

  const mapRef = useRef<MapRef>(null);

  const handleMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      if (mode === "picker") {
        const { lngLat } = event;
        const newLocation = {
          latitude: lngLat.lat,
          longitude: lngLat.lng,
        };
        setMarker(newLocation);
        if (onLocationChange) {
          onLocationChange(newLocation);
        }
      }
    },
    [mode, onLocationChange]
  );

  useEffect(() => {
    if (mode === "display" && hostelLocation) {
      setViewport((prev) => ({
        ...prev,
        latitude: hostelLocation.latitude,
        longitude: hostelLocation.longitude,
        zoom: 15,
      }));
      setMarker(hostelLocation);
    }
  }, [mode, hostelLocation]);

  return (
    <div className={cn("h-full w-full rounded-lg overflow-hidden", className)}>
      <Map
        ref={mapRef}
        {...viewport}
        onMove={(evt: ViewStateChangeEvent) => setViewport(evt.viewState)}
        style={{ width: "100%", height: "100%" }}
        mapLib={maplibregl}
        mapStyle={`https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`}
        onClick={handleMapClick}
      >
        <GeolocateControl position="top-left" />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl />

        {marker && (
          <Marker
            longitude={marker.longitude}
            latitude={marker.latitude}
            anchor="bottom"
            draggable={mode === "picker"}
            onDragEnd={(event: MarkerDragEvent) => {
              if (mode === "picker") {
                const { lngLat } = event;
                const newLocation = {
                  latitude: lngLat.lat,
                  longitude: lngLat.lng,
                };
                setMarker(newLocation);
                if (onLocationChange) {
                  onLocationChange(newLocation);
                }
              }
            }}
          >
            <div className="pin" />
          </Marker>
        )}

        {mode === "display" && hostelLocation && (
          <Source
            id="route"
            type="geojson"
            data={{
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: [
                  [viewport.longitude, viewport.latitude],
                  [hostelLocation.longitude, hostelLocation.latitude],
                ],
              },
            }}
          >
            <Layer
              id="route"
              type="line"
              source="route"
              layout={{
                "line-join": "round",
                "line-cap": "round",
              }}
              paint={{
                "line-color": "#888",
                "line-width": 8,
              }}
            />
          </Source>
        )}
      </Map>
      <style jsx>{`
        .pin {
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          background: #00cae9;
          position: absolute;
          transform: rotate(-45deg);
          left: 50%;
          top: 50%;
          margin: -20px 0 0 -20px;
        }
        .pin:after {
          content: "";
          width: 14px;
          height: 14px;
          margin: 8px 0 0 8px;
          background: #e6e6e6;
          position: absolute;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}
