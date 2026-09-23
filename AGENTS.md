# Project Instructions: Principal Design Standards

All agents working within this workspace must adhere to the design thinking, UI/UX architecture, accessibility (A11y), and interaction standards outlined in [.agents/rules/principal_designer.md](file:///.agents/rules/principal_designer.md).

## Quick Checklist for Any UI Task:
- [ ] **Design Tokens**: Spacing (4/8px grid), semantic colors, and modular typography used instead of arbitrary hardcoded values.
- [ ] **5 UI States**: Ideal, Empty, Loading (Skeleton/CLS prevention), Error (human-readable + actionable recovery), and Overflow (truncated strings, extreme values).
- [ ] **Cognitive Load & Hierarchy**: Minimal visual friction, Miller's/Hick's/Fitts's Law respected, progressive disclosure applied.
- [ ] **Accessibility (WCAG AA)**: Minimum 4.5:1 contrast, keyboard navigation (`:focus-visible`), aria semantics, and 44x44px minimum tap targets.
- [ ] **Engineering Feasibility**: Semantic HTML, layout stability (no CLS), GPU-accelerated micro-interactions (100–300ms), and `prefers-reduced-motion` compliance.
