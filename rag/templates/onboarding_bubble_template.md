# 🎯 Onboarding Bubble Component Template

Template cho component hướng dẫn sử dụng dạng bóng bóng với mũi tên trỏ đến element mục tiêu.

---

## Visual Design

### Layout

- **Bubble**: Nền trắng, bo góc 2xl, shadow lớn
- **Arrow**: Tam giác CSS trỏ về phía element target
- **Overlay**: Background tối mờ, backdrop-blur

### Placements

```
        [top]
          ▼
[left] ◄ TARGET ► [right]
          ▲
       [bottom]
```

### Colors

| Element | Color | Class |
|---------|-------|-------|
| Overlay BG | Black/50% | `bg-black/50` |
| Bubble BG | White | `bg-white` |
| Step Badge | Dynamic | `bg-blue-500`, `bg-purple-500`, etc. |
| Arrow | White | `border-{placement}-white` |
| Text Primary | Gray 800 | `text-gray-800` |
| Text Secondary | Gray 500 | `text-gray-500` |
| Action Text | Blue 500 | `text-blue-500` |

---

## Component Structure

### Props Interface

```typescript
interface OnboardingStep {
  id: string;           // Unique step identifier
  label: string;        // Step title
  desc: string;         // Step description
  ref: RefObject;       // Target element ref
  placement: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingProps {
  steps: OnboardingStep[];
  currentStep: number;
  isVisible: boolean;
  onNext: () => void;
  onSkip: () => void;
  cookieKey?: string;   // Default: 'onboarding_seen'
}
```

### State Management

```javascript
const [showOnboarding, setShowOnboarding] = useState(false);
const [onboardingStep, setOnboardingStep] = useState(0);
const [overlayPosition, setOverlayPosition] = useState({
  top: 0,
  left: 0,
  placement: 'right'
});
```

---

## Implementation

### Step Configuration

```javascript
const onboardingSteps = [
  {
    id: 'step1',
    label: 'Tiêu đề bước 1',
    desc: 'Mô tả chi tiết cho bước này',
    ref: elementRef1,
    placement: 'bottom'
  },
  {
    id: 'step2',
    label: 'Tiêu đề bước 2',
    desc: 'Mô tả chi tiết cho bước này',
    ref: elementRef2,
    placement: 'right'
  }
];
```

### Position Calculator

```javascript
const updateOverlayPosition = () => {
  if (!showOnboarding) return;
  
  const currentStepConfig = onboardingSteps[onboardingStep];
  const targetRef = currentStepConfig?.ref;
  
  if (targetRef?.current) {
    const rect = targetRef.current.getBoundingClientRect();
    const placement = currentStepConfig.placement || 'right';
    let top = 0, left = 0;
    
    switch (placement) {
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + 20;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - 20;
        break;
      case 'bottom':
        top = rect.bottom + 20;
        left = rect.left + rect.width / 2;
        break;
      case 'top':
        top = rect.top - 20;
        left = rect.left + rect.width / 2;
        break;
    }
    
    setOverlayPosition({ top, left, placement });
  }
};
```

### Cookie Persistence

```javascript
// Check on mount
useEffect(() => {
  const hasSeenGuide = document.cookie.includes('onboarding_seen=true');
  if (!hasSeenGuide) {
    setShowOnboarding(true);
    setOnboardingStep(0);
  }
}, []);

// Save on close
const closeOnboarding = () => {
  setShowOnboarding(false);
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `onboarding_seen=true; expires=${expires.toUTCString()}; path=/`;
};
```

---

## JSX Template

### Overlay Container

```jsx
{showOnboarding && (
  <div
    className="fixed inset-0 bg-black/50 z-50 cursor-pointer"
    onClick={nextOnboardingStep}
  >
    {/* Bubble Component */}
  </div>
)}
```

### Bubble Component

```jsx
<div
  className="absolute bg-white rounded-2xl shadow-2xl p-4 max-w-xs transition-all duration-300 ease-out pointer-events-auto"
  style={{
    top: overlayPosition.top,
    left: overlayPosition.left,
    transform:
      overlayPosition.placement === 'right'   ? 'translate(0, -50%)' :
      overlayPosition.placement === 'left'    ? 'translate(-100%, -50%)' :
      overlayPosition.placement === 'bottom'  ? 'translate(-50%, 0)' :
                                                'translate(-50%, -100%)'
  }}
>
  {/* Arrow */}
  <div className={`absolute w-0 h-0 border-8 border-transparent ${
    overlayPosition.placement === 'right'  ? 'border-r-white -left-4 top-1/2 -translate-y-1/2' :
    overlayPosition.placement === 'left'   ? 'border-l-white -right-4 top-1/2 -translate-y-1/2' :
    overlayPosition.placement === 'bottom' ? 'border-b-white -top-4 left-1/2 -translate-x-1/2' :
                                             'border-t-white -bottom-4 left-1/2 -translate-x-1/2'
  }`} />

  {/* Step Header */}
  <div className="flex items-center gap-2 mb-2">
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${stepColors[onboardingStep]}`}>
      {onboardingStep + 1}
    </div>
    <span className="font-semibold text-gray-800">
      {onboardingSteps[onboardingStep].label}
    </span>
  </div>

  {/* Description */}
  <p className="text-sm text-gray-500">
    {onboardingSteps[onboardingStep].desc}
  </p>

  {/* Action Hint */}
  <p className="text-xs text-blue-500 mt-2 font-medium">
    {onboardingStep === onboardingSteps.length - 1
      ? 'Click để hoàn thành! ✓'
      : 'Click để tiếp tục...'}
  </p>

  {/* Skip Button */}
  <button
    onClick={(e) => { e.stopPropagation(); closeOnboarding(); }}
    className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full"
  >
    Bỏ qua <X size={14} />
  </button>
</div>
```

---

## Step Badge Colors

```javascript
const stepColors = [
  'bg-blue-500',    // Step 1
  'bg-purple-500',  // Step 2
  'bg-green-500',   // Step 3
  'bg-orange-500',  // Step 4
  'bg-pink-500',    // Step 5
  'bg-cyan-500'     // Step 6+
];

// Usage: stepColors[onboardingStep % stepColors.length]
```

---

## Help Button (Re-open)

```jsx
<button
  onClick={() => { setShowOnboarding(true); setOnboardingStep(0); }}
  className="mac-button bg-white border border-gray-200 text-gray-500 hover:text-blue-500 hover:border-blue-200 flex items-center justify-center w-10 h-10 !p-0"
  title="Xem hướng dẫn"
>
  <HelpCircle size={18} />
</button>
```

---

## Required Dependencies

```javascript
import { useState, useEffect, useRef } from 'react';
import { HelpCircle, X } from 'lucide-react';
```

---

## Customization Options

| Option | Default | Description |
|--------|---------|-------------|
| `cookieKey` | `'onboarding_seen'` | Cookie name for persistence |
| `cookieExpiry` | 1 year | How long to remember completion |
| `arrowSize` | 8px | CSS border size for arrow |
| `bubbleMaxWidth` | `max-w-xs` | Maximum bubble width |
| `transitionDuration` | 300ms | Animation timing |
