// components/ContactOrganiserModal.tsx
import Sheet from 'react-modal-sheet';
import { XMarkIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { EntryPlaceEvent } from '../api/FetchEvent';
import EventOrganiserBox from './EventOrganiserBox';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  event: EntryPlaceEvent;
}

const ContactOrganiserModal: React.FC<Props> = ({ isOpen, onClose, event }) => {

  const websiteLink = event.organiser_website_link;
  const facebookLink = event.organiser_facebook_link;
  const instagramLink = event.organiser_instagram_link;
  return (
    <Sheet isOpen={isOpen} onClose={onClose}>
      <Sheet.Container>
        <Sheet.Header>
          <div className="bg-white font-semibold shadow-sm">
            <div className="mx-auto max-w-4xl flex py-2 px-5">
              <div className="flex-grow pt-1">Contact Details for {event.title}</div>
              <div className="flex-shrink ps-3 pt-1">
                <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </Sheet.Header>
        <Sheet.Content>
          <div className="mx-auto max-w-4xl pt-4 px-5 pb-8 text-sm">
            <EventOrganiserBox event={event} />

            <button
              onClick={onClose}
              className="mt-8 mb-12 bg-indigo-600 text-sm font-semibold text-white px-4 py-2 rounded-md"
            >
              Close
            </button>
          </div>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop />
    </Sheet>
  );
};

export default ContactOrganiserModal;
