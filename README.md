# NodeBB RTL Support & Vazirmatn Font Plugin

Comprehensive Right-to-Left (RTL) detection, layout correction, and native **Vazirmatn** variable font typography for Persian, Arabic, Hebrew, and Syriac text in NodeBB.

## Features

- **Bundled Vazirmatn Variable Font**: Self-hosted variable WOFF2 font files (`vazirmatn-arabic-wght-normal.woff2` and `vazirmatn-latin-wght-normal.woff2`) designed by Saber Rastikerdar (OFL License). Zero external CDN dependencies, high performance, and 100% privacy.
- **Forum-Wide Unicode-Range Typography**: Using CSS `unicode-range`, Persian/Arabic text anywhere on the forum (navigation, topic titles, category cards, buttons, modals, and profile) renders in Vazirmatn automatically without altering Latin/English typography.
- **Natural Digit Representation**: Preserves user input. Standard Western numerals (`1, 2, 3`) remain Western, and Persian numerals (`۱, ۲, ۳`) remain Persian without forced replacement.
- **Optimized Persian Typography**: Provides optimal line-height (`1.75`) and font weights for RTL posts, headings, blockquotes, and lists to prevent clipping of diacritics and ascenders/descenders.
- **Comprehensive RTL Lists**: Fixes the longstanding issue where Markdown lists (`<ol>`, `<ul>`, `<li>`) in NodeBB default to Left-to-Right with numbers and bullets on the left. With this plugin, list numbers and bullets naturally flip to the right side with proper right padding.
- **Server-Side Parser Hook (`filter:parse.post`)**: Inspects rendered post HTML via Cheerio and adds semantic `dir="rtl"` to headings (`h1`-`h6`), list items, parent lists, blockquotes, and paragraphs.
- **Real-Time Composer Support**: Automatically detects Persian input in topic title and composer textarea to switch to RTL in real time, and formats live preview via `action:composer.preview`.
- **Theme-Agnostic CSS**: Zero dependency on specific themes; works seamlessly across Harmony, Persona, and custom NodeBB themes.

## Supported Scripts

- Persian (Farsi) — with full Vazirmatn variable font integration
- Arabic
- Hebrew
- Syriac

## Installation

Add to your NodeBB installation or `docker-compose.yml`:

```bash
npm install git+ssh://git@github.com/Mazafard/nodebb-plugin-rtl-support.git
```

Or mount locally in `docker-compose.yml`:

```yaml
- NODEBB_ADDITIONAL_PLUGINS=... file:/opt/plugins/nodebb-plugin-rtl-support
```

## Credits & License

- Plugin code: MIT (c) 2026 Mazafard
- Vazirmatn Font: SIL Open Font License 1.1 (OFL) by Saber Rastikerdar

