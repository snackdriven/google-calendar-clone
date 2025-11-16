import { useCalendarStore } from '../../store/calendarStore';
import { isEventInDay } from '../../lib/dateUtils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { motion } from 'framer-motion';

export function MonthView() {
  const { currentDate, events, setSelectedEvent } = useCalendarStore();

  // Get the month view dates
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Group days into weeks
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getDayEvents = (day: Date) => {
    return events.filter((event) => isEventInDay(event, day));
  };

  const getCalendarColor = (calendarId: string) => {
    const calendar = useCalendarStore.getState().calendars.find((c) => c.id === calendarId);
    return calendar?.backgroundColor || '#4285f4';
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/30 sticky top-0 z-10">
        {weekDays.map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground border-r border-border last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-rows-6">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b border-border last:border-b-0">
            {week.map((day) => {
              const dayEvents = getDayEvents(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  className={`border-r border-border last:border-r-0 p-1 min-h-[120px] ${
                    !isCurrentMonth ? 'bg-muted/20 opacity-50' : ''
                  }`}
                >
                  <div
                    className={`text-sm font-medium mb-1 p-1 rounded ${
                      isToday ? 'bg-primary text-primary-foreground' : ''
                    }`}
                  >
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1 overflow-y-auto max-h-[100px]">
                    {dayEvents.slice(0, 3).map((event) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => setSelectedEvent(event)}
                        className="px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity truncate"
                        style={{
                          backgroundColor: getCalendarColor(event.calendarId),
                          color: '#fff',
                        }}
                      >
                        {event.start.dateTime && (
                          <span className="mr-1">
                            {format(parseISO(event.start.dateTime), 'h:mm a')}
                          </span>
                        )}
                        {event.summary}
                      </motion.div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground px-2">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

