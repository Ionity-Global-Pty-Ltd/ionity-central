# ⚡ Agile SCRUM Sprint Hub

The SCRUM Sprint Hub provides a full Kanban-style sprint board with burndown metrics, velocity tracking, and structured user story management.

## Sprint Board Columns

```
┌─────────────────┬──────────────────┬───────────────────┐
│    BACKLOG       │   ⚡ BUSY WITH    │   ✅ COMPLETED     │
│  (Ready queue)   │  (Active sprint) │  (Done stories)   │
└─────────────────┴──────────────────┴───────────────────┘
```

| Column | Description |
|---|---|
| **Backlog** | User stories queued and groomed, awaiting sprint assignment. |
| **⚡ Busy With** | Stories currently in the active sprint iteration. |
| **✅ Completed** | Finished stories with acceptance criteria met (up to 3 shown as reference). |

---

## Key Features

### User Story Cards
Each story card contains:
- **Story title** and descriptive body
- **Story points** (Fibonacci scale: 1, 2, 3, 5, 8, 13)
- **Acceptance criteria checklist** — definition-of-done items
- **Priority label** — P0 Critical, P1 High, P2 Medium, P3 Low
- **Assignee** (from team profiles)

### Metrics Dashboard
- **Burndown Chart**: Automatic story point burndown across sprint timeline.
- **Velocity Tracker**: Average story points completed per sprint (rolling 3-sprint average).
- **Sprint Summary**: Total points in sprint, completed points, remaining points.

### Sprint Management
- Drag stories between columns to advance sprint state.
- Click **⚡ Start Sprint** to lock the current Backlog into an active iteration.
- Click **✅ Complete Sprint** to close the iteration and archive completed stories.

---

## Data Model

```js
{
  id: "story-XXXX",
  title: "String",
  description: "String",
  points: Number,               // Story point estimate (Fibonacci)
  priority: "P0"|"P1"|"P2"|"P3",
  status: "backlog"|"active"|"completed",
  acceptanceCriteria: [
    { text: "String", done: Boolean }
  ],
  assignee: "profile-id",
  sprintId: "sprint-XXXX",
  createdAt: ISO8601,
  completedAt: ISO8601 | null
}
```

---

## Source Files

| File | Purpose |
|---|---|
| `js/scrum.js` | SCRUM module — story CRUD, board render, burndown metrics |
| `css/scrum.css` | Kanban board, story card, and metrics dashboard styles |

---

## Usage

1. Navigate to **SCRUM Sprint** in the sidebar (`data-view="scrum"`).
2. Click **+ Add Story** to create a new user story in the Backlog.
3. Set story points, priority, and acceptance criteria.
4. Drag stories to **⚡ Busy With** to add to the active sprint.
5. Tick acceptance criteria checkboxes as work is completed.
6. Drag to **✅ Completed** when all criteria are met.
7. View the **Metrics Dashboard** for burndown and velocity.
