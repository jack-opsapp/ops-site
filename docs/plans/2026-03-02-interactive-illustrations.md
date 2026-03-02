# Interactive Platform Illustrations — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add post-animation interactivity to all 9 platform feature illustrations so visitors go "WOW" and explore more of the site.

**Architecture:** Each illustration already uses `useIllustration(phaseCount)` which returns `{ ref, phase, replay }`. We add an `interactive` boolean that flips true when the final phase completes. After that, hover/drag/click behaviors unlock. All interactions use Framer Motion (already installed) except Photo Markup which adds a Canvas overlay for freehand drawing. Each illustration is self-contained in `PlatformIllustrations.tsx`.

**Tech Stack:** Framer Motion 12 (drag, Reorder, layout, springs), Canvas 2D API (Photo Markup + Inventory), CSS 3D transforms (Client flip)

---

## Task 1: Shared Infrastructure — `useIllustration` + Interaction Hint

**Files:**
- Modify: `src/components/platform/PlatformIllustrations.tsx:34-107`

**Step 1: Update `useSequence` to expose `interactive` state**

Add `interactive` boolean that becomes true when animation completes. Modify lines 34-69:

```tsx
function useSequence(phaseCount: number, intervalMs = 380) {
  const [phase, setPhase] = useState(-1);
  const [interactive, setInteractive] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isPlayingRef = useRef(false);

  const play = useCallback(() => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;
    setInteractive(false);
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase(-1);

    timersRef.current.push(
      setTimeout(() => {
        for (let i = 0; i < phaseCount; i++) {
          timersRef.current.push(
            setTimeout(() => {
              setPhase(i);
              if (i === phaseCount - 1) {
                setTimeout(() => {
                  isPlayingRef.current = false;
                  setInteractive(true);
                }, 500);
              }
            }, i * intervalMs),
          );
        }
      }, 120),
    );
  }, [phaseCount, intervalMs]);

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  return { phase, play, interactive };
}
```

**Step 2: Update `useIllustration` to pass through `interactive`**

```tsx
function useIllustration(phaseCount: number, intervalMs = 380) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const { phase, play, interactive } = useSequence(phaseCount, intervalMs);
  const hasPlayed = useRef(false);

  useEffect(() => {
    if (inView && !hasPlayed.current) {
      hasPlayed.current = true;
      play();
    }
  }, [inView, play]);

  return { ref, phase, replay: play, interactive };
}
```

**Step 3: Add `InteractionHint` component**

Add after the Container component (~line 107):

```tsx
function InteractionHint({
  type,
  visible
}: {
  type: 'drag' | 'hover' | 'click' | 'draw';
  visible: boolean;
}) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !visible) return null;

  const icons: Record<string, string> = {
    drag: '⤭', hover: '◎', click: '◉', draw: '✎',
  };

  return (
    <motion.div
      className="absolute bottom-3 right-3 flex items-center gap-1.5 pointer-events-none select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.4 }}
      transition={{ delay: 1, duration: 0.6 }}
      onAnimationComplete={() => {
        setTimeout(() => setDismissed(true), 4000);
      }}
    >
      <span className="text-xs font-body text-white/40">{icons[type]}</span>
      <span className="text-[8px] font-body uppercase tracking-wider text-white/30">{type}</span>
    </motion.div>
  );
}
```

**Step 4: Update Container to support relative positioning for hints**

```tsx
function Container({
  children,
  innerRef,
  onHover,
}: {
  children: React.ReactNode;
  innerRef: React.RefObject<HTMLDivElement | null>;
  onHover?: () => void;
}) {
  return (
    <div
      ref={innerRef}
      onMouseEnter={onHover}
      className="relative w-full aspect-[4/3] bg-gradient-to-br from-ops-surface to-[#080808] border border-ops-border rounded-[3px] overflow-hidden flex items-center justify-center transition-colors duration-300 hover:border-ops-border-hover"
    >
      {children}
    </div>
  );
}
```

Note: only change is adding `relative` to className.

**Step 5: Verify build**

Run: `npx next build`
Expected: Clean build, no errors. All illustrations unchanged visually.

**Step 6: Commit**

```
feat: add interactive state to useIllustration + InteractionHint component
```

---

## Task 2: Pipeline — Hover "What If" Conversion

