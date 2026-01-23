# 🎨 UI/UX Component Template

## Visual Design

### Layout

- **Container**: Max-width 7xl, centered with responsive padding
- **Grid**: 4-column layout on large screens (1 sidebar + 3 content)
- **Spacing**: Consistent 8px-based scale (gap-6, gap-8)

### Colors

| Element | Color | Tailwind Class |
|---------|-------|----------------|
| Background | `#F5F5F7` | `bg-[#F5F5F7]` |
| Card BG | White with glass | `glass` or `bg-white` |
| Primary Action | Blue 500 | `bg-blue-500` |
| Secondary Action | Purple 500 | `bg-purple-500` |
| Success Action | Green 500 | `bg-green-500` |
| Text Primary | Gray 900 | `text-gray-900` |
| Text Secondary | Gray 500 | `text-gray-500` |

### Typography

| Element | Style |
|---------|-------|
| Headings | SF Pro (system), semi-bold |
| Body | SF Pro (system), regular |
| Labels | Lexend Deca, various weights |
| Mono | System mono for codes |

## Component Patterns

### Button Component

```jsx
<button className="mac-button bg-blue-500 text-white hover:bg-blue-600 border-transparent shadow-blue-500/20 shadow-lg flex items-center gap-2">
  <Icon size={16} />
  Button Text
</button>
```

### Input Component

```jsx
<input
  type="text"
  className="mac-input w-full"
  placeholder="Placeholder..."
/>
```

### Card Component

```jsx
<div className="glass rounded-2xl p-6 border border-white/40 shadow-xl shadow-gray-200/40">
  {/* Card content */}
</div>
```

### Glass Panel

```jsx
<div className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-sm rounded-2xl p-6">
  {/* Glass content */}
</div>
```

## Animation Standards

| Element | Animation |
|---------|-----------|
| Buttons | `active:scale-95` on press |
| Transitions | `transition-all` with default duration |
| Loading | `animate-spin` on Loader2 icon |
| Modals | `backdrop-blur-sm` with fade animation |

## Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| Mobile (<768px) | Single column, stacked |
| Tablet (768-1024px) | 2 columns |
| Desktop (>1024px) | 4 columns (1 + 3) |

## Usage Example

```jsx
<div className="glass rounded-2xl p-6 border border-white/40 shadow-xl shadow-gray-200/40">
  <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
    <Settings2 size={18} className="text-gray-500" />
    Section Title
  </h2>
  
  <div className="space-y-5">
    <div>
      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Field Label
      </label>
      <input type="text" className="mac-input w-full" />
    </div>
  </div>
</div>
```
