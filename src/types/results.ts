export type RiderStatus = 'placed' | 'dnf' | 'dns' | 'nc';

export interface LapResult {
  total: number | null;
  sections?: number[]; // e.g. 15 section scores per lap
}

export interface DayResult {
  label: string; // "Saturday"
  shortLabel: string; // "Sat"
  laps: LapResult[];
  dayTotal: number | null;
  pending?: boolean; // Day not yet ridden — columns render greyed out
}

export interface PenaltiesBreakdown {
  zeros: number;
  ones: number;
  twos: number;
  threes: number;
  fives: number;
}

export interface RiderResult {
  rank: number | null;
  firstName: string;
  lastName: string;
  bike?: string;
  laps?: (number | null)[]; // Simple flat laps (TK5FNC)
  days?: DayResult[]; // Multi-day with sections (Glenmaggie)
  total: number | null;
  status: RiderStatus;
  note?: string;
  clubPoints?: number | null;
  penalties?: PenaltiesBreakdown;
}

export interface ClassResult {
  className: string;
  classCode: string;
  colour?: string; // Tailwind colour name, e.g. 'red', 'blue', 'white'
  colourAmount?: number; // Tailwind shade, defaults to 500 if not specified
  riders: RiderResult[];
}

export interface ResultFile {
  id: number;
  file_name: string;
  mime_type: string;
  size: number;
  url: string;
  preview_url: string | null;
}

export interface ResultSet {
  id: number;
  title: string;
  scoring_type: 'compact' | 'expanded' | null;
  has_score_data: boolean;
  scores_hidden: boolean;
  score_data: ClassResult[] | null;
  files: ResultFile[];
}

export interface EventResultsResponse {
  event_id: number;
  result_sets: ResultSet[];
}
