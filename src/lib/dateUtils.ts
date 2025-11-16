import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addDays,
  addWeeks,
  isSameDay,
  isSameMonth,
  getHours,
  getMinutes,
  parseISO,
  isBefore,
  isAfter,
  isWithinInterval,
  differenceInDays,
} from 'date-fns';

export function getDaysInView(view: string, currentDate: Date): Date[] {
  let start: Date;
  let end: Date;

  switch (view) {
    case 'day':
      start = startOfDay(currentDate);
      end = endOfDay(currentDate);
      break;
    case '3days':
      start = startOfDay(currentDate);
      end = endOfDay(addDays(currentDate, 2));
      break;
    case 'workweek':
      start = startOfWeek(currentDate, { weekStartsOn: 1 });
      end = endOfWeek(addDays(start, 4), { weekStartsOn: 1 });
      break;
    case 'week':
      start = startOfWeek(currentDate, { weekStartsOn: 1 });
      end = endOfWeek(currentDate, { weekStartsOn: 1 });
      break;
    case '2weeks':
      start = startOfWeek(currentDate, { weekStartsOn: 1 });
      end = endOfWeek(addWeeks(currentDate, 1), { weekStartsOn: 1 });
      break;
    case 'month':
      start = startOfMonth(currentDate);
      end = endOfMonth(currentDate);
      break;
    default:
      start = startOfWeek(currentDate, { weekStartsOn: 1 });
      end = endOfWeek(currentDate, { weekStartsOn: 1 });
  }

  return eachDayOfInterval({ start, end });
}

export function getHoursInDay(): number[] {
  return Array.from({ length: 24 }, (_, i) => i);
}

export function formatEventTime(start: { dateTime?: string; date?: string }, end: { dateTime?: string; date?: string }): string {
  if (start.date && end.date) {
    // All-day event
    const startDate = parseISO(start.date);
    const endDate = parseISO(end.date);
    const daysDiff = differenceInDays(endDate, startDate);

    if (daysDiff === 0) {
      return 'All day';
    } else if (daysDiff === 1) {
      return format(startDate, 'MMM d');
    } else {
      return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`;
    }
  } else if (start.dateTime && end.dateTime) {
    // Timed event
    const startDate = parseISO(start.dateTime);
    const endDate = parseISO(end.dateTime);

    const startTime = format(startDate, 'h:mm a');
    const endTime = format(endDate, 'h:mm a');

    if (isSameDay(startDate, endDate)) {
      return `${startTime} - ${endTime}`;
    } else {
      return `${format(startDate, 'MMM d, h:mm a')} - ${format(endDate, 'MMM d, h:mm a')}`;
    }
  }

  return '';
}

export function getEventPosition(
  event: { start: { dateTime?: string; date?: string } },
  dayStart: Date
): { top: number; height: number } | null {
  if (event.start.date) {
    // All-day event
    return { top: 0, height: 24 };
  }

  if (event.start.dateTime) {
    const eventStart = parseISO(event.start.dateTime);
    const dayStartTime = startOfDay(dayStart);

    if (!isSameDay(eventStart, dayStartTime)) {
      return null;
    }

    const hours = getHours(eventStart);
    const minutes = getMinutes(eventStart);
    const top = hours * 60 + minutes; // minutes from start of day

    // Default height (will be adjusted based on duration)
    const height = 60; // 1 hour default

    return { top, height };
  }

  return null;
}

export function isEventInDay(
  event: { start: { dateTime?: string; date?: string }; end: { dateTime?: string; date?: string } },
  day: Date
): boolean {
  if (event.start.date) {
    // All-day event
    const eventStart = parseISO(event.start.date);
    const eventEnd = event.end?.date ? parseISO(event.end.date) : eventStart;

    return isWithinInterval(day, { start: eventStart, end: eventEnd });
  }

  if (event.start.dateTime) {
    const eventStart = parseISO(event.start.dateTime);
    const eventEnd = event.end?.dateTime ? parseISO(event.end.dateTime) : addDays(eventStart, 1);

    return isWithinInterval(day, { start: eventStart, end: eventEnd });
  }

  return false;
}

export function formatViewTitle(view: string, currentDate: Date): string {
  switch (view) {
    case 'day':
      return format(currentDate, 'EEEE, MMMM d, yyyy');
    case '3days':
      return format(currentDate, 'MMM d') + ' - ' + format(addDays(currentDate, 2), 'MMM d, yyyy');
    case 'workweek':
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      return format(weekStart, 'MMM d') + ' - ' + format(addDays(weekStart, 4), 'MMM d, yyyy');
    case 'week':
      const weekStart2 = startOfWeek(currentDate, { weekStartsOn: 1 });
      return format(weekStart2, 'MMM d') + ' - ' + format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d, yyyy');
    case '2weeks':
      const weekStart3 = startOfWeek(currentDate, { weekStartsOn: 1 });
      return format(weekStart3, 'MMM d') + ' - ' + format(endOfWeek(addWeeks(currentDate, 1), { weekStartsOn: 1 }), 'MMM d, yyyy');
    case 'month':
      return format(currentDate, 'MMMM yyyy');
    default:
      return format(currentDate, 'MMMM yyyy');
  }
}

