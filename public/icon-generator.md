# PWA Icon Generation Guide

The Prague Tracker app needs various icon sizes for different devices and platforms.

## Required Icon Sizes
- 72x72 (Android)
- 96x96 (Android)
- 128x128 (Chrome Web Store)
- 144x144 (Windows tiles)
- 152x152 (iPad)
- 192x192 (Android splash)
- 384x384 (Android splash large)
- 512x512 (PWA standard)

## Icon Design
- **Base concept**: Prague castle or health tracking symbol
- **Colors**: Blue (#2563eb) and white
- **Style**: Simple, recognizable at small sizes
- **Format**: PNG with transparency

## Generation Options

### Option 1: Online Generators
- [PWA Builder](https://www.pwabuilder.com/imageGenerator)
- [Favicon.io](https://favicon.io/favicon-generator/)
- [App Icon Generator](https://appicon.co/)

### Option 2: Manual Creation
Create a 512x512 base icon and resize to other dimensions.

### Option 3: Simple Emoji Icon (Quick Start)
For immediate deployment, you can use emoji-based icons:

```svg
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="64" fill="#2563eb"/>
  <text x="256" y="340" font-size="280" text-anchor="middle" fill="white">📊</text>
</svg>
```

## Temporary Solution
For now, the app will work without custom icons (browser will use defaults).
Add custom icons before production launch for better user experience.

## Icon Placement
All icons should be placed in `/public/` directory:
- `/public/icon-72x72.png`
- `/public/icon-96x96.png`
- `/public/icon-128x128.png`
- etc.

Update `manifest.json` if icon names change.