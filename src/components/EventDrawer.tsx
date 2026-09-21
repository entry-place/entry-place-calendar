'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { ArrowsPointingOutIcon, XMarkIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { CalendarEvent, getLocalEventPath } from '../api/FetchCalendar'
import { EventSessionResponse, getEventWithPossibleSessionDetails } from '../api/FetchEvent'
import { getEventResults } from '../api/FetchResults'
import { ResultSet } from '../types/results'
import EventDetailHeader from './EventDetailHeader'
import EventCTA from './EventCTA'
import EventLocationBox from './EventLocationBox'
import EventOrganiserBox from './EventOrganiserBox'
import EventSchedule from './EventSchedule'
import ResultsBanner from './results/ResultsBanner'
import DocumentsList from './DocumentsList'
import { Button } from './Button'
import { ArrowUpOnSquareIcon } from '@heroicons/react/24/outline'
import WhenBox from './_when-box'
import WhereBox from './_where-box'
import ContactBox from './_contact-box'

interface EventDrawerProps {
  event: CalendarEvent | null
  isOpen: boolean
  onClose: () => void
  isEmbedded?: boolean
  onNavigateUp?: () => void
  onNavigateDown?: () => void
  canNavigateUp?: boolean
  canNavigateDown?: boolean
}

export default function EventDrawer({ event, isOpen, onClose, isEmbedded, onNavigateUp, onNavigateDown, canNavigateUp, canNavigateDown }: EventDrawerProps) {
  const [eventSessionResponse, setEventSessionResponse] = useState<EventSessionResponse | null>(null)
  const [resultSets, setResultSets] = useState<ResultSet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastFetchedEventId = useRef<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Fetch full event data when drawer opens and event changes
  useEffect(() => {
    if (isOpen && event) {
      const currentEventId = event.id.toString()

      // Extract sessionId from urlKey if this is a session
      // urlKey format: "event-slug" for events, "event-slug/s/sessionId" for sessions
      let sessionId: string | null = null
      if (event.isSession && event.urlKey) {
        const urlParts = event.urlKey.split('/s/')
        if (urlParts.length === 2) {
          sessionId = urlParts[1]
        }
      }

      // Create a unique key that includes sessionId for proper caching
      const fetchKey = sessionId ? `${currentEventId}-${sessionId}` : currentEventId

      // Only fetch if we haven't already fetched this event/session combination
      if (lastFetchedEventId.current !== fetchKey) {
        // Only show loading if we don't have any data (initial fetch)
        if (!eventSessionResponse) {
          setLoading(true)
        }
        setError(null)

        getEventWithPossibleSessionDetails(
          currentEventId,
          sessionId, // Pass extracted sessionId
          null, // form
          null  // forceOpenId
        )
          .then((response) => {
            setEventSessionResponse(response)
            lastFetchedEventId.current = fetchKey
            // Fetch results if event has them
            if (response.event.has_results) {
              getEventResults(response.event.id)
                .then((resultsResponse) => setResultSets(resultsResponse.result_sets))
                .catch((err) => console.error('Error fetching results:', err))
            } else {
              setResultSets([])
            }
          })
          .catch((err) => {
            console.error('Error fetching event details:', err)
            setError(err instanceof Error ? err.message : 'Failed to load event details')
          })
          .finally(() => {
            setLoading(false)
          })
      }
    }
  }, [isOpen, event])

  // Reset state after drawer animation completes
  useEffect(() => {
    if (!isOpen) {
      // Clear state after exit animation completes to preserve animation
      const timeout = setTimeout(() => {
        setEventSessionResponse(null)
        setResultSets([])
        setError(null)
        setLoading(false)
        lastFetchedEventId.current = null
      }, 350) // Match the sm:duration-300 from the drawer animation

      return () => clearTimeout(timeout)
    }
  }, [isOpen])

  // Scroll to top when event changes (e.g., using up/down navigation)
  useEffect(() => {
    if (isOpen && event && scrollAreaRef.current) {
      const element = scrollAreaRef.current
      const start = element.scrollTop
      const duration = 200 // Fast animation duration in ms
      const startTime = performance.now()

      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Ease-out animation for smoother feel
        const easeOut = 1 - Math.pow(1 - progress, 3)
        element.scrollTop = start * (1 - easeOut)

        if (progress < 1) {
          requestAnimationFrame(animateScroll)
        }
      }

      requestAnimationFrame(animateScroll)
    }
  }, [event?.id, isOpen])

  if (!event) return null

  const handleShare = async () => {
    if (!eventSessionResponse?.event) return

    const fullEvent = eventSessionResponse.event
    // Use the event's local page URL instead of the current page
    let eventUrl = window.location.href
    if (event) {
      try {
        eventUrl = new URL(getLocalEventPath(event), window.location.origin).href
      } catch (error) {
        console.log('Error constructing event URL, falling back to current page:', error)
        eventUrl = window.location.href
      }
    }

    if (navigator.share) {
      try {
        const when = fullEvent.is_session ? `${fullEvent.future_sessions_count} sessions` : fullEvent.date_formatted_full_pretty
        await navigator.share({
          title: fullEvent?.title || 'Event',
          text: `When: ${when} \nWhere: ${fullEvent?.location_address}`,
          url: eventUrl,
        })
      } catch (error) {
        console.log('Error sharing', error)
      }
    } else {
      try {
        await navigator.clipboard.writeText(eventUrl)
        alert('URL copied to clipboard.')
      } catch (error) {
        console.log('Failed to copy URL', error)
      }
    }
  }

  const renderSkeletonContent = () => (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      
      {/* Image skeleton */}
      <div className="w-full h-48 bg-gray-200 rounded-lg mb-6"></div>
      
      {/* Content skeleton */}
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  )

  const renderEventContent = () => {
    if (loading) return renderSkeletonContent()
    
    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          {event && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 font-mono">
              GET /api/v1/omni-event/{event.id}
            </p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400">Showing basic event information instead.</p>
          {renderBasicEventInfo()}
        </div>
      )
    }

    if (!eventSessionResponse) return renderBasicEventInfo()

    const fullEvent = eventSessionResponse.event
    const maDocs = fullEvent.media?.filter(
      (m) => m.collection_name === "suppreg" || m.collection_name === "selfscrutineering"
    )

    return (
      <div className="space-y-6">
        {/* Results Banner */}
        {fullEvent.has_results && resultSets.length > 0 && (
          <ResultsBanner
            resultSets={resultSets}
            scoresHidden={resultSets.some((rs) => rs.scores_hidden)}
            resultsHref={`${event ? getLocalEventPath(event) : `/${fullEvent.entries_reference_prefix}`}/results`}
          />
        )}

        {/* Event Image */}
        {fullEvent.feature_image_url && (
          <div className="mb-6">
            <img
              src={fullEvent.feature_image_url}
              alt={fullEvent.title}
              className="w-full aspect-[2/1] object-cover rounded-lg"
            />
          </div>
        )}

        {/* Event Detail Header */}
        <EventDetailHeader
          eventSessionResponse={eventSessionResponse}
          showMainCTA={false}
        />

        {/* When and Where Info */}
        <div className="space-y-3 border-b border-gray-100 pb-4">
          <WhenBox 
            event={fullEvent} 
            session={eventSessionResponse.session} 
            showMoreDates={false}
          />
          <WhereBox event={fullEvent} />
        </div>

        {/* Contact Info */}
        <div className="border-b border-gray-100 pb-4">
          <ContactBox event={fullEvent} />
        </div>

        {/* Schedule */}
        {fullEvent.schedules && fullEvent.schedules.length > 0 && (
          <EventSchedule schedules={fullEvent.schedules} timezone={fullEvent.eventTimezone} />
        )}

        {/* Documents */}
        {maDocs && maDocs.length > 0 && (
          <DocumentsList title='File Downloads' mediaArray={maDocs} />
        )}

        {/* Event Description */}
        {fullEvent.body && (
          <div>
            <div className="font-medium text-xl md:text-2xl md:font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4">Event Description</div>
            <div 
              id='event-description'
              className="prose prose-sm prose-indigo"
              dangerouslySetInnerHTML={{ __html: fullEvent.body }} 
            />
          </div>
        )}

        {/* Location Details */}
        <EventLocationBox event={fullEvent} />

        {/* Organiser */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Organiser</h3>
          <div id="event-organiser" className="ring-1 ring-black/5 rounded-lg mb-4 shadow-[inset_0_0_2px_1px_#ffffff4d]">
            <div className="rounded-md shadow-md shadow-black/5 p-2 relative backdrop-blur-xl">
              <div className="shadow-2xl ring-1 ring-black/5 p-4 rounded-md bg-white dark:bg-gray-800">
                <EventOrganiserBox event={fullEvent} />
              </div>
            </div>
          </div>
        </div>

        {/* Share Button - only show in content area */}
        <div className="pt-4 pb-20"> {/* Add bottom padding to avoid overlap with fixed CTA */}
          <div className="flex justify-center">
            <Button 
              onClick={handleShare} 
              variant='secondary' 
              className='rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100'
            >
              <ArrowUpOnSquareIcon className="size-4 text-gray-500 me-2" /> Share
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const renderBasicEventInfo = () => (
    <div className="space-y-6">
      {/* Event Image */}
      {(event.featuredImageLargeUrl || event.imageUrl) && (
        <div className="mb-6">
          <img 
            src={event.featuredImageLargeUrl || event.imageUrl} 
            alt={event.heading ?? 'Event image'} 
            className="w-full aspect-[2/1] object-cover rounded-lg" 
          />
        </div>
      )}

      {/* Event Date */}
      <div className="mb-4">
        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
          {event.date}
        </span>
      </div>

      {/* Event Title */}
      {event.heading && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {event.heading}
          </h3>
        </div>
      )}

      {/* Location/Subheading */}
      {event.subheading && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <strong>Location:</strong> {event.subheading}
          </p>
        </div>
      )}

      {/* Organiser */}
      {event.organiserName && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <strong>Organiser:</strong> {event.organiserName}
          </p>
        </div>
      )}

      {/* Status Tags */}
      <div className="mb-4 flex flex-wrap gap-2">
        {event.is_planned && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            Planned
          </span>
        )}
        {event.enter_on_ridernet && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200">
            Enter on Ridernet
          </span>
        )}
      </div>

      {/* Event Website Button */}
      {event.event_website && (
        <div className="mb-6">
          <a
            href={event.event_website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            Visit Event Website
          </a>
        </div>
      )}
    </div>
  )

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[60]">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity duration-200 ease-in-out data-[closed]:opacity-0 dark:bg-gray-900/50"
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <DialogPanel
              transition
              className="pointer-events-auto w-screen max-w-3xl transform transition duration-200 ease-in-out data-[closed]:translate-x-full sm:duration-300 rounded-2xl overflow-hidden m-2 shadow-3xl"
            >
              <div className="relative flex h-full flex-col bg-white shadow-xl dark:bg-gray-800">
                {/* Sticky Header */}
                <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={onClose}
                        className="relative p-2 -ml-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-500 transition-colors duration-150"
                      >
                        <span className="absolute -inset-2.5" />
                        <span className="sr-only">Close panel</span>
                        <XMarkIcon aria-hidden="true" className="size-6" />
                      </button>
                      
                      {/* Navigation arrows next to close button */}
                      {(onNavigateUp || onNavigateDown) && (
                        <div className="flex items-center gap-2 rounded-md ml-2">
                          <Button
                            variant='outline'
                            onClick={onNavigateUp}
                            disabled={!canNavigateUp}
                            className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-40 disabled:hover:text-gray-400 dark:text-gray-500 dark:hover:text-gray-300 dark:disabled:hover:text-gray-500 transition-colors"
                            aria-label="Previous event"
                          >
                            <ChevronUpIcon className="size-5" />
                          </Button>

                          <Button
                            variant='outline'
                            onClick={onNavigateDown}
                            disabled={!canNavigateDown}
                            className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-40 disabled:hover:text-gray-400 dark:text-gray-500 dark:hover:text-gray-300 dark:disabled:hover:text-gray-500 transition-colors"
                            aria-label="Next event"
                          >
                            <ChevronDownIcon className="size-5" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleShare}
                        variant='secondary'
                        className='text-sm px-3 py-2'
                      >
                        <ArrowUpOnSquareIcon className="size-4 sm:me-1" /> <span className="hidden sm:inline">Share</span>
                      </Button>
                      
                      {event && (
                        <Button
                          href={getLocalEventPath(event)}
                          variant='secondary'
                          className='text-sm px-3 py-2'
                        >
                          <ArrowsPointingOutIcon className="size-4 me-1" />
                          Event Page
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Scrollable Content */}
                <div ref={scrollAreaRef} className="relative flex-1 overflow-y-auto px-4 sm:px-6 py-4">
                  {renderEventContent()}
                </div>
                
                {/* Fixed Bottom CTA - similar to mobile view */}
                {eventSessionResponse && (
                  <div className="absolute bottom-0 left-4 right-4 z-10">
                    <EventCTA eventSessionResponse={eventSessionResponse} />
                  </div>
                )}
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  )
}