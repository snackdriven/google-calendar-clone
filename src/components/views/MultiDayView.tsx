import { useCalendarStore } from '../../store/calendarStore';
import { getDaysInView, getHoursInDay, isEventInDay, formatEventTime, getEventPosition } from '../../lib/dateUtils';
import { format, parseISO, isSameDay } from 'date-fns';
import { CalendarEvent } from '../../types';
import { motion } from 'framer-motion';

interface MultiDayViewProps {
  view: '3days' | 'workweek' | 'week' | '2weeks';
}

export function MultiDayView({ view }: MultiDayViewProps) {
  const { currentDate, events, setSelectedEvent, view: currentView } = useCalendarStore();
  const days = getDaysInView(view, currentDate);
  const hours = getHoursInDay();

  const getDayEvents = (day: Date) => {
    return events.filter((event) => isEventInDay(event, day));
  };

  const getCalendarColor = (calendarId: string) => {
    const calendar = useCalendarStore.getState().calendars.find((c) => c.id === calendarId);
    return calendar?.backgroundColor || '#4285f4';
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header with days */}
      <div className="flex border-b border-border bg-muted/30 sticky top-0 z-10">
        <div className="w-20 border-r border-border flex-shrink-0" />
        {days.map((day) => (
          <div key={day.toISOString()} className="flex-1 border-r border-border last:border-r-0 p-2">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">{format(day, 'EEE')}</div>
              <div className={`text-lg font-semibold mt-1 ${isSameDay(day, new Date()) ? 'text-primary' : ''}`}>
                {format(day, 'd')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* All-day events */}
      <div className="flex border-b border-border bg-muted/30">
        <div className="w-20 border-r border-border flex-shrink-0" />
        {days.map((day) => {
          const dayEvents = getDayEvents(day);
          const allDayEvents = dayEvents.filter((event) => event.start.date);

          return (
            <div key={day.toISOString()} className="flex-1 border-r border-border last:border-r-0 p-1 min-h-[60px]">
              <div className="flex flex-col gap-1">
                {allDayEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelectedEvent(event)}
                    className="px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity truncate"
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
          );
        })}
      </div>

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

          {/* Days columns */}
          {days.map((day) => {
            const dayEvents = getDayEvents(day);
            const timedEvents = dayEvents.filter((event) => event.start.dateTime);

            return (
              <div key={day.toISOString()} className="flex-1 border-r border-border last:border-r-0 relative">
                {hours.map((hour) => (
                  <div key={hour} className="h-16 border-b border-border" />
                ))}

                {/* Render timed events */}
                {timedEvents.map((event) => {
                  const position = getEventPosition(event, day);
                  if (!position) return null;

                  const start = parseISO(event.start.dateTime!);
                  const end = event.end?.dateTime ? parseISO(event.end.dateTime) : new Date(start.getTime() + 60 * 60 * 1000);
                  const duration = (end.getTime() - start.getTime()) / (1000 * 60);
                  const height = Math.max(duration, 30);

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
            );
          })}
        </div>
      </div>
    </div>
  );
}

