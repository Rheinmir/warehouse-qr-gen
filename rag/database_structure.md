# 🗄️ Database Structure

## 1. Database Overview

> **Note**: QRGen Warehouse is a stateless client-side application. There is no persistent database. All data is managed in React state and exists only during the browser session.

## 2. State Structure

The application uses React `useState` for runtime data management:

### Configuration State (`config`)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `warehouseName` | String | `"Kho 2(miền Nam, new)"` | Name of the warehouse |
| `racks` | Number | `10` | Total number of racks |
| `levels` | Number | `4` | Levels per rack |
| `rows` | Number | `5` | Rows per level |
| `rackFormat` | Enum | `"roman"` | `"arabic"` or `"roman"` |
| `levelFormat` | Enum | `"arabic"` | `"arabic"` or `"roman"` |
| `rowFormat` | Enum | `"arabic"` | `"arabic"` or `"roman"` |

### Generated Positions (computed via `useMemo`)

| Field | Type | Description |
|-------|------|-------------|
| `warehouse` | String | Warehouse name |
| `rack` | String | Rack identifier (formatted) |
| `level` | String | Level identifier (formatted) |
| `row` | String | Row identifier (formatted) |
| `code` | String | Full position code: `{warehouse}-{rack}-{level}-{row}` |
| `qrUrl` | String | URL to QR code image |

### UI State

| State Variable | Type | Purpose |
|----------------|------|---------|
| `previewLimit` | Number | Number of rows shown in table |
| `isGeneratingPdf` | Boolean | PDF export loading state |
| `isGeneratingZip` | Boolean | ZIP export loading state |
| `isGeneratingPng` | Boolean | PNG export loading state |
| `exportProgress` | Object | Progress tracking `{current, total, label}` |
| `showOnboarding` | Boolean | Onboarding overlay visibility |
| `onboardingStep` | Number | Current step index |

## 3. Persistence

### Cookie Storage

| Cookie | Value | Expiry | Purpose |
|--------|-------|--------|---------|
| `qrgen_guide_seen` | `"true"` | 1 year | Skip onboarding for returning users |

### No Persistent Storage

The application does not use:
- LocalStorage
- SessionStorage
- IndexedDB
- External databases

All configuration must be re-entered on each visit. Export files are the only permanent outputs.
