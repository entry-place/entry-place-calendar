import { AxiosResponse } from 'axios';
import axios from './axios';

export interface Session {
    id: number;
    label: string;
    start: string;
    end: string;
}

export interface EventDay {
    show1Line: boolean;
    line1: string;
    line2: string;
    date: string;
    pretty: string;
    sessionAvailability: string;
    topText: string;
    url: string;
    sessions: Session[];
}   

export interface SessionsByDate {
    [date: string]: Session[];
}

export interface SessionPricing {
    [sessionId: string]: {
        id: number;
        strategy: string;
        label: string;
        description: string;
        price: string;
    }[];
}

export interface Button {
    buttonText: string;
    buttonLink: string;
}
export interface SessionNextOptions {
    [sessionId: string]: ButtonGroup[];
}

export interface Class {
    id: number;
    club_organiser_id: number;
    name: string;
    sort_order: number;
}

export interface ClassGroup {
    id: number;
    name: string;
    price: string;
    event_id: number;
    group_classification: string;
    enabled: boolean;
    session_enabled_strategy: string;
    strategy: string;
    description: string;
    config: any;
    classes: Class[];
}

export interface EntrantGroup {
    id: number;
    event_id: number;
    name: string;
    type: string;
    group_price: string;
    description: string | null;
    description_html: string | null;
    enabled: number;
    class_groups: ClassGroup[];
    fixed_team_size: number | null;
    post_purchase_note: string | null;
    sort_order: number | null;
}

export interface ButtonGroup {
    id: string;
    iconName: string;
    title: string;
    description: string;
    buttons: Button[];
}

export interface EventScheduleItem {
    label: string;
    starts_at: string;
    ends_at: string | null;
    is_highlighted: boolean;
}

export interface EventSchedule {
    title: string;
    date: string;
    items: EventScheduleItem[];
}

export interface EntryPlaceEvent {
    id: string;
    title: string;
    is_session: number;
    future_sessions_count: number;
    body: string;
    body_text: string;
    entries_final_instructions: string;
    date_formatted_full_pretty: string;
    close_date_pretty: string | null;
    close_date_timezone: string | null;
    close_date_timestamp: string;
    entries_status: string;
    entries_public_status: string;
    entries_reference_prefix: string;
    event_organiser: string;
    event_organiser_slug: string;
    entries_contact_details: string | null;
    organiser_name: string;
    organiser_image_url: string | null;
    location_name: string;
    location_address: string;
    location_type: string;
    online_description: string | null;
    latitude: string | null;
    longitude: string | null;
    event_directions_url: string;
    feature_image_url: string | null;
    cover_image_url: string;
    days: EventDay[];
    sessions_by_date: SessionsByDate;
    entries_supp_regs: string | null;
    options: ButtonGroup[];
    class_groups: ClassGroup[];
    member_class_groups: ClassGroup[];
    family_entrant_groups: EntrantGroup[];
    sidecar_entrant_groups: EntrantGroup[];
    team_entrant_groups: EntrantGroup[];
    terms_entrants: string;
    shop_enabled: boolean;
    fee_strategy: string; // ADDITIONAL or INCLUSIVE
    main_purchase_cta: string; // e.g - Buy Tickets/Merch / Enter online
    products: Product[];
    media?: EventMedia[];
    licence? : LicenceConfig;
    schedules: EventSchedule[];
    eventTimezone?: string;
    date_start?: string;
    date_end?: string;
    event_type?: string;
    has_results: boolean;

    organiser_description: string | null;
    organiser_facebook_link: string | null;
    organiser_instagram_link: string | null;
    organiser_members_count: number | null;
    organiser_website_link: string | null;
    organiser_twitter_link: string | null;
    organiser_youtube_link: string | null;

    rider_entry_system: 'ridernet' | 'entry_place' | null;
    rider_entry_url: string | null;
    enter_on_ridernet: boolean;
}

