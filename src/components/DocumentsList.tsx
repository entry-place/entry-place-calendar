import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { PaperClipIcon } from "@heroicons/react/24/solid";
import { EventMedia, EventSessionResponse } from "../api/FetchEvent";

export interface DocumentsListProps {
  title: string | null | undefined;
  mediaArray: EventMedia[];
}

function formatFileSize(bytes: number, decimals: number = 1): string {
  if (!bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const DocumentsList: React.FC<DocumentsListProps> = ({ title, mediaArray }) => {

  // If there's no matching media, return null or an empty fragment
  if (!mediaArray || mediaArray.length === 0) {
    return null;
  }

  // Replace hosts that match entryplace-dev.sgp1.vultrobjects.com with assets.entry.place
  const rewriteToEntryPlaceDomain = (url: string) => {
    return url.replace('entryplace-dev.sgp1.vultrobjects.com', 'assets.entry.place');
  }

  return (
    <div className="mb-6 md:mb-12">
      <div className="text-sm text-gray-900 sm:col-span-2 sm:mt-0">
        {title && ( <h4 className="text-base font-medium text-gray-600">{title}</h4> )}
        <div role="list" className="rounded-md border border-gray-200 mt-3 divide-y divide-gray-100">

        {mediaArray.map((doc) => {
          var docTitle = '';
          if (doc.collection_name === 'suppreg') {
            docTitle = 'Supplementary Regulations';
          } else if (doc.collection_name === 'selfscrutineering') {
            docTitle = 'Self Scrutineering';
          }
          return (
          <a className='block hover:bg-gray-50 cursor-pointer' href={rewriteToEntryPlaceDomain(doc.original_url)} key={doc.id} target="_blank">
            <div className="py-3 pl-4 pr-5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 min-w-0">
                  <DocumentArrowDownIcon aria-hidden="true" className="size-5 shrink-0 text-gray-400" />
                  <span className="font-medium text-gray-900">{docTitle}</span>
                </div>
                <span className="shrink-0 font-medium text-indigo-600 hover:text-indigo-500">
                  Download
                </span>
              </div>
              <p className="mt-0.5 pl-7 text-gray-400 truncate">{formatFileSize(doc.size)} • {doc.file_name}</p>
            </div>
          </a>
          )}
        )}

        </div>
      </div>
    </div>
  )}

export default DocumentsList;