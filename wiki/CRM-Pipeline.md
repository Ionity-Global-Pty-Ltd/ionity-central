# 💰 4-Stage Commercial CRM Pipeline

Ionity Central includes a full commercial sales pipeline with four financial lifecycle stages, real-time SVG telemetry, and an AI-powered proposal generator.

## Pipeline Stages

```
Check-in ──► Quoted ──► Followed Up ──► Paid / Won
  (Lead)    (Proposal)   (Negotiation)   (Closed)
```

| Stage | Icon | Description |
|---|---|---|
| **Check-in** | 📋 | Initial client contact logged. Opportunity created. |
| **Quoted** | 📄 | Commercial proposal or quote sent to client. |
| **Followed Up** | 📞 | Active negotiation and follow-up communications. |
| **Paid / Won** | ✅ | Deal closed and payment received. |

---

## Key Features

### Deal Cards
Each deal is a rich card containing:
- **Client name** and **organization**
- **Deal value** (ZAR / USD / custom currency)
- **Stage probability** — weighted forecast contribution to pipeline value
- **Activity log** — timestamped notes and communications
- **AI Proposal button** — 1-click Gemini AI scope & milestone generation

### Dynamic SVG Telemetry
- Real-time pipeline value forecasting across all active deals.
- Stage conversion probability calculation.
- Visual funnel chart rendered inline as SVG — no external charting library required.

### AI Proposal Generator
Click **⚡ Generate AI Proposal** on any deal card to produce:
1. Executive scope of work summary
2. Financial milestone breakdown
3. Delivery timeline estimate
4. Risk/assumption register

Powered by `js/gemini-service.js` with Cache AUC — repeated proposal requests for the same deal return instantly from cache without consuming tokens.

---

## Data Model

```js
{
  id: "deal-XXXX",
  client: "String",
  organization: "String",
  value: Number,          // Deal value in base currency
  stage: "checkin" | "quoted" | "followedup" | "paid",
  probability: Number,    // 0–100 stage probability weight
  notes: [ { text, timestamp } ],
  createdAt: ISO8601,
  updatedAt: ISO8601
}
```

Deals are persisted in `localStorage` via `js/storage.js` and optionally synced to Firebase Firestore via `js/firebase-manager.js`.

---

## Source Files

| File | Purpose |
|---|---|
| `js/crm.js` | CRM module — deal CRUD, pipeline render, stage transitions |
| `js/gemini-service.js` | AI proposal generation & Cache AUC |
| `css/crm.css` | Pipeline board, deal card, and funnel SVG styles |

---

## Usage

1. Navigate to **Simple CRM** in the sidebar (`data-view="crm"`).
2. Click **+ New Deal** to create a deal card.
3. Drag deals between stage columns or use the stage dropdown to advance the lifecycle.
4. Click **⚡ Generate AI Proposal** to produce a Gemini-powered commercial scope.
5. Click **✅ Mark Paid** to close the deal and move it to the Won column.
