# HMFFCC Practical Plan (Simple + Intuitive)

This plan turns the big vision into a daily-use tool that is easy to use, especially for quick farm + flight decisions.

## 1) Core outcomes (what success looks like)

1. Add a task in under 10 seconds.
2. Set a reminder without typing complex rules.
3. Log farm/flight events in 1–2 taps.
4. See today at a glance with clear visual status.

## 2) Keep the product to 4 main screens

### A) Today (home)
- Big status cards:
  - **Flight: GO / CAUTION / NO-GO**
  - **Farm Ops: GO / CAUTION / NO-GO**
- Next 3 reminders.
- Overdue tasks count.
- “Quick Log” buttons: Rain, Spray, Maintenance, Flight.

### B) Tasks
- One list with 3 sections only:
  - Today
  - Upcoming
  - Done
- One primary button: **+ Add Task**.
- Task fields:
  - Title (required)
  - Due date/time (optional)
  - Type (Farm / Flight / Personal)
  - Priority (Low / Medium / High)

### C) Reminders
- Template-first reminders (avoid complexity):
  - “Every morning 7:00”
  - “Before sunset”
  - “Every Monday”
  - “After rain > X mm” (phase 2)
- Toggle on/off per reminder.

### D) Logs + Charts
- Chronological timeline of logs.
- Filter chips: Rain, Weather, Spray, Maintenance, Flight.
- Small charts:
  - Rain by day (7/30-day)
  - Spray windows used vs missed
  - Flight-safe windows this week

## 3) Simple interaction design rules

- Use large tap targets and high contrast everywhere.
- Keep forms short; show only required fields first.
- Always provide a quick action on each screen.
- Use plain language:
  - “Add Task”, not “Create Work Item”
  - “Remind Me”, not “Configure Notification Rule”
- Confirm success with a short toast: “Task saved”.

## 4) Data model (minimal and practical)

### tasks
- id
- title
- category (`farm | flight | personal`)
- due_at (nullable)
- priority (`low | medium | high`)
- status (`todo | done`)
- reminder_id (nullable)
- created_at
- updated_at

### reminders
- id
- label
- rule_type (`daily | weekly | one_time | condition`)
- rule_payload (time/day/condition JSON)
- enabled
- linked_task_id (nullable)
- created_at

### logs
- id
- log_type (`rain | spray | maintenance | flight | note`)
- value_num (nullable, e.g. mm rain)
- value_text (nullable)
- occurred_at
- linked_task_id (nullable)
- created_at

## 5) Quick-add flows (must be frictionless)

### Add task
1. Tap **+ Add Task**
2. Enter title
3. (Optional) add due date
4. Save

### Set reminder from task
1. Open task
2. Tap **Add reminder**
3. Pick template (daily/weekly/one-time)
4. Save

### Quick log
1. Tap quick button (Rain/Spray/etc.)
2. Enter one value or note
3. Save

## 6) Visual layer (what user sees instantly)

- **Status strip** (top): Flight + Farm verdict badges.
- **Today lane**: timeline blocks from 06:00–20:00.
- **Task heat**: red dot for overdue, amber for today, green for done.
- **Mini trends**:
  - Rain bars
  - Wind arrows
  - Task completion ring

## 7) Build order (practical roadmap)

### Phase 1 (ship quickly)
- Today screen + task list + quick log.
- Manual reminders (daily/weekly/one-time).
- Basic charts from local log data.

### Phase 2
- Smart reminders from weather thresholds.
- Better filtering + export logs.
- Larger dashboard widgets.

### Phase 3
- Voice log entries.
- Predictive prompts (“Good spray window 9:30–11:00”).

## 8) First sprint task list (copy/paste ready)

1. Create `tasks`, `reminders`, `logs` tables (plus indexes).
2. Build Today screen skeleton with status + reminders + quick log.
3. Build task CRUD with very short form.
4. Add reminder templates and schedule handling.
5. Build log timeline + 2 mini charts (rain, completion).
6. Add empty states and success toasts.
7. Test with a “5-minute real use” checklist.

## 9) Usability acceptance checklist

- Can a new user add a task in under 10 seconds?
- Can reminders be created without reading help text?
- Can a log be entered in under 8 seconds?
- Can user identify overdue tasks in under 3 seconds?
- Can user read main status from 1 meter away?

---

If we follow this plan, the app stays simple: **do tasks, get reminders, log events, and see status visually** without clutter.
