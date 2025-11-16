import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useCalendarStore } from '../store/calendarStore';
import { formatViewTitle } from '../lib/dateUtils';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { CalendarView, Theme } from '../types';

export function CalendarHeader() {
  const {
    view,
    setView,
    currentDate,
    navigateDate,
    goToToday,
    theme,
    setTheme,
  } = useCalendarStore();

  const views: { value: CalendarView; label: string }[] = [
    { value: 'day', label: 'Day' },
    { value: '3days', label: '3 Days' },
    { value: 'workweek', label: 'Work Week' },
    { value: 'week', label: 'Week' },
    { value: '2weeks', label: '2 Weeks' },
    { value: 'month', label: 'Month' },
  ];

  const themes: { value: Theme; label: string }[] = [
    { value: 'default', label: 'Default Dark' },
    { value: 'dark-blue', label: 'Dark Blue' },
    { value: 'dark-green', label: 'Dark Green' },
    { value: 'dark-purple', label: 'Dark Purple' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              <h1 className="text-2xl font-bold">Calendar</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateDate('prev')}
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateDate('next')}
                  aria-label="Next"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
              <h2 className="text-lg font-semibold min-w-[200px]">
                {formatViewTitle(view, currentDate)}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={view} onChange={(e) => setView(e.target.value as CalendarView)}>
              {views.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </Select>
            <Select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
              {themes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>
    </header>
  );
}

