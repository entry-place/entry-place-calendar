"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { CalendarEvent, EntryPlaceCalendar, YearMonthEventGroup, getLocalEventPath } from '../api/FetchCalendar';
import { Button } from './Button';
import EventDrawer from './EventDrawer';
import SponsorAd from './SponsorAd';
import ridernetLogo from '../assets/ridernet-ma-logo.png';
import entryPlaceIcon from '../assets/entry-place-icon.png';

interface EventListGridProps {
  calendar: EntryPlaceCalendar;
  yearMonthEventGroups: YearMonthEventGroup[];
  isEmbedded: boolean;
  calendarColor: string;
  /**
   * Inline sponsor ads between event rows. `org` is the club's organiser
   * slug: ads are fetched and view/click events recorded against it, so it
   * travels with the handles rather than being defaulted. Omit the whole
   * object for no ads.
   */
  inlineAds?: { org: string; handles: string[] };
}

function pickByPosition(arr: string[], position: number): string {
  if (position === 0) return arr[0];
  return arr.length > 1 ? arr[1] : arr[0];
}

export default function EventListGrid({
  calendar,
  yearMonthEventGroups,
  isEmbedded,
  calendarColor,
  inlineAds
}: EventListGridProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Create flat list of all events for navigation
  const allEvents = yearMonthEventGroups.flatMap(group => group.events);
  
  const currentEventIndex = selectedEvent ? allEvents.findIndex(event => event.urlKey === selectedEvent.urlKey) : -1;
  const canNavigateUp = currentEventIndex > 0;
  const canNavigateDown = currentEventIndex >= 0 && currentEventIndex < allEvents.length - 1;

  // Use urlKey for URL parameters (supports both events and sessions)
  const getUrlKey = (event: CalendarEvent): string => {
    return event.urlKey;
  };

  // Check for 'es' query param on mount and open drawer if event exists
  useEffect(() => {
    const urlKey = searchParams.get('es');
    if (urlKey && allEvents.length > 0) {
      const event = allEvents.find(e => getUrlKey(e) === urlKey);
      if (event) {
        if (event.rider_entry_system === 'entry_place') {
          window.location.href = event.eventPath;
          return;
        }
        setSelectedEvent(event);
        setTimeout(() => setIsDrawerOpen(true), 0);
      }
    }
  }, [searchParams, allEvents]);

  // Update URL when drawer opens/closes
  const updateURL = (urlKey?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (urlKey) {
      params.set('es', urlKey);
    } else {
      params.delete('es');
    }

    let queryString = params.toString();
    // Unescape forward slashes in the es parameter
    queryString = queryString.replace(/es=([^&]*)/g, (match, value) => {
      return `es=${decodeURIComponent(value)}`;
    });

    const newURL = queryString ? `${pathname}?${queryString}` : pathname;

    router.replace(newURL, { scroll: false });
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.preventDefault();

    // Entry Place events go straight to entry.place
    if (event.rider_entry_system === 'entry_place') {
      window.location.href = event.eventPath;
      return;
    }

    // Check if mobile device (screen width < 500px, which is md breakpoint)
    const isMobile = window.innerWidth < 500;

    if (isMobile) {
      // On mobile, navigate directly to local event page
      router.push(getLocalEventPath(event));
    } else {
      // On desktop, open drawer
      setSelectedEvent(event);
      // Small delay to ensure the Dialog mounts before animation starts
      setTimeout(() => {
        setIsDrawerOpen(true);
        // Update URL after drawer starts opening to avoid animation interference
        const urlKey = getUrlKey(event);
        updateURL(urlKey);
      }, 0);
    }
  };

  const handleDrawerClose = () => {
    updateURL(); // Remove 'es' param from URL immediately
    // Start close animation after short delay
    setTimeout(() => {
      setIsDrawerOpen(false);
    }, 100);
    // Delay clearing selectedEvent to allow exit animation to complete
    setTimeout(() => {
      setSelectedEvent(null);
    }, 450); // 100ms delay + 350ms animation
  };

  const handleNavigateUp = () => {
    if (canNavigateUp && currentEventIndex > 0) {
      const newEvent = allEvents[currentEventIndex - 1];
      setSelectedEvent(newEvent);
      // Update URL immediately for navigation (no animation conflict)
      const urlKey = getUrlKey(newEvent);
      updateURL(urlKey);
    }
  };

  const handleNavigateDown = () => {
    if (canNavigateDown && currentEventIndex < allEvents.length - 1) {
      const newEvent = allEvents[currentEventIndex + 1];
      setSelectedEvent(newEvent);
      // Update URL immediately for navigation (no animation conflict)
      const urlKey = getUrlKey(newEvent);
      updateURL(urlKey);
    }
  };

  const showInlineAds = !isEmbedded && !!inlineAds?.org && !!inlineAds.handles.length;

  const buildElements = () => {
    const elements: React.ReactNode[] = [];
    let eventsSinceLastAd = 0;
    let adKey = 0;

    for (let index = 0; index < yearMonthEventGroups.length; index++) {
      const yearMonthGroup = yearMonthEventGroups[index];
      const isLast = index === yearMonthEventGroups.length - 1;

      eventsSinceLastAd += yearMonthGroup.events.length;

      elements.push(
        <div key={yearMonthGroup.yearMonth}>
          <h3 className={`text-xs uppercase font-bold p-3 pt-6 print:p-2 print:pt-4 bg-gray-100 text-gray-600 mb-3 ${index === 0 ? 'mt-0' : 'mt-12'}`}>
            {yearMonthGroup.label}
          </h3>

          {yearMonthGroup.events.length === 0 ? (
            <div className="text-sm text-gray-500 italic p-4 print:py-2">
              No events this month
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-8">
              {yearMonthGroup.events.map((event, eventIndex) => (
                <div key={event.uuid} className={`bg-white rounded-lg shadow-md overflow-hidden ${!event.isFutureEvent ? 'opacity-75' : ''}`}>
                  {/* Large Image */}
                  {event.featuredImageLargeUrl || event.imageUrl ? (
                    <div className='w-full aspect-[2/1] overflow-hidden'>
                      <img 
                        src={event.featuredImageLargeUrl || event.imageUrl} 
                        alt={event.heading ?? 'Event image'} 
                        className={`w-full h-full object-cover ${!event.isFutureEvent ? 'opacity-50' : ''}`} 
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-[2/1] bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                  
                  {/* Event Content */}
                  <div className='p-4'>
                    {/* Date */}
                    <h4 className={`text-xs md:text-sm font-medium mb-1 md:mb-2 leading-tight ${event.isFutureEvent && !event.isSession ? `text-gray-700 md:text-${calendarColor}` : 'text-gray-400'}`}>
                      {event.date}
                    </h4>

                    {/* Event Title */}
                    {event.heading && (
                      <h3 className={`text-sm md:text-lg font-semibold mb-1 md:mb-2 leading-tight md:leading-normal ${event.isFutureEvent ? 'text-gray-900' : 'text-gray-400'}`}>
                        <button 
                          onClick={(e) => handleEventClick(event, e)}
                          className='hover:underline text-left w-full cursor-pointer' 
                        >
                          {event.heading}
                        </button>
                        {/* 
                        <a 
                          href={event.eventPath} 
                          className='hover:underline' 
                          {...(event.rider_entry_system === 'ridernet' || isEmbedded ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        >
                          {event.heading}
                        </a>
                        */}
                      </h3>
                    )}

                    {/* Location */}
                    {event.subheading && (
                      <div className="text-xs md:text-sm text-gray-500 mb-2 md:mb-3 leading-tight">
                        <button 
                          onClick={(e) => handleEventClick(event, e)}
                          className='hover:underline text-left w-full cursor-pointer' 
                        >
                          {event.subheading}
                        </button>
                        {/* 
                        <a 
                          href={event.eventPath} 
                          className='hover:underline' 
                          {...(event.rider_entry_system === 'ridernet' || isEmbedded ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        >
                          {event.subheading}
                        </a>
                        */}
                      </div>
                    )}

                    {/* Organiser */}
                    {event.organiserName && (
                      <div className='text-xs text-gray-500 mb-3'>
                        <button 
                          onClick={(e) => handleEventClick(event, e)}
                          className='hover:underline text-left w-full cursor-pointer' 
                        >
                          {event.organiserName}
                        </button>
                        {/* 
                        <a 
                          href={event.eventPath} 
                          className='hover:underline' 
                          {...(event.rider_entry_system === 'ridernet' || isEmbedded ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        >
                          {event.organiserName}
                        </a>
                        */}
                      </div>
                    )}

                    {/* Permit Status */}
                    {event.is_planned && (
                      <div className='mb-3'>
                        <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800'>
                          Planned
                        </span>
                      </div>
                    )}

                    {/* Entry Buttons */}
                    {event.enter_on_ridernet && event.rider_entry_url ? (
                      <div className='mb-3'>
                        <Button
                          href={event.rider_entry_url}
                          target='_blank'
                          rel='noopener noreferrer'
                          variant='outline'
                        >
                          <img
                            src={ridernetLogo.src}
                            alt="Ridernet"
                            className="h-4 w-4 me-2 -mt-0.5"
                          />
                          Enter on Ridernet
                        </Button>
                      </div>
                    ) : event.rider_entry_system === 'entry_place' && event.entries_status !== 'Disabled' && event.entries_status !== 'Postponed Pending New Date' && (
                      <div className='mb-3'>
                        <Button
                          href={event.eventPath}
                          target={isEmbedded ? '_blank' : '_self'}
                          rel={isEmbedded ? 'noopener noreferrer' : undefined}
                          variant='outline'
                        >
                          <img
                            src={entryPlaceIcon.src}
                            alt="Entry Place"
                            className="h-4 w-4 me-2"
                          />
                          Enter on Entry Place
                        </Button>
                      </div>
                    )}

                    {/* Event Website Button */}
                    {event.event_website && (
                      <div className='mb-3'>
                        <Button
                          href={event.event_website}
                          target='_blank'
                          rel='noopener noreferrer'
                          variant='outline'
                        >
                          Event Website
                        </Button>
                      </div>
                    )}

                    {/* Roster Information */}
                    {event.roster && event.roster.length > 0 && (
                      <div className='mt-3 text-xs text-gray-500'>
                        {event.roster.map((group) => (
                          <div key={group.roster_id} className='mb-1'>
                            <span className='font-medium text-gray-400'>{group.name}: </span>
                            {group.positions.map((position) => (
                              <div key={position.position_id}>
                                {position.contacts.map((contact) => (
                                  <span className='font-medium text-gray-700' key={contact.id}>
                                    {contact.first_name} {contact.last_name}
                                  </span>
                                ))}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );

      if (showInlineAds) {
        if (index > 0 && eventsSinceLastAd >= 5) {
          elements.push(
            <div key={`inline-ad-${adKey++}`} className="my-8 flex justify-center print:hidden">
              <SponsorAd handle={pickByPosition(inlineAds!.handles, adKey)} org={inlineAds!.org} />
            </div>
          );
          eventsSinceLastAd = 0;
        } else if (isLast && eventsSinceLastAd > 0) {
          elements.push(
            <div key={`inline-ad-${adKey++}`} className="my-8 flex justify-center print:hidden">
              <SponsorAd handle={pickByPosition(inlineAds!.handles, adKey)} org={inlineAds!.org} />
            </div>
          );
          eventsSinceLastAd = 0;
        }
      }
    }

    return elements;
  };

  return (
    <div className=' px-4'>
      {buildElements()}
      <EventDrawer 
        event={selectedEvent}
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        isEmbedded={isEmbedded}
        onNavigateUp={handleNavigateUp}
        onNavigateDown={handleNavigateDown}
        canNavigateUp={canNavigateUp}
        canNavigateDown={canNavigateDown}
      />
    </div>
  );
}