**Files:**
- Modify: `src/components/platform/PlatformIllustrations.tsx` (PipelineIllustration, ~line 740)

**Overview:** When `interactive` is true, hovering a funnel bar expands it and all bars below to show "what if 100% conversion" at that stage. Dollar values animate. Ghost bars vanish. Bottom summary updates.

**Step 1: Add interactive state**

In `PipelineIllustration`, destructure `interactive` from `useIllustration`. Add hover state:

```tsx
const { ref, phase: p, replay, interactive } = useIllustration(8, 400);
const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
```

**Step 2: Compute "what if" widths and values**

Add after stages array:

```tsx
// When hovering stage i, all stages i..end expand to stage i's width
// and values scale proportionally
const getInteractiveWidth = (stageIdx: number) => {
  if (!interactive || hoveredIdx === null || stageIdx < hoveredIdx) return stages[stageIdx].width;
  return stages[hoveredIdx].width;
};

const getInteractiveValue = (stageIdx: number) => {
  if (!interactive || hoveredIdx === null || stageIdx < hoveredIdx) return stages[stageIdx].value;
  // Scale value proportionally to the hovered stage
  const ratio = stages[hoveredIdx].width / stages[stageIdx].width;
  const baseNum = parseInt(stages[stageIdx].value.replace(/[$K]/g, ''));
  return `$${Math.round(baseNum * ratio)}K`;
};
```

**Step 3: Make bar fills respond to hover**

Replace the bar fills section. Each bar rect gets `onMouseEnter`/`onMouseLeave` when interactive:

```tsx
{stages.map((stage, i) => (
  <motion.rect
    key={`fill-${i}`}
    x={barX} y={startY + i * rowH}
    height={barH} rx="3"
    fill={stage.color} stroke={stage.stroke} strokeWidth="1"
    style={{
      transformOrigin: `${barX}px ${startY + i * rowH + barH / 2}px`,
      cursor: interactive ? 'pointer' : 'default',
    }}
    animate={{
      scaleX: p >= 2 + i ? 1 : 0,
      opacity: p >= 2 + i ? 1 : 0,
      width: getInteractiveWidth(i),
    }}
    transition={{
      duration: 0.6,
      ease: drawEase,
      width: { type: 'spring', stiffness: 300, damping: 20 },
    }}
    filter={i === 4 && p >= 6 ? 'url(#accentGlow)' : undefined}
    onMouseEnter={() => interactive && setHoveredIdx(i)}
    onMouseLeave={() => interactive && setHoveredIdx(null)}
  />
))}
```

**Step 4: Hide ghost bars on hover, animate analytics values**

Ghost bars: add `opacity: hoveredIdx !== null ? 0 : 1` transition.

Analytics values: replace `stage.value` with `getInteractiveValue(i)`.

Hide lost text when hovered: `{stage.lost && hoveredIdx === null && (...)}`.

**Step 5: Update bottom summary on hover**

When `hoveredIdx !== null`, swap WON amount to the hovered stage's value and LEFT ON TABLE to "$0":

```tsx
<text ...>
  {hoveredIdx !== null ? getInteractiveValue(4) : '$96K'}
</text>
...
<text ... fill={hoveredIdx !== null ? 'rgba(46,160,67,0.6)' : 'rgba(229,77,46,0.6)'}>
  {hoveredIdx !== null ? '$0' : '$384K'}
</text>
```

**Step 6: Add InteractionHint**

After the SVG closing tag, before Container closing:

```tsx
<InteractionHint type="hover" visible={interactive} />
```

**Step 7: Verify build + test in browser**

Run: `npx next build && npx next dev`
Test: Navigate to /platform, scroll to Pipeline. After animation, hover bars. Bars should expand with spring physics. Values update. Ghost bars vanish.

**Step 8: Commit**

```
feat: pipeline hover "what if" conversion interaction
```

---

## Task 3: Photo Markup — Draw on the Deck

**Files:**
- Modify: `src/components/platform/PlatformIllustrations.tsx` (PhotoMarkupIllustration, ~line 1038)

**Overview:** After animation, a Canvas overlay appears. User draws freehand red strokes with glow. Mini toolbar with pen/eraser/clear.

**Step 1: Add Canvas ref and drawing state**

