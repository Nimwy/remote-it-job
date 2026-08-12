---
name: Remote IT
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3d4947'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#006387'
  on-tertiary: '#ffffff'
  tertiary-container: '#007da9'
  on-tertiary-container: '#fcfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#7bd0ff'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

The design system focuses on the intersection of professional enterprise reliability and modern technological agility. The target audience includes high-level software engineers, DevOps specialists, and IT managers looking for remote-first opportunities. 

The aesthetic is **Corporate Modern** with a lean toward **Minimalism**. It prioritizes information density and clarity through significant whitespace and a structured grid. The UI should evoke a sense of "technical precision" and "calm efficiency," moving away from the cluttered nature of traditional job boards toward a focused, developer-centric environment. All interfaces must feel fast, responsive, and data-driven without being overwhelming.

## Colors

This design system utilizes a high-contrast palette to distinguish between structural elements and interactive points.

- **Primary (#0D9488):** A vibrant teal used for primary calls to action, active states, and the specific "Remote" branding elements. It represents growth and modern connectivity.
- **Secondary (#0F172A):** A deep slate blue used for typography, navigation backgrounds, and primary brand markers to instill trust and authority.
- **Neutral (#F8FAFC):** The primary canvas color. Use this for page backgrounds to reduce eye strain, while using pure white (#FFFFFF) for elevated card surfaces.
- **Accents:** Use success (Emerald), warning (Amber), and error (Rose) tokens sparingly for status badges and system feedback.

## Typography

The typography strategy leverages **Geist** for technical headers and UI labels to provide a precise, developer-friendly feel. **Inter** is used for all body copy and descriptions to ensure maximum legibility at various weights and sizes.

- Use **Geist Medium** for buttons and navigation items to maintain a crisp edge.
- Use **Inter Regular** for job descriptions with a 1.5x line height to ensure readability in long-form text.
- Apply `text-slate-900` to headings and `text-slate-600` to secondary body text to create a clear visual hierarchy.

## Layout & Spacing

The design system utilizes a **12-column fluid grid** for desktop and a **single-column vertical stack** for mobile. 

- **Grid:** On desktop, the central container is capped at 1280px. Margins are set to 24px on mobile and 48px on desktop.
- **Rhythm:** An 8px linear scale (4, 8, 16, 24, 32, 48, 64) is used for all padding and margins to maintain mathematical harmony.
- **Alignment:** Data-heavy layouts (like job listings) should use a left-aligned configuration with generous horizontal padding (md or lg) between data columns to avoid visual crowding.

## Elevation & Depth

This design system uses a **Tonal Layering** approach combined with **Ambient Shadows**. Depth is used to distinguish the "interactive" layer from the "content" layer.

- **Level 0 (Background):** Neutral slate (#F8FAFC) used for the canvas.
- **Level 1 (Cards):** Pure White (#FFFFFF) with a soft, 1px border in slate-200. No shadow in static state.
- **Level 2 (Active/Hover):** Soft, extra-diffused shadow (Y: 4px, Blur: 12px, Color: Slate-900 at 5% opacity).
- **Level 3 (Modals/Popovers):** Higher elevation shadow (Y: 12px, Blur: 24px, Color: Slate-900 at 10% opacity) with a backdrop blur of 8px on the overlay.

## Shapes

The shape language is consistently "Rounded" to soften the professional tone and make the platform feel approachable.

- **Standard Elements:** Buttons, input fields, and small cards use `rounded-md` (0.5rem / 8px).
- **Surface Containers:** Large job listing cards and profile sections use `rounded-lg` (1rem / 16px).
- **Interactive Indicators:** Status badges and tags use a full pill-shape (9999px) to distinguish them from structural buttons.

## Components

### Buttons
- **Primary:** Background teal-600, text white, Geist font, 8px radius. Hover state: teal-700.
- **Secondary:** Background slate-900, text white, Geist font.
- **Outline:** Transparent background, 1px border slate-200, text slate-900.

### Cards (Job Listings)
- White background, 16px radius, 1px border (#E2E8F0).
- Left-aligned company logo (48x48px, 8px radius).
- High-contrast job title in Geist 600.
- Metadata (Location, Salary, Time Posted) in Inter 400 with `text-slate-500` and small icons.

### Status Badges
- **Open:** Light teal background, teal-800 text, pill shape, uppercase Geist bold 10px.
- **Closed:** Light gray background, gray-600 text.
- **Remote:** Vibrant cyan-100 background, cyan-900 text.

### Inputs
- Height: 44px for standard, 52px for search bars.
- Background white, border slate-200, focus state border teal-500 with 2px teal outer glow (alpha 10%).

### Additional Components
- **Salary Toggle:** A custom-styled switch using the teal primary color for the "active" remote-only filter.
- **Tech Stack Chips:** Small, low-contrast gray chips with mono-spaced Geist font to represent coding languages.