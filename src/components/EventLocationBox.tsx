"use client";
import React from "react";
import { EntryPlaceEvent } from "../api/FetchEvent";
import { Button } from "./Button";

interface EventLocationBoxProps {
  event: EntryPlaceEvent;
}

const EventLocationBox = ({ event }: EventLocationBoxProps) => {
  const { location_type, location_name, location_address, latitude, longitude, title, online_description } = event;

  const hasCoordinates = latitude && longitude;

  const mapImageUrl = hasCoordinates
    ? `https://maps.googleapis.com/maps/api/staticmap?scale=2&center=${latitude},${longitude}&zoom=15&maptype=roadmap&size=640x320&format=png&scale=2&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&markers=size%3Asmall%7Ccolor%3A0xe0cce9%7Ccolor%3A0xF65858%7C${latitude},${longitude}`
    : null;

  var heading = "";
  switch (location_type) {
    case "address":
      heading = "Location";
      break;
    case "online":
      heading = "Online Event";
      break;
    case "tba":
      heading = "Location";
      break;
    default:
      heading = "Location Not Specified";
      break;
  }

  var subheading: string | null = null;
  if (location_type === "address") {
    subheading = location_name || null;
  } else if (location_type === "tba") {
    subheading = "To Be Announced";
  }

  var description: string | null = null;
  if (location_type === "online") {
    description = online_description || null;
  } else if (location_type === "address") {
    description = location_address || null;
  } else if (location_type === "tba") {
    description = "Check back soon for updates.";
  }

  return (
    <div className="mt-8 border-b border-gray-50 pb-12 mb-12">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{heading}</h3>

      {subheading && <h4 className="text-gray-700 font-medium">{subheading}</h4>}

      {description && <div className="text-gray-600 text-sm mb-4">{description}</div>}

      {/* Directions button */}
      {hasCoordinates && (
        <Button variant="outline"
          href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline mb-4"
        >
          Get Directions
        </Button>
      )}

      {/* Map Image */}

      {mapImageUrl && (
        <a href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`} target="_blank" rel="noopener noreferrer">
        <img
          className="w-full rounded-lg aspect-[640/320] object-cover"
          src={mapImageUrl}
          alt={`Map of ${location_name} • ${location_address}`}
          loading="lazy"
          title={`Map of ${location_name} • ${location_address}`}
        />
        </a>
      )}
    </div>
  );
};

export default EventLocationBox;