```tsx
const canvasRef = useRef<HTMLCanvasElement>(null);
const isDrawing = useRef(false);
const lastPoint = useRef<{ x: number; y: number } | null>(null);
const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
const [hasDrawn, setHasDrawn] = useState(false);
```

**Step 2: Add drawing handlers**

```tsx
const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent) => {
  const canvas = canvasRef.current;
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
  return {
    x: (clientX - rect.left) / rect.width * 400,
    y: (clientY - rect.top) / rect.height * 300,
  };
};

const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
  if (!interactive) return;
  isDrawing.current = true;
  lastPoint.current = getCanvasPoint(e);
  setHasDrawn(true);
};

const draw = (e: React.MouseEvent | React.TouchEvent) => {
  if (!isDrawing.current || !canvasRef.current) return;
  const ctx = canvasRef.current.getContext('2d')!;
  const point = getCanvasPoint(e);
  if (!point || !lastPoint.current) return;

  if (tool === 'pen') {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#E54D2E';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#E54D2E';
    ctx.shadowBlur = 6;
  } else {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 0;
  }

  ctx.beginPath();
  ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
  ctx.lineTo(point.x, point.y);
  ctx.stroke();
  ctx.shadowBlur = 0;

  lastPoint.current = point;
};

const stopDraw = () => {
  isDrawing.current = false;
  lastPoint.current = null;
};

const clearCanvas = () => {
  const ctx = canvasRef.current?.getContext('2d');
  if (ctx) ctx.clearRect(0, 0, 400, 300);
  setHasDrawn(false);
};
```

**Step 3: Add Canvas overlay + toolbar in JSX**

After the SVG tag, inside Container:

```tsx
{interactive && (
  <>
    <canvas
      ref={canvasRef}
      width={400}
      height={300}
      className="absolute inset-0 w-full h-full cursor-crosshair"
      style={{ touchAction: 'none' }}
      onMouseDown={startDraw}
      onMouseMove={draw}
      onMouseUp={stopDraw}
      onMouseLeave={stopDraw}
      onTouchStart={startDraw}
      onTouchMove={draw}
      onTouchEnd={stopDraw}
    />
    <motion.div
      className="absolute bottom-3 left-3 flex gap-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      {(['pen', 'eraser'] as const).map((t) => (
        <button
          key={t}
          onClick={() => setTool(t)}
          className={`px-2 py-1 text-[8px] font-body uppercase tracking-wider rounded-sm border transition-colors ${
            tool === t
              ? 'bg-[#E54D2E]/20 border-[#E54D2E]/40 text-[#E54D2E]'
              : 'bg-white/5 border-white/10 text-white/30 hover:text-white/50'
          }`}
        >
          {t}
        </button>
      ))}
      {hasDrawn && (
        <button
          onClick={clearCanvas}
          className="px-2 py-1 text-[8px] font-body uppercase tracking-wider rounded-sm border bg-white/5 border-white/10 text-white/30 hover:text-white/50 transition-colors"
        >
          clear
        </button>
      )}
    </motion.div>
  </>
)}
<InteractionHint type="draw" visible={interactive && !hasDrawn} />
```

**Step 4: Disable Container hover replay when drawing**

Change Container `onHover` to only fire when not interactive:

```tsx
<Container innerRef={ref} onHover={interactive ? undefined : replay}>
```

**Step 5: Build + test**

Run: `npx next build && npx next dev`
Test: Scroll to Photo Markup. After animation, draw on the deck with cursor. Red glowing strokes appear. Try eraser. Try clear.

**Step 6: Commit**

```
feat: photo markup freehand drawing canvas interaction
```

---

## Task 4: Project Management — Drag to Reorder Tasks

**Files:**
- Modify: `src/components/platform/PlatformIllustrations.tsx` (ProjectManagementIllustration, ~line 127)

**Overview:** After animation, task rows become draggable along y-axis. Reorder with spring physics using Framer Motion `Reorder`.

**Step 1: Add import**

Add to the imports at line 16:
```tsx
import { motion, useInView, Reorder } from 'framer-motion';
```

**Step 2: Add task order state**

```tsx
const { ref, phase: p, replay, interactive } = useIllustration(8);
const [taskOrder, setTaskOrder] = useState([0, 1, 2, 3]);
```

**Step 3: Wrap task rows in Reorder.Group**

