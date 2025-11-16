/* global gapi */

const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events';

export interface GoogleCalendarEvent {
  id?: string;
  summary?: string;
  description?: string;
  start?: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  recurringEventId?: string;
  colorId?: string;
  created?: string;
  updated?: string;
  htmlLink?: string;
}

export interface GoogleCalendarList {
  id: string;
  summary: string;
  description?: string;
  backgroundColor?: string;
  foregroundColor?: string;
}

export class GoogleCalendarAPI {
  private apiKey: string;
  private clientId: string;
  private tokenClient: google.accounts.oauth2.TokenClient | null = null;

  constructor(apiKey: string, clientId: string) {
    this.apiKey = apiKey;
    this.clientId = clientId;
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof gapi === 'undefined') {
        reject(new Error('Google API not loaded'));
        return;
      }

      gapi.load('client', async () => {
        try {
          await gapi.client.init({
            apiKey: this.apiKey,
            discoveryDocs: DISCOVERY_DOCS,
          });

          this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: this.clientId,
            scope: SCOPES,
            callback: () => {
              // Token response will be handled by the calling code
            },
          });

          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  requestAccessToken(onTokenReceived: (token: string) => void): void {
    if (!this.tokenClient) {
      throw new Error('API not initialized');
    }

    this.tokenClient.callback = (resp: google.accounts.oauth2.TokenResponse) => {
      if (resp.error) {
        console.error('Error getting access token:', resp.error);
        return;
      }
      if (resp.access_token) {
        onTokenReceived(resp.access_token);
      }
    };

    this.tokenClient.requestAccessToken({ prompt: 'consent' });
  }

  setAccessToken(token: string): void {
    if (typeof gapi === 'undefined' || !gapi.client) {
      throw new Error('Google API not loaded');
    }
    gapi.client.setToken({ access_token: token });
  }

  async getCalendarList(): Promise<GoogleCalendarList[]> {
    if (typeof gapi === 'undefined' || !gapi.client) {
      throw new Error('Google API not loaded');
    }

    const response = await gapi.client.calendar.calendarList.list();
    return response.result.items || [];
  }

  async getEvents(
    calendarId: string,
    timeMin: string,
    timeMax: string,
    syncToken?: string
  ): Promise<{ events: GoogleCalendarEvent[]; nextSyncToken?: string }> {
    if (typeof gapi === 'undefined' || !gapi.client) {
      throw new Error('Google API not loaded');
    }

    const params: Record<string, string> = {
      calendarId,
      timeMin,
      timeMax,
      singleEvents: 'true',
      orderBy: 'startTime',
    };

    if (syncToken) {
      params.syncToken = syncToken;
    }

    try {
      const response = await gapi.client.calendar.events.list(params);
      return {
        events: response.result.items || [],
        nextSyncToken: response.result.nextSyncToken,
      };
    } catch (error: any) {
      // Handle sync token expiry (410)
      if (error.status === 410) {
        // Return empty events, caller should do full sync
        return { events: [] };
      }
      throw error;
    }
  }

  async createEvent(calendarId: string, event: GoogleCalendarEvent): Promise<GoogleCalendarEvent> {
    if (typeof gapi === 'undefined' || !gapi.client) {
      throw new Error('Google API not loaded');
    }

    const response = await gapi.client.calendar.events.insert({
      calendarId,
      resource: event,
    });

    return response.result;
  }

  async updateEvent(
    calendarId: string,
    eventId: string,
    event: Partial<GoogleCalendarEvent>
  ): Promise<GoogleCalendarEvent> {
    if (typeof gapi === 'undefined' || !gapi.client) {
      throw new Error('Google API not loaded');
    }

    const response = await gapi.client.calendar.events.update({
      calendarId,
      eventId,
      resource: event,
    });

    return response.result;
  }

  async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    if (typeof gapi === 'undefined' || !gapi.client) {
      throw new Error('Google API not loaded');
    }

    await gapi.client.calendar.events.delete({
      calendarId,
      eventId,
    });
  }
}

// Extend global Window interface for Google API
declare global {
  interface Window {
    gapi: typeof gapi;
    google: typeof google;
  }
}

