import { EntryPlaceEvent, EventSessionResponse, SessionData } from "../api/FetchEvent";
import SessionPicker from "./SessionPicker";
import { CalendarDaysIcon } from "@heroicons/react/24/solid";
import React from "react";

interface WhenBoxProps {
  event: EntryPlaceEvent;
  session: SessionData | null;
  showMoreDates: boolean;
}

const WhenBox: React.FC<WhenBoxProps> = ({ event, session, showMoreDates }) => {
  return (
    <div>
      <div className="flex md:mb-2 gap-3">
          <div>
            <span className="rounded-full bg-slate-50 p-2 inline-block">
              <CalendarDaysIcon className="size-6 md:size-8 text-slate-700" />
            </span>
          </div>
          <div className="text-slate-900 mb-0 pl font-medium pt-2 md:pt-3">
            {event.is_session == 0 && (
            <div className="text-slate-900 text-md pe-4">
              {event.date_formatted_full_pretty}
            </div>
            )}

            {/* Show current session (and optionally more sessions) */}
            {event.is_session == 1 && session && (
              <>
                <div className="text-slate-900 text-md pe-4">
                  {session.date_formatted_full_pretty}
                </div>
                {showMoreDates && event.future_sessions_count && (
                    <SessionPicker 
                    buttonTitle={`+${event.future_sessions_count} more dates`} 
                    modalHeading='Choose a Session'
                    id='session'
                    event={event}
                    />
                )}
              </>
            )}
          </div>
      </div>          
      
      {/* Show no sessions if there aren't any */}
      {event.is_session == 1 && !session && (
      <div className="text-slate-600 text-sm pe-4">
        No session dates available
      </div>
      )}
    </div>
  );
};

export default WhenBox;