The current task rows are rendered as SVG rects+text. Since Framer Motion `Reorder` works on DOM elements (not SVG), we need a hybrid approach: keep the SVG background but overlay HTML div task rows when interactive.

When `interactive`, render an absolutely positioned HTML overlay with the tasks as Reorder items, styled to match the SVG positions. When not interactive, render the original SVG tasks.

```tsx
{interactive && (
  <Reorder.Group
    axis="y"
    values={taskOrder}
    onReorder={setTaskOrder}
    className="absolute inset-0 flex flex-col justify-center px-[18%] gap-[2%]"
    style={{ paddingTop: '28%' }}
  >
    {taskOrder.map((idx) => {
      const task = tasks[idx];
      return (
        <Reorder.Item
          key={idx}
          value={idx}
          className="flex items-center gap-2 px-3 py-2 rounded-sm border cursor-grab active:cursor-grabbing"
          style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderColor: 'rgba(255,255,255,0.08)',
          }}
          whileDrag={{
            scale: 1.03,
            borderColor: 'rgba(89,119,148,0.4)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            zIndex: 50,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: task.color }}
          />
          <span className="text-[10px] font-heading text-white/40">
            {task.label}
          </span>
          <span className="ml-auto text-[8px] font-body text-white/20">
            {task.status}
          </span>
        </Reorder.Item>
      );
    })}
  </Reorder.Group>
)}
```

The `tasks` array should be defined alongside the existing stage data. Extract the labels and colors from the current SVG text elements.

**Step 4: Add InteractionHint**

```tsx
<InteractionHint type="drag" visible={interactive} />
```

**Step 5: Build + test**

**Step 6: Commit**

```
feat: project management drag-to-reorder task interaction
```

---

## Task 5: Client Management — 3D Flip Card

**Files:**
- Modify: `src/components/platform/PlatformIllustrations.tsx` (ClientManagementIllustration, ~line 447)

**Overview:** After animation, clicking the contact card flips it 180° on the Y axis, revealing project history on the back.

**Step 1: Add flip state**

```tsx
const { ref, phase: p, replay, interactive } = useIllustration(7);
const [flipped, setFlipped] = useState(false);
```

**Step 2: Wrap the contact card SVG in a flip container**

Since CSS 3D transforms don't work on SVG elements, use a foreignObject or an HTML overlay approach. Recommended: overlay an HTML div when interactive.

When `interactive`, render an absolutely positioned div with CSS 3D flip:

```tsx
{interactive && (
  <div
    className="absolute inset-0 flex items-center justify-center cursor-pointer"
    style={{ perspective: '800px' }}
    onClick={() => setFlipped(!flipped)}
  >
    <motion.div
      className="w-[55%] h-[60%]"
      style={{ transformStyle: 'preserve-3d' }}
      animate={{ rotateY: flipped ? 180 : 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Front face — matches SVG contact card */}
      <div
        className="absolute inset-0 rounded-sm border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-4 flex flex-col justify-center"
        style={{ backfaceVisibility: 'hidden' }}
      >
        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 mb-3" />
        <div className="text-[11px] font-heading font-bold text-white/50">JOHNSON RESIDENCE</div>
        <div className="text-[9px] font-body text-white/25 mt-1">Mike Johnson</div>
        <div className="text-[8px] font-body text-white/15 mt-0.5">(555) 234-5678</div>
        <div className="flex gap-2 mt-3">
          <div className="px-2 py-0.5 text-[7px] font-body uppercase rounded-sm bg-[#597794]/15 text-[#597794]/60 border border-[#597794]/20">3 projects</div>
          <div className="px-2 py-0.5 text-[7px] font-body uppercase rounded-sm bg-white/5 text-white/25 border border-white/8">active</div>
        </div>
      </div>
      {/* Back face — project history */}
      <div
        className="absolute inset-0 rounded-sm border border-[#597794]/30 bg-gradient-to-br from-[#597794]/[0.08] to-transparent p-4 flex flex-col justify-center"
        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
      >
        <div className="text-[9px] font-body uppercase tracking-wider text-[#597794]/60 mb-2">Project History</div>
        {['Kitchen Remodel — $24K', 'Deck Build — $18K', 'Bathroom — $12K'].map((p, i) => (
          <div key={i} className="flex items-center gap-2 py-1 border-b border-white/5 last:border-0">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500/40" />
            <span className="text-[8px] font-body text-white/35">{p}</span>
          </div>
        ))}
        <div className="mt-3 text-[8px] font-body text-white/20">Last contact: 2 days ago</div>
        <div className="text-[8px] font-body text-white/15 italic mt-1">"Wants quote for fence"</div>
      </div>
    </motion.div>
  </div>
)}
```

