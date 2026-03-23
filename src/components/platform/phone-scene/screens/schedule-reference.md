# Schedule Screen — iOS Source Reference

Visual layout specs extracted from actual iOS SwiftUI code.
Used by `schedule-screen.ts` to match the real app.

## Header (AppHeader.swift — schedule case)

- Title: "SCHEDULE" — `OPSStyle.Typography.title`, primaryText
- Subtitle: HStack(spacing: 8) → "TODAY" | "|" | "March 19" — `caption`, secondaryText
- 4 toolbar buttons, each 44×44pt circle, `cardBackground` fill, 8pt spacing:
  1. `calendar` (month toggle)
  2. `line.3.horizontal.decrease.circle` (filter)
  3. `person.2` / `person` (scope toggle)
  4. `magnifyingglass` (search)
- Horizontal padding: 20pt

## Week Strip (CalendarDaySelector + WeekDayCell)

- **Container**: single rounded rect, `cardBackgroundDark`, `cornerRadius` (OPSStyle)
- Vertical padding: 12pt, horizontal padding: 6pt
- **WeekDayCell** (per day): 86pt height
  - VStack(spacing: 2):
    - Day abbreviation — `caption` font, today=primaryText, others=secondaryText
    - Day number — `buttonLarge` font, primaryText
    - Spacer (reserved for spanning bars)
  - padding top: 4pt, horizontal: 4pt per cell
  - cornerRadius: 4pt per cell
  - **Today**: background `primaryAccent.opacity(0.15)` — subtle blue tint
  - **Selected**: 1pt border of primaryText (rounded rect overlay)
  - **Past days**: 0.55 opacity
- **Spanning bars**: colored event bars below day cells (3pt h, 2pt gap, max 4 rows)
- "+N" overflow text below bars

## Day Header (DayCanvasView — dayHeader)

- HStack:
  - Left VStack(spacing: 2):
    - Weekday: "MONDAY" — `headingBold`, primaryText
    - Date: "MARCH 16, 2026" — `smallCaption`, secondaryText, uppercase
  - Spacer
  - Right: "[ EVENTS — N ]" — `smallCaption`, primaryText
    - padding: h=8, v=4
    - background: cardBackgroundDark
    - border: white 0.10 opacity, 0.5pt, cornerRadius 2
- Padding: h=20, top=8, bottom=12

## Task Card (CalendarEventCard)

- **Fixed height**: 64pt
- **Layout**: HStack(spacing: 0)
  - Left: color stripe — 4pt width, `displayColor` fill
  - Content: VStack(spacing: 5, leading)
    - Project title: `bodyEmphasis`, primaryText, uppercase, lineLimit 1
    - Client: `smallCaption`, secondaryText, lineLimit 1
    - Address: `microLabel`, primaryText.opacity(0.45), lineLimit 1
  - Content padding: leading 14, trailing 14, vertical 14
- **Background**: `cardBackgroundDark`
- **Border**: white 0.10 opacity, 0.5pt, cornerRadius 2
- **Row padding**: vertical 4pt, horizontal 20pt (leading + trailing)

### Task Type Badge (top-right overlay)
- Text: taskType uppercased — `miniLabel` font
- Color: displayColor (text AND border tint)
- Background: displayColor.opacity(0.12), roundedRect r=2
- Border: displayColor.opacity(0.35), 0.5pt
- Padding: h=7, v=3
- Offset: top 18pt (4+14), trailing 34pt

### Completed Badge (bottom-right overlay)
- Text: "COMPLETED" — `captionBold`, primaryText
- Background: statusColor(.completed) fill, roundedRect r=2
- Padding: h=8, v=4
- Offset: bottom 12pt (4+8), trailing 34pt

### Completed Card Dimming
- Overlay: `modalOverlay` color covers full card
- Applied when task.status == .completed || .cancelled
