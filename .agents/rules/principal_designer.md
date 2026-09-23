# Rule: Principal Designer & Design Systems Architect

This workspace adheres to high-level Principal Product Design standards (Staff / Principal Designer Level).
When reviewing, designing, proposing, or implementing frontend components and user experiences, apply the following principles and criteria.

---

## 1. Core Operating Principles

### 1.1 System Over Screen (Atomic & Modular Thinking)
- **Token-Driven Design**: Never use arbitrary, hardcoded values (e.g., `#3b82f6`, `17px`). Always map decisions to Design System tokens:
  - Spacing rhythm: 4px / 8px scale (e.g., 4, 8, 12, 16, 24, 32, 48, 64px).
  - Semantic color roles: `surface-base`, `surface-elevated`, `brand-primary`, `brand-hover`, `text-primary`, `text-secondary`, `border-subtle`, `status-danger`, etc.
  - Typography scale: explicit font sizes, line heights, and font weights with clear semantic roles (`display`, `heading-lg`, `body-base`, `caption`).
  - Radii & elevation (shadows/z-index): stratified into standardized levels.
- **Composability**: Design UI elements as modular, decoupled, and reusable components.

### 1.2 Cognitive Ergonomics & Information Architecture
- **Cognitive Load Minimization**:
  - Apply **Miller's Law**: Chunk complex information into digestible, logical groups.
  - Apply **Hick's Law**: Reduce excessive choices to speed up decision-making.
  - Apply **Fitts's Law**: Key interactive targets must be prominent and easily clickable/tappable.
- **Progressive Disclosure**: Surface only essential information upfront; provide secondary actions or details on demand (modals, accordions, tooltips, drill-downs).
- **Scanning Patterns**: Structure layouts along natural eye movement patterns (F-pattern for text-dense content, Z-pattern for landing/marketing flows).
- **Visual Weight & Hierarchy**: Use contrast, whitespace, and font weight to lead the user's focus intuitively.

### 1.3 The 5 Immutable UI States
Never implement or review a component with only the "ideal/happy path" in mind. Every interactive flow and data-dependent view must account for all 5 states:
1. **Ideal State**: Standard happy path with realistic data variation.
2. **Empty State**: Clear explanation of why it's empty, an illustrative or friendly cue, and an actionable next step/CTA.
3. **Loading / Skeleton State**: Match the actual layout to prevent Cumulative Layout Shift (CLS) and reduce perceived wait time.
4. **Error / Recovery State**: Human-readable, non-technical, empathetic error feedback with clear retry or resolution options.
5. **Partial / Overflow State**: Extreme edge cases such as long truncated strings, extreme numbers/currencies, localized text expansion, or null/missing attributes.

### 1.4 Engineering Empathy & Layout Feasibility
- **Box Model & DOM Health**: Design with Flexbox/CSS Grid logic, container queries, and responsive flow. Avoid layouts that break upon zoom (up to 200%) or window resizing.
- **Performance & 60fps Interactions**: Use GPU-accelerated CSS properties (`transform`, `opacity`) for smooth transitions. Minimize expensive reflows and repaints.
- **State Hydration & Clean Props**: Keep component state models clean, predictable, and resilient to async network latency.

### 1.5 Universal Accessibility (A11y First)
- **WCAG 2.1 AA Standards**:
  - Text contrast ratio at least 4.5:1 (normal text) and 3:1 (large text).
  - UI boundaries and interactive indicators at least 3:1 contrast against adjacent backgrounds.
- **Keyboard Navigability**:
  - Predictable, sequential tab order (`tabindex`).
  - High-visibility focus indicators (`:focus-visible`).
  - Trap focus inside active dialogs/modals; release focus and return to the trigger element on close.
- **Semantic HTML & Screen Reader Support**:
  - Proper HTML5 tags (`<main>`, `<nav>`, `<header>`, `<article>`, `<button>`).
  - Informative `aria-label`, `aria-expanded`, `aria-haspopup`, and `role` attributes where standard HTML tags are insufficient.
- **Touch Ergonomics**: Minimum tap target size of 44x44px for touch interfaces.

### 1.6 Motion & Feedback with Intent
- Motion must communicate spatial continuity, state change, or tactile feedback—never just ornamental fluff.
- Duration guidelines:
  - Micro-interactions (hover, press, toggle): 100–150ms.
  - State transitions (dropdowns, accordions, toasts): 200–300ms.
  - Complex screen or layout transitions: 300–450ms.
- Always respect `@media (prefers-reduced-motion: reduce)`.

---

## 2. Interaction & Review Workflow for the AI

When tasked with UI design, component authoring, code review, or refactoring in this project:
1. **Challenge Assumptions**: Check whether the request accounts for edge cases, error states, and responsive behavior.
2. **Critique with Construction**: Point out UX friction points, layout bugs, accessibility violations, or lack of visual hierarchy before writing code.
3. **Specify Design Tokens**: Refer to explicit token names, spacing units, and typography hierarchies.
4. **Deliver Resilient Code**: Provide production-ready HTML/CSS/TypeScript code that adheres to these principles out of the box.
