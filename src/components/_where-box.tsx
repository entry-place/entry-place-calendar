import { EntryPlaceEvent } from "../api/FetchEvent";
import { MapPinIcon, VideoCameraIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import React from "react";

interface WhereBoxProps {
  event: EntryPlaceEvent;
}

const WhereBox: React.FC<WhereBoxProps> = ({ event }) => {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`;
  return (
    <div>
      <div className="flex md:mb-2 gap-3">
        <div className="flex mb-2">
          <div>
            <span className="rounded-full bg-slate-50 p-2 inline-block">
              {event.location_type === "address" && (
              <MapPinIcon className="size-6 md:first:size-8 text-slate-900" />
              )}
              {event.location_type === "online" && (
                <VideoCameraIcon className="size-6 md:first:size-8 text-slate-900" />
              )}
              {event.location_type === "tba" && (
                <MapPinIcon className="size-6 md:first:size-8 text-slate-900" />
              )}
            </span>
          </div>
          <div className="text-slate-900 mb-0 pl-2 font-medium text-md">
            
            {event.location_type === "address" && (
              <>
              <div className="mb-0.5 text-slate-900 hover:underline">
                <a target="_blank" href={mapUrl} >
                {event.location_name}
                </a>
              </div>
              <div className="text-slate-700 font-normal text-sm hover:underline">
                <a target="_blank" href={mapUrl} >
                  {event.location_address}
                </a>
              </div>
              {/* <div className="pb-1">
                <a target="_blank" href={mapUrl} 
                className="pt-1 text-sm text-indigo-600 underline font-semibold hover:text-indigo-900">
                  Open in Google Maps
                  </a>
              </div> */}
            </>
            )}

            {event.location_type === "online" && (
            <>
              <div className="mb-0.5 text-slate-900">
                Online Event
              </div>
              <div className="text-slate-700 font-normal text-sm">
                  This event is online
              </div>
            </>
            )}

            {event.location_type === "tba" && (
            <>
              <div className="mt-2 mb-0.5 text-slate-900">
                Location to be announced
              </div>
            </>
            )}


          </div>
        </div>
      </div>
    </div>
  );
};

export default WhereBox;