# WisdomCanvas 🌌
> **Premium digital editorial designed for mindfulness, self-improvement, and ambient quote visualization.**

WisdomCanvas is a high-fidelity, responsive ambient quotes web application. It curates over 600 authentic quotes across six distinct moods and topics: **Motivation, Wisdom, Love, Peace, Creativity, and Humor**. With immersive dynamic moving backgrounds (auroras, sunsets, emerald forests), customizable image exporters, saved bookmark collections, and an automatic fullscreen screensaver, WisdomCanvas transforms words of wisdom into rich visual experiences.

---

## ✨ Features

### 1. 🎨 Symmetrical Editorial Quote Card
- **Symmetric Architecture**: Built around a balanced grid system featuring a top-center glowing quote mark badge, centered serif typography, and author lines flanking the names symmetrically.
- **Glassmorphic Floating Capsule Toolbar**: A highly polished, centered control panel mimicking high-end desktop operating systems, hosting actions for favoriting, styling, copying, and sharing.
- **Dynamic Highlights**: The color accents, badge shadows, buttons, and animations dynamically transition to match the theme of the current topic (e.g., Motivation glows pinkish-red, Wisdom shines deep cyan, Peace glows emerald green).

### 2. 🎛️ 3-Button Navigation Arena
- Perfectly balanced controls positioned under the main card:
  - **Left Arrow**: Steps back sequentially through session history.
  - **Center ("Inspire Me") Button**: Large glowing CTA button that shuffles a brand new quote instantly.
  - **Right Arrow**: Steps forward in session history (or shuffles a new quote if at the end of the history queue).
- Full keyboard integration: press `ArrowRight` or `Space` to cycle quotes, `ArrowLeft` to return to previous ones, and `Escape` to close drawers or modals.

### 3. 🖼️ Canvas Exporter Customizer
- Export quote graphics as beautiful, high-resolution PNG images ready for download or social media.
- Adjust customization parameters on the fly via a visual canvas:
  - **Backdrops**: Aurora Dark, Sunset Glow, Emerald Forest, Peaceful Tea, Minimal Dark, Minimal Light.
  - **Typography**: Playfair Display (Serif), Outfit (Sans-Serif), Space Grotesk (Tech Monospace).
  - **Alignments**: Left, Center, and Right text layouts.

### 4. 📺 Full-Screen Ambient Screensaver (Slideshow Mode)
- Access a dedicated, interactive slideshow interface with high-contrast ambient glow effects.
- **Autoplay Engine**: Quotes automatically cycle at a user-customized interval (from 3s to 20s).
- **Progress Tracking**: A micro-animated countdown bar fills dynamically to indicate transition times.
- **Controls & Filters**: Play, pause, skip forward, step back, customize the transition delay, or change the screensaver's active mood filter using inline controls.
- **Exit Accessibility**: Features an absolute floating close button (`X`) and `Escape` keyboard mapping.

### 5. 📂 Favorites Shelf & Offline Bookmarks
- Add quotes to a saved database in one click using the Heart button.
- Slide out a floating drawer to view all saved items.
- Features automatic offline persistence using the browser's `localStorage` so bookmarks are retained between visits.

---

## 🛠️ Architecture & Tech Stack

- **Markup**: Semantic HTML5 structures ensuring clean document outline, accessibility, and high search engine discoverability.
- **Styling**: Vanilla CSS3 implementing modern layout methods (CSS Grid, Flexbox, custom media queries), variables (CSS Custom Properties), glassmorphism (translucent backgrounds with `backdrop-filter` blurs), and keyframe-based micro-animations.
- **Scripting**: Native ES6 JavaScript managing application state, scroll indicators, local storage synchronization, canvas raster rendering, dynamic theme updates, keyboard hotkeys, and toast notification popups.
- **Aesthetics**:
  - Google Fonts (`Outfit`, `Playfair Display`, `Space Grotesk`)
  - FontAwesome Icons v6.4.0
  - HSL-tailored harmonious gradients

---

## 📱 Mobile Responsiveness & Polishing

WisdomCanvas is designed with mobile-first principles:
- **Responsive Layout**: Reorganizes headers and topic navigation into scrollable containers on smaller viewports.
- **Symmetric Controls**: Arrow buttons and the Inspire Me shuffle action maintain horizontal symmetry as circular buttons on mobile viewports instead of stacking awkwardly.
- **Adaptive Card Padding**: Padding and font scales dynamically shrink on mobile viewports to prevent overflow and ensure text fits gracefully.

---

## 🚀 Getting Started

1. Clone this repository:
   ```bash
   git clone https://github.com/jasnoorsinghbadwal/Wisdom-Canvas.git
   ```
2. Open `index.html` in any modern web browser.
3. No build tools, compilers, or packages are required!
