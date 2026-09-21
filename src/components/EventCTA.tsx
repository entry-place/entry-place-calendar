"use client";
import { EventSessionResponse, SessionData } from '../api/FetchEvent';
import { XCircleIcon } from '@heroicons/react/16/solid';
import {  ArrowRightIcon, ClockIcon } from '@heroicons/react/16/solid';
import React from 'react';
import SessionPicker from './SessionPicker';
import { useSearchParams } from 'next/navigation';
import { Button } from './Button';
import { ArrowUpOnSquareIcon } from '@heroicons/react/24/solid';
import ridernetLogo from '../assets/ridernet-ma-logo.png';

export interface HeaderProps {
  eventSessionResponse: EventSessionResponse;
}

const EventCTA: React.FC<HeaderProps> = ( { eventSessionResponse }) => {
  const event = eventSessionResponse.event;
  const session: SessionData | null = eventSessionResponse.session;
  var backgroundClass = null;
  var title = null;
  var subtitle = null;
  var isActiveState = true;
  var icon: React.ReactNode = null;
  var badgeClass = '';
  var status = event.entries_status;

  // Check if we're in an iframe
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  const searchParams = useSearchParams();
  const forceOpenId: string | null = searchParams.get("forceOpenId");
  var decodedEventId: null | string = null;
  if (forceOpenId) {
    try {
      decodedEventId = atob(forceOpenId);
    } catch (err) {
      console.error("Error decoding forceOpenId:", err);
    }
  }

  var eventUrl = `/${event.entries_reference_prefix}/select`;
  // We force open the event open if the forceOpenId is set and matches the event id
  if (decodedEventId && decodedEventId !== event.id) {
    status = 'Live';
    eventUrl = `/${event.entries_reference_prefix}/select?forceOpenId=${forceOpenId}`;
  }

  if (session) {
    status = 'Live';
  }
  switch (status) {
    case 'Closed':
    case 'Closing':
      title = 'Entries Closed';
      // subtitle = 'No longer accepting entries.';
      badgeClass = 'bg-orange-50 text-orange-600';
      isActiveState = false;
      icon = <XCircleIcon className="h-4 w-4 text-orange-600 me-2" />;
      break;
    case 'Pending Information':
      title = 'Entries Opening Soon';
      subtitle = 'Please check back soon.';
      badgeClass = 'text-blue-600 bg-blue-50';
      isActiveState = false;
      icon = <ClockIcon className="h-4 w-4 text-blue-600 me-2" />;
      break;
  
    case 'Cancelled':
      title = 'Event Cancelled';
      subtitle = null;
      badgeClass = 'bg-red-50 text-red-600';
      isActiveState = false;
      icon = <XCircleIcon className="h-4 w-4 text-red-600 me-2" />;
      break;

    case 'Postponed Pending New Date':
      title = 'Event Postponed';
      subtitle = 'This event has been postponed and waiting on a new date.';
      badgeClass = 'text-blue-600';
      isActiveState = false;
      break;

    case 'Live':
    case 'Force Open':
      break;

    default:
      break;
  }
 
  var badgeClass = 'inline-flex items-center rounded-md px-2 py-1 text-sm font-medium ring-1 ring-inset ring-red-600/10' + ' ' + badgeClass;

  return (
    <>
      {!isActiveState && (
        <div className='flex flex-col text-gray-900 items-center gap-x-6 p-3 md:p-6 shadow-sm md:rounded-lg bg-gray-50 font-medium border-t border-gray-200 md:border'>
          <div className='flex flex-row md:flex-col items-center'>
            <div className={badgeClass}>{icon && (icon)}{title}</div>
            <div className='hidden md:block mt-3 ms-4 md:ms-0 text-sm font-normal text-gray-500 mb-3'>{subtitle}</div>
          </div>
          <button disabled className="mt-3 md:mt-0 w-full flex-grow bg-gray-400 hover:bg-gray-600 cursor-not-allowed text-white text-md font-medium px-4 py-3 rounded-md transition-colors duration-300 whitespace">
            {event.main_purchase_cta}
            <ArrowRightIcon className="hidden md:inline-block h-5 w-5 text-white -mt-1 ms-2" />
          </button>
        </div>
        )}

      {isActiveState && (
        <>
        <div className="ring-1 ring-black/5 rounded-lg mb-4 shadow-[inset_0_0_2px_1px_#ffffff4d]">
          <div className="rounded-md shadow-md shadow-black/5 p-2 relative backdrop-blur-xl">
            <div className="shadow-2xl ring-1 ring-black/5 p-4 rounded-md bg-white">
              <div className='flex flex-col text-white-900 gap-x-6  bg-white font-medium text-center'>
                  {/* Show Ridernet button even if Entry Place entries are disabled */}
                  {event.enter_on_ridernet && event.rider_entry_url ? (
                    <Button
                      href={event.rider_entry_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="primary"
                    >
                      <img
                        src={ridernetLogo.src}
                        alt="Ridernet"
                        className="h-4 w-4 me-2 -mt-0.5"
                      />
                      Enter on Ridernet
                      <ArrowRightIcon className="hidden md:inline-block h-5 w-5 text-white ms-2 -mt-0.5" />
                    </Button>
                  ) : (
                    /* Regular EntryPlace Button - only show if entries are not disabled */
                    event.entries_status != 'Disabled' && event.entries_status != 'Postponed Pending New Date' && (
                      <a
                        href={eventUrl}
                        target={isInIframe ? "_blank" : "_self"}
                        rel={isInIframe ? "noopener noreferrer" : undefined}
                        className="bg-gray-950 shadow-md hover:bg-gray-800 text-sm font-normal text-white px-4 py-3 rounded-full transition-colors duration-300 disabled:bg-gray-500 disabled:outline disabled:outline-1 disabled:outline-gray-400"
                      >
                        {event.main_purchase_cta}
                        <ArrowRightIcon className="hidden md:inline-block h-5 w-5 text-white ms-2" />
                      </a>
                    )
                  )}

                  {/* Ridernet close date - separate from Entry Place logic */}
                  {!eventSessionResponse.event.is_session && event.enter_on_ridernet && event.close_date_timestamp && Number(event.close_date_timestamp) > 0 && (
                    <div className='text-xs flex flex-col items-center text-gray-400 mt-3 md:mt-4 md:-mb-1'>
                      <div className='text-center'>
                        <span className='font-medium text-gray-500 me-1'>Entries close: </span>
                        {event.close_date_pretty} {event.close_date_timezone}
                      </div>
                    </div>
                  )}

                  {/* Entry Place status - only show for Entry Place events */}
                  {!eventSessionResponse.event.is_session && !event.enter_on_ridernet && (
                    <div className='text-xs flex flex-col items-center text-gray-400 mt-3 md:mt-4 md:-mb-1'>
                      <div className='text-center'>
                            {(event.entries_status == 'Live' || event.entries_status == 'Force Open') && (
                              <>
                              <span className='font-medium text-gray-500 me-1'>Entries close: </span>
                              {event.close_date_pretty} {event.close_date_timezone}
                              </>
                            )}
                            {!(event.entries_status == 'Live' || event.entries_status == 'Force Open') && (
                              <>
                              {event.entries_public_status}
                              </>
                            )}
                      </div>
                    </div>
                  )}
              </div>             
            </div>             
          </div>             
        </div>             
        </>
      )}
    </>
  );
};
export default EventCTA;