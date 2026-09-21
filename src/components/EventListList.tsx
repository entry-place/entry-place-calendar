"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { CalendarEvent, EntryPlaceCalendar, YearMonthEventGroup, getLocalEventPath } from '../api/FetchCalendar';
import { Button } from './Button';
import EventDrawer from './EventDrawer';
import SponsorAd from './SponsorAd';
import ridernetLogo from '../assets/ridernet-ma-logo.png';
import entryPlaceIcon from '../assets/entry-place-icon.png';

interface EventListListProps {
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

function getBorderColor(weekIndex: number) {
  const colors = ['border-l-gray-200', 'border-l-gray-400'];
  return colors[weekIndex % colors.length];
}

export default function EventListList({
  calendar,
  yearMonthEventGroups,
  isEmbedded,
  calendarColor,
  inlineAds
}: EventListListProps) {
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
          <h3 className={`text-xs uppercase font-bold p-3 pt-4 print:p-2 print:pt-4 bg-gray-100 text-gray-600 ${index === 0 ? 'mt-0' : 'mt-12'}`}>
            {yearMonthGroup.label}
          </h3>

          {yearMonthGroup.events.length === 0 ? (
            <div className="relative border-l-4 border-l-gray-200 pt-2 pl-4">
              <div className="border-b border-gray-200 pb-2">
                <div className="text-sm text-gray-500 italic ps-4 py-4 print:py-2">
                  No events this month
                </div>
              </div>
            </div>
          ) : (
            yearMonthGroup.events.map((event, eventIndex) => {
              const showMonthHeader = eventIndex === 0 || yearMonthGroup.events[eventIndex - 1].monthYear !== event.monthYear;
              const showTodayLine = false;
              const borderColor = getBorderColor(event.yearWeek);

              return (
                <div key={event.uuid} className={`relative bg-gray-white border-l-4 print:border-l-1 ${borderColor} pt-2 ${event.isFutureEvent ? 'bg-white' : 'bg-gray-50'}`}>
                  
                  {showTodayLine && (
                    <div className="flex items-center my-6 print:hidden">
                      <div className="flex-grow h-px bg-red-500"></div>
                      <span className={`px-4 py-1 text-xs font-medium text-${calendarColor} border border-red-500 bg-red-50 rounded-md`}>Today</span>
                      <div className="flex-grow h-px bg-red-500"></div>
                    </div>
                  )}
                  
                  <div className='border-b border-gray-200 py-3 print:pb-0 '>
                    <div className="grid grid-cols-1 gap-4 print:gap-2 sm:grid-cols-5 md:grid-cols-6">
                      <h4 className={`hidden sm:block text-sm print:text-tiny font-medium items-center ps-4 ${event.isFutureEvent && !event.isSession ? 'text-gray-700' : 'text-gray-400'}`}>{event.date}</h4>

                      <div className='sm:col-span-3 flex print:gap-2 items-start print:sm:col-span-2'>
                        {(event.featuredImageLargeUrl || event.imageUrl) ? (
                          <div className='ms-2 sm:ms-0 w-28 h-14 flex-shrink-0 print:hidden ps-0.5 sm:ps-0 me-2 md:me-4'>
                            <img src={event.featuredImageLargeUrl || event.imageUrl} alt={event.heading ?? 'Image'} className={`w-full h-full object-cover rounded ${!event.isFutureEvent ? 'opacity-25' : ''}`} />
                          </div>
                        ) : (
                          <div className="hidden w-0.5 sm:w-24 bg-gray-50 rounded print:hidden" />
                        )}

                        <div className='px-2 sm:px-0'>
                          <div className='flex flex-col gap-1 print:gap-0'>
                            <h4 className={`text-sm block sm:hidden print:text-tiny font-medium items-center ${event.isFutureEvent ? `text-${calendarColor}` : 'text-gray-400'}`}>{event.date}</h4>

                            {event.heading && (
                              <h3 className={`text-base print:text-tiny font-medium ${event.isFutureEvent ? 'text-gray-900' : 'text-gray-400'}`}>
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
                              <div className="text-sm print:text-tiny text-gray-500 print:hidden">
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
                              <div className='text-xs text-gray-400 print:text-tiny'>
                                <button
                                  onClick={(e) => handleEventClick(event, e)}
                                  className='hover:underline text-left w-full cursor-pointer'
                                >
                                  {event.organiserName}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className='col-span-1 pt-2 text-xs uppercase text-gray-500 sm:hidden'>
                            
                          </div>
                        </div>
                      </div>

                      <div className='hidden print:block'>
                        {event.subheading && (
                          <div className="text-sm print:text-tiny text-gray-500">
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
                      </div>

                      {/* Event Details */}
                      <div className='col-span-1 md:col-span-2 text-xs text-gray-500 hidden sm:block'>
                        {/* Entry Buttons */}
                        {event.enter_on_ridernet && event.rider_entry_url ? (
                          <div className='mt-1'>
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
                          <div className='mt-1'>
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
                          <div className='mt-1'>
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

                        {/* Discipline and Affiliation */}
                        {/* Permit Status - only show if pending and entries not live */}
                        {event.is_planned && (
                          <div className='mt-1'>
                            <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800'>
                              Planned
                            </span>
                          </div>
                        )}

                        {event.roster && event.roster.length > 0 && (
                          <div className='flex flex-col gap-1 mb-1'>
                            {event.roster.map((group) => (
                              <div key={group.roster_id} className='mb-2'>
                                <h4 className='text-xs font-medium text-gray-400'>{group.name}</h4>
                                {group.positions.map((position) => (
                                  <div key={position.position_id} className='mt-1 text-gray-400'>
                                    <span>{position.position_name}: {position.contacts.map((contact) => (
                                        <span className='font-medium text-gray-700' key={contact.id}>
                                          {contact.first_name} {contact.last_name}
                                        </span>
                                      ))}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}

                        {!event.isSession && (
                          <div className='flex flex-wrap gap-2'>
                            
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
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
    <div role="list" className='md:px-2'>
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