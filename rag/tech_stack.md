# 🛠️ Tech Stack

## Core Engine

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI framework |
| **Vite** | 4.4.5 | Build tool & dev server |
| **Tailwind CSS** | 3.3.3 | Utility-first styling |

## Key Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| **jsPDF** | 2.5.1 | PDF document generation |
| **html2canvas** | 1.4.1 | HTML to canvas conversion |
| **JSZip** | 3.10.1 | ZIP archive creation |
| **lucide-react** | 0.263.1 | Modern icon library |

## External APIs

| Service | URL | Purpose |
|---------|-----|---------|
| **QR Server API** | `api.qrserver.com/v1/create-qr-code/` | Dynamic QR code generation |
| **Google Fonts** | `fonts.googleapis.com` | Lexend Deca font family |

## Infrastructure

| Component | Technology |
|-----------|------------|
| **Deployment** | Vercel |
| **SPA Routing** | Vercel rewrites (all paths → index.html) |
| **Build Output** | Static files in `/dist` |

## Development Dependencies

| Tool | Version | Purpose |
|------|---------|---------|
| **ESLint** | 8.45.0 | Code linting |
| **PostCSS** | 8.4.27 | CSS processing |
| **Autoprefixer** | 10.4.14 | CSS vendor prefixes |

## Browser Requirements

- Modern browsers with ES6+ support
- Canvas API for PNG export
- Fetch API for QR code loading
- Blob API for file downloads
