# Diagram Feature Style Policy

This document defines the styling conventions for the diagram feature. Follow these rules to ensure consistent, maintainable styles that are easy for both humans and LLM agents to understand and modify.

## Token Usage

All colors come from Tailwind utilities that reference CSS variables defined in `src/app/styles/tokens.css`.

**Allowed:**
- Tailwind color utilities: `bg-slate-200`, `text-sky-500`, `border-ko-dashboard`
- Theme config for non-styling purposes (e.g., mapping data to labels)

**NOT Allowed:**
- Hex values in component files: `#ec4899`, `rgb(236, 72, 153)`
- Importing from `themeConfig.colors` for styling (use Tailwind utilities instead)
- Arbitrary color values: `bg-[#ec4899]`, `text-[rgb(236,72,153)]`

## Tailwind Rules

Use existing config utilities by default. When a new value is needed:

1. Add the value to `tailwind.config.js` first
2. Then use the new utility in components

**Arbitrary values** are only acceptable for one-off layout values that don't belong in the design system:
```tsx
// OK - one-off dimension
className="w-[100px]"

// NOT OK - should be a token
className="text-[10px]"  // Use text-2xs instead
className="bg-[#ec4899]" // Use bg-ko-dashboard instead
```

## Library Customization

React Flow (@xyflow/react) overrides live in `src/app/styles/react-flow-overrides.css` **only**.

**Rules:**
- Components must NOT use `!important` on React Flow classes
- If a library style needs overriding, add a rule to the override file
- Document what the override replaces with a comment

**Example override:**
```css
/* Override default MiniMap background (was: white) */
.react-flow__minimap {
    background: rgb(226 232 240 / 0.8);
}
```

## Patterns

### Conditional Classes
Use `cn()` for conditional class composition:
```tsx
import { cn } from '@/shared/lib/utils';

className={cn(
    'base-classes',
    condition && 'conditional-classes',
    condition2 ? 'if-true' : 'if-false'
)}
```

### Repeated Class Strings
Extract to a constant when the same classes appear multiple times:
```tsx
const buttonClasses = cn(
    'px-4 py-2 rounded-md',
    'bg-slate-800 text-slate-100',
    'hover:bg-slate-700 transition-colors'
);

// Then use:
<button className={buttonClasses}>Click</button>
```

### Color Palette
- **Neutral:** Use `slate-*` (not `gray-*`)
- **Accent:** Use `sky-*` for interactive/focus states
- **KO Types:** Use `ko-*` colors for knowledge object types

### Dynamic Values
For values that must be computed at runtime, use inline styles:
```tsx
// OK - value comes from constants/props
style={{ opacity: DIAGRAM_BACKGROUND.OPACITY }}
style={{ width: node.width }}

// NOT OK - dynamic Tailwind class
className={`opacity-[${value}]`}  // Breaks searchability
```

## File Organization

| File | Purpose |
|------|---------|
| `src/app/styles/tokens.css` | Color token definitions |
| `src/app/styles/react-flow-overrides.css` | Library style overrides |
| `tailwind.config.js` | Tailwind theme extensions |
| Component files | Component-specific Tailwind classes |

## When in Doubt

1. Check existing components for precedent
2. Prefer Tailwind utilities over custom CSS
3. If adding a new color/size/etc., add to config first
4. Ask if unsure rather than inventing a new pattern

## Quick Reference

| Instead of... | Use... |
|---------------|--------|
| `#0ea5e9` | `sky-500` or `ko-saved-search` |
| `text-[10px]` | `text-2xs` |
| `text-[11px]` | `text-xs-` |
| `gray-*` | `slate-*` |
| `!important` on RF classes | Add rule to override file |
| Dynamic class templates | Inline styles |
