# ⚙️ Workflows

## Development

### Start Development Server

```bash
npm run dev
```

- Runs Vite dev server at `http://localhost:5173`
- Hot Module Replacement (HMR) enabled
- Auto-opens in default browser

### Linting

```bash
npm run lint
```

- ESLint with React plugin
- Zero warnings policy (`--max-warnings 0`)

### Preview Production Build

```bash
npm run preview
```

- Serves the `/dist` folder locally
- Use to test production bundle before deployment

## Build & Deployment

### Build for Production

```bash
npm run build
```

- Output: `/dist` directory
- Minified and optimized assets

### Deploy to Vercel

**Automatic Deployment**:
1. Push to `main` branch
2. Vercel auto-deploys via Git integration

**Manual Deployment**:
```bash
vercel --prod
```

### Vercel Configuration

The `vercel.json` configures SPA routing:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## Git Workflow

### Commit Changes

```bash
git add .
git commit -m "feat: description of changes"
git push origin main
```

### Commit Message Convention

| Type | Usage |
|------|-------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `style:` | UI/CSS changes |
| `docs:` | Documentation updates |
| `refactor:` | Code restructuring |

## Testing

> **Note**: No automated tests currently configured. Manual testing workflow:

1. Start dev server (`npm run dev`)
2. Configure warehouse settings
3. Verify QR preview updates
4. Test each export format:
   - CSV: Download and open in Excel
   - PDF: Check label layout
   - PNG: Verify image quality in ZIP
   - ZIP: Confirm contains CSV + all images
