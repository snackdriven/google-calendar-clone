export type CalendarView = 'day' | '3days' | 'workweek' | 'week' | '2weeks' | 'month';

export type Theme = 'default' | 'dark-blue' | 'dark-green' | 'dark-purple';

export interface GoogleCalendar {
  id: string;
  summary: string;
  description?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  selected?: boolean;
  syncToken?: string;
}

export interface CalendarEvent {
  id: string;
  calendarId: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  recurringEventId?: string;
  colorId?: string;
  created?: string;
  updated?: string;
  htmlLink?: string;
}

export interface CalendarState {
  view: CalendarView;
  currentDate: Date;
  calendars: GoogleCalendar[];
  events: CalendarEvent[];
  selectedEvent: CalendarEvent | null;
  isLoading: boolean;
  error: string | null;
}

export interface SyncState {
  [calendarId: string]: {
    syncToken?: string;
    lastSyncTime?: number;
  };
}

