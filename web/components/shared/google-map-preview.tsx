"use client";

import { cn } from "@/lib/utils";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { MapPin } from "lucide-react";
import type { CSSProperties } from "react";

const mapContainerStyle: CSSProperties = {
  width: "100%",
  height: "100%",
};

type GoogleMapPreviewProps = {
  latitude: number | null;
  longitude: number | null;
  className?: string;
};

function GoogleMapPreviewLoaded({
  latitude,
  longitude,
  className,
}: {
  latitude: number;
  longitude: number;
  className?: string;
}) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["places"],
  });

  if (loadError) {
    return (
      <div
        className={cn(
          "flex min-h-36 w-full items-center justify-center rounded-lg border border-border bg-muted/30 px-3 text-center text-xs text-destructive",
          className,
        )}
      >
        Could not load Google Maps.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className={cn(
          "flex min-h-36 w-full animate-pulse items-center justify-center rounded-lg border border-border bg-muted/40 text-xs text-muted-foreground",
          className,
        )}
      >
        Loading map…
      </div>
    );
  }

  const center = { lat: latitude, lng: longitude };

  return (
    <div className={cn("min-h-36 w-full overflow-hidden rounded-lg", className)}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={15}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
        }}
      >
        <Marker position={center} />
      </GoogleMap>
    </div>
  );
}

/**
 * Read-only map for event location. Coordinates come from the event row (same
 * as {@link GoogleMapsInput} saves on create/edit).
 */
export function GoogleMapPreview({
  latitude,
  longitude,
  className,
}: GoogleMapPreviewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const hasCoords =
    latitude != null &&
    longitude != null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  if (!hasCoords) {
    return (
      <div
        className={cn(
          "flex min-h-36 w-full flex-col items-center justify-center gap-1 rounded-lg border border-border bg-muted/30 px-3 text-center",
          className,
        )}
      >
        <MapPin className="size-5 text-muted-foreground" aria-hidden />
        <p className="text-xs text-muted-foreground">
          No map pin for this location yet. Set the address on the edit page to
          place the event on the map.
        </p>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div
        className={cn(
          "flex min-h-36 w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-3 text-center text-xs text-muted-foreground",
          className,
        )}
      >
        Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to show the map preview.
      </div>
    );
  }

  return (
    <GoogleMapPreviewLoaded
      latitude={latitude}
      longitude={longitude}
      className={className}
    />
  );
}
