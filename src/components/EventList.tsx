"use client";
import { useState, useEffect } from 'react';
import { Menu } from '@headlessui/react';
import { ListBulletIcon, Squares2X2Icon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/16/solid';

import { Button } from './Button';
import { CalendarEvent, EntryPlaceCalendar, YearMonthEventGroup } from '../api/FetchCalendar';
import { getCookie, setCookie } from '../utils/cookieUtils';
// import { QueueListIcon, ViewColumnsIcon } from '@heroicons/react/16/solid';
import toast from 'react-hot-toast';
import EventListGrid from './EventListGrid';
import EventListList from './EventListList';

interface EventListProps {
  calendar: EntryPlaceCalendar;
  yearMonthEventGroups: YearMonthEventGroup[];
  isEmbedded: boolean;
  calendarColor: string;
  heading: string;
  /**
   * Inline sponsor ads between event rows. `org` is the club's organiser
   * slug: ads are fetched and view/click events recorded against it, so it
   * travels with the handles rather than being defaulted. Omit the whole
   * object for no ads.
   */
  inlineAds?: { org: string; handles: string[] };
}

function getLastWeekYearWeek(): number {
  const now = new Date();
  const lastWeekDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const year = lastWeekDate.getFullYear();

  // Get ISO week number
  const startOfYear = new Date(year, 0, 1);
  const dayOfYear = Math.floor((lastWeekDate.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);

  return year * 100 + weekNumber; // Format: YYYYWW (e.g. 202613)
}

function getCurrentYearMonth(): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // getMonth() returns 0-11
  return year * 100 + month; // Format: YYYYMM
}

const LAYOUT_BUTTON_BASE = 'px-2 py-[calc(theme(spacing.[1.5])-1px)] rounded-lg text-sm font-medium transition-colors';
const LAYOUT_BUTTON_ACTIVE = 'bg-white text-gray-950 shadow ring-1 ring-black/10';
const LAYOUT_BUTTON_INACTIVE = 'text-gray-600 hover:text-gray-900 hover:bg-gray-50';

interface LayoutToggleProps {
  layoutMode: 'list' | 'grid';
  onLayoutChange: (layout: 'list' | 'grid') => void;
  showLabels?: boolean;
}

function LayoutToggle({ layoutMode, onLayoutChange, showLabels = true }: LayoutToggleProps) {
  return (
    <div className="flex gap-1 bg-gray-200 rounded-xl p-1.5">
      <button
        onClick={() => onLayoutChange('list')}
        className={`${LAYOUT_BUTTON_BASE} ${
          layoutMode === 'list' ? LAYOUT_BUTTON_ACTIVE : LAYOUT_BUTTON_INACTIVE
        }`}
      >
        <ListBulletIcon className='size-5 inline-block' />
        {showLabels && <span className='hidden md:inline-block ms-1'>List</span>}
      </button>
      <button
        onClick={() => onLayoutChange('grid')}
        className={`${LAYOUT_BUTTON_BASE} ${
          layoutMode === 'grid' ? LAYOUT_BUTTON_ACTIVE : LAYOUT_BUTTON_INACTIVE
        }`}
      >
        <Squares2X2Icon className='size-5 inline-block' />
        {showLabels && <span className='hidden md:inline-block ms-1'>Grid</span>}
      </button>
    </div>
  );
}

interface DownloadMenuItemsProps {
  onDownloadPDF: () => void;
  onDownloadXLSX: () => void;
}

function DownloadMenuItems({ onDownloadPDF, onDownloadXLSX }: DownloadMenuItemsProps) {
  return (
    <>
      <Menu.Item>
        <button
          onClick={onDownloadPDF}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          {/* <DocumentArrowDownIcon className="w-4 h-4 mr-3" /> */}
          Download as PDF
        </button>
      </Menu.Item>
      <Menu.Item>
        <button
          onClick={onDownloadXLSX}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          {/* <DocumentArrowDownIcon className="w-4 h-4 mr-3" /> */}
          Export as XLSX
        </button>
      </Menu.Item>
    </>
  );
}

interface MenuSectionHeaderProps {
  title: string;
}

function MenuSectionHeader({ title }: MenuSectionHeaderProps) {
  return (
    <div className="px-4 py-2 border-b border-gray-100 border-t">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
    </div>
  );
}

export default function EventList({ calendar, yearMonthEventGroups, isEmbedded, calendarColor, heading, inlineAds }: EventListProps) {
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'list' | 'grid'>('list');
  const [mounted, setMounted] = useState(false);

  // Share functionality
  const handleShare = async (type: 'native' | 'copy') => {
    // For embedded calendars, share the regular calendar URL instead of the embed URL
    const url = isEmbedded
      ? `${window.location.origin}/${calendar.slug}`
      : window.location.href;
    const title = `${calendar.name} - Calendar`;
    const text = calendar.description || `View upcoming events for ${calendar.name}`;

    if (type === 'native' && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url
        });
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          // Fallback to copy if native share fails
          handleShare('copy');
        }
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Calendar link copied to clipboard!');
      } catch (error) {
        // Ultimate fallback - create a temporary text area
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('Calendar link copied to clipboard!');
      }
    }
  };

  const handleDownloadPDF = () => {
    // For now, trigger print dialog which can save as PDF
    window.print();
  };

  const handleDownloadCSV = () => {
    // Create a simple CSV that can be opened in Excel
    const csvData = [
      ['Date', 'Event', 'Location', 'Organiser'].join(','),
      ...yearMonthEventGroups.flatMap(group => 
        group.events.map(event => [
          event.date,
          `"${event.heading || ''}"`,
          `"${event.subheading || ''}"`,
          `"${event.organiserName || ''}"`
        ].join(','))
      )
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${calendar.slug}-calendar.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Calendar exported as CSV file!');
  };

  const handleDownloadXLSX = () => {
    alert('XLSX export not implemented yet');
  };

  // Load layout preference from cookie after component mounts
  useEffect(() => {
    setMounted(true);
    const savedLayout = getCookie(`calendar-layout-${calendar.slug}`);
    if (savedLayout === 'grid' || savedLayout === 'list') {
      setLayoutMode(savedLayout);
    }
  }, []);

  // Save layout preference to cookie when it changes
  const handleLayoutChange = (newLayout: 'list' | 'grid') => {
    setLayoutMode(newLayout);
    setCookie(`calendar-layout-${calendar.slug}`, newLayout, 365); // Save for 1 year
  };

  // Show loading state until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div>
        <div className='py-3 px-4 bg-gray-50'>
          {calendar.name ? (
            <h3 className="text-lg font-bold text-gray-900">{calendar.name}</h3>
          ) : (
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2">Loading...</div>
          )}
        </div>
        <div className="bg-gray-100 px-4 animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  const lastWeekYearWeek = getLastWeekYearWeek();
  const filteredYearMonthGroups = showPastEvents
    ? yearMonthEventGroups
    : yearMonthEventGroups
        .map(group => ({
          ...group,
          events: group.events.filter(event => event.yearWeek >= lastWeekYearWeek),
        }))
        .filter(group => group.events.length > 0);

  const hasOlderEvents = yearMonthEventGroups.some(group =>
    group.events.some(event => event.yearWeek < lastWeekYearWeek)
  );

  return (
    <>
      {/* Sticky Column Headers */}
      <div className="sticky top-0 z-10 print:mt-0">
        {/* Name of calendar */}
        <div className="py-3 px-4 print:hidden">
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-bold text-gray-900`}>{heading} 
              <span className='ms-2 text-sm font-normal text-gray-400 print:hidden inline-block'>
                {calendar.subscription_count} {calendar.subscription_count === 1 ? 'subscriber' : 'subscribers'}
              </span>
            </h3>
            
            {/* Desktop Layout - md and up */}
            <div className="hidden sm:flex gap-2 items-center">              
              {/* Show Past Events Button */}
              {hasOlderEvents && (
                <Button
                  variant='outline'
                  onClick={() => setShowPastEvents(!showPastEvents)}
                >
                  Show older events
                </Button>
              )}
              
              {/* Desktop Download Menu */}
              {/* <Menu as="div" className="relative">
                <Menu.Button as={Button} variant="outline">
                  <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                  Download
                </Menu.Button>
                
                <Menu.Items className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                  <DownloadMenuItems onDownloadPDF={handleDownloadPDF} onDownloadXLSX={handleDownloadXLSX} />
                </Menu.Items>
              </Menu> */}

              {/* Desktop Share Button */}
              <Button
                variant="outline"
                onClick={() => handleShare('share' in navigator ? 'native' : 'copy')}
              >
                {/* <ArrowUpOnSquareIcon className="w-4 h-4 mr-2" /> */}
                {'share' in navigator ? 'Share' : 'Copy Link'}
              </Button>

              <LayoutToggle layoutMode={layoutMode} onLayoutChange={handleLayoutChange} />
            </div>

            {/* Mobile Layout Toggle - below sm */}
            <div className="sm:hidden flex items-center gap-2">

              {/* Mobile Menu Dropdown */}
              <Menu as="div" className="relative">
                <Menu.Button className="inline-flex items-center justify-center px-2 py-[calc(theme(spacing.[1.5])-1px)] rounded-lg border border-transparent shadow ring-1 ring-black/10 whitespace-nowrap text-sm font-medium text-gray-950 cursor-pointer hover:bg-gray-50">
                  <ChevronDownIcon className="w-5 h-5" />
                </Menu.Button>
                
                <Menu.Items className="absolute right-0 z-20 mt-2 w-64 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                  {/* Show Past Events */}
                  {hasOlderEvents && (
                    <>
                      <Menu.Item>
                        <button
                          onClick={() => setShowPastEvents(!showPastEvents)}
                          className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <span>Show older events</span>
                          {showPastEvents && <CheckIcon className="w-4 h-4 text-gray-600" />}
                        </button>
                      </Menu.Item>
                    </>
                  )}

                  <Menu.Item>
                    <button
                      onClick={() => handleShare('share' in navigator ? 'native' : 'copy')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {/* <ArrowUpOnSquareIcon className="w-4 h-4 mr-3" /> */}
                      {'share' in navigator ? 'Share Calendar' : 'Copy Link'}
                    </button>
                  </Menu.Item>
                </Menu.Items>
              </Menu>

              <LayoutToggle layoutMode={layoutMode} onLayoutChange={handleLayoutChange} showLabels={false} />
            </div>
        </div>
      </div>
      
      {layoutMode === 'grid' ? (
        <EventListGrid
          calendar={calendar}
          yearMonthEventGroups={filteredYearMonthGroups}
          isEmbedded={isEmbedded}
          calendarColor={calendarColor}
          inlineAds={inlineAds}
        />
      ) : (
        <EventListList
          calendar={calendar}
          yearMonthEventGroups={filteredYearMonthGroups}
          isEmbedded={isEmbedded}
          calendarColor={calendarColor}
          inlineAds={inlineAds}
        />
      )}
      </div>
    </>
  );
}