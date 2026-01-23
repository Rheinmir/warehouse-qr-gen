# 📜 Development Rules

## AI Agent Guidelines

1. **Session Start**: At the beginning of every session, read `rag/0-INDEX.md` and `rag/rules.md` first.
2. **Standard Alignment**: Ensure all generated code follows the defined naming and architectural patterns.
3. **RAG Maintenance**: Update relevant RAG files when making significant changes to the codebase.
4. **Vietnamese Context**: UI text and labels are in Vietnamese. Maintain language consistency.

## Coding Standards

### Style

- **Paradigm**: Functional React with hooks
- **ES Version**: ES6+ (arrow functions, destructuring, template literals)
- **Component Style**: Single-file components with inline logic

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `App`, `PreviewCard` |
| Functions | camelCase | `handleInputChange`, `exportToPDF` |
| State variables | camelCase | `config`, `isGeneratingPdf` |
| CSS classes | kebab-case (Tailwind) | `mac-button`, `glass` |
| Constants | camelCase | `onboardingSteps` |

### File Organization

```
src/
├── App.jsx          # Main component (keep logic here)
├── index.css        # Global styles & Tailwind utilities
└── main.jsx         # Entry point (minimal)
```

## UI/UX Standards

### Design System

- **Theme**: macOS-inspired with glassmorphism
- **Font**: System fonts + Lexend Deca for labels
- **Colors**: 
  - Background: `#F5F5F7` (Apple gray)
  - Text: `#1D1D1F` (Apple black)
  - Accents: Blue (`#3B82F6`), Purple, Green

### Custom Utilities (index.css)

| Class | Purpose |
|-------|---------|
| `.glass` | Frosted glass effect with blur |
| `.mac-input` | macOS-style input fields |
| `.mac-button` | Rounded buttons with active scale |
| `.mac-card` | Subtle bordered cards |

## Export Format Standards

### CSV

- UTF-8 with BOM (`\ufeff`)
- Comma-separated
- Headers: `Kho, Kệ, Tầng, Hàng, Mã Vị Trí, Link QR Code`

### PDF

- A4 portrait orientation
- 12 labels per page (3 columns × 4 rows)
- QR size: 25mm

### PNG

- 2x resolution for print quality
- Canvas size: 640 × 680 px
- Includes company logo from `/CTD.png`
