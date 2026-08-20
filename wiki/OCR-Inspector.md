# 🔍 Paddle OCR AI Vision Inspector

The OCR Inspector provides 1-click on-screen text extraction using the Paddle OCR engine, combined with AI-powered reporting via the Gemini service.

## Overview

The OCR Inspector is a non-destructive overlay tool that:
1. Captures the current browser viewport as an image.
2. Runs the Paddle OCR engine to extract all visible text regions.
3. Displays confidence scores and bounding boxes per detected text block.
4. Sends extracted text to the Gemini AI service for contextual analysis and reporting.

---

## Key Features

### 1-Click Screen OCR
- Click **Paddle OCR AI** in the sidebar or press the OCR nav item to trigger a full-viewport scan.
- The capture is performed client-side with no data leaving the browser until the optional AI analysis step.

### AI Vision Reporter
- Extracted text is automatically passed to `js/gemini-service.js` for:
  - **Content summary** — concise summary of visible workspace content
  - **Action items** — AI-detected tasks or next steps from the scanned content
  - **Data extraction** — structured data identified in tables, forms, or lists

### Overlay Inspector Panel
- Floating overlay panel (`css/ocr-inspector.css`) shows:
  - List of all detected text regions
  - Confidence score per region (0.0 – 1.0)
  - Raw extracted text with whitespace preserved
- Non-destructive: Overlay can be dismissed without affecting the workspace.

---

## Integration Points

| Integration | Description |
|---|---|
| **Unity Workspace** | OCR text can be imported directly as a new document block |
| **CRM Pipeline** | Detected client names or values can pre-fill new deal cards |
| **Local RAG** | Extracted content is indexed into the RAG vector cache for AI context |

---

## Source Files

| File | Purpose |
|---|---|
| `js/ocr-inspector.js` | OCR capture, Paddle engine integration, AI report dispatch |
| `css/ocr-inspector.css` | Overlay inspector panel styles |

---

## Usage

1. Click **Paddle OCR AI** in the sidebar (nav icon with camera + green circle).
2. The inspector captures the viewport and runs the OCR engine.
3. Review detected text regions in the floating overlay panel.
4. Click **📋 Import to Workspace** to create a new Unity document block from the OCR output.
5. Click **🧠 AI Analyse** to send the extracted text to Gemini for contextual reporting.
6. Close the overlay by clicking **✕** or pressing `Esc`.

---

## Privacy & Data Handling

- The viewport capture is performed entirely in-browser using the Canvas API.
- OCR processing runs client-side — no image data is transmitted to external servers.
- The optional AI Analysis step sends **text only** (not images) to the Gemini API over HTTPS.
