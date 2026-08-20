# 📱 PWA & Web App Manifest

Ionity Central is a fully installable Progressive Web App (PWA) with offline support, a service worker cache, push notifications, and a complete Web App Manifest.

## Web App Manifest (`manifest.json`)

The manifest defines PWA metadata:

```json
{
  "name": "Ionity Central - Unified Workspace, CRM & Scrum",
  "short_name": "Ionity Central",
  "display": "standalone",
  "background_color": "#1A1A1A",
  "theme_color": "#3366FF",
  "start_url": "./index.html",
  "scope": "./",
  "orientation": "any",
  "categories": ["productivity", "business", "utilities"]
}
```

### PWA Icons

| Size | File | Usage |
|---|---|---|
| 192×192 | `icons/icon-192.png` | Android home screen, Chrome PWA badge |
| 512×512 | `icons/icon-512.png` | Splash screen, high-DPI displays |

Both icons use `"purpose": "any maskable"` for adaptive icon support on Android.

### Shortcuts

Three quick-action shortcuts are defined in the manifest:
- **New Document** — Opens workspace with a new Unity document action
- **CRM Pipeline** — Opens directly to the CRM board
- **Sprint Board** — Opens directly to the SCRUM kanban view

---

## Service Worker (`sw.js`)

The service worker provides offline caching and fast repeat loads.

### Cache Strategy
- **Precache**: All core static assets (HTML, CSS, JS, icons, manifest) are precached on service worker install.
- **Network-first with cache fallback**: API calls and dynamic content attempt network first; serve from cache if offline.
- **Cache-then-network**: For static assets with `Cache-Control: immutable`, serve from cache immediately and update in background.

### Cache Name
```js
const CACHE_NAME = 'ionity-central-v1';
```

Increment the version string to force a cache bust on next deploy.

---

## Installation

### Desktop (Chrome / Edge)
1. Open the app in Chrome or Edge.
2. Click the **Install** icon (⊕) in the browser address bar.
3. Click **Install** in the prompt — Ionity Central opens as a standalone app window.

### Android
1. Open the app in Chrome for Android.
2. Tap the **⋮ Menu** → **Add to Home screen**.
3. Tap **Install** — the app icon appears on the home screen.

### iOS (Safari)
1. Open the app in Safari on iOS.
2. Tap the **Share** icon → **Add to Home Screen**.
3. Tap **Add** — the app icon appears on the home screen.

---

## Push Notifications

Ionity Central uses the Web Push API for native OS-level notifications (when installed as a PWA):
- **Managed by** `js/notifications.js`
- **Types**: Toast (in-app), PWA Push (OS-level when app is in background)
- **Events**: Deal stage changes, sprint story completion, RAG backup completed, screenshare session started

To enable push notifications, the app requests `Notification` permission on first meaningful interaction.

---

## Firebase Hosting PWA Headers

`firebase.json` sets the following cache headers for PWA assets:

```json
{
  "source": "**/*.@(js|css|svg|png|ico|webp|woff2)",
  "headers": [
    { "key": "Cache-Control", "value": "public, max-age=604800, immutable" }
  ]
}
```

The service worker and `manifest.json` are served with `no-cache` to ensure updates are detected immediately.
