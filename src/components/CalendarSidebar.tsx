import { motion } from 'framer-motion';
import { Calendar, LogOut, RefreshCw } from 'lucide-react';
import { useCalendarStore } from '../store/calendarStore';
import { useAuthStore } from '../store/authStore';
import { useGoogleCalendar, setCalendarAPI } from '../hooks/useGoogleCalendar';
import { Button } from './ui/Button';
import { GoogleCalendar } from '../types';
import { useEffect } from 'react';

interface CalendarSidebarProps {
  calendarAPI: any;
}

export function CalendarSidebar({ calendarAPI }: CalendarSidebarProps) {
  const { calendars, toggleCalendar, isLoading } = useCalendarStore();
  const { clearAuth, userEmail } = useAuthStore();
  const { syncCalendars, syncEvents } = useGoogleCalendar();

  useEffect(() => {
    if (calendarAPI) {
      setCalendarAPI(calendarAPI);
    }
  }, [calendarAPI]);

  const handleLogout = () => {
    clearAuth();
    window.location.reload();
  };

  const handleSync = async () => {
    await syncCalendars();
    await syncEvents(true);
  };

  const getCalendarColor = (calendar: GoogleCalendar) => {
    return calendar.backgroundColor || '#4285f4';
  };

  return (
    <aside className="w-64 border-r border-border bg-card h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        {userEmail && (
          <div className="pb-4 border-b border-border">
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <p className="font-medium truncate">{userEmail}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isLoading}
            className="flex-1"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Sync
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Calendars
          </h3>
          <div className="space-y-1">
            {calendars.map((calendar) => (
              <motion.label
                key={calendar.id}
                whileHover={{ x: 2 }}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={calendar.selected ?? false}
                  onChange={() => toggleCalendar(calendar.id)}
                  className="sr-only"
                />
                <div
                  className="w-4 h-4 rounded-full border-2 border-border"
                  style={{
                    backgroundColor: calendar.selected
                      ? getCalendarColor(calendar)
                      : 'transparent',
                  }}
                />
                <span className="text-sm flex-1 truncate">{calendar.summary}</span>
              </motion.label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

