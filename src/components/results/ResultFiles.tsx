import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { ResultFile } from "../../types/results";

function formatFileSize(bytes: number, decimals: number = 1): string {
  if (!bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function fileLabel(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'Image';
  if (mimeType === 'application/pdf') return 'PDF';
  return 'File';
}

interface ResultFilesProps {
  files: ResultFile[];
}

export default function ResultFiles({ files }: ResultFilesProps) {
  if (files.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {files.map((file) => (
        <a
          key={file.id}
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2.5 text-sm hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
        >
          <DocumentArrowDownIcon className="size-5 text-stone-400 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-stone-800 dark:text-stone-200 truncate">
              {file.file_name}
            </div>
            <div className="text-xs text-stone-400 dark:text-stone-500">
              {fileLabel(file.mime_type)} · {formatFileSize(file.size)}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
