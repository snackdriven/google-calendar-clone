import { useEffect } from 'react';
import { useCalendarStore } from '../store/calendarStore';

export function useKeyboardShortcuts() {
  const { navigateDate, goToToday, setView, view } = useCalendarStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      // Navigation shortcuts
      if (e.key === 'ArrowLeft' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        navigateDate('prev');
      } else if (e.key === 'ArrowRight' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        navigateDate('next');
      } else if (e.key === 't' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        goToToday();
      }

      // View shortcuts
      if (e.key === 'd' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        setView('day');
      } else if (e.key === 'w' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        setView('week');
      } else if (e.key === 'm' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        setView('month');
      } else if (e.key === 'w' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        setView('workweek');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateDate, goToToday, setView, view]);
}