**Step 3: Hide SVG card when flipped**

Add `opacity: interactive && flipped ? 0 : 1` to the SVG card group.

**Step 4: Add InteractionHint**

```tsx
<InteractionHint type="click" visible={interactive} />
```

**Step 5: Build + test**

**Step 6: Commit**

```
feat: client management 3D flip card interaction
```

---

## Task 6: Invoicing — Swipe to Convert

**Files:**
- Modify: `src/components/platform/PlatformIllustrations.tsx` (InvoicingIllustration, ~line 543)

**Overview:** After animation, drag the estimate document rightward. As you drag, it morphs into an invoice: header changes, SENT stamp appears, amounts turn green. Release past 50% to complete.

**Step 1: Add drag + conversion state**

```tsx
const { ref, phase: p, replay, interactive } = useIllustration(6, 420);
const [dragX, setDragX] = useState(0);
const [converted, setConverted] = useState(false);
const dragProgress = Math.min(Math.max(dragX / 120, 0), 1); // 0-1 over 120px
```

**Step 2: Add drag overlay when interactive**

Use an HTML overlay with `motion.div` that has `drag="x"` and `dragConstraints`:

```tsx
{interactive && !converted && (
  <motion.div
    className="absolute inset-0 cursor-grab active:cursor-grabbing"
    drag="x"
    dragConstraints={{ left: 0, right: 150 }}
    dragElastic={0.1}
    style={{ x: dragX }}
    onDrag={(_, info) => setDragX(info.offset.x)}
    onDragEnd={(_, info) => {
      if (info.offset.x > 60) {
        setConverted(true);
      }
      setDragX(0);
    }}
  />
)}
```

**Step 3: Morph SVG elements based on `dragProgress` and `converted`**

- Invoice header text: crossfade opacity based on `dragProgress`
- Dollar amount: interpolate fill from white to green
- Progress bar at bottom of document
- When `converted`: show SENT stamp with rotation, confetti accent burst

The specifics depend on the current SVG structure of InvoicingIllustration. The implementation should read the current SVG elements and apply:
- `opacity: 1 - dragProgress` on "ESTIMATE" text
- `opacity: dragProgress` on "INVOICE" text overlay
- `fill` interpolation on amount text
- SENT stamp as a rotated rect+text that fades in

**Step 4: Add InteractionHint + commit**

```
feat: invoicing swipe-to-convert estimate interaction
```

---

## Task 7: Scheduling — Drag Blocks Between Slots

**Files:**
- Modify: `src/components/platform/PlatformIllustrations.tsx` (SchedulingIllustration, ~line 240)

**Overview:** After animation, schedule blocks become draggable within the calendar grid. Drop on a different slot to reschedule.

**Implementation approach:** Overlay HTML draggable elements positioned to match SVG grid cells. Each block is a `motion.div` with `drag` and snap-to-grid logic. On drop, compute nearest grid cell from pointer position and snap.

Key implementation details:
- Calculate grid cell positions from the SVG constants (startX, startY, colW, rowH)
- Map pixel coordinates to grid cell indices
- Snap animation: `transition={{ type: 'spring', stiffness: 400, damping: 25 }}`
- Ghost outline: render a faded copy at original position during drag
- Swap: if target cell is occupied, animate both blocks to swapped positions

**Commit:** `feat: scheduling drag-to-reschedule interaction`

---

## Task 8: Team Management — Drag Crew Between Jobs

**Files:**
- Modify: `src/components/platform/PlatformIllustrations.tsx` (TeamManagementIllustration, ~line 351)

**Overview:** After animation, crew avatar circles become draggable between job assignment rows.

**Implementation approach:** Similar overlay pattern. Crew dots become `motion.div` circles with `drag` enabled. On drop near a different job row, the avatar animates to that row. Source/target crew counts animate with a spring counter.

