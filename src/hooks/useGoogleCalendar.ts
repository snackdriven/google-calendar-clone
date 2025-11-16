import { useEffect, useCallback } from 'react';
import { useCalendarStore } from '../store/calendarStore';
import { useAuthStore } from '../store/authStore';
import { GoogleCalendarAPI } from '../lib/googleCalendarApi';
import { CalendarEvent, GoogleCalendar } from '../types';
import { formatISO, startOfDay, endOfDay, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addWeeks } from 'date-fns';

// This will be initialized from App
let calendarAPI: GoogleCalendarAPI | null = null;

export function setCalendarAPI(api: GoogleCalendarAPI) {
  calendarAPI = api;
}

export function useGoogleCalendar() {
  const {
    calendars,
    setCalendars,
    events,
    setEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    currentDate,
    view,
    syncState,
    setSyncToken,
    getSyncToken,
    setLoading,
    setError,
  } = useCalendarStore();

  const { accessToken, isAuthenticated } = useAuthStore();

  const syncCalendars = useCallback(async () => {
    if (!calendarAPI || !accessToken || !isAuthenticated) return;

    try {
      setLoading(true);
      calendarAPI.setAccessToken(accessToken);
      const calendarList = await calendarAPI.getCalendarList();
      
      const formattedCalendars: GoogleCalendar[] = calendarList.map(cal => ({
        id: cal.id,
        summary: cal.summary,
        description: cal.description,
        backgroundColor: cal.backgroundColor,
        foregroundColor: cal.foregroundColor,
        selected: calendars.find(c => c.id === cal.id)?.selected ?? cal.id === 'primary',
      }));

      setCalendars(formattedCalendars);
    } catch (error) {
      console.error('Error syncing calendars:', error);
      setError('Failed to sync calendars');
    } finally {
      setLoading(false);
    }
  }, [accessToken, isAuthenticated, calendars, setCalendars, setLoading, setError]);

  const getDateRange = useCallback(() => {
    let timeMin: Date;
    let timeMax: Date;

    switch (view) {
      case 'day':
        timeMin = startOfDay(currentDate);
        timeMax = endOfDay(currentDate);
        break;
      case '3days':
        timeMin = startOfDay(currentDate);
        timeMax = endOfDay(addDays(currentDate, 2));
        break;
      case 'workweek':
        timeMin = startOfWeek(currentDate, { weekStartsOn: 1 });
        timeMax = endOfWeek(addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 4), { weekStartsOn: 1 });
        break;
      case 'week':
        timeMin = startOfWeek(currentDate, { weekStartsOn: 1 });
        timeMax = endOfWeek(currentDate, { weekStartsOn: 1 });
        break;
      case '2weeks':
        timeMin = startOfWeek(currentDate, { weekStartsOn: 1 });
        timeMax = endOfWeek(addWeeks(currentDate, 1), { weekStartsOn: 1 });
        break;
      case 'month':
        timeMin = startOfMonth(currentDate);
        timeMax = endOfMonth(currentDate);
        break;
      default:
        timeMin = startOfWeek(currentDate, { weekStartsOn: 1 });
        timeMax = endOfWeek(currentDate, { weekStartsOn: 1 });
    }

    // Expand range to ensure we get all relevant events
    timeMin = addDays(timeMin, -7);
    timeMax = addDays(timeMax, 7);

    return { timeMin, timeMax };
  }, [view, currentDate]);

  const syncEvents = useCallback(async (fullSync = false) => {
    if (!calendarAPI || !accessToken || !isAuthenticated) return;

    try {
      setLoading(true);
      calendarAPI.setAccessToken(accessToken);

      const { timeMin, timeMax } = getDateRange();
      const timeMinStr = formatISO(timeMin);
      const timeMaxStr = formatISO(timeMax);

      const selectedCalendars = calendars.filter(cal => cal.selected);
      const allEvents: CalendarEvent[] = [];

      for (const calendar of selectedCalendars) {
        try {
          const syncToken = fullSync ? undefined : getSyncToken(calendar.id);
          const result = await calendarAPI.getEvents(
            calendar.id,
            timeMinStr,
            timeMaxStr,
            syncToken
          );

          if (result.nextSyncToken) {
            setSyncToken(calendar.id, result.nextSyncToken);
          }

          const calendarEvents: CalendarEvent[] = result.events
            .filter(e => e.id)
            .map(e => ({
              id: e.id!,
              calendarId: calendar.id,
              summary: e.summary || 'Untitled Event',
              description: e.description,
              start: e.start || {},
              end: e.end || {},
              location: e.location,
              attendees: e.attendees,
              recurringEventId: e.recurringEventId,
              colorId: e.colorId,
              created: e.created,
              updated: e.updated,
              htmlLink: e.htmlLink,
            }));

          allEvents.push(...calendarEvents);
        } catch (error: any) {
          // Handle sync token expiry - do full sync
          if (error.status === 410) {
            const result = await calendarAPI.getEvents(
              calendar.id,
              timeMinStr,
              timeMaxStr
            );

            if (result.nextSyncToken) {
              setSyncToken(calendar.id, result.nextSyncToken);
            }

            const calendarEvents: CalendarEvent[] = result.events
              .filter(e => e.id)
              .map(e => ({
                id: e.id!,
                calendarId: calendar.id,
                summary: e.summary || 'Untitled Event',
                description: e.description,
                start: e.start || {},
                end: e.end || {},
                location: e.location,
                attendees: e.attendees,
                recurringEventId: e.recurringEventId,
                colorId: e.colorId,
                created: e.created,
                updated: e.updated,
                htmlLink: e.htmlLink,
              }));

            allEvents.push(...calendarEvents);
          } else {
            console.error(`Error syncing events for calendar ${calendar.id}:`, error);
          }
        }
      }

      setEvents(allEvents);
    } catch (error) {
      console.error('Error syncing events:', error);
      setError('Failed to sync events');
    } finally {
      setLoading(false);
    }
  }, [accessToken, isAuthenticated, calendars, view, currentDate, getSyncToken, setSyncToken, setEvents, setLoading, setError]);

  const createEvent = useCallback(async (calendarId: string, event: CalendarEvent): Promise<CalendarEvent | null> => {
    if (!calendarAPI || !accessToken || !isAuthenticated) return null;

    try {
      setLoading(true);
      calendarAPI.setAccessToken(accessToken);

      const googleEvent = await calendarAPI.createEvent(calendarId, {
        summary: event.summary,
        description: event.description,
        start: event.start,
        end: event.end,
        location: event.location,
        attendees: event.attendees,
        colorId: event.colorId,
      });

      const newEvent: CalendarEvent = {
        id: googleEvent.id!,
        calendarId,
        summary: googleEvent.summary || 'Untitled Event',
        description: googleEvent.description,
        start: googleEvent.start || {},
        end: googleEvent.end || {},
        location: googleEvent.location,
        attendees: googleEvent.attendees,
        recurringEventId: googleEvent.recurringEventId,
        colorId: googleEvent.colorId,
        created: googleEvent.created,
        updated: googleEvent.updated,
        htmlLink: googleEvent.htmlLink,
      };

      addEvent(newEvent);
      // Trigger a sync to get the latest state
      await syncEvents(true);
      return newEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      setError('Failed to create event');
      return null;
    } finally {
      setLoading(false);
    }
  }, [accessToken, isAuthenticated, addEvent, syncEvents, setLoading, setError]);

  const updateEventCallback = useCallback(async (event: CalendarEvent): Promise<CalendarEvent | null> => {
    if (!calendarAPI || !accessToken || !isAuthenticated) return null;

    try {
      setLoading(true);
      calendarAPI.setAccessToken(accessToken);

      const googleEvent = await calendarAPI.updateEvent(event.calendarId, event.id, {
        summary: event.summary,
        description: event.description,
        start: event.start,
        end: event.end,
        location: event.location,
        attendees: event.attendees,
        colorId: event.colorId,
      });

      const updatedEvent: CalendarEvent = {
        ...event,
        summary: googleEvent.summary || 'Untitled Event',
        description: googleEvent.description,
        start: googleEvent.start || {},
        end: googleEvent.end || {},
        location: googleEvent.location,
        attendees: googleEvent.attendees,
        recurringEventId: googleEvent.recurringEventId,
        colorId: googleEvent.colorId,
        updated: googleEvent.updated,
      };

      updateEvent(updatedEvent);
      // Trigger a sync to get the latest state
      await syncEvents(true);
      return updatedEvent;
    } catch (error) {
      console.error('Error updating event:', error);
      setError('Failed to update event');
      return null;
    } finally {
      setLoading(false);
    }
  }, [accessToken, isAuthenticated, updateEvent, syncEvents, setLoading, setError]);

  const deleteEventCallback = useCallback(async (event: CalendarEvent): Promise<void> => {
    if (!calendarAPI || !accessToken || !isAuthenticated) return;

    try {
      setLoading(true);
      calendarAPI.setAccessToken(accessToken);

      await calendarAPI.deleteEvent(event.calendarId, event.id);
      deleteEvent(event.id);
      // Trigger a sync to get the latest state
      await syncEvents(true);
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Failed to delete event');
    } finally {
      setLoading(false);
    }
  }, [accessToken, isAuthenticated, deleteEvent, syncEvents, setLoading, setError]);

  // Auto-sync when authenticated and calendars change
  useEffect(() => {
    if (isAuthenticated && calendars.length > 0) {
      syncEvents();
    }
  }, [isAuthenticated, calendars, view, currentDate]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    syncCalendars,
    syncEvents,
    createEvent,
    updateEvent: updateEventCallback,
    deleteEvent: deleteEventCallback,
    calendars,
    events,
  };
}

