# 🌊 Watermark Studio

The Watermark Studio renders a retro Ionity Global brand watermark over recorded media, with configurable opacity, position, and live canvas preview.

## Overview

The Watermark Studio is used in conjunction with the Screen Recorder (`js/recorder.js`) to composite the official Ionity Global watermark onto live-recorded video frames. The watermark is applied in real-time using the Canvas API — no post-processing required.

---

## Key Features

### Retro Brand Composite
- The watermark badge combines:
  - **Ionity Global logo** (`assets/ionity-logo-vector.svg`)
  - **"IONITY CENTRAL"** text in 8-bit retro pixel font
  - **Author credit**: Johan Wilhelm van Antwerp · Antwerp Designs
  - **Timestamp badge** (optional) for session-timestamped recordings

### Configurable Overlay
| Option | Default | Description |
|---|---|---|
| **Opacity** | `0.7` | Watermark alpha transparency (0.0 – 1.0) |
| **Position** | `bottom-left` | Corner anchor: `top-left`, `top-right`, `bottom-left`, `bottom-right` |
| **Scale** | `1.0` | Size multiplier relative to viewport width |
| **Color Mode** | `light` | `light` (white text) or `dark` (dark text on light bg) |

### Live Canvas Preview
- A real-time preview canvas shows the watermark composite before beginning a recording session.
- Drag the watermark to reposition it interactively on the preview canvas.

---

## Integration with Screen Recorder

During a recording session:
1. `js/recorder.js` captures the screen/camera stream via `MediaRecorder`.
2. Each video frame is composited with the watermark via the Canvas 2D API.
3. The final `.webm` output includes the watermark baked into every frame.
4. The recorded file is available for immediate download upon stopping the session.

---

## Source Files

| File | Purpose |
|---|---|
| `js/watermark.js` | Watermark renderer, Canvas composite engine, configuration |
| `js/recorder.js` | Screen recorder, MediaRecorder integration, watermark attachment |

---

## Usage

1. Navigate to **Watermark Studio** in the sidebar (`data-view="watermark"`).
2. Adjust opacity, position, and scale using the configuration controls.
3. Preview the watermark overlay on the live canvas.
4. Click **Apply to Recorder** to attach the watermark to the next recording session.
5. Navigate to **Screen Recorder** and begin recording — the watermark is automatically composited.