Key implementation details:
- Avatar lift: `whileDrag={{ scale: 1.2, boxShadow: '0 0 20px rgba(89,119,148,0.3)' }}`
- Drop zone detection: check pointer Y against job row boundaries
- Animated counter: interpolate number values with spring physics
- Accent ring on recently moved avatar: 2s timeout

**Commit:** `feat: team management drag-crew interaction`

---

## Task 9: Job Board — Drag Cards Between Columns

**Files:**
- Modify: `src/components/platform/PlatformIllustrations.tsx` (JobBoardIllustration, ~line 632)

**Overview:** After animation, kanban cards become draggable between columns.

**Implementation approach:** HTML overlay with three columns. Cards are `motion.div` elements with `drag` enabled. Use Framer Motion `layoutId` for smooth cross-column animations. On drop, determine target column from pointer X position.

Key implementation details:
- Card tilt during drag: `rotate: velocity.x * 0.05` (±3° based on drag velocity)
- Layout animation on source column: remaining cards close gap
- Target column: cards spread apart when hovering with card, header pulses accent
- Drop: spring snap into column

**Commit:** `feat: job board drag-between-columns interaction`

---

## Task 10: Inventory — Physics Gravity Tumble

**Files:**
- Modify: `src/components/platform/PlatformIllustrations.tsx` (InventoryIllustration, ~line 891)

**Overview:** After animation, clicking triggers gravity simulation. Items tumble, bounce, settle. RESTOCK button springs them back.

**Step 1: Add physics state and canvas ref**

```tsx
const canvasRef = useRef<HTMLCanvasElement>(null);
const [tumbled, setTumbled] = useState(false);
const [restocked, setRestocked] = useState(false);
const physicsItems = useRef<PhysicsItem[]>([]);
const animFrameRef = useRef<number>(0);
```

**Step 2: Define PhysicsItem type and simulation**

```tsx
interface PhysicsItem {
  x: number; y: number;       // position
  vx: number; vy: number;     // velocity
  targetX: number; targetY: number; // grid position for restock
  w: number; h: number;       // size
  color: string;
  rotation: number;
  vr: number;                 // rotational velocity
}
```

Physics loop:
- Gravity: `vy += 0.5` per frame
- Floor collision at y=280: `vy *= -0.4` (damping bounce), `vx *= 0.8` (friction)
- Wall collision at x=0 and x=400
- Item-to-item: simple AABB overlap push
- Draw each item as a rounded rect with rotation

**Step 3: Tumble trigger**

On click when interactive: initialize physics items from grid positions, give each a random `vx` and upward `vy`, start `requestAnimationFrame` loop.

**Step 4: Restock trigger**

On RESTOCK click: for each item, animate from current position back to `targetX, targetY` using spring interpolation (not physics). Stagger by 50ms per item.

**Step 5: Canvas overlay + button**

```tsx
{interactive && (
  <>
    <canvas
      ref={canvasRef}
      width={400}
      height={300}
      className="absolute inset-0 w-full h-full"
      style={{ cursor: tumbled ? 'default' : 'pointer' }}
      onClick={() => !tumbled && triggerTumble()}
    />
    {tumbled && !restocked && (
      <motion.button
        className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 text-[9px] font-heading uppercase tracking-wider rounded-sm border border-[#597794]/40 bg-[#597794]/15 text-[#597794] hover:bg-[#597794]/25 transition-colors"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5, ...spring }}
        onClick={triggerRestock}
      >
        RESTOCK
      </motion.button>
    )}
  </>
)}
<InteractionHint type="click" visible={interactive && !tumbled} />
```

**Step 6: Build + test + commit**

```
feat: inventory physics gravity tumble interaction
```

---

## Execution Order (Recommended)

1. **Task 1** — Infrastructure (blocks all others)
2. **Task 2** — Pipeline hover (easiest, fastest win)
3. **Task 3** — Photo Markup draw (most unique)
4. **Task 5** — Client flip (self-contained)
5. **Task 4** — Project Management drag (introduces Reorder pattern)
6. **Task 6** — Invoicing swipe (medium complexity)
7. **Task 7** — Scheduling drag (grid snap logic)
8. **Task 8** — Team Management drag (similar to scheduling)
9. **Task 9** — Job Board drag (similar, cross-column)
10. **Task 10** — Inventory physics (most complex, do last)

Tasks 2-10 are independent of each other and can be parallelized after Task 1.
