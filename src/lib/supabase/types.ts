// Manually-typed Supabase schema for RaceVerse.
// Will be replaced by `pnpm gen:types` output once Supabase CLI is configured.
// Source of truth: docs/FRONTEND_ARCHITECTURE.md §3 in gomdolkim/RunningApi.

export type PrimaryType =
  | "road_marathon"
  | "road_other"
  | "trail"
  | "ultra"
  | "mixed"
  | "virtual"
  | "unknown";

export type EditionStatus =
  | "announced"
  | "open"
  | "closed"
  | "completed"
  | "cancelled"
  | "postponed"
  | "unknown";

export type DistanceCategory =
  | "road"
  | "trail"
  | "track"
  | "ultra"
  | "vertical"
  | "relay"
  | "mixed"
  | "unknown";

export interface Race {
  id: string;
  canonical_name: string;
  slug: string;
  description: string | null;
  website_url: string | null;
  organizer_id: string | null;
  location_id: string | null;
  primary_type: PrimaryType;
  first_held_year: number | null;
  is_active: boolean;
  search_text: string;
  created_at: string;
  updated_at: string;
}

export interface RaceEdition {
  id: string;
  race_id: string;
  edition_year: number;
  event_date: string | null;
  event_end_date: string | null;
  status: EditionStatus;
  participant_limit: number | null;
  registered_count: number | null;
  edition_name: string | null;
  notes: string | null;
}

export interface RaceDistance {
  id: string;
  race_edition_id: string;
  distance_km: number | null;
  distance_label: string;
  category: DistanceCategory;
  elevation_gain_m: number | null;
  elevation_loss_m: number | null;
  itra_points: number | null;
  utmb_index: number | null;
  cutoff_hours: number | null;
  start_time: string | null;
}

export interface Location {
  id: string;
  country_code: string;
  country_name: string | null;
  region: string | null;
  city: string | null;
  venue_name: string | null;
  address: string | null;
  geo_point: string | null;
  timezone: string | null;
}

export interface RegistrationInfo {
  id: string;
  race_edition_id: string;
  registration_url: string | null;
  registration_platform: string | null;
  opens_at: string | null;
  closes_at: string | null;
  price_amount: number | null;
  price_currency: string | null;
  early_bird_price: number | null;
  early_bird_deadline: string | null;
  lottery_required: boolean;
  qualifying_time_required: boolean;
  qualifying_standards: Record<string, string> | null;
  waitlist_available: boolean;
  registration_notes: string | null;
  how_to_register: string | null;
}

export interface Organizer {
  id: string;
  name: string;
  website: string | null;
  email: string | null;
}

export interface Tag {
  id: string;
  name: string;
  category: string | null;
}

export interface RaceMedia {
  id: string;
  race_id: string;
  media_type: string;
  url: string;
  caption: string | null;
}

// View row: races_public
export interface RacePublic {
  id: string;
  canonical_name: string;
  slug: string;
  description: string | null;
  website_url: string | null;
  primary_type: PrimaryType;
  first_held_year: number | null;
  is_active: boolean;
  search_text: string;
  created_at: string;
  updated_at: string;
  location_id: string | null;
  country_code: string | null;
  country_name: string | null;
  region: string | null;
  city: string | null;
  venue_name: string | null;
  address: string | null;
  timezone: string | null;
  longitude: number | null;
  latitude: number | null;
  organizer_id: string | null;
  organizer_name: string | null;
  organizer_website: string | null;
}

// View row: race_with_next_edition (races_public + edition + registration)
export interface RaceWithNextEdition extends RacePublic {
  edition_id: string | null;
  edition_year: number | null;
  event_date: string | null;
  event_end_date: string | null;
  edition_status: EditionStatus | null;
  participant_limit: number | null;
  registered_count: number | null;
  edition_name: string | null;
  edition_notes: string | null;
  registration_url: string | null;
  registration_platform: string | null;
  registration_opens_at: string | null;
  registration_closes_at: string | null;
  price_amount: number | null;
  price_currency: string | null;
  early_bird_price: number | null;
  early_bird_deadline: string | null;
  lottery_required: boolean | null;
  qualifying_time_required: boolean | null;
  waitlist_available: boolean | null;
  registration_notes: string | null;
  how_to_register: string | null;
}

export interface CountryStats {
  country_code: string;
  country_name: string | null;
  race_count: number;
  marathon_count: number;
  trail_count: number;
  geocoded_count: number;
}

// Minimal Database type for @supabase/supabase-js generic.
// Fully-generated types will replace this after `pnpm gen:types`.
type RWE_Row = RaceWithNextEdition;
type RP_Row = RacePublic;
type CS_Row = CountryStats;

export interface Database {
  public: {
    Tables: {
      races: { Row: Race; Insert: Partial<Race>; Update: Partial<Race>; Relationships: [] };
      race_editions: {
        Row: RaceEdition;
        Insert: Partial<RaceEdition>;
        Update: Partial<RaceEdition>;
        Relationships: [];
      };
      race_distances: {
        Row: RaceDistance;
        Insert: Partial<RaceDistance>;
        Update: Partial<RaceDistance>;
        Relationships: [];
      };
      locations: {
        Row: Location;
        Insert: Partial<Location>;
        Update: Partial<Location>;
        Relationships: [];
      };
      registration_info: {
        Row: RegistrationInfo;
        Insert: Partial<RegistrationInfo>;
        Update: Partial<RegistrationInfo>;
        Relationships: [];
      };
      organizers: {
        Row: Organizer;
        Insert: Partial<Organizer>;
        Update: Partial<Organizer>;
        Relationships: [];
      };
      tags: { Row: Tag; Insert: Partial<Tag>; Update: Partial<Tag>; Relationships: [] };
      race_media: {
        Row: RaceMedia;
        Insert: Partial<RaceMedia>;
        Update: Partial<RaceMedia>;
        Relationships: [];
      };
    };
    Views: {
      races_public: { Row: RP_Row; Relationships: [] };
      race_with_next_edition: { Row: RWE_Row; Relationships: [] };
      country_stats: { Row: CS_Row; Relationships: [] };
    };
    Functions: {
      search_races: {
        Args: {
          countries?: string[] | null;
          types?: string[] | null;
          distance_min?: number | null;
          distance_max?: number | null;
          date_from?: string | null;
          date_to?: string | null;
          search_query?: string | null;
          only_with_registration?: boolean | null;
          limit_count?: number | null;
          offset_count?: number | null;
        };
        Returns: RWE_Row[];
      };
      races_in_bbox: {
        Args: {
          west: number;
          south: number;
          east: number;
          north: number;
          limit_count?: number | null;
        };
        Returns: RWE_Row[];
      };
      races_near: {
        Args: {
          lat: number;
          lon: number;
          radius_km?: number | null;
          limit_count?: number | null;
        };
        Returns: RWE_Row[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
