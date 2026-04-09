"use client";

import { cn } from "@/lib/utils";
import { Libraries, StandaloneSearchBox, useJsApiLoader } from "@react-google-maps/api";
import { MapPin, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const libraries: Libraries = ["places"];

export interface LocationResult {
  address: string;
  country?: string;
  lat: number | null;
  lng: number | null;
}

interface GoogleMapsInputProps {
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onLocationChange: (result: LocationResult) => void;
  onClear?: () => void;
  onBlur?: () => void;
}

export function GoogleMapsInput({
  value = "",
  placeholder = "Event Location",
  disabled,
  className,
  onLocationChange,
  onClear,
  onBlur,
}: GoogleMapsInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  // Keep local state in sync with external value changes (e.g. form reset)
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputValue(text);
    onLocationChange({ address: text, lat: null, lng: null });
  };

  const handlePlaceChanged = () => {
    const places = searchBoxRef.current?.getPlaces();
    if (!places || places.length === 0) return;

    const place = places[0];
    const location = place.geometry?.location;
    const countryComponent = place.address_components?.find((c) =>
      c.types.includes("country"),
    );

    const address =
      place.name && place.vicinity
        ? `${place.name}, ${place.vicinity}`
        : place.name || place.vicinity || place.formatted_address || "";

    if (!address) return;

    setInputValue(address);
    onLocationChange({
      address,
      country: countryComponent?.long_name,
      lat: location?.lat() ?? null,
      lng: location?.lng() ?? null,
    });
  };

  const handleClear = () => {
    setInputValue("");
    onLocationChange({ address: "", lat: null, lng: null });
    onClear?.();
  };

  const inputClass = cn(
    "h-11 w-full rounded-lg border border-input bg-surface pl-10 pr-8 text-sm text-body placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
    className,
  );

  if (!isLoaded) {
    return (
      <div className="relative w-full">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          disabled
          placeholder="Loading..."
          className={inputClass}
        />
      </div>
    );
  }

  return (
    <StandaloneSearchBox
      onLoad={(ref) => { searchBoxRef.current = ref; }}
      onPlacesChanged={handlePlaceChanged}
    >
      <div className="relative w-full">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          type="text"
          value={inputValue}
          placeholder={placeholder}
          disabled={disabled}
          onChange={handleTextChange}
          onBlur={onBlur}
          autoComplete="off"
          className={inputClass}
        />
        {inputValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-body"
            aria-label="Clear location"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </StandaloneSearchBox>
  );
}