export interface LicenceConfig {
    id: number;
    event_id: number | null;
    introduction_text: string | null;
    show_licence_screen: number;          // 0 or 1
    licence_validation: number;           // 0 or 1

    own_ama_membership_enabled: number;   // 0 or 1
    buy_ama_membership_enabled: number;   // 0 or 1
    cost_ama_membership: string | null;

    own_ma_licence_enabled: number;       // 0 or 1
    own_ma_recreation_licence: number;    // 0 or 1
    own_ma_competition_licence: number;   // 0 or 1

    buy_ma_licence_enabled: number;       // 0 or 1
    buy_ma_recreation_licence: number;    // 0 or 1
    buy_ma_competition_licence: number;   // 0 or 1

    cost_ma_licence_recreation: string | null;
    cost_ma_licence_competition: string | null;

    ma_ride_park_licence_enabled: number; // 0 or 1
    cost_ride_park_licence: string | null;
    come_and_try_enabled: number;         // 0 or 1
    come_and_try_text: string | null;

    no_licence_enabled: number;           // 0 or 1
    no_licence_text: string | null;
    no_award_enabled: boolean;
    created_at?: string;
    updated_at?: string;
}
  

export interface EventMedia {
    id: number;
    model_type: string;
    model_id: number;
    uuid: string;
    collection_name: string;
    name: string;
    file_name: string;
    mime_type: string;
    disk: string;
    conversions_disk: string;
    size: number;
    manipulations: Record<string, unknown>;
    custom_properties: Record<string, unknown>;
    generated_conversions: Record<string, boolean>;
    responsive_images: any[];      // or Record<string, unknown>[] if you want to be more specific
    order_column: number;
    created_at: string;
    updated_at: string;
    original_url: string;
    preview_url: string;
  }

interface Product {
    name: string;
    price: string;
}

interface SessionRosterContact {
    name: string;
  }
  
  interface SessionOptionButton {
    buttonText: string;
    buttonLink: string;
    buttonTarget?: string;
  }
  
  interface SessionOption {
    id: string;
    iconName: string;
    title: string;
    description: string;
    buttons: SessionOptionButton[];
  }
  
  export interface SessionData {
    id: number;
    title: string;
    label: string;
    description: string | null;
    start_date: string;
    date_formatted_full_pretty: string;
    is_today: boolean;
    relative_date: string;
    time: string;
    all_day: number;
    capacity: number;
    entries_count: number;
    remaining_capacity: number;
    status: string;
    roster_info: {
      description: string;
      contacts: SessionRosterContact[];
    };
    session_options: SessionOption[];
  }
  
  export interface EventSessionResponse {
    session: SessionData | null;
    event: EntryPlaceEvent;
  }

export async function getEventWithPossibleSessionDetails(eventId: string, sessionId: string | null, form: string | null, forceOpenId: string | null): Promise<EventSessionResponse> {
    try {
        var path = '/api/v1/omni-event/' + eventId;
        if (sessionId) {
            path += '?sessionId=' + sessionId;
        }
        if (form) {
            path += (sessionId ? '&' : '?') + 'form=' + form;
        }

        var response: AxiosResponse<EventSessionResponse> = await axios.get(path);
        var decodedEventId: null | string = null;
        if (forceOpenId) {
          try {
            decodedEventId = atob(forceOpenId);
          } catch (err) {
            console.error("Error decoding forceOpenId:", err);
          }
        }
        if (response.status === 200) {
            // Change event status to 'Live' if forceOpenId matches event.id
            if (decodedEventId && decodedEventId == response.data.event.id) {
                response.data.event.entries_status = 'Live';
            }
            return response.data;
        } else {
            throw new Error('Network response was not ok');
        }
    } catch (error: any) {
        if (error.response?.status === 404) {
          throw new Error("EventNotFound");
        }
        throw new Error(`${error}`);
    }
}
