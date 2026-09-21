import { EventSessionResponse, SessionData } from '../api/FetchEvent';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { ArrowDownIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import React from 'react';
import SessionPicker from './SessionPicker';

export interface HeaderProps {
  eventSessionResponse: EventSessionResponse;
  showMainCTA: boolean;
}

const EventDetailHeader: React.FC<HeaderProps> = ( { eventSessionResponse, showMainCTA }) => {
  const event = eventSessionResponse.event;
  const session: SessionData | null = eventSessionResponse.session;
  return (
    <div className="flex flex-col gap-2 md:gap-3 md:mb-4 text-red-700">
      <div className="flex-grow hidden md:block">
        {!event.is_session && (<div className="mb-2 text-sm text-red-700">{event.date_formatted_full_pretty}</div>)}
        {event.is_session == 1 && session && (
          <div className="text-gray-700 font-medium pe-4">
            {session.date_formatted_full_pretty} 
            {event.future_sessions_count && (
              <SessionPicker 
              buttonTitle={`+${event.future_sessions_count} more dates`} 
              modalHeading='Choose a Session'
              id='session'
              event={event}
              />
          )}
          </div>
        )}
        {event.is_session == 1 && !session && (
        <div className="text-slate-600 text-sm pe-4">
          No session dates available
        </div>
        )}
      </div>
      <h1 className="text-3xl font-medium md:text-4xl md:font-bold text-gray-900">{event.title}</h1>
    </div>
  );
};
export default EventDetailHeader;