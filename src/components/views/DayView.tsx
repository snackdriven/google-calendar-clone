import { useCalendarStore } from '../../store/calendarStore';
import { getDaysInView, getHoursInDay, isEventInDay, formatEventTime, getEventPosition } from '../../lib/dateUtils';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

export function DayView() {
  const { currentDate, events, setSelectedEvent } = useCalendarStore();
  const days = getDaysInView('day', currentDate);
  const hours = getHoursInDay();
  const day = days[0];

  const dayEvents = events.filter((event) => isEventInDay(event, day));

  const allDayEvents = dayEvents.filter((event) => event.start.date);
  const timedEvents = dayEvents.filter((event) => event.start.dateTime);

  const getCalendarColor = (calendarId: string) => {
    const calendar = useCalendarStore.getState().calendars.find((c) => c.id === calendarId);
    return calendar?.backgroundColor || '#4285f4';
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* All-day events bar */}
      {allDayEvents.length > 0 && (
        <div className="border-b border-border p-2 bg-muted/30">
          <div className="flex flex-col gap-1">
            {allDayEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setSelectedEvent(event)}
                className="px-3 py-1 rounded text-sm cursor-pointer hover:opacity-80 transition-opacity truncate"
                style={{
                  backgroundColor: getCalendarColor(event.calendarId),
                  color: '#fff',
                }}
              >
                {event.summary}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Time grid */}
      <div className="flex-1 relative overflow-y-auto">
        <div className="flex">
          {/* Time column */}
          <div className="w-20 border-r border-border flex-shrink-0">
            {hours.map((hour) => (
              <div key={hour} className="h-16 border-b border-border flex items-start justify-end pr-2 pt-1">
                <span className="text-xs text-muted-foreground">{format(new Date().setHours(hour, 0, 0, 0), 'h a')}</span>
              </div>
            ))}
          </div>

          {/* Events column */}
          <div className="flex-1 relative">
            {hours.map((hour) => (
              <div key={hour} className="h-16 border-b border-border" />
            ))}

            {/* Render timed events */}
            {timedEvents.map((event) => {
              const position = getEventPosition(event, day);
              if (!position) return null;

              const start = parseISO(event.start.dateTime!);
              const end = event.end?.dateTime ? parseISO(event.end.dateTime) : new Date(start.getTime() + 60 * 60 * 1000);
              const duration = (end.getTime() - start.getTime()) / (1000 * 60); // minutes
              const height = Math.max(duration, 30); // minimum 30 minutes

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setSelectedEvent(event)}
                  className="absolute left-1 right-1 px-2 py-1 rounded text-xs cursor-pointer hover:opacity-90 transition-opacity shadow-sm border border-border/50"
                  style={{
                    top: `${position.top}px`,
                    height: `${height}px`,
                    backgroundColor: getCalendarColor(event.calendarId),
                    color: '#fff',
                    minHeight: '30px',
                  }}
                >
                  <div className="font-medium truncate">{event.summary}</div>
                  <div className="text-xs opacity-90">{formatEventTime(event.start, event.end || event.start)}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

