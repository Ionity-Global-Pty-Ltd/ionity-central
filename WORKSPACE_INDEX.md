# ⚡ IONITY CENTRAL — MASTER ARCHITECTURE & WORKSPACE INDEX

```
========================================================================================
  ██╗ ██████╗ ███╗   ██╗██╗████████╗██╗   ██╗     ██████╗███████╗███╗   ██╗████████╗██████╗  █████╗ ██╗     
  ██║██╔═══██╗████╗  ██║██║╚══██╔══╝╚██╗ ██╔╝    ██╔════╝██╔════╝████╗  ██║╚══██╔══╝██╔══██╗██╔══██╗██║     
  ██║██║   ██║██╔██╗ ██║██║   ██║    ╚████╔╝     ██║     █████╗  ██╔██╗ ██║   ██║   ██████╔╝███████║██║     
  ██║██║   ██║██║╚██╗██║██║   ██║     ╚██╔╝      ██║     ██╔══╝  ██║╚██╗██║   ██║   ██╔══██╗██╔══██║██║     
  ██║╚██████╔╝██║ ╚████║██║   ██║      ██║       ╚██████╗███████╗██║ ╚████║   ██║   ██║  ██║██║  ██║███████╗
  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝   ╚═╝      ╚═╝        ╚═════╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
========================================================================================
```

> **Comprehensive Workspace Index, Technical Topology, Layout Blueprint, Git Repository Status & Firebase Hosting Architecture.**

---

## 👤 Solutionist & Entity Metadata

