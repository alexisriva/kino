---
name: Cinematic Journal
colors:
  surface: '#121315'
  surface-dim: '#121315'
  surface-bright: '#38393b'
  surface-container-lowest: '#0d0e10'
  surface-container-low: '#1b1c1e'
  surface-container: '#1f2022'
  surface-container-high: '#292a2c'
  surface-container-highest: '#343537'
  on-surface: '#e3e2e5'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#e3e2e5'
  inverse-on-surface: '#303033'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#c6c6c9'
  on-secondary: '#2f3133'
  secondary-container: '#454749'
  on-secondary-container: '#b4b5b7'
  tertiary: '#cdced4'
  on-tertiary: '#2e3135'
  tertiary-container: '#b1b3b8'
  on-tertiary-container: '#42454a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#e2e2e5'
  secondary-fixed-dim: '#c6c6c9'
  on-secondary-fixed: '#1a1c1e'
  on-secondary-fixed-variant: '#454749'
  tertiary-fixed: '#e1e2e7'
  tertiary-fixed-dim: '#c4c6cb'
  on-tertiary-fixed: '#191c20'
  on-tertiary-fixed-variant: '#44474b'
  background: '#121315'
  on-background: '#e3e2e5'
  surface-variant: '#343537'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Newsreader
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 30px
  body-md:
    fontFamily: Newsreader
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.03em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The brand personality is sophisticated, authoritative, and immersive—reminiscent of a premium film publication or a high-end streaming service. It caters to cinephiles and industry enthusiasts who value deep analysis over tabloid headlines. 

The design style is **Modern Corporate with an Editorial edge**, characterized by a dark, atmospheric palette that allows film stills to act as the primary visual driver. We avoid the "gamer" aesthetic by removing neon glows and vibrant gradients, replacing them with subtle tonal layers and refined accenting. The goal is to evoke a sense of quiet prestige and cinematic depth through generous whitespace (negative space) and rigorous typographic hierarchy.

## Colors
The palette is rooted in a "Deep Onyx" foundation to create a theater-like environment. 

- **Primary (Muted Gold):** Used sparingly for critical calls-to-action, ratings, and featured badges. It suggests quality and awards.
- **Secondary (Slate Blue/Gray):** Used for interactive states and secondary metadata to maintain a cool, professional temperature.
- **Neutral/Background:** We use a tiered system of grays. `#0D0E10` serves as the base canvas, while slightly lighter tones (`#1A1C1E`) define cards and containers.
- **Surface Accents:** Low-contrast borders in dark grays replace shadows to define structure without adding visual noise.

## Typography
The typography strategy employs a pairing of a high-performance sans-serif for interface elements and a literary serif for long-form content.

- **Headlines (Manrope):** Clean, geometric, and modern. High-weight settings are used for film titles to create impact.
- **Body (Newsreader):** This serif provides the "Journal" feel. It is optimized for readability in reviews and editorial pieces, giving the site an intellectual, authoritative voice.
- **Labels (Hanken Grotesk):** Used for navigation, metadata (Director, Cast), and UI controls. These are often set in uppercase with slight tracking to enhance the premium feel.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy on desktop to ensure editorial control over line lengths and image compositions.

- **Grid:** A 12-column system with a 1280px max-width. 
- **Rhythm:** We use a generous vertical rhythm. Featured sections should have significant padding (80px–120px) to separate them from the standard feed, creating a sense of "breathing room" found in high-end print magazines.
- **Mobile Adaption:** On mobile, margins shrink to 20px, and the grid collapses to 1 column. Serifs are scaled slightly down but maintain generous line height to prevent ocular fatigue.

## Elevation & Depth
In this design system, depth is achieved through **Tonal Layers** rather than shadows. 

- **Level 0 (Background):** Deepest black/gray.
- **Level 1 (Cards/Navigation):** A subtle lift using `#1A1C1E`.
- **Level 2 (Modals/Overlays):** A lighter gray `#2C2F33` with a 1px solid border in a slightly lighter tint (`#3F444A`).
- **Interactive States:** Instead of glowing, interactive elements use subtle background color shifts or high-contrast white text against the muted background. 
- **Imagery:** High-quality film stills should use a subtle dark-to-transparent gradient overlay at the bottom to ensure white typography remains legible without the need for text-shadows.

## Shapes
We use a **Soft (0.25rem)** roundedness approach. This maintains a structured, professional look while feeling modern. 

- **Standard Elements:** Buttons and small input fields use the base 4px radius.
- **Feature Cards:** Larger elements like poster containers can scale up to `rounded-lg` (8px) to soften the large surface area.
- **Media Containers:** Movie posters and video thumbnails should always maintain consistent corner radii to ensure the grid looks cohesive.

## Components
- **Buttons:** Primary buttons use the Muted Gold background with black text. Secondary buttons are "Ghost" style with a 1px slate-gray border. No glows or gradients.
- **Chips/Badges:** Small, rectangular with 2px radius. Used for genres or technical specs (e.g., "4K", "HDR"). Use subtle fills (e.g., 10% opacity white) over the dark background.
- **Cards:** Content cards rely on a 1px border (`#2C2F33`) rather than shadows. On hover, the border color may brighten slightly to a neutral gray.
- **Input Fields:** Search bars and email signups use a dark-recessed fill with no border, becoming visible only through their internal padding and the typography within.
- **Ratings:** Use the Muted Gold color for stars. For numerical scores, use the Serif font to emphasize the "review" nature of the site.
- **Lists:** Editorial lists (top 10s) should use large, high-contrast numbers in the Headline font to create a strong vertical rhythm.