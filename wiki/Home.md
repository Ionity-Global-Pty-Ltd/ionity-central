# ⚡ Welcome to the Ionity Central Wiki

**Ionity Central** is an all-in-one unified workspace, commercial CRM, agile sprint engine, on-device AI platform, and P2P streaming suite — designed for enterprise teams and hosted 100% free on Google Cloud Platform.

> Architected & Maintained by **Johan Wilhelm van Antwerp** · Antwerp Designs · Ionity Global (Pty) Ltd  
> 🌐 [www.ionity.today](https://www.ionity.today) | [www.ionity.co.za](https://www.ionity.co.za)

---

## 📖 Wiki Navigation

### 🏗️ Architecture & Infrastructure
- **[Architecture & Cloud Topology](Architecture.md)**: Google Cloud Always-Free e2-micro VM, Firebase Edge Hosting, WebRTC streaming topology, Mermaid system diagram.

### 💼 Core Application Modules
- **[Unity 2.0 Workspace](../README.md#1--unity-20-workspace)**: Dynamic block editor, Markdown import/export, focus timer, retro badge metadata.
- **[4-Stage CRM Pipeline](CRM-Pipeline.md)**: Deal lifecycle (Check-in → Paid/Won), AI proposal generator, SVG telemetry.
- **[SCRUM Sprint Hub](SCRUM-Sprint.md)**: Kanban board, story points, burndown metrics, velocity tracking.
- **[OCR Inspector](OCR-Inspector.md)**: Paddle OCR AI vision scanning, on-screen text extraction, AI reporting.
- **[Watermark Studio](Watermark-Studio.md)**: Retro brand watermark composite for recorded media.
- **[P2P Screenshare & Moveable Camera](P2P-Screenshare-and-Webcam.md)**: WebRTC P2P mesh, draggable PiP, 1-click left corner dock, screen recorder, VM session ledger.

### 🧠 AI & Intelligence
- **[Local Tiny AI & Semantic RAG](Local-AI-and-RAG.md)**: On-device Chrome AI / Gemini Nano, in-cache neural engine, BM25/TF-IDF vector index, 1-Click VM backup.

### 🔒 Security & Identity
- **[Security & Google OAuth 2.0](Security-and-Auth.md)**: `@ionity.today` domain gate, JWT token verification, Nginx security headers, session persistence.

### 📱 PWA & Client Features
- **[PWA & Web App Manifest](PWA-and-Manifest.md)**: Service worker offline caching, installable PWA, push notifications, manifest configuration.

### 🚀 Deployment & DevOps
- **[Deployment & Setup Guide](Deployment-Guide.md)**: Step-by-step Firebase Hosting deployment, GCP Always-Free VM provisioning, GitHub Actions CI/CD.
- **[Cloud Hardware & Free-Tier Quotas](../cloudhardware.txt)**: Detailed hardware specs and infrastructure inventory log.

---

## 🗂️ Quick Reference

| Module | Entry File | CSS File |
|---|---|---|
| App Bootstrap | `js/app.js` | `css/main.css` |
| Unity Workspace | `js/workspace.js` | `css/workspace.css` |
| CRM Pipeline | `js/crm.js` | `css/crm.css` |
| SCRUM Sprint | `js/scrum.js` | `css/scrum.css` |
| P2P Screenshare | `js/screenshare.js` | `css/screenshare.css` |
| OCR Inspector | `js/ocr-inspector.js` | `css/ocr-inspector.css` |
| Watermark Studio | `js/watermark.js` | — |
| Screen Recorder | `js/recorder.js` | — |
| Profiles & Sigs | `js/profiles.js` | — |
| Local AI & RAG | `js/local-rag.js` | — |
| Gemini AI | `js/gemini-service.js` | — |
| Firebase | `js/firebase-manager.js` | — |
| Auth / OAuth | `js/auth.js` | `css/auth-screen.css` |
| Notifications | `js/notifications.js` | — |
| Storage | `js/storage.js` | — |
| Tab Sync | `js/tab-sync.js` | — |
| Icons | `js/icons.js` | — |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Shift+S` | Snap screenshare camera to default left corner |
| `Ctrl+K` | Open Command Palette |
| `Ctrl+N` | New Unity document |
| `Esc` | Close active modal / panel |

---

## 🏷️ Design Tokens

| Token | Hex Value | Usage |
|---|---|---|
| Canvas | `#1A1A1A` | Workspace background |
| Text | `#FFFFFF` | Primary foreground |
| Accent Blue | `#3366FF` | Primary actions & links |
| Accent Gold | `#FFA000` | Retro 8-bit highlights |
| Status Green | `#00E676` | Live / active indicators |
| Status Red | `#FF3D71` | Recording / error states |
