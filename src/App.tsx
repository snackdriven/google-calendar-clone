import { useEffect, useState } from 'react';
import { useCalendarStore } from './store/calendarStore';
import { useAuthStore } from './store/authStore';
import { useGoogleCalendar, setCalendarAPI } from './hooks/useGoogleCalendar';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { GoogleCalendarAPI } from './lib/googleCalendarApi';
import { CalendarHeader } from './components/CalendarHeader';
import { CalendarSidebar } from './components/CalendarSidebar';
import { EventForm } from './components/EventForm';
import { EventDetails } from './components/EventDetails';
import { DayView } from './components/views/DayView';
import { MultiDayView } from './components/views/MultiDayView';
import { MonthView } from './components/views/MonthView';
import { Plus } from 'lucide-react';
import { Button } from './components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { view, isLoading, error, theme, setTheme } = useCalendarStore();
  const { isAuthenticated, accessToken, setAuth, userEmail } = useAuthStore();
  const { syncCalendars } = useGoogleCalendar();
  const [calendarAPI, setCalendarAPILocal] = useState<GoogleCalendarAPI | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useKeyboardShortcuts();

  // Initialize Google Calendar API
  useEffect(() => {
    const initAPI = async () => {
      try {
        // Get API credentials from environment variables or config
        // In production, these should be in .env file
        const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
        const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

        if (!API_KEY || !CLIENT_ID) {
          console.error('Missing Google API credentials. Please set VITE_GOOGLE_API_KEY and VITE_GOOGLE_CLIENT_ID');
          return;
        }

        const api = new GoogleCalendarAPI(API_KEY, CLIENT_ID);
        await api.initialize();
        setCalendarAPILocal(api);
        setCalendarAPI(api);
        setInitialized(true);

        // Try to restore token if available
        const storedToken = localStorage.getItem('google_access_token');
        const storedEmail = localStorage.getItem('google_user_email');

        if (storedToken && storedEmail) {
          setAuth(storedToken, storedEmail);
          api.setAccessToken(storedToken);
        }
      } catch (error) {
        console.error('Error initializing Google Calendar API:', error);
      }
    };

    initAPI();
  }, [setAuth]);

  // Apply theme on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem('calendar-theme') || 'default';
    setTheme(storedTheme as typeof theme);
  }, [setTheme]);

  // Handle authentication
  const handleAuth = async () => {
    if (!calendarAPI) return;

    calendarAPI.requestAccessToken((token: string) => {
      // Get user email from token
      fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setAuth(token, data.email);
          calendarAPI?.setAccessToken(token);
          syncCalendars();
        })
        .catch((error) => {
          console.error('Error getting user info:', error);
        });
    });
  };

  // Render view based on current view type
  const renderView = () => {
    switch (view) {
      case 'day':
        return <DayView />;
      case '3days':
      case 'workweek':
      case 'week':
      case '2weeks':
        return <MultiDayView view={view} />;
      case 'month':
        return <MonthView />;
      default:
        return <MultiDayView view="week" />;
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing calendar...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Calendar Clone</h1>
          <p className="text-muted-foreground">Sign in with Google to access your calendars</p>
          <Button onClick={handleAuth} size="lg">
            Sign in with Google
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CalendarHeader />

      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence>
          <CalendarSidebar calendarAPI={calendarAPI} />
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto relative">
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-2 border-b border-border">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="absolute top-0 left-0 right-0 bg-primary/10 border-b border-primary/20 py-2 px-4 z-20">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">Syncing...</span>
              </div>
            </div>
          )}

          <div className="p-4 h-full">{renderView()}</div>

          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowEventForm(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center z-30"
            aria-label="Create new event"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        </main>
      </div>

      <EventForm isOpen={showEventForm} onClose={() => setShowEventForm(false)} />
      <EventDetails />
    </div>
  );
}

export default App;