| Metadata Field | Value / Details |
|---|---|
| **Author & Solutionist** | **Johan Wilhelm van Antwerp** |
| **Design Studio** | **Antwerp Designs** |
| **Enterprise Entity** | **Ionity Global (Pty) Ltd** |
| **Official Portals** | [www.ionity.today](https://www.ionity.today) • [www.ionity.co.za](https://www.ionity.co.za) |
| **Design Philosophy** | **8-Bit Retro Accents + Modern Structured Layouts** |
| **Primary Color Scheme** | Canvas `#1A1A1A` • Text `#FFFFFF` • Accent Blue `#3366FF` • 8-Bit Gold `#FFA000` |
| **Application Type** | Progressive Web Application (PWA) + Unified Enterprise Suite |
| **Hosting Cost** | **$0.00 / month (100% Free Forever under Google Cloud Always-Free & Firebase Spark)** |

---

## 📁 Workspace Directory Map & File Blueprint

```
g:\.hackathon\.Ionity Central/
├── .firebaserc                     # Firebase multi-project aliases (project-hackathon-pr-me, ionity-root-system)
├── firebase.json                   # Firebase Web Hosting CDN config, headers, immutable caching, and SPA rewrites
├── index.html                      # Core SPA layout, 9 viewports, floating HUDs, 15 modal overlays, GSI & WebRTC SDKs
├── manifest.json                   # PWA Web App Manifest (standalone display, theme colors, icons)
├── sw.js                           # Progressive Web App Service Worker (offline cache, background sync, push handler)
├── DEPLOYMENT_GUIDE.md             # In-depth Google Cloud Compute Engine & Firebase Hosting deployment manual
├── WORKSPACE_INDEX.md              # [THIS FILE] Master application architecture and developer index
├── README.md                       # Public GitHub README documentation and quickstart
├── cloudhardware.txt               # Free-tier cloud hardware specifications, memory budgets, and quotas
├── Dockerfile                      # Containerized Nginx Alpine packaging for self-hosted container deployments
├── nginx.conf                      # High-performance Nginx reverse-proxy config with HTTP/2 and gzip caching
├── deploy-firebase.ps1             # 1-Click automated PowerShell deployment to Firebase Hosting
├── deploy-firebase.sh              # 1-Click automated Bash deployment to Firebase Hosting
├── deploy-gcp.sh                   # GCP VM bootstrap script (2GB Swap, UFW firewall, Nginx, Certbot SSL)
├── LICENSE                         # Apache License 2.0
├── css/                            # Modular Vanilla CSS3 Stylesheets
│   ├── main.css                    # Design tokens, variables, typography, reset, 8-bit badges, scrollbars
│   ├── workspace.css               # Unity 2.0 block editor, page tree, cover banner, focus timer, soundboard
│   ├── crm.css                     # 4-stage pipeline Kanban board, KPI cards, SVG forecast bar chart
│   ├── scrum.css                   # Scrum sprint board, story cards, Fibonacci pills, burndown chart
│   ├── components.css              # Modals, command palette, toast notifications, badges, switches, profile cards
│   ├── auth-screen.css             # Fullscreen Auth 2.0 login gate, OAuth provider buttons, demo login banner
│   ├── screenshare.css             # Moveable floating video camera viewport, dockable left-corner styling
│   └── ocr-inspector.css           # Paddle OCR scanner overlay, bottom-right mouseover inspector HUD
├── js/                             # 18 Modular Vanilla ES2024 JavaScript Subsystems
│   ├── app.js                      # Main controller, router, command palette (Ctrl+K), global events, PWA lifecycle
│   ├── auth.js                     # AuthManager: Google Identity (GSI), strict @ionity.today lock, SSO simulation
│   ├── crm.js                      # CRMManager: 4-stage sales pipeline (Check-in ➔ Paid), deal CRUD, CSV export
│   ├── scrum.js                    # ScrumManager: Sprint Kanban, Fibonacci points, velocity burndown chart
│   ├── workspace.js                # WorkspaceManager: Dynamic block editor, slash menu (/), Markdown import/export
│   ├── firebase-manager.js         # FirebaseManager: Firebase 10.13.0 Web SDK wrapper, Cloud Storage snapshots
│   ├── gcp-helper.js               # GCPHelper: Always-Free VM telemetry, simulated WebSSH terminal, script generator
│   ├── gemini-service.js           # GeminiService: Google Gemini 1.5/2.0 Flash API, Cache AUC (0ms / 0 tokens)
│   ├── local-rag.js                # LocalRAGService: In-browser TF-IDF vector index, Free VM backup
│   ├── notifications.js            # NotificationManager: Push notifications, Web Audio 8-bit synth sound generator
│   ├── ocr-inspector.js            # OcrInspector: Paddle OCR vision scanner, DOM element inspector HUD
│   ├── profiles.js                 # ProfilesManager: Multi-identity switcher, digital signature generator
│   ├── recorder.js                 # ScreenRecorderManager: MediaRecorder 60fps video capture, watermark compositing
│   ├── screenshare.js              # ScreenshareManager: Moveable camera PiP, 1-click left dock, WebRTC P2P mesh
│   ├── storage.js                  # StorageManager: IndexedDB / LocalStorage persistence & automated migrations
│   ├── tab-sync.js                 # TabSyncManager: BroadcastChannel real-time multi-tab state synchronization
│   ├── watermark.js                # WatermarkStudioManager: Canvas logo watermark generator & stamp overlay studio
│   └── icons.js                    # IconsManager: High-resolution vector SVG icon system
├── tools/                          # Cloud Provisioning & DevOps Utilities
│   ├── deploy-gcp-vm.ps1           # Automated GCP e2-micro VM orchestrator in PowerShell
│   └── setup-webssh-ttyd.sh        # In-browser WebSSH daemon installer (ttyd)
├── scripts/                        # Build & Automation Scripts
│   └── generate-catalog.mjs        # Asset catalog generator script
├── wiki/                           # Dedicated Architectural Knowledgebase
│   ├── Home.md                     # Wiki navigation & ecosystem overview
│   ├── Architecture.md             # Cloud topology & WebRTC mesh architecture
│   ├── Deployment-Guide.md         # Deployment procedures for Firebase and GCP
│   ├── Local-AI-and-RAG.md         # Chrome window.ai & Local Semantic RAG guide
│   ├── P2P-Screenshare-and-Webcam.md # P2P screensharing & moveable camera documentation
│   └── Security-and-Auth.md        # Strict Google OAuth 2.0 domain gate documentation
└── assets/                         # Vector SVGs, Logos, Audio FX, Signatures & 4K Wallpapers
```

---

## 🖥️ Layouts & User Experience Architecture

Ionity Central implements a structured multi-viewport single page application with 9 dedicated viewports, floating interactive HUDs, and 15 modal overlays:

```
+-----------------------------------------------------------------------------------------------+
|                                      TOP NAVIGATION HEADER                                    |
| [Logo: IONITY CENTRAL] [Breadcrumbs]  [Sync Dot] [Record] [Watermark] [🔊 FX] [Ctrl+K] [AI]   |
+-------------------+---------------------------------------------------------------------------+
|      SIDEBAR      |                             MAIN VIEWPORT AREA                            |
| ----------------- | ------------------------------------------------------------------------- |
| • Unity Workspace |  VIEW 1: Unity 2.0 Workspace (Dynamic blocks, slash menu, cover banner)    |
| • Paddle OCR AI   |  VIEW 2: Simple CRM (4-Stage pipeline, KPI cards, SVG forecast chart)     |
| • P2P Screenshare |  VIEW 3: SCRUM Sprint Hub (Sprint backlog, ⚡ Busy With, Burndown chart)   |
| • Screen Recorder |  VIEW 4: Enterprise Auth 2.0 (Google GSI SDK, connected providers hub)    |
| • Watermark Studio|  VIEW 5: GCP Always-Free VM & Firebase Hosting Control Center             |
| • Profiles & Sign |  VIEW 6: Screen Recorder Studio (60fps, mic mix, webcam PiP bubble)       |
| • Simple CRM      |  VIEW 7: Logo Watermark Studio (Canvas stamp designer, transparency)      |
| • SCRUM Sprints   |  VIEW 8: Profiles & Digital Signatures (Johan Wilhelm van Antwerp)        |
| • Cloud VM & GCP  |  VIEW 9: Workspace Preferences (8-Bit audio toggle, JSON backup/restore)   |
| ----------------- | ------------------------------------------------------------------------- |
| [Profile Card]    | [FLOATING HUDS]: Moveable Cam PiP (Dockable), Screen Rec HUD, OCR HUD     |
+-------------------+---------------------------------------------------------------------------+
```

### 1. The 9 Core Viewports
1. **Unity Workspace (`#view-workspace`)**:
   - Notion-like modular block editor with dynamic blocks (Paragraph, H1, H2, Checklist, 8-Bit Focus Timer, 8-Bit Soundboard, Dynamic Table, Callout, Code Runner, Quote, Video Recording Embed).
   - Slash Command Menu (`/` trigger in any block).
   - Document Hierarchy Tree with 1-click Page creation and Markdown import/export (`.md`).
   - Customizable Cover Gallery (8 retro gradient presets) and SVG vector icons.
2. **Simple CRM (`#view-crm`)**:
   - 4-Stage Financial Commercial Pipeline: `Check-in` ➔ `Quoted` ➔ `Followed Up` ➔ `Paid / Won`.
   - 5 KPI Telemetry Cards: Total Pipeline, Weighted Forecast, Deals Closed Won, In Negotiation, Win Rate Ratio.
   - SVG Telemetry Bar Chart comparing Total Deal Volume vs. Probability-Weighted Revenue.
   - Contacts & Leads Directory Table View with instant search and CSV export.
3. **Agile SCRUM Sprints (`#view-scrum`)**:
   - Active Sprint Header Card (Dates, Sprint Goal, Story Points, Velocity Progress Bar).
   - Interactive Burndown Chart tracking daily remaining story points.
   - Epic Filter Bar (`ALL`, `AUTH`, `PWA`, `CRM`, `GCP VM`).
   - 4-Column Sprint Kanban Board: `Sprint Backlog`, `⚡ Busy With`, `QA & Review`, `✅ Completed (3 Done)`.
4. **Enterprise Auth 2.0 (`#view-auth`)**:
   - Google Identity Services (GSI) One-Tap and button integration.
   - Strict `@ionity.today` and `@ionity.co.za` domain restriction filter.
   - Connected SSO Providers Hub (Google, GitHub, Microsoft 365, Anthropic Claude).
5. **Google Cloud VM & Firebase Hosting (`#view-gcp`)**:
   - Dual Tier Deployment Cards (Firebase Spark Free Tier vs. GCP Always-Free e2-micro VM).
   - Simulated Cloud Terminal (`root@ionity-central-vm`) with 1-click actions (`firebase deploy`, `gcloud compute instances list`, `df -h`, `free -h`, `systemctl status nginx`, `certbot certificates`).
   - 1-Click Google Cloud Web SSH launcher and instant PowerShell/Bash bootstrap code generators.
6. **Screen Recorder Studio (`#view-recorder`)**:
   - High-framerate screen recording (1080p, 720p, 4K at 30/60 FPS).
   - System audio + microphone condenser mixing.
   - Webcam presenter PiP compositing with live Ionity border.
   - Real-time logo watermark branding overlay.
7. **Logo Watermark Studio (`#view-watermark`)**:
   - Interactive canvas designer for embedding brand stamps and signatures into documents and recordings.
   - Presets for Ionity Global, Antwerp Designs, and AEDi Emblem with custom upload, scale, opacity, and positioning controls.
8. **Profiles & Digital Signatures (`#view-profiles`)**:
   - Executive identity management for **Johan Wilhelm van Antwerp** (Solutionist, Antwerp Designs).
   - Digital signature preview and vector stamp rendering (`Johanwilhelmvanantwerpesignatureionity.png`, `AEDi-AntwerpDesigns-Ionityglobal.png`).
   - Multi-profile switching and custom avatar/signature uploading.
9. **Workspace Preferences (`#view-settings`)**:
   - Brand preferences, author credentials, 8-Bit audio sound toggle, Cache AUC stats, and 1-Click Full Workspace JSON Backup/Restore.

### 2. Floating Viewports & Interactive HUDs
- **Moveable Video Camera & P2P Screenshare (`#floating-screenshare-container`)**:
  - Freely draggable and resizable video viewport with boundary constraints.
  - **1-Click Bottom-Left Corner Dock** (`Ctrl+Shift+S`) with glassmorphism backdrop.
  - **⛶ 1-Click Fullscreen** toggle for live presentations.
  - 100% Peer-to-Peer WebRTC mesh streaming (0 Firebase bandwidth consumed).
- **Floating Screen Recorder HUD (`#screen-recorder-hud`)**:
  - 8-Bit blinking `REC` beacon, live `00:00:00` timer, Pause/Resume, and Stop & Save buttons.
- **Paddle OCR AI Vision Scanner HUD (`#ocr-inspector-hud`)**:
  - Live on-screen text recognition overlay and bottom-right mouseover inspector telemetry HUD.
- **Real-Time Multi-Tab Keypoint Synchronization (`#tab-sync-indicator`)**:
  - BroadcastChannel synchronization across multiple browser tabs with active tab counter.

---

## ⚙️ JavaScript Subsystems & Module Manifest

| Subsystem File | Class / Service | Key Responsibilities & Capabilities |
|---|---|---|
| `js/app.js` | `App` | Root orchestrator, view router (`switchView`), command palette (`openCommandPalette`), keyboard shortcuts (`Ctrl+K`, `Ctrl+Shift+R`, `Ctrl+Shift+S`, `ESC`), PWA installation. |
| `js/auth.js` | `AuthManager` | Google Identity Services (GSI SDK), domain gate (`@ionity.today` / `@ionity.co.za`), custom Client ID manager, demo 1-click login. |
| `js/crm.js` | `CRMManager` | 4-stage commercial pipeline, deal CRUD, probability weighting, revenue forecast chart rendering, CSV data export. |
| `js/scrum.js` | `ScrumManager` | Sprint iteration management, Fibonacci story points, Kanban drag-and-drop, interactive velocity burndown chart. |
| `js/workspace.js` | `WorkspaceManager` | Dynamic block editor, slash menu (`/`), Markdown importer/exporter, cover gallery, focus timer, soundboard, dynamic table editor. |
| `js/firebase-manager.js` | `FirebaseManager` | Firebase 10.13.0 Web SDK wrapper, Hosting target config, Cloud Storage JSON snapshot backup and restoration. |
| `js/gcp-helper.js` | `GCPHelper` | GCP Always-Free VM telemetry, simulated SSH terminal, 1-click Google Cloud Web SSH launcher, script code generator. |
| `js/gemini-service.js` | `GeminiService` | Google Gemini 1.5/2.0 Flash API integration, **Cache AUC** engine for 0ms token caching, quick prompt templates. |
| `js/local-rag.js` | `LocalRAGService` | In-browser inverted TF-IDF semantic vector index across docs, deals, and tasks; automated backup to GCP VM / Cloud Storage. |
| `js/notifications.js` | `NotificationManager` | Web Push notification permissions, in-app notification drawer, 8-bit retro Web Audio synth sound generator. |
| `js/ocr-inspector.js` | `OcrInspector` | Paddle OCR on-screen vision inspection, DOM element inspector, bottom-right mouseover telemetry HUD. |
| `js/profiles.js` | `ProfilesManager` | Executive profile switcher, digital signature manager (`Johan Wilhelm van Antwerp`), custom avatar/signature uploads. |
| `js/recorder.js` | `ScreenRecorderManager` | `MediaRecorder` API screen capture (60 FPS, 1080p/4K), mic mixing, webcam PiP bubble, live canvas logo watermark overlay. |
| `js/screenshare.js` | `ScreenshareManager` | WebRTC P2P screenshare, moveable floating webcam PiP, 1-click left-corner snap, session ledger logger. |
| `js/storage.js` | `StorageManager` | LocalStorage & IndexedDB persistence layer, auto-migration, seed dataset loader, workspace export/import. |
| `js/tab-sync.js` | `TabSyncManager` | `BroadcastChannel` real-time state synchronization across browser tabs and keypoints. |
| `js/watermark.js` | `WatermarkStudioManager` | Canvas logo watermark engine, preset selection (Ionity Global, Antwerp Designs, AEDi), transparency & position controls. |
| `js/icons.js` | `IconsManager` | High-resolution vector SVG icon repository and icon picker helper. |

---

## 🎨 Design System & CSS Aesthetic Tokens

Ionity Central strictly adheres to the Antwerp Designs 8-Bit Retro + Modern Structured layout design system:

```css
:root {
  /* Core Canvas & Surfaces */
  --bg-app: #1A1A1A;                 /* Deep Matte Dark Canvas */
  --bg-surface: #222222;             /* Primary Elevated Surface */
  --bg-surface-elevated: #2A2A2A;    /* Secondary Elevated Card / Modal */
  --bg-sidebar: #141414;             /* Dark Sidebar Backdrop */

  /* Brand Colors & Accents */
  --text-main: #FFFFFF;              /* High-Contrast Pure White Text */
  --text-muted: #A0A0A0;             /* Subtle Description Text */
  --accent-primary: #3366FF;         /* Ionity Electric Blue Accent */
  --accent-hover: #5580FF;           /* Hover Electric Blue */
  --accent-8bit-gold: #FFA000;       /* Retro 8-Bit Pixel Gold Accent */

  /* Telemetry & Stage Status */
  --status-green: #00E676;           /* Paid / Won / Cloud Online (Green) */
  --status-yellow: #FFD600;          /* Quoted / Pending (Yellow) */
  --status-red: #FF3D71;             /* REC / Urgent / Error (Red) */
  --status-purple: #A855F7;          /* Followed Up / Stage 3 (Purple) */

  /* Borders & Glassmorphism */
  --border-subtle: #333333;          /* Clean Structured Border */
  --border-focus: #3366FF;           /* Active Component Highlight */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Typography */
  --font-main: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'SF Mono', 'Cascadia Code', 'Fira Code', 'Courier New', monospace;
  --font-8bit: 'Press Start 2P', 'Courier New', monospace;
}
```

---

## 🌿 Git Repository Status & Remote Architecture

```
Repository:   Ionity-Global-Pty-Ltd/ionity-central
Remote (Git): https://github.com/Ionity-Global-Pty-Ltd/ionity-central.git
Branch:       main (Up-to-date with 'origin/main')
```

### Recent Git Commit History
1. `f6a585d`: `feat: Add ionity.digital domain support in Nginx, GCP bootstrap, and OAuth gate`
2. `57ac4d2`: `Delete CNAME`
3. `e9fca04`: `Create CNAME`
4. `1b59fd9`: `feat: Add Paddle OCR Vision Scanner, Bottom-Right Mouseover Inspector HUD, and Real-Time Multi-Tab Keypoint Sync`
5. `73d1b34`: `feat: Ionity Central v1.0.0 — Unified Workspace, CRM, Scrum, Moveable Camera, P2P Screenshare, Local Tiny AI & RAG Engine`

### Current Working Tree Status
- **Modified Tracked Files**:
  - `.firebaserc` — Configured project target to `project-hackathon-pr-me`
  - `cloudhardware.txt` — Updated live deployment target to `https://project-hackathon-pr-me.web.app`
  - `js/firebase-manager.js` — Set default project ID to `project-hackathon-pr-me`
- **Untracked Directories & Artifacts**:
  - `assets/` (Video walkthroughs, logos, audio FX, brand emblems)
  - `4k Walls/` (High-definition wallpaper assets)
  - `Doc template/` (Document template specifications)
  - `scripts/` (Build & catalog generator utilities)

---

## 🔥 Firebase Web Hosting & Google Cloud Topology

### Tier A: Firebase Web Hosting (Spark Free Tier)
- **Active Project ID**: `project-hackathon-pr-me` (Alias: `production`, `hackathon`) / `ionity-root-system` (Alias: `root`)
- **Hosting URL**: `https://project-hackathon-pr-me.web.app` & `https://project-hackathon-pr-me.firebaseapp.com`
- **Custom Domains Supported**: `central.ionity.today` • `central.ionity.digital` • `central.ionity.co.za`
- **Hosting Rules (`firebase.json`)**:
  - `public: "."` with single-page application URL rewrite (`"source": "**", "destination": "/index.html"`).
  - Strict security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection: 1; mode=block`).
  - Immutable asset caching (`Cache-Control: max-age=604800, public, immutable` for images, fonts, icons).
  - Service Worker zero-caching (`Cache-Control: no-cache, no-store, must-revalidate` for `/sw.js`).
- **1-Click Deploy Command**:
  ```powershell
  firebase deploy --only hosting --project project-hackathon-pr-me
  ```

### Tier B: Google Cloud Compute Engine Always-Free VM
- **Instance Machine Type**: `e2-micro` (2 vCPUs, 1.0 GB Physical RAM + 2.0 GB Linux Swapfile).
- **Persistent Disk**: 30 GB Standard Persistent Disk (`/dev/sda1` on Ubuntu 24.04 LTS).
- **Cloud Storage Bucket**: `gs://ionity-storage-root` (5 GB Standard Storage quota).
- **Region & Zone**: `us-central1-a` (Iowa, Always-Free Tier eligible).
- **Web Stack**: Nginx 1.26+ Reverse Proxy with HTTP/2, Let's Encrypt automated Certbot SSL renewal, and UFW firewall.
- **SSH Connectivity**: 1-Click Google Cloud In-Browser Web SSH & WebSSH Daemon (`ttyd`).

---

## 🧠 Local Tiny AI, Cache AUC & Semantic RAG Engine

```
+----------------------------------------------------------------------------------------+
|                                LOCAL AI & RAG PIPELINE                                 |
+----------------------------------------------------------------------------------------+
|                                                                                        |
|   +--------------------------+       +-------------------+       +-----------------+   |
|   |  Unity Docs, CRM Deals,  | ----> |  TF-IDF Vector    | ----> |  Local Cache    |   |
|   |  SCRUM Stories & Backlog |       |  Chunking Engine  |       |  IndexedDB      |   |
|   +--------------------------+       +-------------------+       +-----------------+   |
|                                                                          |             |
|                                                                          v             |
|                                      +---------------------------------------------+   |
|                                      |      CACHE AUC (Active Universal Cache)     |   |
|                                      |      • 0ms Inference for Repeated Prompts   |   |
|                                      |      • 0 Network Tokens Consumed            |   |
|                                      +---------------------------------------------+   |
|                                                              |                         |
|                                   +--------------------------+---------------------+   |
|                                   |                                                |   |
|                                   v                                                v   |
|                    +------------------------------+                +-----------------+ |
|                    |  On-Device Window.AI / Nano  |                |  Gemini Flash   | |
|                    |  (100% Offline Inference)    |                |  (Cloud API)    | |
|                    +------------------------------+                +-----------------+ |
+----------------------------------------------------------------------------------------+
```

1. **Local Tiny AI (On-Device)**: Uses Chrome Built-in AI (`window.ai` / Gemini Nano) or local neural fallback, executing 100% locally with 0 network calls.
2. **Cache AUC (Active Universal Cache)**: In-memory & IndexedDB query vector cache that intercepts duplicate AI prompts and serves instant responses with 0ms latency and 0 API tokens spent.
3. **Local RAG Semantic Cache**: Chunks documents, deals, and tasks into semantic units with 1-click cloud snapshot backup to the Always-Free GCP VM.

---

## 📜 Copyright & Governance

* **Architect & Author**: **Johan Wilhelm van Antwerp**  
* **Design Studio**: **Antwerp Designs**  
* **Organization**: **Ionity Global (Pty) Ltd**  
* **Live Websites**: [www.ionity.today](https://www.ionity.today) • [www.ionity.co.za](https://www.ionity.co.za)  
* **License**: [Apache License, Version 2.0](LICENSE)  
* **Copyright**: © 2026 Ionity Global (Pty) Ltd & Antwerp Designs. All rights reserved.
