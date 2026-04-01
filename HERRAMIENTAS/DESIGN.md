# Design System Specification: Architectural Intelligence

## 1. Overview & Creative North Star
**The Creative North Star: "The Digital Foreman"**

In the world of smart construction, we are moving away from the "dust and brick" aesthetic toward a "precision and light" philosophy. This design system is not merely a collection of UI components; it is a high-fidelity digital twin of the construction environment. It represents a synthesis of robust engineering and futuristic intelligence.

To break the "template" look common in industrial software, we employ **Intentional Asymmetry**. Rather than perfectly centered grids, we use weighted layouts where information is anchored by heavy typography and balanced by expansive, breathing negative space. Overlapping elements—such as text bleeding over the edges of glass containers—create a sense of 3D depth and kinetic energy, suggesting a project that is constantly in motion and evolving.

---

## 2. Colors: The Atmosphere of Precision
Our palette moves beyond standard dark modes into a tiered "Midnight" environment. We use depth and luminescence to guide the eye rather than structural lines.

### The Palette (Material Tokens)
*   **Core Background:** `surface` (#111316) – A deep, rich charcoal that acts as the foundation.
*   **Primary Accent:** `primary_container` (#00f0ff) – Our "Electric Cyan." This is used for active states, data visualization highlights, and primary CTAs.
*   **Surface Hierarchy:**
    *   `surface_container_lowest`: #0c0e11 (Deep pits/backgrounds)
    *   `surface_container_low`: #1a1c1f (Standard sections)
    *   `surface_container_high`: #282a2d (Interactive cards)
    *   `surface_container_highest`: #333538 (Floating elements)

### The "No-Line" Rule
Traditional 1px borders are strictly prohibited for sectioning. To separate content, designers must utilize **Background Color Shifts**. For example, a project dashboard should sit on `surface`, while the sidebar navigation resides on `surface_container_low`. The boundary is felt through the tonal shift, not seen through a stroke.

### The "Glass & Gradient" Rule
To achieve a signature, high-end feel:
*   **Floating Navigation/Modals:** Use `surface_variant` at 60% opacity with a `backdrop-filter: blur(20px)`.
*   **Signature Gradients:** For Hero CTAs and active Progress Bars, use a linear gradient: `primary` (#dbfcff) to `primary_container` (#00f0ff) at a 135-degree angle. This provides a "glow" that flat colors cannot replicate.

---

## 3. Typography: Authority & Clarity
We utilize a dual-font strategy to balance technical precision with modern editorial flair.

*   **Display & Headlines:** `Space Grotesk`. This typeface provides a technical, geometric edge that feels engineered. 
    *   *Usage:* Use `display-lg` (3.5rem) for hero titles with tight letter-spacing (-0.02em) to create a sense of massive scale.
*   **Body & Labels:** `Inter`. A highly legible, neutral sans-serif that ensures data-heavy construction reports remain readable at any size.
    *   *Usage:* `body-md` (0.875rem) for general descriptions; `label-md` (0.75rem) in All-Caps with +0.05em tracking for technical metadata.

---

## 4. Elevation & Depth: Tonal Layering
In this design system, depth is a function of light and stack order, not artificial shadows.

*   **The Layering Principle:** Nested containers must always move "upward" in the surface scale. If a dashboard is `surface_container_low`, any card within it must be `surface_container_high`. This creates a natural "lift" as if the UI is illuminated from within.
*   **Ambient Shadows:** For high-priority floating elements (like a site-map modal), use a shadow tinted with the primary color: `rgba(0, 219, 233, 0.08)` with a 40px blur and 0px offset. This mimics the ambient glow of an electric screen.
*   **The "Ghost Border" Fallback:** If a card requires a border for focus, use `outline_variant` at 20% opacity. For a "Glowing Border," apply a 1px stroke using the `primary` token but only on the top and left sides to simulate a light source hitting the edge of a glass pane.

---

## 5. Components

### Buttons: The Kinetic Trigger
*   **Primary:** A solid fill of `primary_fixed_dim`. On hover, the button should gain a `0 0 15px primary_container` box-shadow (the "Electric Glow").
*   **Secondary (Glass):** A transparent background with `backdrop-filter: blur(10px)` and a `ghost border`. 
*   **Tertiary:** Text-only in `primary`, using `label-md` sizing.

### Cards: The Data Vessel
Forbid the use of divider lines within cards. Separate the header from the body using a 20px `vertical white space` (Spacing Scale: `5`).
*   **Style:** `surface_container_high` background, `xl` (0.75rem) roundedness, and a subtle "inner glow" achieved by a 1px top-border in `outline_variant` at 10% opacity.

### Input Fields: The Precision Tool
*   **State:** Default inputs are `surface_container_highest` with no border. 
*   **Focus:** Upon interaction, the field gains a 1px bottom-border in `primary_container` and the label shifts to `primary` color.

### Construction-Specific Components
*   **Blueprint Viewer:** A dark-themed canvas using `surface_container_lowest` as the base, with `primary` used for active structural lines and `secondary` for secondary annotations.
*   **Project Progress Ring:** A thick-stroke circular progress bar using a gradient from `primary` to `primary_container`, featuring a soft `drop-shadow` glow to represent a "live" system.

---

## 6. Do's and Don'ts

### Do
*   **DO** use extreme typographic contrast. A `display-lg` headline next to a `label-sm` technical note creates an editorial, high-end feel.
*   **DO** use the Spacing Scale religiously. Consistent gaps (e.g., `spacing-8` between major sections) are the only way to maintain "Robustness."
*   **DO** embrace "Dark Space." Let the `surface` color breathe; not every pixel needs to be occupied.

### Don't
*   **DON'T** use 100% opaque, high-contrast borders. They break the "Glassmorphism" illusion and make the UI feel dated and "boxy."
*   **DON'T** use standard grey shadows. Shadows should always be low-opacity and tinted by the surface or primary colors.
*   **DON'T** mix roundedness. If a card is `xl`, the buttons inside it should be `md` or `lg`. Never mix sharp 0px corners with rounded elements.

---

**Director's Note:** This system is designed to look like it was carved out of a single piece of dark, illuminated obsidian. Keep it clean, keep it deep, and let the light (the Primary Cyan) be the guide for the user's journey.