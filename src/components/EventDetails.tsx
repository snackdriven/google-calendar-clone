import { CalendarEvent } from '../types';
import { useCalendarStore } from '../store/calendarStore';
import { useGoogleCalendar } from '../hooks/useGoogleCalendar';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { formatEventTime } from '../lib/dateUtils';
import { Trash2, Edit } from 'lucide-react';
import { useState } from 'react';
import { EventForm } from './EventForm';

export function EventDetails() {
  const { selectedEvent, setSelectedEvent } = useCalendarStore();
  const { deleteEvent } = useGoogleCalendar();
  const [showEditForm, setShowEditForm] = useState(false);

  if (!selectedEvent) return null;

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this event?')) {
      await deleteEvent(selectedEvent);
      setSelectedEvent(null);
    }
  };

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleClose = () => {
    setSelectedEvent(null);
    setShowEditForm(false);
  };

  const getCalendarColor = (calendarId: string) => {
    const calendar = useCalendarStore.getState().calendars.find((c) => c.id === calendarId);
    return calendar?.backgroundColor || '#4285f4';
  };

  return (
    <>
      <Modal isOpen={!showEditForm && !!selectedEvent} onClose={handleClose} title={selectedEvent.summary}>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Time</h3>
            <p>{formatEventTime(selectedEvent.start, selectedEvent.end || selectedEvent.start)}</p>
          </div>

          {selectedEvent.location && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Location</h3>
              <p>{selectedEvent.location}</p>
            </div>
          )}

          {selectedEvent.description && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
              <p className="whitespace-pre-wrap">{selectedEvent.description}</p>
            </div>
          )}

          {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Attendees</h3>
              <ul className="list-disc list-inside space-y-1">
                {selectedEvent.attendees.map((attendee, index) => (
                  <li key={index}>
                    {attendee.displayName || attendee.email}
                    {attendee.responseStatus && (
                      <span className="text-xs text-muted-foreground ml-2">({attendee.responseStatus})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selectedEvent.htmlLink && (
            <div>
              <a
                href={selectedEvent.htmlLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Open in Google Calendar
              </a>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {showEditForm && (
        <EventForm
          isOpen={showEditForm}
          onClose={() => {
            setShowEditForm(false);
            setSelectedEvent(null);
          }}
          event={selectedEvent}
        />
      )}
    </>
  );
}

