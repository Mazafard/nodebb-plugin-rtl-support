# NodeBB RTL Support Plugin

Automatic Right-to-Left (RTL) detection and styling for Persian, Arabic, Hebrew, and Syriac text in NodeBB.

## Features

- **Comprehensive RTL Lists**: Fixes the longstanding issue where Markdown lists (`<ol>`, `<ul>`, `<li>`) in NodeBB default to Left-to-Right with numbers and bullets on the left. With this plugin, list numbers and bullets naturally flip to the right side with proper right padding.
- **Server-Side Parser Hook (`filter:parse.post`)**: Inspects rendered post HTML via Cheerio and adds semantic `dir="rtl"` to headings (`h1`-`h6`), list items, parent lists, blockquotes, and paragraphs.
- **Real-Time Composer Live Preview**: Listens to `action:composer.preview` to dynamically format RTL text as users type in the composer.
- **Theme-Agnostic CSS**: Zero dependency on specific themes; works seamlessly across Harmony, Persona, and custom NodeBB themes.

## Supported Scripts

- Persian (Farsi)
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

## License

MIT (c) 2026 Mazafard
