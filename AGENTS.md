# AGENTS.md — Developer & AI Agent Architecture Guide

This document describes the architectural layout, conventions, and operational patterns for the **Trevel Tourism & Fleet Management System**.

---

## 1. Project Overview & Philosophy

- **Domain**: Premium Tourism Bus Fleet Operation & Charter Reservation (PO. Trevel Wisata Nusantara, East Java & Bali).
- **Aesthetic**: High-End Swiss Editorial Transit & Tactile Skeuomorphic Ticket.
- **Tech Stack**: React 18, Vite, Tailwind CSS, Framer Motion, TanStack Query v5, Recharts, React Hook Form, date-fns (locale `id`), canvas-confetti, sonner.
- **Language**: JavaScript (ES2022+ / JSX), clean modern syntax without TypeScript.

---

## 2. Directory Structure

```
trevel-management-system/
├── index.html                 # Entry point with Google Fonts (Bricolage Grotesque, Plus Jakarta Sans, JetBrains Mono)
├── package.json               # Dependencies and scripts
├── vite.config.js             # Vite configuration with React plugin
├── tailwind.config.js         # Custom theme: canvas, obsidian, cobalt, terminal, ticket colors & fonts
├── postcss.config.js          # PostCSS with Tailwind and Autoprefixer
├── netlify.toml               # Netlify build configuration with SPA fallback rewrite
├── README.md                  # Human user documentation
├── AGENTS.md                  # This architecture guide
└── src/
    ├── main.jsx               # React 18 createRoot, QueryClientProvider, Sonner Toaster
    ├── App.jsx                # Layout controller, global navigation, optimistic mutations
    ├── api.js                 # Network layer with Google Apps Script endpoint, 8s timeout, DEMO fallback
    ├── utils.js               # IDR currency formatting, date helpers, barcode generator, collision matrix
    ├── styles.css             # Base styles, grid pattern, print stylesheets, ticket notches, rubber stamp
    └── components/
        ├── Navbar.jsx         # Sticky floating glassmorphism island, live WIB clock, status pill
        ├── HomeHero.jsx       # Company profile, live stats, popular East Java routes, crew safety SOP
        ├── FleetCatalog.jsx   # Bus cards (Zotopia, Cocomelon), specifications, direct booking triggers
        ├── SeatMapModal.jsx   # Interactive 33-seat floor plan (2-2 layout + 5-seat rear lounge)
        ├── BookingForm.jsx    # React Hook Form, pax counter, cost calculator, split layout
        ├── RangeCalendar.jsx  # Custom range calendar with collision detection matrix & tooltips
        ├── TicketPreview.jsx  # Skeuomorphic thermal ticket with radial notches, barcode, spring stamp
        ├── ScheduleView.jsx   # Toggle 30-day Gantt timeline & searchable data grid with ticket stacks
        └── ExecutiveRecap.jsx # KPI cards, Recharts Bar Chart & Donut Chart, partner loyalty leaderboard
```

---

## 3. Key Conventions & Invariants

### 3.1. Fleet Representation
There are two primary executive buses in service:
1. `zotopia`: Jetbus 5 Royal Coach | Plate `N 7122 UZ` | Capacity 33 Seats | Color `#1D4ED8`
2. `cocomelon`: Avante H8 Prime | Plate `N 7890 UZ` | Capacity 33 Seats | Color `#059669`
Both have a standard charter base rate of `Rp3.500.000` / day.

### 3.2. Collision Detection Matrix
In `src/utils.js`:
- `isDateBookedForBus(dateStr, busId, bookings)`: Inspects if a single date intersects any existing active reservation for the specified bus.
- `checkRangeCollision(startStr, endStr, busId, bookings)`: Inspects if a selected date interval overlaps any existing booking. If an overlap occurs, the user is blocked from making the reservation.
- Notice: **Zotopia on 2026-10-23** (`TRV-261023-901`) is specifically reserved for *Mitra Wisata Tour* to serve as a demonstrative collision baseline.

### 3.3. Offline & Local Storage Persistence
- In `src/api.js`, `fetchSystemData()` checks if the Google Apps Script URL has its placeholder `ID_PENERAPAN_ANDA`. If so, it falls back seamlessly to `DEMO` with local storage synchronization (`STORAGE_KEY_BOOKINGS`).
- Optimistic updates in `App.jsx` ensure immediate UI responsiveness when a reservation is submitted.

### 3.4. Printing Support
The tactile ticket (`TicketPreview.jsx`) includes print CSS defined in `src/styles.css`. Elements with `.no-print` are omitted, and `.print-ticket-root` renders cleanly as an operational travel permit (*Surat Jalan*).

---

## 4. Maintenance Guidelines

- **No Build Artifacts**: Never commit or emit `dist/` or `.vite/` files into the repository.
- **Date Formatting**: Always use `date-fns` with `{ locale: id }` to preserve standardized Indonesian date nomenclature (e.g., `Oktober`, `November`, `Senin`, `Selasa`).
- **Currency**: Always use `formatIDR()` from `src/utils.js` for Rupiah outputs.
