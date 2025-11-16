# Google Calendar Clone

A single-user Google Calendar clone with multiple view options, dark themes, and two-way Google Calendar synchronization.

## Features

- **Multiple Views**: 1 day, 3 days, work week, 7 days, 2 weeks, and month views
- **Dark Themes**: Default dark, dark blue, dark green, and dark purple themes
- **Google Calendar Integration**: Two-way sync with multiple Google Calendars
- **Keyboard Navigation**: Full keyboard support for navigation and shortcuts
- **Smooth Animations**: Framer Motion powered animations
- **Desktop Focused**: Optimized for desktop use with keyboard and mouse

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS 4** for styling
- **Zustand** for state management
- **Framer Motion** for animations
- **date-fns** for date manipulation
- **Google Calendar API v3** for calendar integration

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Google Calendar API:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google Calendar API
   - Create OAuth 2.0 credentials (Web application)
   - Set authorized redirect URIs to `http://localhost:5173` (or your dev server URL)

3. **Configure environment variables:**
   Create a `.env` file in the root directory:
   ```env
   VITE_GOOGLE_API_KEY=your_api_key_here
   VITE_GOOGLE_CLIENT_ID=your_client_id_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## Keyboard Shortcuts

- `←` / `→`: Navigate to previous/next period
- `Ctrl/Cmd + T`: Go to today
- `Ctrl/Cmd + D`: Switch to day view
- `Ctrl/Cmd + W`: Switch to week view
- `Ctrl/Cmd + Shift + W`: Switch to work week view
- `Ctrl/Cmd + M`: Switch to month view
- `Esc`: Close modals/event details

## Views

- **Day View**: Single day with hourly time slots
- **3 Days View**: Three consecutive days
- **Work Week**: Monday to Friday
- **Week**: Full week (Monday to Sunday)
- **2 Weeks**: Two consecutive weeks
- **Month View**: Full month calendar grid

## Theming

The app supports multiple dark themes:
- **Default Dark**: Classic dark theme
- **Dark Blue**: Blue accent dark theme
- **Dark Green**: Green accent dark theme
- **Dark Purple**: Purple accent dark theme

Theme selection is saved to localStorage and persists across sessions.

## Google Calendar Sync

The app uses incremental sync with Google Calendar:
- Initial full sync on first load
- Incremental sync using `nextSyncToken` for subsequent updates
- Automatic sync token refresh on expiry (410 response)
- Two-way synchronization for events (create, update, delete)

## Project Structure

```
google-calendar-clone/
├── src/
│   ├── components/       # React components
│   │   ├── views/        # Calendar view components
│   │   └── ui/           # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   ├── store/            # Zustand stores
│   ├── types/            # TypeScript type definitions
│   └── App.tsx           # Main application component
├── public/               # Static assets
└── package.json
```

## Notes

- This is a single-user, desktop-focused application
- Accessibility is limited to keyboard navigation and smooth animations
- Mobile and touch interfaces are not supported
- Screen reader support is not implemented

## License

MIT

