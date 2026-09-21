"use client";
import { XMarkIcon } from '@heroicons/react/24/solid';
import React, { useState } from 'react';
import Sheet from 'react-modal-sheet';
import { EntryPlaceEvent } from '../api/FetchEvent';

interface Props {
  buttonTitle: string;
  modalHeading: string;
  id: string;
  event: EntryPlaceEvent;
}

const SessionPicker: React.FC<Props> = ({ buttonTitle, modalHeading, id, event }) => {

  const [isOpen, setOpen] = useState(false)
  
  const { sessions_by_date } = event;
  // Filter sessions by date to only include dates that are today or in the future. The format of the key is 'YYYY-MM-DD'.
  // Take into account the current timezone
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  const futureSessions = Object.keys(sessions_by_date).filter(date => date >= todayString);
  const filteredSessionsByDate = Object.fromEntries(Object.entries(sessions_by_date).filter(([date]) => futureSessions.includes(date)));  

  return (
    <span className='ms-1'>
      <button type='button' onClick={() => setOpen(true)}
      className='text-sm text-indigo-600 underline font-medium hover:text-indigo-900'
      >
      {buttonTitle}
      </button>

      <Sheet isOpen={isOpen} onClose={() => setOpen(false)}>
          <Sheet.Container>
          <Sheet.Header>
            <div className='bg-white font-semibold shadow-sm '>
              <div className='mx-auto max-w-4xl flex py-2 px-5'>
                <div className='flex-grow pt-1'>
                  {modalHeading}
                </div>
                <div className='flex-shrink ps-3 pt-1'>
                  <button onClick={() => setOpen(false)} className='text-gray-600 hover:text-gray-800'>
                    <XMarkIcon className='w-5 h-5' />
                  </button>
                </div>
              </div>
            </div>
            </Sheet.Header>
          <Sheet.Content>
          <Sheet.Scroller>
            <div>
              <div className='mx-auto max-w-4xl pt-4 px-5 pb-8 text-sm'>
              {Object.entries(filteredSessionsByDate).map(([date, sessions]) => (
                <div key={date}>
                  {sessions.map(session => (
                    <a href={`/${event.entries_reference_prefix}/select?sessionId=${session.id}`}
                      key={session.id} 
                      className='outline outline-2 outline-gray-200 hover:outline-indigo-600 p-4 rounded mb-4 block'
                      >
                      {session.label}
                    </a>
                  ))}
                </div>
              ))}

              <button onClick={() => setOpen(false)} className='mt-8 mb-12 bg-indigo-600 text-sm font-semibold text-white px-4 py-2 rounded-md'>Close</button>
              </div>
          </div>

          </Sheet.Scroller>
            </Sheet.Content>
            </Sheet.Container>
            <Sheet.Backdrop />
        </Sheet>
    </span>
  );
};

export default SessionPicker;