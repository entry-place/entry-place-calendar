import { EntryPlaceEvent } from "../api/FetchEvent";
import ContactOrganiserModal from "./ContactOrganiserModal";
import Link from "next/link";
import React, { useState } from "react";

interface ContactBoxProps {
  event: EntryPlaceEvent;
}

const ContactBox: React.FC<ContactBoxProps> = ({ event }) => {

  const [isContactOpen, setContactOpen] = useState(false);
  
  return (
    <div className="basis-1/3 rounded-lg">
      <div className="pt-5 pb-3 md:pb-5 flex">
          <span>
            {event.organiser_image_url && (
              <div className="h-12 w-12">
              <Link href={`/organiser/${event.event_organiser_slug}`}>
                <img 
                className="img-fluid rounded-lg h-12 w-12" 
                src={event.organiser_image_url}
                alt="avatar" 
                />
              </Link>
              </div>
            )}
          </span>
          <div className="pl-3 text-gray-400">
            <div className="text-gray-800 mb-0 font-normal hover:underline">
                <Link className="font-medium text-slate-700" 
                href={`/organiser/${event.event_organiser_slug}`}
                >{event.organiser_name} </Link>
            </div>
            <div>
                <button
                  className="text-slate-500 text-sm underline"
                  onClick={() => setContactOpen(true)}
                >
                  Contact event organiser
                </button>
            </div>

            <ContactOrganiserModal
              isOpen={isContactOpen}
              onClose={() => setContactOpen(false)}
              event={event}
            />
          </div>
      </div>
    </div>
  );
};

export default ContactBox;