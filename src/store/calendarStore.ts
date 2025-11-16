import { create } from 'zustand';
import { CalendarView, Theme, GoogleCalendar, CalendarEvent, SyncState } from '../types';

interface CalendarStore {
  // View state
  view: CalendarView;
  setView: (view: CalendarView) => void;
  
  // Date state
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  goToToday: () => void;
  navigateDate: (direction: 'prev' | 'next') => void;
  
  // Theme state
  theme: Theme;
  setTheme: (theme: Theme) => void;
  
  // Calendar state
  calendars: GoogleCalendar[];
  setCalendars: (calendars: GoogleCalendar[]) => void;
  toggleCalendar: (calendarId: string) => void;
  
  // Events state
  events: CalendarEvent[];
  setEvents: (events: CalendarEvent[]) => void;
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (event: CalendarEvent) => void;
  deleteEvent: (eventId: string) => void;
  
  // Selection state
  selectedEvent: CalendarEvent | null;
  setSelectedEvent: (event: CalendarEvent | null) => void;
  
  // Loading/Error state
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  
  // Sync state
  syncState: SyncState;
  setSyncToken: (calendarId: string, syncToken: string) => void;
  getSyncToken: (calendarId: string) => string | undefined;
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  // View state
  view: 'week',
  setView: (view) => set({ view }),
  
  // Date state
  currentDate: new Date(),
  setCurrentDate: (date) => set({ currentDate: date }),
  goToToday: () => set({ currentDate: new Date() }),
  navigateDate: (direction) => {
    const { currentDate, view } = get();
    const newDate = new Date(currentDate);
    
    switch (view) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case '3days':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 3 : -3));
        break;
      case 'workweek':
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case '2weeks':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 14 : -14));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    set({ currentDate: newDate });
  },
  
  // Theme state
  theme: 'default',
  setTheme: (theme) => {
    set({ theme });
    // Apply theme class to document
    document.documentElement.className = theme === 'default' ? 'dark' : `dark dark-theme-${theme.replace('dark-', '')}`;
  },
  
  // Calendar state
  calendars: [],
  setCalendars: (calendars) => set({ calendars }),
  toggleCalendar: (calendarId) => {
    const { calendars } = get();
    set({
      calendars: calendars.map(cal =>
        cal.id === calendarId ? { ...cal, selected: !cal.selected } : cal
      ),
    });
  },
  
  // Events state
  events: [],
  setEvents: (events) => set({ events }),
  addEvent: (event) => {
    const { events } = get();
    set({ events: [...events, event] });
  },
  updateEvent: (event) => {
    const { events } = get();
    set({
      events: events.map(e => e.id === event.id ? event : e),
    });
  },
  deleteEvent: (eventId) => {
    const { events } = get();
    set({ events: events.filter(e => e.id !== eventId) });
  },
  
  // Selection state
  selectedEvent: null,
  setSelectedEvent: (event) => set({ selectedEvent: event }),
  
  // Loading/Error state
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
  error: null,
  setError: (error) => set({ error }),
  
  // Sync state
  syncState: {},
  setSyncToken: (calendarId, syncToken) => {
    const { syncState } = get();
    set({
      syncState: {
        ...syncState,
        [calendarId]: {
          ...syncState[calendarId],
          syncToken,
          lastSyncTime: Date.now(),
        },
      },
    });
  },
  getSyncToken: (calendarId) => {
    return get().syncState[calendarId]?.syncToken;
  },
}));

// Initialize theme on load
if (typeof window !== 'undefined') {
  const storedTheme = localStorage.getItem('calendar-theme') as Theme | null;
  if (storedTheme) {
    useCalendarStore.getState().setTheme(storedTheme);
  } else {
    useCalendarStore.getState().setTheme('default');
  }
}

// Persist theme changes
useCalendarStore.subscribe((state) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('calendar-theme', state.theme);
  }
});

