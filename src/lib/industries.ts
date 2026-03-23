// src/lib/industries.ts

// --- Types ---

export type FlowDirection = 'left-to-right' | 'top-to-bottom' | 'right-to-left';
export type WireframeVariant = 'messages' | 'dashboard' | 'apps';
export type DeviceType = 'phone' | 'laptop' | 'tablet' | 'desktop';

export interface IndustryContent {
  meta: {
    title: string;
    description: string;
    keywords: string[];
  };
  hero: {
    sectionLabel: string;
    headline: string;
    subtext: string;
  };
  painPoints: Array<{
    title: string;
    bullets: string[];
    forLine: string;
  }>;
  solutions: Array<{
    title: string;
    copy: string;
    painPointRef: number;
  }>;
  comparison: {
    competitors: [string, string];
    rows: Array<{
      feature: string;
      ops: boolean | string;
      comp1: boolean | string;
      comp2: boolean | string;
    }>;
  };
  faq: Array<{
    question: string;
    answer: string;
  }>;
  cta: {
    headline: string;
    subtext: string;
  };
}

export interface IndustryData {
  slug: string;
  name: string;
  painPointConfig: Array<{
    variant: WireframeVariant;
  }>;
  solutionConfig: Array<{
    deviceType: DeviceType;
    flowDirection: FlowDirection;
  }>;
  content: {
    en: IndustryContent;
    es?: IndustryContent;
  };
}

// --- Universal FAQ (shared across all industries) ---

export const universalFAQ: { en: Array<{ question: string; answer: string }>; es: Array<{ question: string; answer: string }> } = {
  en: [
    {
      question: 'What does OPS cost?',
      answer: 'OPS is free to get started with full access to core features including scheduling, crew management, and project tracking. No credit card required. Paid plans unlock advanced features like analytics and priority support.',
    },
    {
      question: 'How do I get started with OPS?',
      answer: 'Download OPS from the App Store, create your account in under a minute, and start adding jobs immediately. No training required — your crew opens the app and knows what to do.',
    },
    {
      question: 'What devices does OPS work on?',
      answer: 'OPS is available on iPhone and iPad with an Android version in development. The app works offline so your crew can use it on job sites with no cell signal.',
    },
  ],
  es: [
    {
      question: '¿Cuánto cuesta OPS?',
      answer: 'OPS es gratis para comenzar con acceso completo a funciones principales. No se requiere tarjeta de crédito. Los planes pagados desbloquean funciones avanzadas.',
    },
    {
      question: '¿Cómo empiezo con OPS?',
      answer: 'Descarga OPS desde la App Store, crea tu cuenta en menos de un minuto y comienza a agregar trabajos de inmediato. Sin necesidad de entrenamiento.',
    },
    {
      question: '¿En qué dispositivos funciona OPS?',
      answer: 'OPS está disponible en iPhone y iPad con una versión de Android en desarrollo. La app funciona sin conexión.',
    },
  ],
};

// --- Industry Data ---

export const industries: IndustryData[] = [
  // ─── Landscaping ───────────────────────────────────────────────────────
  {
    slug: 'landscaping',
    name: 'Landscaping',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left-to-right' },
      { deviceType: 'laptop', flowDirection: 'top-to-bottom' },
      { deviceType: 'tablet', flowDirection: 'right-to-left' },
      { deviceType: 'desktop', flowDirection: 'left-to-right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Landscaping Crew & Job Management App | OPS',
          description: 'Run your landscaping crews without the chaos. Scheduling, job tracking, and crew communication — built for landscape contractors.',
          keywords: [
            'landscaping business software',
            'lawn care crew scheduling app',
            'landscaping job management software',
            'landscape contractor app',
            'lawn care business management app',
            'landscaping scheduling software',
            'landscape crew tracking app',
            'lawn care company software',
            'landscaping field service software',
            'landscape estimating and scheduling app',
          ],
        },
        hero: {
          sectionLabel: 'For Landscaping Companies',
          headline: 'RUN YOUR CREWS.\nNOT YOUR PHONE.',
          subtext: "Every morning you're dispatching 3 crews, answering the same questions by text, and hoping everyone shows up to the right property. OPS puts your schedule, job notes, and crew assignments in one place — so your foremen lead, not wait.",
        },
        painPoints: [
          {
            title: 'Your schedule lives in too many places',
            bullets: [
              'Route changes texted to 6 different numbers every morning',
              'Crew shows up to a job that got cancelled yesterday',
              'Foreman calls asking for the gate code you already sent twice',
              'Last-minute rain days blow up the whole week with no easy way to rebuild it',
            ],
            forLine: 'For: Owner-operators and office managers running 2\u201310 crews',
          },
          {
            title: "No one knows what's actually done in the field",
            bullets: [
              'Jobs marked "done" by text — no photos, no proof, no timestamps',
              "Clients call to complain about something you can't verify",
              'Mulch and materials get used with zero accountability',
              "End of week you're reconstructing hours from memory",
            ],
            forLine: 'For: Landscape contractors managing maintenance routes and install crews simultaneously',
          },
          {
            title: "Spring slams you every year — and you're never ready",
            bullets: [
              'Crew count doubles in April and onboarding is pure chaos',
              "New hires don't know property layouts, client preferences, or where the equipment lives",
              "Estimates piling up while you're too deep in operations to quote new work",
              'Equipment breakdowns during peak season with no documented service history',
            ],
            forLine: 'For: Seasonal landscaping companies scaling from 5 to 20+ crew members',
          },
        ],
        solutions: [
          {
            title: 'One schedule. Every crew. Real time.',
            copy: "Build your week on a drag-and-drop board, assign jobs to specific crews, and push updates instantly. When it rains Thursday, reschedule everything in minutes — not an hour of texts. Your foremen see their route the moment you publish it, and gate codes, site notes, and client instructions travel with the job, not in your head.",
            painPointRef: 0,
          },
          {
            title: 'Field crews check in. You see everything.',
            copy: 'Every job close includes a photo, a timestamp, and a status — completed, skipped, issue flagged. No more he-said she-said with clients. No more guessing whether the crew hit that property before 3pm. Material usage logs to the job automatically so you know exactly where your mulch and fertilizer went at the end of the month.',
            painPointRef: 1,
          },
          {
            title: 'New crew member. Day-one ready.',
            copy: "Every property in OPS carries its full history — mow height preference, chemical sensitivities, gate codes, parking notes, photos of the last service. A new hire opens the app and knows what to do before their boots hit the turf. Stop briefing the same properties every spring. Let the app carry the institutional knowledge your foremen currently hold in their heads.",
            painPointRef: 2,
          },
          {
            title: 'Equipment tracked. Surprises cut.',
            copy: "Log service dates, attach photos of damage, and flag equipment that needs attention before it fails mid-season. When a mower goes down on a Monday morning, you know which backup is available and which crew can absorb the route. No more losing a full day because the shop didn't know the zero-turn had been running rough for two weeks.",
            painPointRef: 2,
          },
        ],
        comparison: {
          competitors: ['Jobber', 'LMN'],
          rows: [
            { feature: 'Mobile-first crew app', ops: true, comp1: 'Limited', comp2: false },
            { feature: 'Real-time job status from field', ops: true, comp1: true, comp2: 'Add-on' },
            { feature: 'Per-job photo & timestamp logs', ops: true, comp1: true, comp2: false },
            { feature: 'Offline mode for no-signal sites', ops: true, comp1: false, comp2: false },
            { feature: 'Built-in crew messaging', ops: true, comp1: 'Limited', comp2: false },
            { feature: 'Starting price', ops: 'Free to start', comp1: '$49/mo', comp2: '$298/mo' },
          ],
        },
        faq: [
          {
            question: 'What is the best app for managing a landscaping crew?',
            answer: "The best landscaping crew management app is one your crew will actually use in the field — which means it has to work offline, load fast on a phone in direct sunlight, and not require a two-hour training session. OPS is built specifically for field crews: foremen get a clean daily schedule, can check in on arrival, close jobs with photos, and flag issues — all without needing to call the office. It syncs in real time so the owner or office manager always knows where jobs stand.",
          },
          {
            question: 'How do I schedule multiple landscaping crews without the chaos?',
            answer: "Scheduling multiple landscape crews gets chaotic when your schedule lives in texts, a whiteboard, or a spreadsheet. The fix is a centralized schedule where every crew sees only their jobs, changes push instantly to everyone's phone, and you can drag-and-drop a full day's work when rain forces a reschedule. OPS lets you build routes by crew, attach site notes and gate codes to each job, and publish updates in seconds — so your morning dispatch takes five minutes, not forty-five.",
          },
          {
            question: 'Can landscaping software work without cell service?',
            answer: 'Yes — OPS works fully offline. Crews in rural properties, gated communities with dead zones, or commercial sites with poor signal can still check in, view job details, log materials, take photos, and close jobs. Everything syncs automatically the moment a connection is available. This is one of the most common complaints landscaping crews have with office-first software like QuickBooks or Aspire: the field app falls apart without reliable cell service.',
          },
          {
            question: 'How do small landscaping companies compete with larger operations?',
            answer: "Small and mid-size landscaping companies — typically running 2 to 10 crews — compete on responsiveness, quality, and local reputation. The problem is that most of their operational edge gets eaten up by manual scheduling, scattered communication, and time spent chasing down job status. With OPS, a 5-person operation can run with the same visibility and field accountability as a 50-person company. Your crews look professional, your clients get photo proof of service, and you're not playing phone tag all day.",
          },
          {
            question: 'Is there landscaping software that handles seasonal crew scaling?',
            answer: "Seasonal scaling is one of the hardest operational problems for landscaping businesses — crew count can triple between March and May, and every new hire needs to get up to speed on dozens of properties fast. OPS handles this by attaching all property knowledge directly to the job: mow height, gate codes, client notes, photos from previous visits. New crew members are field-ready on day one. Adding them to the system takes under a minute, and you can adjust crew assignments as your headcount changes throughout the season.",
          },
        ],
        cta: {
          headline: 'STOP DISPATCHING BY TEXT.',
          subtext: 'Set up your first crew schedule in under 10 minutes. No training, no contracts, no per-user pricing that punishes you for growing.',
        },
      },
    },
  },

  // ─── Auto Detailing ────────────────────────────────────────────────────
  {
    slug: 'auto-detailing',
    name: 'Auto Detailing',
    painPointConfig: [
      { variant: 'dashboard' },
      { variant: 'messages' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'top-to-bottom' },
      { deviceType: 'laptop', flowDirection: 'right-to-left' },
      { deviceType: 'tablet', flowDirection: 'left-to-right' },
      { deviceType: 'desktop', flowDirection: 'top-to-bottom' },
    ],
    content: {
      en: {
        meta: {
          title: 'Auto Detailing Business Software | OPS',
          description: 'Run your detailing business from your phone. Scheduling, invoicing, before/after photos, and no-show protection — built for mobile and shop detailers.',
          keywords: [
            'auto detailing scheduling software',
            'mobile detailing business software',
            'car detailing CRM',
            'detailing business app',
            'auto detailing invoicing app',
            'mobile detailing scheduling app',
            'detailing shop management software',
            'car detailing booking software',
            'detailing business management app',
            'auto detailing software for small business',
          ],
        },
        hero: {
          sectionLabel: 'Auto Detailing',
          headline: 'RUN YOUR DETAILING BUSINESS\nFROM YOUR PHONE',
          subtext: "Between drive time, setup, and the actual work, you don't have time to chase invoices or rebook no-shows. OPS handles the business side so you can stay focused on the car in front of you.",
        },
        painPoints: [
          {
            title: "No-shows are killing your schedule",
            bullets: [
              'Clients book, forget, and you show up to an empty driveway',
              'You lose two hours of drive time and earn nothing',
              "Rescheduling eats up your morning before you've touched a car",
              "No deposit, no accountability — clients treat your time like it's free",
            ],
            forLine: 'For mobile detailers running 4\u20138 stops a day',
          },
          {
            title: 'Package pricing confuses everyone',
            bullets: [
              "Clients don't understand the difference between a basic wash and a full interior",
              "You quote one thing, they expect another, and now it's an argument",
              'Add-ons for ceramic coating, engine bay, or pet hair never get charged correctly',
              "You're undercharging regulars and losing margin on the jobs that take the most time",
            ],
            forLine: 'For detailers offering tiered or \u00e0 la carte services',
          },
          {
            title: 'Before/after photos disappear into your camera roll',
            bullets: [
              "You take 20 photos per job but they're scattered across Messages, Google Drive, and your phone",
              'Clients dispute work quality with no visual proof to back you up',
              "You can't build a portfolio or market results because nothing is organized by job",
              "Ceramic and paint correction clients expect documentation — you're delivering none",
            ],
            forLine: 'For detailers doing correction, ceramic, or high-ticket work',
          },
        ],
        solutions: [
          {
            title: 'Automated reminders that actually work',
            copy: "OPS sends SMS and push reminders 48 hours and 2 hours before every appointment — customized with the client's name, vehicle, and service. Collect a deposit at booking so clients have real skin in the game. When someone cancels, your open slot surfaces immediately so you can fill it fast.",
            painPointRef: 0,
          },
          {
            title: 'Packages and add-ons built right in',
            copy: "Build your service menu once — Bronze, Silver, Gold, whatever you call them — and attach add-ons with fixed prices. When you book a job, both you and the client see exactly what's included. No verbal negotiations, no invoice surprises. If the pet hair surcharge applies, it's already on the ticket.",
            painPointRef: 1,
          },
          {
            title: 'Job photos attached to every ticket',
            copy: "OPS ties your before/after photos directly to the job, not your camera roll. Tap the job, see every photo from every visit. Clients get a clean photo summary with their invoice. For ceramic or paint correction work, you have documented proof ready if questions come up months later.",
            painPointRef: 2,
          },
          {
            title: 'Route your day, not just your schedule',
            copy: 'Map your stops in order before you leave the shop. OPS shows drive time between appointments so you can see when a 9am and 11am booking are actually 45 minutes apart. Fit more jobs in the same hours without the frantic scramble between stops.',
            painPointRef: 0,
          },
        ],
        comparison: {
          competitors: ['Urable', 'Mobile Tech RX'],
          rows: [
            { feature: 'Before/after photos attached to jobs', ops: true, comp1: true, comp2: 'Limited' },
            { feature: 'Automated no-show deposit collection', ops: true, comp1: 'Add-on', comp2: false },
            { feature: 'SMS appointment reminders', ops: true, comp1: true, comp2: 'Add-on' },
            { feature: 'Tiered package + \u00e0 la carte pricing', ops: true, comp1: true, comp2: 'Limited' },
            { feature: 'Route optimization between stops', ops: true, comp1: false, comp2: false },
            { feature: 'Free to start, no credit card', ops: true, comp1: false, comp2: false },
          ],
        },
        faq: [
          {
            question: 'What is the best scheduling app for a mobile detailing business?',
            answer: "The best scheduling app for mobile detailing handles the specific problems of the trade: back-to-back appointments with drive time between them, clients who no-show, and service packages that need to be priced consistently. OPS was built for field service workers and includes automated reminders, deposit collection at booking, and route mapping between stops — features generic scheduling tools like Calendly or Acuity simply don't offer. If you're running 4\u20138 stops a day solo or with a small crew, you need something purpose-built for the field, not an office.",
          },
          {
            question: 'How do I reduce no-shows for my detailing business?',
            answer: "No-shows in detailing usually happen for two reasons: clients forgot, or they had no financial reason to show up. Both are fixable. Automated SMS reminders sent 48 and 2 hours before the appointment eliminate most forgetfulness — studies consistently show reminder rates drop no-shows by 30\u201350%. Requiring a deposit at booking — even $25\u2013$50 — creates accountability and filters out clients who were never serious. OPS handles both automatically: you set the rules once, and it runs in the background every day.",
          },
          {
            question: 'Can I use detailing software to manage before and after photos?',
            answer: "Yes, and it's one of the highest-value things you can do for your detailing business. When before/after photos are attached directly to a job record — not floating in your camera roll or a shared Google Drive folder — you have immediate access to proof of condition on every vehicle, every visit. This protects you from damage disputes, gives ceramic and paint correction clients the documentation they paid for, and builds a portfolio that sells your work automatically. OPS stores photos at the job level so you can pull up any vehicle's history in seconds.",
          },
          {
            question: 'Is there detailing software that handles packages and add-on pricing?',
            answer: "Yes. The biggest margin leak in detailing businesses is inconsistent add-on pricing — charging for pet hair removal on some jobs but forgetting on others, or not charging enough for interior work on SUVs versus sedans. OPS lets you build your service menu with tiered packages (e.g., Basic, Premium, Full Detail) and a list of add-ons with fixed prices. When you book a job, you select the package, check off add-ons, and the total is calculated automatically. The client sees it on their confirmation and invoice — no surprises, no negotiations.",
          },
          {
            question: 'What software do professional auto detailers use?',
            answer: "The most common tools used by professional detailers are Urable, Mobile Tech RX, and increasingly OPS. Urable is well-regarded for its invoicing and client history features but lacks built-in route optimization and charges extra for some integrations. Mobile Tech RX is popular for its inspection-style job forms, particularly in the PDR and window tint markets, but its scheduling tools are basic. OPS was built for field-first operations: it combines scheduling, routing, reminders, invoicing, and photo documentation in a single mobile app with no credit card required to get started.",
          },
        ],
        cta: {
          headline: 'STOP LOSING MONEY TO NO-SHOWS AND SCATTERED JOBS',
          subtext: 'Set up your service menu, turn on reminders, and start your first day running a tighter operation. Free to start — no credit card, no sales call.',
        },
      },
    },
  },

  // ─── Railings ──────────────────────────────────────────────────────────
  {
    slug: 'railings',
    name: 'Railings',
    painPointConfig: [
      { variant: 'apps' },
      { variant: 'messages' },
      { variant: 'dashboard' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'right-to-left' },
      { deviceType: 'laptop', flowDirection: 'left-to-right' },
      { deviceType: 'tablet', flowDirection: 'top-to-bottom' },
      { deviceType: 'desktop', flowDirection: 'left-to-right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Railing Contractor Software | OPS',
          description: 'Run your railing business from measure to install. Schedule jobs, track custom fabrication, and invoice faster with OPS — built for railing contractors.',
          keywords: [
            'railing contractor software',
            'railing installation scheduling app',
            'custom railing business management',
            'fence and railing contractor app',
            'iron railing contractor software',
            'glass railing project management',
            'cable railing installation software',
            'aluminum railing contractor app',
            'field service management railing',
            'railing company job tracking',
          ],
        },
        hero: {
          sectionLabel: 'For Railing Contractors',
          headline: 'MEASURE. FABRICATE.\nINSTALL. REPEAT.',
          subtext: "Every railing job is one-of-a-kind. Measure errors cost you powder coating runs. Fabrication lead times blow up your install schedule. Inspectors reject work that was never tracked against code. OPS keeps every job — aluminum, wrought iron, glass, cable — moving through the pipeline without something falling through the cracks.",
        },
        painPoints: [
          {
            title: 'The measure-to-fabricate gap kills margins',
            bullets: [
              'Field measurements taken on paper or phone photos — never where the fabricator can find them',
              'One transposed dimension means a full re-cut and another powder coat cycle',
              'Fabrication shop starts cutting before the site conditions are confirmed — rework is the result',
              'No clear handoff between who measured, who ordered, and who scheduled the install',
            ],
            forLine: 'For: Custom railing shops running measure-then-build on every single job',
          },
          {
            title: 'Scheduling around fabrication lead times is a guessing game',
            bullets: [
              "Powder coating shops run 2\u20133 week lead times — but you're promising customers install dates before the order is even placed",
              "Glass panel sourcing adds another variable — tempered and laminated panels aren't off-the-shelf",
              "Install crews show up to sites where the materials aren't ready, or materials arrive before the deck framing is done",
              'Double-booking crews happens when jobs are tracked in texts and a personal calendar',
            ],
            forLine: 'For: Railing contractors juggling multiple active jobs at different pipeline stages',
          },
          {
            title: 'Code compliance is invisible until the inspector shows up',
            bullets: [
              'IBC, IRC, and local amendments all set different requirements — height, baluster spacing, glass type, post embedment',
              'No record of which code version was referenced at quote time — disputes arise months later',
              "Commercial jobs require engineer-stamped drawings; tracking who submitted what and when lives in someone's email",
              "Post-installation corrections are the most expensive rework in the trade — cutting out set posts is a day's lost labor",
            ],
            forLine: 'For: Railing contractors doing residential decks, commercial stairways, and ADA-compliant installs',
          },
        ],
        solutions: [
          {
            title: 'Field measurements that actually reach the shop',
            copy: 'Log every measurement directly in the job — photos, dimensions, site notes, and slope angles attached to the project, not buried in a text thread. The fabrication shop sees exactly what the field crew captured, in the order they captured it. No transcription, no lost notebooks. When a dimension changes at final measure, the job record updates and everyone downstream knows.',
            painPointRef: 0,
          },
          {
            title: 'Schedule to the pipeline, not the calendar',
            copy: "Each job in OPS has a status that reflects where it sits in your actual workflow — measured, ordered, in fabrication, powder coat, ready to install, installed, inspected. You schedule install crews based on real status, not optimistic guesses. When a powder coat shop calls to say they're two days late, you move the install date in one tap and the crew sees the change immediately on their phones.",
            painPointRef: 1,
          },
          {
            title: 'Code notes live on the job, not in your head',
            copy: "Attach the applicable code reference, height requirements, baluster spacing, and glass spec to the project at quote time. Your install crew sees what they're building to before they ever drive to the site. When an inspector asks what code version you followed, you pull up the job and show them — it's all there. No scrambling through old emails, no calling the office mid-inspection.",
            painPointRef: 2,
          },
          {
            title: 'One app for office and field — no duplicate entry',
            copy: 'Quotes, job schedules, crew assignments, material status, and invoices all live in the same place. When the job is installed and signed off, the invoice goes out from the field before the crew even loads the van. No re-entering job details into a separate invoicing system. No end-of-day data reconciliation. The office sees what the field sees, in real time.',
            painPointRef: 1,
          },
        ],
        comparison: {
          competitors: ['Jobber', 'Buildertrend'],
          rows: [
            { feature: 'Job pipeline stages (measure \u2192 fab \u2192 install)', ops: true, comp1: 'Limited', comp2: 'Limited' },
            { feature: 'Field measurement notes attached to jobs', ops: true, comp1: 'Add-on', comp2: 'Add-on' },
            { feature: 'Fabrication lead time tracking', ops: true, comp1: false, comp2: false },
            { feature: 'Crew mobile app — works offline', ops: true, comp1: true, comp2: 'Limited' },
            { feature: 'Simple setup, no training required', ops: true, comp1: true, comp2: false },
            { feature: 'Pricing', ops: 'Free to start', comp1: '$49\u2013$599/mo', comp2: '$499+/mo' },
          ],
        },
        faq: [
          {
            question: 'Is there software built specifically for railing contractors?',
            answer: "Most field service apps are built for repeat-service trades like HVAC or plumbing — they assume you're scheduling the same type of job week after week. Railing is different: every job is custom, your schedule depends on fabrication and material lead times you don't control, and your install crew needs to know what they're building before they arrive on site. OPS is built for trades that work on a measure-then-build pipeline. You can define your own job stages, attach field measurements and code notes directly to the project, and schedule installs based on where fabrication actually stands — not where you hoped it would be.",
          },
          {
            question: 'How do I manage scheduling when powder coating lead times keep changing?',
            answer: "The core problem is that most scheduling tools treat a job as either \"scheduled\" or \"done\" — they have no concept of the stages in between. With OPS, each job moves through defined pipeline stages: measured, ordered, in fabrication, at powder coat, ready to install. Your install schedule is built around the \"ready to install\" stage, not the date you hoped the shop would finish. When a supplier calls with a delay, you update the stage and the install slot moves accordingly. Your crew sees the current schedule on their phones — no one shows up to a site where materials aren't ready.",
          },
          {
            question: 'Can I track building code requirements for each railing job?',
            answer: "Code compliance in the railing trade is high-stakes — the corrections after a failed inspection are expensive, and commercial jobs with engineer-stamp requirements add another layer of documentation. In OPS, you can attach notes, specs, and photos to any job. At quote time, log the applicable code reference, required height, maximum baluster spacing, glass type, and post embedment spec. Your install crew sees this when they open the job on site. If an inspector asks for documentation, you have a timestamped project record showing what code you designed to and when.",
          },
          {
            question: 'How does OPS handle quoting custom railing jobs where no two jobs are the same?',
            answer: "Custom work means your quotes can't be built from a flat rate card — every linear foot of railing has different material, fabrication complexity, and install conditions. OPS lets you build line-item quotes from scratch on any job, capture site-specific notes and photos alongside the pricing, and convert accepted quotes to active jobs in one tap. Because the field measurement data lives on the same job record as the quote, your office doesn't have to re-enter anything when the project moves from sold to scheduled.",
          },
          {
            question: "What's the difference between OPS and Jobber for a railing contractor?",
            answer: "Jobber is a solid general field service app, but it's designed around simple service calls with no multi-stage production pipeline. It has no native way to track where a job sits in a fabrication workflow, and it doesn't have inventory management built in — you need to pay for a separate add-on or external tool to track materials. OPS is built with the concept of job stages at the core, so your team always knows whether a job is waiting on a glass order, sitting at the powder coat shop, or ready to schedule. For railing contractors who run a measure-to-install pipeline with multiple trade dependencies, that structure is the difference between running tight and running chaotic.",
          },
        ],
        cta: {
          headline: 'STOP MANAGING JOBS IN TEXT THREADS.',
          subtext: "Every railing job you run has a measure, a fabrication order, a material wait, and an install. OPS tracks all of it so your crew knows exactly what's happening — and your customers aren't calling to ask.",
        },
      },
    },
  },
  // ─── Pool Service ──────────────────────────────────────────────────────
  {
    slug: 'pool-service',
    name: 'Pool Service',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left-to-right' },
      { deviceType: 'laptop', flowDirection: 'top-to-bottom' },
      { deviceType: 'tablet', flowDirection: 'right-to-left' },
      { deviceType: 'desktop', flowDirection: 'left-to-right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Pool Service Management Software | OPS',
          description: 'Run your pool routes without the chaos. Route scheduling, chemical logs, and crew tracking — built for pool service companies that do more than skim.',
          keywords: [
            'pool service management software',
            'pool route scheduling app',
            'pool chemical tracking software',
            'swimming pool business software',
            'pool service route optimization',
            'pool maintenance crew app',
            'pool cleaning business management',
            'pool service dispatch software',
            'pool company scheduling app',
            'pool technician route management',
          ],
        },
        hero: {
          sectionLabel: 'For Pool Service Companies',
          headline: 'RUN YOUR ROUTES.\nNOT YOUR VOICEMAIL.',
          subtext: "You're juggling 80 pools a week across 6 routes, chasing chemical readings in a spiral notebook, and losing customers you didn't know were unhappy. OPS puts your routes, service records, and crew assignments in one place — so your techs service pools, not answer phone calls.",
        },
        painPoints: [
          {
            title: 'Routes fall apart before lunch',
            bullets: [
              'Monday route built in your head — no backup when you call in sick',
              'New customer added mid-week throws off every route downstream',
              'Tech hits a locked gate and burns 30 minutes calling you for the next stop',
              'Seasonal pools come online in April and nobody remembers which ones or what chemicals they need',
            ],
            forLine: 'For: Pool service owners running 50\u2013200+ residential accounts',
          },
          {
            title: 'Chemical compliance is a liability you carry in a spiral notebook',
            bullets: [
              'Health department asks for 6 months of chemical logs and you have a water-damaged notebook',
              'Tech adjusts chlorine without logging it — next tech over-corrects and you get a green pool call',
              'Commercial pools require specific documentation you reconstruct from memory before inspections',
              'No way to prove you serviced a pool on a disputed date without digging through text messages',
            ],
            forLine: 'For: Pool companies servicing commercial properties and HOA communities with compliance requirements',
          },
          {
            title: 'You lose customers before they tell you why',
            bullets: [
              'Customer cancels after 3 months and you never knew they were unhappy',
              'No service history visible — tech says he was there, customer says he wasn\'t',
              'Recurring issues on the same pool with no pattern recognition across visits',
              'Upsell opportunities (equipment repair, resurfacing, automation) invisible because service notes live in texts',
            ],
            forLine: 'For: Growing pool companies competing against solo operators on service quality',
          },
        ],
        solutions: [
          {
            title: 'Routes built once. Updated everywhere.',
            copy: "Build your weekly routes on a visual board, assign them to specific techs, and push changes instantly. When a customer cancels or a new pool comes online, drag it into the right day and every tech sees the update. Gate codes, equipment notes, and chemical preferences travel with the stop — not in your head. If a tech calls in sick, reassign their route in two taps.",
            painPointRef: 0,
          },
          {
            title: 'Every service logged. Every chemical tracked.',
            copy: "Your tech checks in at the pool, logs chemical readings, snaps a photo of the water clarity, and closes the stop — all on their phone. You get a timestamped, geotagged service record for every visit. When a health inspector asks for chlorine logs on a commercial pool, you pull up six months of records in seconds. No spiral notebooks. No reconstructed data.",
            painPointRef: 1,
          },
          {
            title: 'Service history that prevents churn.',
            copy: "Every pool in OPS carries its full service history — chemical trends, equipment age, past issues, customer preferences. When a customer calls about a cloudy pool, your tech sees every visit and every reading before they arrive. Recurring problems surface automatically. You stop losing customers to silent frustration because you can actually see what's happening on every account.",
            painPointRef: 2,
          },
          {
            title: 'Crew management without the phone tag.',
            copy: "Assign routes, push schedule changes, and see which stops are complete — all in real time. Your techs open the app and see their day. No morning phone calls. No mid-route texts asking what's next. When a customer adds a last-minute service call, slot it into the nearest tech's route and they see it immediately. You run the business instead of dispatching it.",
            painPointRef: 0,
          },
        ],
        comparison: {
          competitors: ['Skimmer', 'Jobber'],
          rows: [
            { feature: 'Mobile-first crew app', ops: true, comp1: true, comp2: 'Limited' },
            { feature: 'Real-time route updates', ops: true, comp1: true, comp2: true },
            { feature: 'Per-stop photo & chemical logs', ops: true, comp1: true, comp2: 'Add-on' },
            { feature: 'Offline mode for no-signal areas', ops: true, comp1: false, comp2: false },
            { feature: 'Multi-trade support (pools + other work)', ops: true, comp1: false, comp2: true },
            { feature: 'Starting price', ops: 'Free to start', comp1: '$98/mo + $2/pool', comp2: '$49/mo' },
          ],
        },
        faq: [
          {
            question: 'What is the best software for pool service companies?',
            answer: "The best pool service software depends on whether you just clean pools or run a full service operation. If all you do is weekly chemical maintenance on residential pools, a pool-only tool like Skimmer covers the basics. But most pool companies also handle equipment repairs, plaster and resurfacing, automation installs, and commercial contracts — work that doesn't fit neatly into a route-only app. OPS handles route-based maintenance and project-based work in the same platform, so your crew isn't switching between apps depending on the job type.",
          },
          {
            question: 'How does OPS handle pool route scheduling?',
            answer: "You build routes visually — drag pools into days, assign them to specific techs, and publish. Every tech sees their route with stop order, gate codes, equipment notes, and chemical history. When a customer reschedules or a new pool comes online, adjust the route and every tech sees the update in real time. If a tech is out, reassign their entire route to a backup in two taps. No more rebuilding the week in a spreadsheet every Monday.",
          },
          {
            question: 'Can I track chemical readings and service history per pool?',
            answer: "Every service stop in OPS generates a timestamped record with chemical readings, photos, and tech notes. Over time, you build a complete chemical history for every pool — useful for troubleshooting recurring issues, proving compliance to health departments on commercial accounts, and showing customers exactly what was done on every visit. This isn't a feature you bolt on. It's how the app works.",
          },
          {
            question: 'How is OPS different from Skimmer for pool service?',
            answer: "Skimmer is built specifically for pool route management — chemical logging, route optimization, and customer communication for weekly maintenance stops. It does that well. But if your company also handles equipment repairs, renovations, commercial contracts, or any work that isn't a recurring weekly stop, Skimmer has no way to manage it. OPS handles both route-based maintenance and project-based work, so your techs have one app for everything. You also avoid Skimmer's per-pool pricing that scales up as your route grows.",
          },
          {
            question: 'Does OPS work offline for pool techs in the field?',
            answer: "Yes. Pool techs spend their day in backyards — behind block walls, under screen enclosures, in areas with weak or no cell signal. OPS works fully offline: your tech can view their route, check in at a stop, log chemical readings, take photos, and close the job with no connection. Everything syncs automatically when they get signal. No lost data. No spinning wheels. No excuse for an incomplete log.",
          },
        ],
        cta: {
          headline: 'STOP RUNNING YOUR ROUTES FROM A SPIRAL NOTEBOOK.',
          subtext: "Every pool on your route has chemical requirements, equipment history, and a customer who expects consistency. OPS tracks all of it so your techs know what every pool needs — before they open the gate.",
        },
      },
    },
  },
  // ─── Garage Door ───────────────────────────────────────────────────────
  {
    slug: 'garage-door',
    name: 'Garage Door',
    painPointConfig: [
      { variant: 'dashboard' },
      { variant: 'messages' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left-to-right' },
      { deviceType: 'laptop', flowDirection: 'top-to-bottom' },
      { deviceType: 'tablet', flowDirection: 'right-to-left' },
      { deviceType: 'desktop', flowDirection: 'left-to-right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Garage Door Service Management Software | OPS',
          description: 'Dispatch emergency spring calls, track truck inventory, and quote repair-vs-replace on site — built for garage door companies that can\'t afford missed calls.',
          keywords: [
            'garage door service software',
            'garage door business management app',
            'garage door dispatch software',
            'overhead door company software',
            'garage door repair scheduling app',
            'garage door installer management',
            'garage door technician dispatch',
            'garage door service scheduling',
            'garage door inventory tracking',
            'garage door company management software',
          ],
        },
        hero: {
          sectionLabel: 'For Garage Door Companies',
          headline: 'DISPATCH THE CALL.\nNOT THE VOICEMAIL.',
          subtext: "A broken spring is an emergency. The homeowner is stuck in their garage. They're calling 3 companies and hiring the first one that picks up. OPS gets your tech dispatched and on-route before your competitor checks their voicemail.",
        },
        painPoints: [
          {
            title: 'Every missed call is a lost job',
            bullets: [
              'Customer calls with a broken spring — your tech is on a roof and can\'t answer',
              'By the time you call back in 20 minutes, they\'ve already booked someone else',
              '45% of garage door calls go to voicemail industry-wide — each one is $264+ walking away',
              'No way to see which calls are emergencies vs. routine maintenance requests',
            ],
            forLine: 'For: Garage door companies where 60%+ of revenue comes from emergency service calls',
          },
          {
            title: 'Your truck is a warehouse and nobody tracks it',
            bullets: [
              'Tech drives 40 minutes to a job, doesn\'t have the right torsion spring on the truck',
              'Spring wire gauge, inside diameter, and wind direction create hundreds of SKU combinations',
              'End of month you can\'t reconcile inventory because parts leave the truck with no record',
              'Techs stock their trucks from memory — duplicates pile up while critical springs run out',
            ],
            forLine: 'For: Companies running 3+ trucks with high-value spring and opener inventory',
          },
          {
            title: 'Quoting repair vs. replace is a trust problem',
            bullets: [
              'Homeowner doesn\'t trust the tech recommending a full replacement on a 15-year-old door',
              'No way to show repair cost vs. replacement value side-by-side on the spot',
              'Quotes written on paper get "lost" — customer calls back weeks later and you have no record',
              'Upsell on openers, insulation, and smart features happens inconsistently because there\'s no process',
            ],
            forLine: 'For: Garage door companies selling $4,500+ replacement jobs alongside $264 spring repairs',
          },
        ],
        solutions: [
          {
            title: 'Emergency dispatch in seconds. Not minutes.',
            copy: "When a spring call comes in, create the job, assign the nearest available tech, and push it to their phone — all before the customer hangs up. Your tech gets the address, gate code, door specs, and job type on their screen. No callback delay. No missed revenue. The homeowner sees a tech name and ETA instead of a voicemail greeting.",
            painPointRef: 0,
          },
          {
            title: 'Every truck inventoried. Every part tracked.',
            copy: "Log what's on each truck — spring sizes, opener models, hardware kits — and update it as parts get used on jobs. When a tech closes a spring replacement, the part deducts from their truck inventory automatically. You see which trucks need restocking before anyone drives to the warehouse. No more surprise shortages on a Saturday emergency call.",
            painPointRef: 1,
          },
          {
            title: 'Quote on site. Close on site.',
            copy: "Your tech builds the quote on their phone while standing in the customer's garage — repair cost, replacement options, opener upgrades, all itemized. The customer sees real numbers, not a verbal estimate they'll forget by dinner. Accepted quotes convert to active jobs in one tap. Declined quotes stay in the system so you can follow up next week instead of losing the lead forever.",
            painPointRef: 2,
          },
          {
            title: 'Job history that builds repeat business.',
            copy: "Every service call is logged with door specs, spring measurements, parts used, and photos. When a customer calls back two years later for a different issue, your tech sees the full history before they pull into the driveway. You know the door type, the opener model, and what was done last time. That's how you turn a one-time spring call into a lifetime customer.",
            painPointRef: 2,
          },
        ],
        comparison: {
          competitors: ['ServiceTitan', 'Workiz'],
          rows: [
            { feature: 'Mobile-first tech app', ops: true, comp1: true, comp2: true },
            { feature: 'Emergency dispatch workflow', ops: true, comp1: true, comp2: true },
            { feature: 'On-site quoting from phone', ops: true, comp1: true, comp2: true },
            { feature: 'Offline mode for no-signal areas', ops: true, comp1: false, comp2: false },
            { feature: 'No long-term contract required', ops: true, comp1: false, comp2: true },
            { feature: 'Starting price', ops: 'Free to start', comp1: '$398+/mo', comp2: '$198/mo' },
          ],
        },
        faq: [
          {
            question: 'What is the best software for garage door companies?',
            answer: "Garage door work is split between emergency service calls and scheduled installations — most field service software is designed for one or the other, not both. ServiceTitan handles large operations but costs $398+ per month with annual contracts and long onboarding. Workiz is lighter but still charges $198 per month. OPS handles emergency dispatch and scheduled project work in the same platform, with a free tier that lets you start today. Your techs get a mobile app that works in garages with no signal, and you get real-time visibility into every job.",
          },
          {
            question: 'How does OPS handle emergency garage door dispatch?',
            answer: "A broken spring or off-track door is urgent — the customer is calling multiple companies and booking the fastest response. In OPS, you create the emergency job, assign the nearest tech, and push it to their phone in under a minute. The tech sees the address, door type, and job details immediately. No callback chains. No dispatching through a whiteboard. The speed of your response is the difference between winning and losing the job.",
          },
          {
            question: 'Can OPS track garage door parts and truck inventory?',
            answer: "Garage door trucks carry hundreds of spring combinations — different wire gauges, inside diameters, lengths, and wind directions. OPS lets you log inventory per truck and update it as parts get used on jobs. You see which trucks need restocking before your tech shows up to a job without the right spring. It's not a full warehouse management system — it's practical truck-level inventory that prevents wasted trips.",
          },
          {
            question: 'How is OPS different from ServiceTitan for garage door companies?',
            answer: "ServiceTitan is built for large home service companies doing $5M+ in annual revenue — it has deep features for marketing automation, call tracking, and membership programs, but it comes with a price tag north of $398 per month, annual contracts, and a multi-month onboarding process. If you're running 2\u20138 trucks, that overhead doesn't match your operation. OPS gives you dispatch, scheduling, quoting, and crew management without the ERP-level complexity or the enterprise-level cost. You can be dispatching jobs on day one.",
          },
          {
            question: 'Does OPS work offline in garages with no cell signal?',
            answer: "Garage door techs work inside enclosed garages — often metal structures with poor cell reception, especially in rural areas or warehouse districts. OPS works fully offline: your tech can view their schedule, open job details, build quotes, take photos, and close jobs with no connection. Everything syncs when they get signal. No lost data. No spinning loading screens in a customer's garage.",
          },
        ],
        cta: {
          headline: 'STOP LOSING EMERGENCY CALLS TO VOICEMAIL.',
          subtext: "A broken spring waits for nobody. The homeowner is calling the first company that answers. OPS gets your tech dispatched and on-route while your competitor is still checking messages.",
        },
      },
    },
  },
  // ─── Fencing ───────────────────────────────────────────────────────────
  {
    slug: 'fencing',
    name: 'Fencing',
    painPointConfig: [
      { variant: 'apps' },
      { variant: 'messages' },
      { variant: 'dashboard' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left-to-right' },
      { deviceType: 'laptop', flowDirection: 'top-to-bottom' },
      { deviceType: 'tablet', flowDirection: 'right-to-left' },
      { deviceType: 'desktop', flowDirection: 'left-to-right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Fencing Contractor Management Software | OPS',
          description: 'Estimate linear footage, schedule weather-dependent installs, and stop losing leads during peak season — built for fence contractors.',
          keywords: [
            'fencing contractor software',
            'fence company management app',
            'fence estimating software',
            'fencing business management',
            'fence installation scheduling app',
            'fence contractor scheduling software',
            'fencing crew management app',
            'fence company job tracking',
            'fence installer dispatch software',
            'fencing business app',
          ],
        },
        hero: {
          sectionLabel: 'For Fencing Contractors',
          headline: 'MEASURE ONCE.\nSCHEDULE ONCE.\nBUILD.',
          subtext: "Every fence job starts with a site visit, a tape measure, and math that has to be right — because wrong linear footage means wrong material orders, wrong quotes, and wrong margins. OPS keeps your measurements, materials, and schedule in one place so your crew shows up with the right posts and the right plan.",
        },
        painPoints: [
          {
            title: 'Material estimates miss and margins bleed',
            bullets: [
              'Linear footage calculated on a notepad — transposed wrong into the quote',
              '10% material waste assumed but never tracked against actual usage',
              'Gate count and post spacing vary by style — vinyl, wood, chain link all calculate differently',
              'Supplier price changes between quote day and install day eat your margin with no warning',
            ],
            forLine: 'For: Fence contractors quoting 5\u201320+ jobs per week across multiple material types',
          },
          {
            title: 'Weather owns your schedule and you react instead of plan',
            bullets: [
              'Rain delays push Tuesday\'s install into a week that\'s already full',
              'Concrete post sets need 24\u201348 hours to cure — but the next crew doesn\'t know that',
              'Permit inspections scheduled around weather windows get missed and push everything back',
              'Customer expects Thursday completion but you can\'t pour footings in the rain they don\'t know about',
            ],
            forLine: 'For: Fencing companies in regions with unpredictable weather affecting install schedules',
          },
          {
            title: 'Peak season buries you in leads you can\'t process',
            bullets: [
              'Spring brings 30 estimate requests in a week — you respond to 12 and lose the other 18',
              'Leads sit in voicemail, text, email, and Facebook messages with no single view',
              'By the time you quote, the homeowner already booked the competitor who responded faster',
              'No way to know which leads are $800 chain link repairs vs. $15,000 cedar privacy installs',
            ],
            forLine: 'For: Growing fence companies losing revenue during peak season due to slow response times',
          },
        ],
        solutions: [
          {
            title: 'Estimates that travel with the job.',
            copy: "Capture measurements, material selections, and site photos during the estimate visit — all on your phone. Gate count, post spacing, and linear footage stay attached to the job record from quote through completion. When your install crew opens the job, they see exactly what was measured, what was quoted, and what materials to load. No more calling the office to ask what style of picket the customer picked.",
            painPointRef: 0,
          },
          {
            title: 'Weather delays handled. Schedule rebuilt.',
            copy: "When rain kills Wednesday's install, drag it to the next available day and every crew sees the update instantly. Mark jobs that need concrete cure time so the next stage doesn't get scheduled too early. Your crew sees their week on their phone — if it changes, they know before they load the truck. Stop rebuilding the schedule in texts every time the forecast shifts.",
            painPointRef: 1,
          },
          {
            title: 'Every lead captured. None forgotten.',
            copy: "Every estimate request gets logged as a job the moment it comes in — phone, text, or walk-in. You see all pending estimates in one view, sorted by date received. Quote them in order, follow up on the ones that went cold, and stop losing $15,000 cedar jobs because they were buried in a text thread from three weeks ago. When peak season hits, you process leads systematically instead of reactively.",
            painPointRef: 2,
          },
          {
            title: 'Crew schedule. One source of truth.',
            copy: "Your install crews see their week on their phone — which jobs, which addresses, what materials are needed, and what stage the job is in. Post-set crew knows which properties are ready for panels. Panel crew knows which post sets need another day to cure. No more morning meetings to figure out who's going where. The schedule is live, it's on every phone, and it updates the moment you change it.",
            painPointRef: 1,
          },
        ],
        comparison: {
          competitors: ['Jobber', 'Housecall Pro'],
          rows: [
            { feature: 'Mobile-first crew app', ops: true, comp1: 'Limited', comp2: 'Limited' },
            { feature: 'Per-job photo & measurement logs', ops: true, comp1: true, comp2: true },
            { feature: 'Multi-stage job tracking', ops: true, comp1: false, comp2: false },
            { feature: 'Offline mode for job sites', ops: true, comp1: false, comp2: false },
            { feature: 'No per-user pricing that scales with crew size', ops: true, comp1: false, comp2: false },
            { feature: 'Starting price', ops: 'Free to start', comp1: '$49/mo', comp2: '$79/mo' },
          ],
        },
        faq: [
          {
            question: 'What is the best software for fence contractors?',
            answer: "Most fence contractors run their business on spreadsheets, notebooks, and text messages — the industry has no dominant software player because generic field service tools don't understand multi-stage install work. Jobber and Housecall Pro handle basic scheduling but have no concept of a job that moves through estimate, permit, post-set, and panel stages. OPS tracks jobs through stages so your post-set crew and panel crew aren't stepping on each other, and your office knows exactly where every job sits without calling the field.",
          },
          {
            question: 'How does OPS help with fence estimating?',
            answer: "OPS isn't an estimating calculator — it's where your estimate data lives after you measure. Capture linear footage, gate locations, post spacing, material type, and site photos during the walk-through, all on your phone. That data stays on the job record from quote through install. Your crew opens the job on install day and sees exactly what was measured, what material to load, and what the site looks like. No more lost napkin estimates or calling the office to confirm whether it was 6-foot or 8-foot panels.",
          },
          {
            question: 'Can OPS handle multi-stage fence installations?',
            answer: "A fence install isn't one visit — it's a permit pull, a post-set, a cure period, a panel install, and sometimes a concrete or grading stage before any of that. OPS lets you break jobs into stages so each crew knows their part and the next crew knows when the previous stage is complete. Post-set crew marks their stage done, panel crew sees it's ready. No more showing up to hang panels on posts that were set yesterday.",
          },
          {
            question: 'How is OPS different from Jobber for a fencing company?',
            answer: "Jobber is designed for simple service calls — a tech shows up, does the work, and closes the job. Fencing doesn't work that way. A fence job has multiple stages, multiple crews, weather dependencies, and material logistics that a single-visit model can't capture. Jobber also charges per user, which gets expensive fast when you're adding seasonal crew members during peak season. OPS doesn't charge per user, handles multi-stage work natively, and works offline on job sites where your crew is setting posts in a field with no cell signal.",
          },
          {
            question: 'Does OPS work for both residential and commercial fencing?',
            answer: "Yes. Residential fence work and commercial fencing have different scopes but the same operational challenges — estimating, scheduling around weather, tracking materials, and managing crews across multiple active job sites. OPS handles both. A 200-foot residential cedar privacy fence and a 2,000-foot commercial chain link perimeter are both multi-stage jobs with material requirements and crew assignments. The app doesn't care about the fence type — it cares about making sure your crew shows up to the right site with the right plan.",
          },
        ],
        cta: {
          headline: 'STOP LOSING FENCE JOBS TO SLOW QUOTES.',
          subtext: "Peak season waits for nobody. Every lead that sits in your voicemail for 48 hours is revenue your competitor already booked. OPS gets your estimates organized so you quote fast and build faster.",
        },
      },
    },
  },
  // ─── Tree Service ──────────────────────────────────────────────────────
  {
    slug: 'tree-service',
    name: 'Tree Service',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'apps' },
      { variant: 'dashboard' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left-to-right' },
      { deviceType: 'laptop', flowDirection: 'top-to-bottom' },
      { deviceType: 'tablet', flowDirection: 'right-to-left' },
      { deviceType: 'desktop', flowDirection: 'left-to-right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Tree Service Management Software | OPS',
          description: 'Estimate tree work accurately, track crew safety documentation, and manage seasonal demand — built for arborists and tree service companies.',
          keywords: [
            'tree service management software',
            'arborist business management app',
            'tree removal scheduling software',
            'tree care company management',
            'tree service dispatch app',
            'tree trimming business software',
            'tree service crew management',
            'arborist scheduling software',
            'tree company job tracking app',
            'tree service estimating software',
          ],
        },
        hero: {
          sectionLabel: 'For Tree Service Companies',
          headline: 'ESTIMATE THE TREE.\nNOT THE CHAOS.',
          subtext: "Every tree is different — species, diameter, height, lean, hazards, access, proximity to structures. Your estimates can't come from a flat rate card. OPS captures the complexity of every job so your crew shows up knowing exactly what they're cutting, what equipment they need, and what's at risk.",
        },
        painPoints: [
          {
            title: 'Every estimate is a custom job and nothing is repeatable',
            bullets: [
              'Same species, same diameter — completely different price because of power lines, slope, and access',
              'Estimator eyeballs DBH and height from the ground, writes it on a napkin, and quotes from gut feel',
              'Crew arrives and the tree is bigger, leaner, or closer to the house than the estimate described',
              'No photos from the estimate visit — crew calls the office asking what they\'re looking at',
            ],
            forLine: 'For: Tree service companies where every job is a unique combination of species, hazards, and access conditions',
          },
          {
            title: 'Safety documentation exists on paper or not at all',
            bullets: [
              'OSHA requires job hazard analyses and you do them on a clipboard that lives in the truck',
              'Near-miss incidents go unreported because there\'s no simple way to log them in the field',
              'ISA certifications, CDL expirations, and equipment inspections tracked in a filing cabinet',
              'Insurance audit asks for 12 months of safety records and you spend a weekend reconstructing them',
            ],
            forLine: 'For: Tree companies with OSHA compliance requirements and insurance documentation needs',
          },
          {
            title: 'Storm season is feast. Winter is famine. Neither is managed.',
            bullets: [
              'One ice storm generates 60 emergency calls in 48 hours and you can only handle 8',
              'No way to triage which calls are hazard trees vs. cosmetic cleanup',
              'Winter months with zero revenue but crews still need hours to stay on payroll',
              'Seasonal workers disappear in October and you re-train new ones every March',
            ],
            forLine: 'For: Tree service owners managing feast-or-famine seasonal demand with small crews',
          },
        ],
        solutions: [
          {
            title: 'Estimates that describe the real job.',
            copy: "Capture everything during the site visit — species, DBH, height, lean direction, proximity to structures, power line clearance, access path for equipment, and photos from multiple angles. Your crew opens the job on the morning of the cut and sees the full picture. No surprises. No phone calls asking if the oak is 18 or 28 inches. No showing up with a 60-foot bucket when the job needs a 75.",
            painPointRef: 0,
          },
          {
            title: 'Safety logs that exist without extra work.',
            copy: "Your crew lead opens the job, sees the hazard notes from the estimate, and logs their pre-job safety check — all on their phone. Photos of the work zone, notes on overhead hazards, and crew assignments are timestamped and attached to the job record. When the insurance auditor asks for documentation, you pull it up in minutes instead of spending a weekend with a filing cabinet.",
            painPointRef: 1,
          },
          {
            title: 'Storm demand organized. Not chaotic.',
            copy: "When 60 calls come in after an ice storm, log them all as jobs immediately — address, description, photos if the customer sends them. Triage by hazard level: tree on a house gets dispatched today, cosmetic limb cleanup gets scheduled for next week. Your crew sees the priority queue on their phone and works through it systematically. No lost calls. No forgotten callbacks. No guessing which job is urgent.",
            painPointRef: 2,
          },
          {
            title: 'Crew schedules that flex with the season.',
            copy: "During peak season, your schedule is full three weeks out. During winter, you're chasing pruning jobs to keep crews busy. OPS gives you visibility into both — you see capacity gaps before they become payroll problems, and you see overload before it becomes missed deadlines. Assign crews to jobs based on equipment needs and certifications, not just availability. The crew with the crane gets the 90-foot removals. The pruning crew gets the residential trims.",
            painPointRef: 2,
          },
        ],
        comparison: {
          competitors: ['Jobber', 'ArboStar'],
          rows: [
            { feature: 'Mobile-first crew app', ops: true, comp1: 'Limited', comp2: true },
            { feature: 'Per-job photo & hazard documentation', ops: true, comp1: true, comp2: true },
            { feature: 'Offline mode for remote job sites', ops: true, comp1: false, comp2: false },
            { feature: 'No multi-month onboarding required', ops: true, comp1: true, comp2: false },
            { feature: 'Multi-trade support beyond tree work', ops: true, comp1: true, comp2: false },
            { feature: 'Starting price', ops: 'Free to start', comp1: '$49/mo', comp2: '$150+/user/mo' },
          ],
        },
        faq: [
          {
            question: 'What is the best software for tree service companies?',
            answer: "Most tree service companies use spreadsheets, whiteboards, and text messages — the industry has been underserved by software because tree work doesn't fit the standard service-call model. Jobber handles basic scheduling but doesn't understand the complexity of tree estimates. ArboStar is tree-specific but costs $150+ per user per month with a 12-week implementation timeline. OPS gives you job management, crew scheduling, and field documentation at a fraction of the cost, with a mobile app your crew can actually use on remote job sites with no cell signal.",
          },
          {
            question: 'How does OPS handle tree work estimates?',
            answer: "Tree work estimates require more context than any other trade — species, diameter, height, lean, hazards, access, equipment requirements, and proximity to structures all affect the price. OPS doesn't try to auto-calculate your bid. Instead, it gives your estimator a structured way to capture all of that information during the site visit — measurements, photos, hazard notes — and keeps it attached to the job record. When your crew opens the job on cut day, they see exactly what the estimator saw. No missing context. No surprises.",
          },
          {
            question: 'Can OPS handle emergency storm work?',
            answer: "Storm events generate massive call volume in a short window. OPS lets you log every call as a job immediately — even before you dispatch anyone — so nothing gets lost. Triage by hazard level: trees on structures and blocking roads get priority, cosmetic cleanup gets queued for later. Your crew sees the priority list on their phones and works through it in order. When the storm is over, you have a complete record of every call, every job, and every hour worked for insurance documentation.",
          },
          {
            question: 'How is OPS different from ArboStar for tree companies?',
            answer: "ArboStar is purpose-built for arborists with features like canopy mapping and tree inventory that no other software offers. But it costs $150+ per user per month, requires a 12-week implementation process, and has limited offline capability. If you run a 4-person crew, you're looking at $600+ per month before you've dispatched a single job. OPS covers the operational core — scheduling, dispatch, crew management, job documentation — at a fraction of the cost, works offline on remote job sites, and requires zero implementation. Download it and start dispatching today.",
          },
          {
            question: 'Does OPS work on remote job sites with no cell signal?',
            answer: "Tree work happens in backyards, wooded lots, rural properties, and storm-damaged areas — many with weak or no cell signal. OPS works fully offline: your crew can view their schedule, open job details, take photos, log work notes, and close jobs with no connection. Everything syncs when they're back in signal range. For a trade where half your job sites have no reliable internet, offline capability isn't a nice-to-have — it's a requirement.",
          },
        ],
        cta: {
          headline: 'STOP ESTIMATING FROM GUT FEEL.',
          subtext: "Every tree is different. Your estimates should capture that — species, size, hazards, access, and equipment needs. OPS gives your crew the full picture before the saw starts.",
        },
      },
    },
  },
  // ─── Concrete ──────────────────────────────────────────────────────────
  {
    slug: 'concrete',
    name: 'Concrete',
    painPointConfig: [
      { variant: 'dashboard' },
      { variant: 'messages' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left-to-right' },
      { deviceType: 'laptop', flowDirection: 'top-to-bottom' },
      { deviceType: 'tablet', flowDirection: 'right-to-left' },
      { deviceType: 'desktop', flowDirection: 'left-to-right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Concrete Contractor Management Software | OPS',
          description: 'Schedule pours around weather, coordinate multi-crew staging, and document every batch — built for concrete contractors who can\'t afford a bad pour.',
          keywords: [
            'concrete contractor software',
            'concrete business management software',
            'concrete scheduling software',
            'concrete crew management app',
            'concrete pour scheduling software',
            'concrete subcontractor management',
            'concrete project management software',
            'concrete job costing software',
            'concrete contractor app',
            'concrete estimating and scheduling app',
          ],
        },
        hero: {
          sectionLabel: 'For Concrete Contractors',
          headline: "YOU CAN'T UN-POUR CONCRETE.\nMAKE SURE THE SCHEDULE IS RIGHT.",
          subtext: "The truck shows up and the clock starts. If the forms aren't ready, the crew isn't staged, or the weather turns — you're paying for mud you can't use. OPS coordinates your crews, tracks weather windows, and documents every pour so the right people are at the right site before the first truck backs in.",
        },
        painPoints: [
          {
            title: 'Weather doesn\'t check your calendar',
            bullets: [
              'Temperature drops below 40\u00B0F during curing and the concrete weakens permanently — no fix, no rework, just demolition',
              'Ready-mix delivery is scheduled but the rain forecast changed overnight — now you\'re rescheduling the crew, the pump, the trucks, and the inspector by phone',
              'A large commercial pour needs forms, rebar, pump, finishers, and 8\u201312 trucks arriving at 15-minute intervals — one breakdown in the sequence and the whole pour is at risk',
              'Cancel tomorrow\'s pour and the cascade hits every project on your schedule for the rest of the week',
            ],
            forLine: 'For: Concrete contractors making pour-or-wait decisions that cost thousands based on weather apps and gut feel',
          },
          {
            title: 'Labor costs 9% more than last year and every idle hour bleeds money',
            bullets: [
              'Construction compensation up 9% year-over-year — if your estimates use last year\'s labor rates, every job bleeds margin',
              'Over 20% of construction workers are over 55 and retiring fast — the pipeline of replacements is thin',
              'Delays cost North American construction $280 billion annually — and concrete delays are the most expensive because you can\'t pause a pour',
              'Less experienced crews mean more quality issues — inconsistent finishing, improper curing, substandard formwork that doubles labor costs on rework',
            ],
            forLine: 'For: Concrete company owners paying more for labor while watching productivity drop with every inexperienced hire',
          },
          {
            title: 'GC software priced for subcontractor budgets',
            bullets: [
              'Procore is the gold standard for construction management — and completely unaffordable for a 10-person concrete crew doing 3\u20134 active jobs',
              'ServiceTitan costs $245\u2013$500+ per tech per month with $5,000\u2013$50,000 implementation — that\'s $30K\u2013$60K/year for a sub with 5\u20138% net margins',
              'Jobber was designed for same-day service calls, not multi-day concrete projects with weather dependencies and multi-crew staging',
              'The result: most concrete contractors still run on phone calls, text messages, and paper estimates because the software market failed them',
            ],
            forLine: 'For: Concrete subcontractors who need crew scheduling and job tracking but can\'t justify Procore pricing on sub margins',
          },
        ],
        solutions: [
          {
            title: 'Schedule pours around weather. Not the other way around.',
            copy: "Build your pour schedule with multi-day visibility that accounts for temperature windows, rain probability, and wind conditions. When weather forces a reschedule, shift crews and equipment to alternate sites with one adjustment — not an hour of phone calls. Multi-crew staging shows exactly who needs to be where: form crew complete, rebar inspected, pump staged, finishers on standby, trucks arriving at intervals. Pour documentation captures batch tickets, conditions, and time-stamped photos — the evidence trail that proves quality.",
            painPointRef: 0,
          },
          {
            title: 'Every crew hour tracked. Every dollar accounted.',
            copy: "When labor costs 9% more than last year, you need to know exactly where every hour goes. Time tracking per crew, per site, per phase builds the labor cost database that makes your next estimate accurate — not a guess based on last year's rates. Real-time job costing compares estimated vs. actual labor and material costs as the project progresses. Crew dispatch prevents the most expensive waste: sending a finishing crew to a site that isn't ready.",
            painPointRef: 1,
          },
          {
            title: 'Built for the pour site. Not the office trailer.',
            copy: "Your finishers are on their knees at 5 AM. They're not checking a laptop. 56dp touch targets work with wet, muddy gloves. Dark theme is readable at dawn or under flood lights. Photo capture documents formwork, rebar placement, pour progress, and finished surfaces with timestamps and GPS. Works offline because new construction sites, rural pads, and infrastructure projects don't have cell service. Your crew sees their schedule and site details without calling the office.",
            painPointRef: 1,
          },
          {
            title: 'Sub pricing. Not GC pricing.',
            copy: "Concrete margins are tight enough without your software squeezing them. OPS is flat-rate regardless of crew size — whether you're running 5 workers or 50. Free to start with no credit card. No implementation fees. No 12-month contracts. Compare that to Procore at enterprise pricing, ServiceTitan at $30K\u2013$60K/year for 10 workers, or Jobber at $4,188+/year with user overages. For a concrete sub doing $1M\u2013$5M in revenue, OPS is a line item you'll never think about.",
            painPointRef: 2,
          },
        ],
        comparison: {
          competitors: ['Jobber', 'Knowify'],
          rows: [
            { feature: 'Mobile-first crew app', ops: true, comp1: 'Limited', comp2: 'Limited' },
            { feature: 'Multi-day project scheduling', ops: true, comp1: false, comp2: true },
            { feature: 'Per-phase photo documentation', ops: true, comp1: 'Basic', comp2: 'Limited' },
            { feature: 'Offline mode for job sites', ops: true, comp1: false, comp2: false },
            { feature: 'No per-user pricing', ops: true, comp1: false, comp2: false },
            { feature: 'Starting price', ops: 'Free to start', comp1: '$49/mo', comp2: '$149/mo' },
          ],
        },
        faq: [
          {
            question: 'What is the best software for concrete contractors?',
            answer: "It depends on your role. If you're a GC managing concrete subs, Procore and Fieldwire are industry standards — but at enterprise pricing designed for companies managing 50+ projects. If you're a concrete subcontractor running 2\u201315 workers, those tools are overbuilt and overpriced. Jobber handles basic scheduling but was designed for same-day service calls — it doesn't understand multi-day pours, weather dependencies, or multi-crew staging. Knowify offers construction-specific job costing but isn't mobile-first for field crews. OPS handles scheduling, crew management, job tracking, and photo documentation at flat-rate pricing that works for sub margins.",
          },
          {
            question: 'How do concrete contractors handle weather delays?',
            answer: "The best concrete contractors schedule pours around weather windows, not despite them. They monitor forecasts 3\u20137 days out for temperature, humidity, wind, and precipitation — because concrete that cures below 40\u00B0F weakens permanently, and rain during finishing ruins the surface. When weather forces a reschedule, the cascade hits everything: ready-mix delivery, pump operator, inspector, and crew need to be rescheduled simultaneously while alternate site work gets slotted into the open day. Software that tracks all those dependencies and can cascade changes across projects is the difference between managing weather and reacting to it.",
          },
          {
            question: 'How is the labor shortage affecting concrete contractors?',
            answer: "Concrete is one of the hardest-hit segments of construction. Over 20% of workers are over 55 and retiring, the residential sector faces a 32% labor shortage, and compensation has risen 9% year-over-year. This creates a triple squeeze: fewer workers, higher cost per worker, and lower average experience. Less experienced crews mean more quality issues — inconsistent finishing, improper curing, substandard formwork. Technology that maximizes productive hours per crew member through better scheduling, reduced idle time, and fewer cascading delays directly addresses all three pressures.",
          },
          {
            question: 'How is OPS different from Procore for concrete subcontractors?',
            answer: "Procore is built for general contractors managing large-scale construction projects with dozens of subs, change orders, architectural drawings, and bidding portals. If you're a 10-person concrete crew doing 3\u20134 active jobs, you don't need 90% of what Procore offers — but you're paying for all of it. OPS gives concrete subs what they actually need: crew scheduling, multi-site coordination, pour documentation with photos, and time tracking — at flat-rate pricing, not enterprise pricing. You'll be scheduling pours on day one instead of spending months in onboarding.",
          },
          {
            question: 'What documentation do concrete contractors need per pour?',
            answer: "Professional pour documentation protects against quality disputes and satisfies inspection requirements. Key records include batch tickets from the ready-mix supplier showing mix design, slump, and air content. Ambient conditions at pour time — temperature, humidity, wind. Slump test results on-site. Time-stamped photos of formwork, rebar placement, pour progress, and finished surface. For commercial and infrastructure work, this documentation is increasingly required, not optional. OPS captures all of it on your phone during the pour — organized per project and retrievable in seconds.",
          },
        ],
        cta: {
          headline: "YOU CAN'T UN-POUR CONCRETE.",
          subtext: "Every pour is a one-shot operation. Your schedule, your crews, and your weather window have to be right before the first truck backs in. OPS makes sure they are.",
        },
      },
    },
  },
  // ─── Flooring ──────────────────────────────────────────────────────────
  {
    slug: 'flooring',
    name: 'Flooring',
    painPointConfig: [
      { variant: 'apps' },
      { variant: 'dashboard' },
      { variant: 'messages' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left-to-right' },
      { deviceType: 'laptop', flowDirection: 'top-to-bottom' },
      { deviceType: 'tablet', flowDirection: 'right-to-left' },
      { deviceType: 'desktop', flowDirection: 'left-to-right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Flooring Contractor Management Software | OPS',
          description: 'Schedule multi-day installs, track material costs in real time, and give your installers a tool that works from the subfloor — not the showroom.',
          keywords: [
            'flooring contractor software',
            'flooring business software',
            'flooring scheduling software',
            'flooring installer app',
            'flooring company management software',
            'flooring project management',
            'flooring job costing software',
            'flooring crew management app',
            'flooring installation scheduling app',
            'flooring business management app',
          ],
        },
        hero: {
          sectionLabel: 'For Flooring Contractors',
          headline: 'YOUR INSTALLERS ARE YOUR\nMOST EXPENSIVE RESOURCE.\nSTOP WASTING THEIR TIME.',
          subtext: "A flooring install isn't a one-day job. It's subfloor prep, material acclimation, installation, transitions, and cleanup across 2\u20135 days — with every phase depending on the last. OPS schedules the full project, tracks material costs in real time, and gives your crew everything they need from the job site floor, not the showroom desk.",
        },
        painPoints: [
          {
            title: 'Multi-day installs collapse without coordination',
            bullets: [
              'Day 1 subfloor prep, Day 2\u20133 installation, Day 4 transitions and trim — each phase depends on the previous one finishing on time',
              'Plumber runs behind on rough-in and your crew shows up to a site that isn\'t ready — a wasted day of labor and a rescheduled customer',
              'Hardwood needs 3\u20135 days to acclimate before installation — if materials arrive late, the entire project stalls',
              'Failed moisture test on a concrete subfloor pushes everything back and you need to redirect the crew to another job without double-booking',
            ],
            forLine: 'For: Flooring contractors juggling subfloor prep, material delivery, installation crews, and customer schedules across projects that span days',
          },
          {
            title: 'Material waste and blind job costing kill margins',
            bullets: [
              'Every cut creates waste — the difference between a 5% and 15% waste factor on a $10,000 material order is $1,000 of pure margin loss',
              'You don\'t know your true margin on a job until weeks after invoicing — material costs, labor hours, and unexpected subfloor repairs pile up across the project',
              'Underestimate tile and you\'re making an emergency distributor run — overestimate and you\'re stuck with inventory tying up cash',
              'Installer wages growing 11% year-over-year — if you quoted using last year\'s labor rates, this year\'s wages eat directly into profit',
            ],
            forLine: 'For: Flooring contractors losing money because material overages, waste, and inaccurate estimates eat into already-thin margins',
          },
          {
            title: 'Showroom software that doesn\'t work from the subfloor',
            bullets: [
              'QFloors and Epicor RFMS have great estimating — but no mobile app your installer can use to check schedules or document subfloor conditions from a customer\'s living room',
              'Jobber handles scheduling but has no concept of multi-day project phasing, material delivery coordination, or subfloor documentation',
              'ServiceTitan costs $245\u2013$500+ per tech per month — for a 5-installer company, that\'s $15,000\u2013$30,000/year in software on already-thin margins',
              'Your office doesn\'t know if today\'s install is on track until the crew calls at 4 PM — by then it\'s too late to adjust anything',
            ],
            forLine: 'For: Flooring company owners running operations on paper because the software they bought works at the desk but not on the floor',
          },
        ],
        solutions: [
          {
            title: 'Multi-day scheduling that handles the full project.',
            copy: "Schedule a 5-day hardwood installation phase by phase: subfloor prep Monday, acclimation check Tuesday, installation Wednesday\u2013Thursday, transitions Friday. Each phase shows crew assignments, material requirements, and completion status. When the plumber delays rough-in, drag the project forward and the system notifies affected crew and customers. Material delivery dates are tied to project phases — so acclimation timelines are tracked, not forgotten. Multi-project views show every active job across all crews, preventing double-booking and idle time.",
            painPointRef: 0,
          },
          {
            title: 'Know your margin before the invoice goes out.',
            copy: "Track material costs, labor hours, and expenses in real time as the project progresses. When your installer logs 2 extra hours of subfloor repair, the job cost updates immediately — before you invoice, not three weeks after. Photo documentation captures subfloor conditions before installation and completed work at every phase. Job history builds a database of actual costs per project type and surface material, making every future estimate more accurate than the last.",
            painPointRef: 1,
          },
          {
            title: 'From the job site. Not the showroom.',
            copy: "Your installers need to see today's schedule, the project specs, and a way to document their work — from a dusty subfloor, not a showroom desk. 56dp touch targets work with work gloves. Dark theme is readable in any lighting — from a dim basement to a sun-drenched living room. Photo capture documents subfloor condition, installation progress, and completed work. Offline mode works on job sites with no WiFi — common in new construction and renovation projects.",
            painPointRef: 2,
          },
          {
            title: 'Flat pricing. Not per-installer pricing.',
            copy: "Flooring margins are already under pressure from 11% wage inflation and volatile material costs. Your software shouldn't add to the squeeze. OPS is flat-rate regardless of crew size — hire your fourth installer, no price increase. Free to start with no credit card. No implementation fees. No 12-month contracts. Compare: ServiceTitan at $15K\u2013$30K/year for 5 installers, QFloors at enterprise pricing, Jobber at $4,188+/year with user overages. For a flooring company doing $300K\u2013$1M in revenue, OPS is a rounding error.",
            painPointRef: 2,
          },
        ],
        comparison: {
          competitors: ['Jobber', 'Floorzap'],
          rows: [
            { feature: 'Mobile-first crew interface', ops: true, comp1: true, comp2: 'Limited' },
            { feature: 'Multi-day project scheduling', ops: true, comp1: false, comp2: true },
            { feature: 'Per-phase photo documentation', ops: true, comp1: 'Basic', comp2: true },
            { feature: 'Offline mode for job sites', ops: true, comp1: false, comp2: false },
            { feature: 'No per-user pricing', ops: true, comp1: false, comp2: false },
            { feature: 'Starting price', ops: 'Free to start', comp1: '$49/mo', comp2: 'Subscription' },
          ],
        },
        faq: [
          {
            question: 'What is the best software for flooring contractors?',
            answer: "It depends on your primary need. If you need comprehensive estimating and material management, QFloors and Epicor RFMS are industry standards — but they're office-centric with no mobile crew interface. Floorzap offers flooring-specific quoting and scheduling in one tool. Jobber handles basic scheduling and invoicing but doesn't understand multi-day project phasing or material coordination. OPS provides mobile-first crew scheduling, multi-day project management, and photo documentation at flat-rate pricing — bridging the gap between showroom software and generic field service tools.",
          },
          {
            question: 'How do flooring contractors manage multi-day installation projects?',
            answer: "Successful flooring contractors break projects into phases: subfloor preparation, material acclimation (3\u20135 days for hardwood), installation, transitions and trim, and cleanup. Each phase has specific crew assignments, material requirements, and time estimates. The key is scheduling software that supports multi-day projects with phase dependencies — so when one phase runs over, downstream phases adjust automatically. Material delivery dates must be synchronized with installation phases to prevent crew idle time.",
          },
          {
            question: 'How do I reduce material waste on flooring jobs?',
            answer: "Material waste typically runs 5\u201315% depending on room layout, pattern matching, and installer skill. Three things reduce it: precise measurement and waste factor calculation during estimating, tracking actual waste per project type to refine future estimates, and planning cuts to maximize material use across rooms. Real-time job costing that compares estimated vs. actual material use identifies patterns over time. The difference between a 5% and 15% waste factor on a $10,000 material order is $1,000 — pure margin.",
          },
          {
            question: 'How is OPS different from Jobber for flooring companies?',
            answer: "Jobber was built for same-day service businesses — a plumber shows up, fixes the leak, and closes the job. Flooring doesn't work that way. A hardwood install runs 3\u20135 days with subfloor prep, acclimation, installation, and finishing phases that depend on each other. Jobber has no concept of multi-day project phasing, material delivery coordination, or trade dependencies. It also charges per user, which gets expensive as you add seasonal installers. OPS handles multi-day projects natively, works offline on job sites without WiFi, and doesn't charge per user.",
          },
          {
            question: 'How is the installer labor shortage affecting flooring companies?',
            answer: "Skilled flooring installers are the scarcest resource in the trade. The workforce is aging out, younger workers aren't entering at sufficient rates, and installer wages have grown 11% — significantly faster than the 7.3% construction median. This means every hour of installer idle time costs more than it did last year. Flooring contractors can't hire their way out of the problem. The answer is making the crews you have more productive — better scheduling, fewer wasted trips, less rework from miscommunication — so every installer hour generates revenue.",
          },
        ],
        cta: {
          headline: 'STOP WASTING YOUR MOST EXPENSIVE RESOURCE.',
          subtext: "Your installers cost more every year. Every hour they spend waiting for materials, driving to sites that aren't ready, or calling the office for specs is money you don't get back. OPS puts the plan in their hands.",
        },
      },
    },
  },
  // ─── Drywall ───────────────────────────────────────────────────────────
  {
    slug: 'drywall',
    name: 'Drywall',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'apps' },
      { variant: 'dashboard' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left-to-right' },
      { deviceType: 'laptop', flowDirection: 'top-to-bottom' },
      { deviceType: 'tablet', flowDirection: 'right-to-left' },
      { deviceType: 'desktop', flowDirection: 'left-to-right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Drywall Contractor Management Software | OPS',
          description: 'Phase-by-phase scheduling, multi-site crew dispatch, and trade coordination — built for drywall subs who need more than a spreadsheet but less than Procore.',
          keywords: [
            'drywall contractor software',
            'drywall business software',
            'drywall scheduling software',
            'drywall crew management app',
            'drywall project management software',
            'drywall subcontractor management',
            'drywall job tracking app',
            'drywall estimating and scheduling',
            'drywall business management app',
            'drywall installer scheduling software',
          ],
        },
        hero: {
          sectionLabel: 'For Drywall Contractors',
          headline: 'FIVE PHASES. THREE TRADES.\nZERO ROOM FOR ERROR.',
          subtext: "Hanging, taping, mudding, sanding, finishing — each phase has its own crew, its own drying time, and its own way of falling behind. And you're coordinating all of it around electricians who aren't done and painters who are waiting. OPS tracks every phase across every site so your crews go where the work is actually ready.",
        },
        painPoints: [
          {
            title: 'Every phase depends on the last one drying',
            bullets: [
              'Hanging, taping, first coat, second coat, sanding, finishing — each phase needs 24\u201348 hours of drying time that humidity can extend without warning',
              'Electrical and plumbing rough-in must be complete and inspected before hanging starts — one trade running behind halts your entire operation',
              'A 5-crew company has crews at 3\u20134 different sites, each at different phases — knowing which crew goes where tomorrow requires real-time visibility, not phone calls',
              'Schedule sanding based on standard timing, mud isn\'t dry, crew shows up and can\'t work — a wasted day you could have sent them to another site',
            ],
            forLine: 'For: Drywall contractors managing hanging, taping, mudding, sanding, and finishing across multiple sites while coordinating with electricians, plumbers, and painters',
          },
          {
            title: 'The labor crisis is making every other problem worse',
            bullets: [
              'Drywall installers are among the hardest skilled labor roles to fill — 88% of firms with craft workers report open positions',
              'Installer wages have grown 11% while margins stay flat — if your estimates use last year\'s rates, every job is less profitable than projected',
              'Less experienced workers create quality issues that weren\'t a problem five years ago — poor mudding and sanding shows through paint',
              'More bodies doesn\'t solve it — overcrowded sites, higher safety risk, less accountability. The answer is making the crews you have more productive.',
            ],
            forLine: 'For: Drywall company owners who can\'t find skilled hangers and finishers while wages climb 11% and quality drops with every green hire',
          },
          {
            title: 'Enterprise software for subcontractor budgets',
            bullets: [
              'Procore and Buildertrend are built for general contractors — bidding portals, architectural drawings, client selection tools you\'ll never touch',
              'ServiceTitan costs $245\u2013$500+ per tech per month with $5K\u2013$50K implementation — for a 10-person drywall crew, that\'s $30K\u2013$60K/year',
              'Jobber was designed for same-day service calls — no phased construction workflows, no drying time between phases, no trade coordination',
              'So most drywall companies use nothing. Phone calls, text messages, and handshake agreements with the GC. The software market failed this trade.',
            ],
            forLine: 'For: Drywall subcontractors paying GC prices for software they only use 20% of',
          },
        ],
        solutions: [
          {
            title: 'Phase-by-phase scheduling across every site.',
            copy: "Schedule hanging crew at Site A Monday, taping at Site B, finishing at Site C — with phase completion tracking that shows which sites are ready for the next step. When mud needs an extra day to dry, push sanding forward and redirect the crew to a site that IS ready. Trade coordination notes track when electrical passed inspection and when the GC says the site is clear for hang. Tomorrow's dispatch is based on reality, not assumptions.",
            painPointRef: 0,
          },
          {
            title: 'Make every crew hour count.',
            copy: "When skilled hangers cost $27+/hour and wages are climbing 11% annually, idle time is the most expensive line item you're not tracking. Real-time crew visibility shows where every team is and what phase they're completing. Photo documentation captures work quality at each phase — catch finishing issues before the painter shows up. Time tracking per phase per site builds accurate labor cost data for future estimates. Crew scheduling prevents the #1 waste: sending workers to a site that isn't ready for their phase.",
            painPointRef: 1,
          },
          {
            title: 'Built for the job site. Not the office trailer.',
            copy: "Drywall sites are dusty, messy, and don't always have WiFi. Your scheduling app needs to handle all of that. 56dp touch targets work with work gloves. Dark theme is readable from a dark interior to a bright exterior. Photo documentation captures each phase — hanging alignment, tape seams, mud coats, finished surfaces — for quality tracking and GC sign-off. Works offline on new construction shells without cell service. Your crew sees their schedule and phase requirements without calling anyone.",
            painPointRef: 1,
          },
          {
            title: "You're a sub, not a GC. Price accordingly.",
            copy: "Your software budget should match your role. OPS is flat-rate regardless of crew size — whether you're running 3 workers or 30. Free to start with no credit card. No implementation fees. No 12-month contracts. Compare: Procore and Buildertrend at enterprise GC pricing, ServiceTitan at $30K\u2013$60K/year for 10 workers, Jobber at $4,188+/year with user overages. For a drywall sub doing $500K\u2013$2M in revenue, OPS is insignificant overhead.",
            painPointRef: 2,
          },
        ],
        comparison: {
          competitors: ['Jobber', 'Contractor+'],
          rows: [
            { feature: 'Mobile-first crew app', ops: true, comp1: 'Limited', comp2: true },
            { feature: 'Multi-phase project scheduling', ops: true, comp1: false, comp2: 'Limited' },
            { feature: 'Per-phase photo documentation', ops: true, comp1: 'Basic', comp2: true },
            { feature: 'Offline mode for job sites', ops: true, comp1: false, comp2: false },
            { feature: 'No per-user pricing', ops: true, comp1: false, comp2: 'Free tier limited' },
            { feature: 'Starting price', ops: 'Free to start', comp1: '$49/mo', comp2: 'Free tier' },
          ],
        },
        faq: [
          {
            question: 'What is the best software for drywall contractors?',
            answer: "It depends on your role. If you're a GC with drywall crews, Procore or Buildertrend provide comprehensive project management — at GC pricing. If you're a drywall subcontractor, Contractor+ offers sub-focused features including scheduling and invoicing with a free tier. Jobber is accessible but was designed for same-day service, not phased construction. Knowify offers construction-specific job costing. OPS combines multi-phase scheduling, crew management, photo documentation, and trade coordination at flat-rate pricing that works for sub margins.",
          },
          {
            question: 'How do drywall contractors manage multi-phase scheduling?',
            answer: "Successful drywall contractors schedule by phase, not just by day. Hanging, taping, first coat, second coat, sanding, and finishing each require specific crews and drying time between phases. The key is tracking phase completion per site so crews are dispatched to sites that are actually ready for their phase — not sites where mud is still drying. A 5-crew company with 3\u20134 active sites needs multi-site visibility showing phase status across all jobs. Without it, you're making dispatch decisions based on yesterday's phone call instead of today's reality.",
          },
          {
            question: 'How is the labor shortage affecting drywall contractors?',
            answer: "Drywall is one of the hardest-hit trades. 88% of firms report open positions and installer wages have grown 11% — almost double the 7.3% construction average. The shortage hurts quality too: less experienced crews produce finishing work that shows through paint, requiring rework that doubles labor costs. 56% of contractors report failing to meet schedule timelines due to labor shortages. The answer isn't more bodies on overcrowded sites. It's making existing crews more productive through better scheduling that eliminates idle time, wasted trips, and phase mismatches.",
          },
          {
            question: 'How is OPS different from Procore for drywall subcontractors?',
            answer: "Procore is built for general contractors managing dozens of subs, change orders, architectural drawings, and bidding portals across large-scale projects. If you're a drywall sub running 5\u201315 workers across 3\u20134 active job sites, you don't need 90% of what Procore offers — but you're paying enterprise pricing for all of it. OPS gives drywall subs what they actually need: phase-by-phase scheduling, multi-site crew dispatch, photo documentation per phase, and trade coordination — at flat-rate pricing. Deploy it today, not in three months.",
          },
          {
            question: 'How do drywall contractors coordinate with other trades?',
            answer: "Drywall sits in the middle of the construction sequence: after electrical and plumbing rough-in and inspection, before painting and final trim. A missed handoff from any trade halts your operation. Real-time communication with GCs about site readiness, tracking inspection schedules, and flexible crew dispatching are essential. The most common and expensive failure is sending a crew to a site that isn't ready for their phase. OPS tracks site readiness and phase status so you dispatch crews to sites where work can actually happen — not sites where you're hoping the electrician finished.",
          },
        ],
        cta: {
          headline: 'STOP SENDING CREWS TO SITES THAT AREN\'T READY.',
          subtext: "Every wasted trip is hours of skilled labor you don't get back. OPS tracks which sites are ready for which phase — so your crews go where the work is, not where you hope it is.",
        },
      },
    },
  },
  // ─── Appliance Repair ──────────────────────────────────────────────────
  {
    slug: 'appliance-repair',
    name: 'Appliance Repair',
    painPointConfig: [
      { variant: 'dashboard' },
      { variant: 'apps' },
      { variant: 'messages' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left-to-right' },
      { deviceType: 'laptop', flowDirection: 'top-to-bottom' },
      { deviceType: 'tablet', flowDirection: 'right-to-left' },
      { deviceType: 'desktop', flowDirection: 'left-to-right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Appliance Repair Business Software | OPS',
          description: 'Dispatch smarter, document diagnostics, and stop making two trips when one will do — built for appliance repair companies competing with franchise chains.',
          keywords: [
            'appliance repair software',
            'appliance repair scheduling software',
            'appliance repair business software',
            'appliance repair dispatch software',
            'appliance repair management app',
            'appliance repair invoicing app',
            'appliance repair inventory management',
            'appliance repair field service management',
            'appliance repair technician app',
            'appliance repair business management',
          ],
        },
        hero: {
          sectionLabel: 'For Appliance Repair Companies',
          headline: 'STOP MAKING TWO TRIPS\nWHEN ONE WILL DO.',
          subtext: "The industry average first-time fix rate is 75%. That means 1 in 4 jobs sends your tech back out — burning fuel, blocking a new appointment, and frustrating a customer who already waited once. OPS documents diagnostics, tracks what's on every truck, and gives your techs everything they need to close the job on the first visit.",
        },
        painPoints: [
          {
            title: 'One in four jobs requires a second trip — and each one costs you $200+',
            bullets: [
              'Tech diagnoses a failed water inlet valve but doesn\'t have one on the van — customer waits days, you lose a future appointment slot, and they might call your competitor instead',
              'Tracking hundreds of parts across multiple vans is chaos — every brand uses different part numbers for the same component',
              'Each callback costs $150\u2013$300 in wasted labor and fuel, plus the new job you could\'ve run in that slot',
              'Improving first-time fix rate from 75% to 90% adds capacity for 2\u20133 additional billable jobs per week per technician',
            ],
            forLine: 'For: Appliance repair owners watching profits disappear into second truck rolls because techs didn\'t have the right parts',
          },
          {
            title: 'Customers expect franchise-level service from a 3-person shop',
            bullets: [
              'Homeowners compare your service to Amazon delivery tracking — they want online booking, text updates, and accurate arrival windows',
              'Manufacturers require digital documentation for warranty payouts — model numbers, serial numbers, failure codes, photos. Paper doesn\'t cut it.',
              'Quotes don\'t get sent in time, follow-ups fall through the cracks, customers who called three days ago still haven\'t been scheduled',
              'Sears Home Services and Mr. Appliance have enterprise tech platforms — your 4-tech shop needs the same customer experience without the franchise overhead',
            ],
            forLine: 'For: Independent appliance repair companies losing jobs because they can\'t match the booking experience of franchise chains',
          },
          {
            title: 'Enterprise pricing for an industry of small businesses',
            bullets: [
              'ServiceTitan costs $245\u2013$500+ per tech per month plus $5K\u2013$50K implementation — for a 4-tech company, that\'s $12K\u2013$24K/year on $400K revenue',
              'Housecall Pro charges $59\u2013$329/month with add-ons ($40/mo proposals, $149/mo price book) pushing real costs well above the sticker price',
              'Workiz charges per-user with costs scaling as you add technicians — features like inventory tracking require higher-tier plans',
              'None of these are built for appliance repair. No model/serial number tracking, no failure code libraries, no first-time fix rate analytics. Just generic scheduling.',
            ],
            forLine: 'For: Appliance repair owners paying enterprise prices for generic tools that don\'t understand diagnostics, parts, or warranty workflows',
          },
        ],
        solutions: [
          {
            title: 'Fix it right the first time.',
            copy: "Track what's on every truck before you dispatch. When a tech diagnoses the problem, they log exactly what they need — model number, part number, symptoms, photos — so the return visit starts with the part already on the van. Job documentation captures appliance details, failure symptoms, and diagnostic photos in real time. Over time, you see which appliance types and which parts drive the most callbacks, so you stock smarter and train better. Every percentage point of first-time fix rate improvement is money straight to your bottom line.",
            painPointRef: 0,
          },
          {
            title: 'Professional service. Small business overhead.',
            copy: "Automated booking confirmation, real-time ETA updates, and professional digital invoices — the same customer experience franchise chains deliver, without the franchise fees. Customers book online 24/7. Automated text reminders reduce no-shows. Digital invoices with parts line items and warranty documentation are generated on-site and sent before the technician leaves the driveway. Customer equipment history shows every appliance you've serviced at that address, with previous repairs and warranty status.",
            painPointRef: 1,
          },
          {
            title: 'Built for the utility room. Not the boardroom.',
            copy: "Your techs work in basements, garages, and tight kitchen spaces — not at desks. 56dp touch targets work with work gloves. Dark theme is readable behind a refrigerator or in a bright laundry room. Photo capture documents the problem, the repair, and the installed parts for warranty compliance. Works offline because basements don't have WiFi. Sync when you're back in the van. Your tech sees the job, the appliance history, and what's on their truck — nothing more, nothing less.",
            painPointRef: 1,
          },
          {
            title: 'Your parts cost enough. Your software shouldn\'t.',
            copy: "OPS is flat-rate regardless of team size — add technicians as you grow, no price increase. Free to start with no credit card. No implementation fees. No 12-month contracts. No $5,000 setup. Compare: ServiceTitan at $12K\u2013$24K/year for 4 techs, Housecall Pro at $3,948+/year with add-ons, Workiz at per-user rates that scale up. For an appliance repair company doing $300K\u2013$600K in revenue, OPS costs less than a single callback.",
            painPointRef: 2,
          },
        ],
        comparison: {
          competitors: ['Workiz', 'Housecall Pro'],
          rows: [
            { feature: 'Mobile-first dark theme UI', ops: true, comp1: false, comp2: false },
            { feature: 'Scheduling + dispatching', ops: true, comp1: true, comp2: true },
            { feature: 'Per-job photo documentation', ops: true, comp1: true, comp2: true },
            { feature: 'Offline mode for basements', ops: true, comp1: false, comp2: false },
            { feature: 'No per-user pricing', ops: true, comp1: false, comp2: false },
            { feature: 'Starting price', ops: 'Free to start', comp1: '$198/mo (5 users)', comp2: '$59/mo' },
          ],
        },
        faq: [
          {
            question: 'What is the best software for appliance repair businesses?',
            answer: "Workiz is the most popular among small-to-mid appliance repair companies for dispatch and call tracking — but it charges per-user, and costs add up as you grow. Housecall Pro offers scheduling and invoicing but provides the same generic features it gives HVAC and plumbing companies. ServiceTitan is designed for large operations at $245\u2013$500+ per tech per month. None of them are built for appliance repair specifically. OPS combines scheduling, dispatch, photo documentation, and mobile job management at flat-rate pricing that works for a 2-tech shop or a 15-van fleet.",
          },
          {
            question: 'How can I improve my first-time fix rate?',
            answer: "The industry average is 75% — meaning 1 in 4 jobs requires a return trip. Three things drive improvement: stock common parts per appliance type on each van based on historical job data, capture detailed diagnostics during the first visit so return trips start prepared, and track which appliance types and failure modes cause the most callbacks so you can pre-stage those parts. Improving from 75% to 90% adds capacity for 2\u20133 additional billable jobs per week per technician. That's real revenue, not a theoretical number.",
          },
          {
            question: 'How do I handle manufacturer warranty claims efficiently?',
            answer: "Manufacturers increasingly require digital documentation: model and serial numbers, photos of the failure, parts used, labor hours, and technician notes. Incomplete paperwork means denied claims and delayed payments. Digital job documentation that captures all required fields on-site — on the technician's phone, during the repair — eliminates the end-of-day paperwork scramble and the incomplete forms that get rejected. OPS photo documentation and job notes give you a complete record for every warranty repair.",
          },
          {
            question: 'How is OPS different from Workiz for appliance repair?',
            answer: "Workiz is a strong fit for appliance repair with solid dispatch and call tracking features. The main differences are pricing model and field experience. Workiz charges per-user — at $198/month for 5 users, costs scale linearly as you hire. OPS is flat-rate regardless of team size. OPS also works offline — critical for appliance repair techs working in basements and utility rooms with no cell signal — and uses a dark-themed, glove-friendly interface designed specifically for field conditions, not office use.",
          },
          {
            question: 'What\'s the biggest challenge for independent appliance repair vs. franchise chains?',
            answer: "Franchise chains like Sears Home Services and Mr. Appliance run enterprise tech platforms that deliver real-time ETAs, automated customer communications, and professional digital invoicing. Matching that customer experience without franchise overhead is the challenge. Most independent shops still answer the phone, scribble on paper, and send handwritten invoices. The solution is affordable software that delivers the same professional experience. OPS at flat-rate pricing provides the same capabilities — online booking, automated updates, digital invoicing — that franchise operations pay thousands per month to access.",
          },
        ],
        cta: {
          headline: 'STOP PAYING FOR TWO TRIPS.',
          subtext: "Every callback is wasted fuel, a blocked appointment, and a frustrated customer. OPS helps your techs fix it right the first time — and document everything for the warranty claim while they're at it.",
        },
      },
    },
  },

  // ─── Handyman ─────────────────────────────────────────────────────────
  {
    slug: 'handyman',
    name: 'Handyman',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left-to-right' },
      { deviceType: 'laptop', flowDirection: 'top-to-bottom' },
      { deviceType: 'tablet', flowDirection: 'right-to-left' },
      { deviceType: 'desktop', flowDirection: 'left-to-right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Handyman Business Software | OPS',
          description: 'Manage 15 different job types from one app. Scheduling, quoting, photo documentation, and crew management — built for handyman businesses that do it all.',
          keywords: [
            'handyman software',
            'handyman business software',
            'handyman scheduling app',
            'handyman business management software',
            'handyman invoicing app',
            'handyman estimating software',
            'handyman CRM',
            'handyman job management app',
            'best software for handyman business',
            'handyman field service management',
          ],
        },
        hero: {
          sectionLabel: 'For Handyman Businesses',
          headline: '15 DIFFERENT JOBS.\nONE APP THAT KEEPS UP.',
          subtext: "Drywall at 8. Faucet at 10. Deck repair after lunch. You cover more trades from one truck than most companies run in a year. OPS handles the quoting, scheduling, and follow-up — so you stay on the job, not on the phone.",
        },
        painPoints: [
          {
            title: 'Every job is different — and pricing every one is a gamble',
            bullets: [
              'Drywall patch vs. faucet swap vs. deck repair — each needs different materials, different time, different pricing. No single formula works.',
              'Unforeseen damage behind walls turns a 2-hour job into a 6-hour job at the same quoted price. Your margin just disappeared.',
              'Underpricing to beat unlicensed guys and platform-driven rates leads straight to burnout and empty bank accounts.',
              "Homeowners expect a price before you show up. Without fast, accurate quotes, you're either losing the job or losing money.",
            ],
            forLine: 'For: Solo operators and small crews quoting 5\u201310 different service types a week',
          },
          {
            title: 'Scheduling chaos multiplies the moment you grow',
            bullets: [
              'What worked for 5 jobs a week breaks at 15 — overlapping bookings, missed follow-ups, jobs that fall through the cracks.',
              'Multi-day projects across drywall, painting, plumbing, and carpentry are impossible to coordinate from a phone call log.',
              'New booking gets written on a sticky note. Follow-up gets forgotten. Customer calls a competitor.',
              'Confirmation texts, arrival ETAs, recurring maintenance reminders — every missed communication kills a referral.',
            ],
            forLine: 'For: Handyman businesses scaling from solo to 2\u20135 workers',
          },
          {
            title: 'Software built for plumbers, priced for empires',
            bullets: [
              'ServiceTitan charges $245\u2013$500 per tech per month with $5,000\u2013$50,000 setup fees. For a solo handyman making $60K a year, that is absurd.',
              'Jobber starts at $39 but hits $169 for a team of 5 with $29 per-user overages. Add the marketing suite and you are north of $250 a month.',
              'Housecall Pro scales to $329 a month before the $40 proposal tool, $149 price book, and $20 per-vehicle GPS tracking add-ons.',
              "None of them handle multi-trade workflows. They're built for one-trade companies. A handyman doing 15 service types needs flexibility, not rigid plumbing templates.",
            ],
            forLine: 'For: Handyman owners who need more than a spreadsheet but refuse to pay $300 a month for HVAC software',
          },
        ],
        solutions: [
          {
            title: 'Quote any job in 60 seconds.',
            copy: "Drywall patch? Faucet replacement? Deck repair? Quote it from your truck before you leave the first job. Flexible job types handle every service a handyman offers — no rigid plumbing or HVAC templates. Snap a photo to capture the scope before quoting. Job history shows what you charged for similar work, so pricing stays consistent and profitable across every trade you cover.",
            painPointRef: 0,
          },
          {
            title: 'One calendar. Every trade. Zero chaos.',
            copy: "Drywall in the morning, plumbing at noon, furniture assembly at 3. One calendar handles every service type without the overlap. Color-coded job types show your full day at a glance. Multi-day projects stay organized across phases. Automated confirmation and reminder texts cut no-shows. Your crew knows where they are going next without calling you.",
            painPointRef: 1,
          },
          {
            title: 'Built for the truck, not the office.',
            copy: "You go from a kitchen to a garage to a deck in one day. Your app needs to keep up. 56dp touch targets work with work gloves. Dark theme is readable from a crawl space to a sunny deck. Photo documentation captures before and after for every job type. Download today. Schedule your first job today. No 3-week implementation, no $5,000 setup fee, no sales demo required.",
            painPointRef: 2,
          },
          {
            title: '$79 a month flat. Not per-trade, not per-worker.',
            copy: "You cover 15 different trades from one truck. Your software should cover them all at one price. $79 a month flat regardless of team size — hire a helper for busy season, no price increase. Compare: ServiceTitan at $15,000\u2013$30,000 a year for a 5-person team. Jobber at $4,000+ a year with overages. Housecall Pro at $3,900+ a year with add-ons. OPS at $948 a year flat. Less than 1% of gross revenue for most handyman businesses.",
            painPointRef: 2,
          },
        ],
        comparison: {
          competitors: ['Jobber', 'Housecall Pro'],
          rows: [
            { feature: 'Multi-trade job categorization', ops: true, comp1: 'Limited', comp2: 'Limited' },
            { feature: 'Photo documentation per job', ops: true, comp1: true, comp2: true },
            { feature: 'Works offline', ops: true, comp1: 'Limited', comp2: 'Limited' },
            { feature: 'Mobile-first dark theme UI', ops: true, comp1: false, comp2: false },
            { feature: 'Flat pricing (no per-user fees)', ops: '$79/mo flat', comp1: '$39\u2013349/mo + $29/user', comp2: '$59\u2013329/mo + per-user' },
            { feature: 'Free to start', ops: true, comp1: false, comp2: false },
          ],
        },
        faq: [
          {
            question: 'What is the best software for a handyman business?',
            answer: "It depends on your size and workflow. Most handyman businesses try Jobber or Housecall Pro and find them too expensive for what they actually use, or too rigid for multi-trade work. OPS is built for field crews running diverse job types — quoting, scheduling, photo documentation, and crew management at $79 a month flat. No per-user pricing that punishes you for hiring. No single-trade templates that don't fit how you work.",
          },
          {
            question: 'How should I price handyman services?',
            answer: "Most handymen charge $50\u2013$150 an hour, with the national average around $60\u2013$85. Price by job type, not just by hour — carpentry, plumbing, and electrical command higher rates than general maintenance. Always factor in materials, drive time, and a margin for the unexpected. The average homeowner spends about $408 per project. Track what you charge for similar jobs to build consistent pricing. OPS job history makes this automatic.",
          },
          {
            question: 'How do I manage scheduling for multiple job types?',
            answer: "Handymen juggle 5\u201310 different service types in a single day, unlike plumbers or electricians who run similar jobs all day. You need color-coded job categorization, realistic time blocking per service type, and buffer time between jobs. Multi-day jobs like a bathroom remodel need phase-based scheduling. OPS handles all of this from a single mobile calendar — one place for every trade you cover.",
          },
          {
            question: 'How much does handyman business software cost?',
            answer: "ServiceTitan: $245\u2013$500 per tech per month plus $5,000\u2013$50,000 implementation. Housecall Pro: $59\u2013$329 per month plus add-ons that can double the price. Jobber: $39\u2013$349 per month plus $29 per extra user. OPS: Free to start, $79 per month flat regardless of team size. For a typical solo handyman or 2\u20133 person crew, OPS costs $948 a year. Elsewhere you are looking at $2,000\u2013$6,000 or more.",
          },
          {
            question: 'How do I grow a handyman business from solo to a team?',
            answer: "The transition from solo to team is where most handyman businesses break. You need systems for scheduling multiple workers, tracking job completion, maintaining quality, and managing customer communication at scale. The biggest mistake is adding workers without adding systems — you get scheduling chaos, inconsistent quality, and lost revenue. Start with software that scales with you. OPS flat pricing means adding your second or fifth worker costs zero more in software fees.",
          },
        ],
        cta: {
          headline: 'STOP JUGGLING 15 TRADES ON A STICKY NOTE.',
          subtext: 'One app for every job type. Free to start. No training, no contracts, no per-user pricing that punishes you for growing.',
        },
      },
    },
  },

  // ─── Pressure Washing ─────────────────────────────────────────────────
  {
    slug: 'pressure-washing',
    name: 'Pressure Washing',
    painPointConfig: [
      { variant: 'dashboard' },
      { variant: 'messages' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'top-to-bottom' },
      { deviceType: 'laptop', flowDirection: 'left-to-right' },
      { deviceType: 'tablet', flowDirection: 'right-to-left' },
      { deviceType: 'desktop', flowDirection: 'top-to-bottom' },
    ],
    content: {
      en: {
        meta: {
          title: 'Pressure Washing Business Software | OPS',
          description: 'Respond faster, route smarter, and stop losing jobs to the company that showed up first. Scheduling, before/after photos, and recurring service management for pressure washing crews.',
          keywords: [
            'pressure washing software',
            'pressure washing business software',
            'pressure washing scheduling app',
            'pressure washing CRM',
            'pressure washing invoicing app',
            'pressure washing route optimization',
            'pressure washing business management',
            'pressure washing recurring service software',
            'best software for pressure washing business',
            'pressure washing crew management app',
          ],
        },
        hero: {
          sectionLabel: 'For Pressure Washing Companies',
          headline: 'YOUR COMPETITOR\nALREADY RESPONDED.',
          subtext: "78% of customers hire the first company to reply. The average pressure washing business takes 47 hours to respond to a lead. That is two days. By then, the job is gone. OPS puts the quote in your customer's hands while you are still on the rig.",
        },
        painPoints: [
          {
            title: '71% of your leads never get a response',
            bullets: [
              "78% of customers buy from the first company to respond. You are not competing on price — you are competing on speed. 15 minutes wins. 47 hours loses.",
              'The average pressure washing business takes 47 hours to respond to a lead. That is two full business days. The customer already hired someone else.',
              '71% of leads never receive any response at all. Every unanswered call and unread text is revenue left on the table. For a business spending $500\u2013$2,000 a month on ads, that is thousands wasted.',
              'Commercial contract opportunities require professional, rapid proposals — not a text message three days later.',
            ],
            forLine: 'For: Pressure washing operators losing jobs to faster competitors',
          },
          {
            title: 'Seasonal swings destroy cash flow — and per-user software makes it worse',
            bullets: [
              '70\u201385% of annual revenue concentrates into 7\u20138 months. Northern operators face 3\u20134 months with almost zero work. Cash flow planning without recurring contracts is guesswork.',
              'Bringing on 3 extra crew for peak season at $29 per user per month adds $90\u2013$180 in software costs alone — for temporary workers who leave in October.',
              '58% of the market is long-term commercial contracts. 61% of commercial clients prefer recurring arrangements. But tracking which properties are due and managing route density requires tools most operators lack.',
              'Off-season revenue strategies — Christmas lighting, gutter cleaning, window washing — need flexible scheduling. Your software should handle multiple service types, not just pressure washing templates.',
            ],
            forLine: 'For: Pressure washing owners who triple crew size in spring and watch revenue drop to near-zero in winter',
          },
          {
            title: 'Incorrect pricing is the #1 reason pressure washing businesses fail',
            bullets: [
              'Two-thirds of pressure washing businesses gross under $50,000. The difference between those businesses and the ones doing $200K is not demand or skill — it is pricing discipline.',
              'Pricing per square foot varies by surface, condition, and accessibility. Driveways, decks, siding, and roofs each require different time, chemicals, and equipment. Without data from past jobs, every estimate is a guess.',
              'Profitable operators target average tickets of $800\u2013$1,200 and maintain 40\u201350% margins. Getting there requires knowing your true cost per job — labor, chemicals, fuel, equipment, insurance.',
              'New operators undercharge to win business. It works until the margins disappear, the equipment breaks, and the business folds.',
            ],
            forLine: 'For: Pressure washing operators working 60-hour weeks with nothing to show for it',
          },
        ],
        solutions: [
          {
            title: 'Respond in minutes. Not days.',
            copy: "Every lead notification hits your phone instantly. Quote the job from your truck between sites — service type, square footage, price — and send a professional estimate before the customer calls your competitor. One tap turns a booking request into a scheduled job. Automated confirmation texts and pre-service reminders cut no-shows. Stop losing 71% of your leads. Win the response race.",
            painPointRef: 0,
          },
          {
            title: 'Seasonal crews without seasonal software bills.',
            copy: "Hire 3 extra crew for peak season. Add them to OPS. Pay the same $79 a month. Flat pricing means your software cost stays fixed whether you are running 1 rig in January or 4 rigs in June. Recurring service management tracks which properties are due, groups them into efficient routes, and auto-schedules the next visit. Off-season services use the same calendar — no separate tools needed.",
            painPointRef: 1,
          },
          {
            title: 'Before and after that sells the next job.',
            copy: "Every completed job includes timestamped before/after photos attached to the work order. Commercial clients get professional completion reports. Homeowners see the transformation and share it with neighbors — your best marketing at zero cost. Job history shows each property's cleaning schedule and condition over time, turning one-time customers into annual accounts.",
            painPointRef: 2,
          },
          {
            title: '$79 a month flat. Not per-rig, not per-crew.',
            copy: "Your busiest month should not be your most expensive software month. $79 a month flat regardless of crew size — scale from 1 rig to 5 rigs with no price increase. Compare: Jobber at $4,000+ a year for a growing team. Housecall Pro at $3,900+ a year with add-ons. ServiceMonster at $360\u2013$1,200 a year. OPS at $948 a year flat. Less than 1% of gross revenue for a pressure washing business doing $100K\u2013$300K.",
            painPointRef: 1,
          },
        ],
        comparison: {
          competitors: ['Jobber', 'ServiceMonster'],
          rows: [
            { feature: 'Route optimization', ops: true, comp1: '$119+/mo plan', comp2: true },
            { feature: 'Before/after photo documentation', ops: true, comp1: true, comp2: true },
            { feature: 'Works offline', ops: true, comp1: 'Limited', comp2: 'Limited' },
            { feature: 'Multi-service type support', ops: true, comp1: true, comp2: 'Limited' },
            { feature: 'Flat pricing (no per-user fees)', ops: '$79/mo flat', comp1: '$39\u2013349/mo + $29/user', comp2: 'Per-user tiers' },
            { feature: 'Free to start', ops: true, comp1: false, comp2: false },
          ],
        },
        faq: [
          {
            question: 'What is the best software for a pressure washing business?',
            answer: "It depends on your operation size and whether you need seasonal flexibility. ServiceMonster was built for exterior cleaning but lacks full business management. Jobber is popular but charges per user — painful when you double crew size for summer. Housecall Pro locks route optimization behind premium tiers. OPS combines scheduling, route optimization, photo documentation, and recurring service management at $79 a month flat with no per-user charges and no annual contracts.",
          },
          {
            question: 'How should I price pressure washing jobs?',
            answer: "Most contractors charge $0.30\u2013$0.80 per square foot, varying by surface: driveways at $0.50, decks at $0.55, siding at $0.50, roofs at $0.70. Profitable operators target average tickets of $800\u2013$1,200 for residential, with the most successful exceeding $1,400. Know your true cost per job — labor, chemicals, fuel, equipment depreciation, and insurance. Track actual costs versus estimates to tighten pricing over time.",
          },
          {
            question: 'How do I manage seasonal revenue swings in pressure washing?',
            answer: "Three strategies. First, build recurring commercial maintenance contracts — 58% of the market is long-term agreements, and 61% of commercial clients prefer recurring service. Second, diversify for the off-season with gutter cleaning, window washing, or Christmas lighting. Third, offer spring and summer prepay packages that lock in revenue early. OPS manages recurring visits and multi-service scheduling in one platform year-round.",
          },
          {
            question: 'How much does pressure washing software cost?',
            answer: "ServiceMonster runs $30\u2013$100 a month. Jobber runs $39\u2013$349 a month plus $29 per extra user. Housecall Pro runs $59\u2013$329 a month plus add-ons. ServiceTitan runs $245\u2013$500 per tech per month — overbuilt for most pressure washing operations. OPS is free to start, then $79 a month flat regardless of crew size. For a growing company with seasonal crew fluctuation, the difference is $948 a year versus $2,000\u2013$6,000 elsewhere.",
          },
          {
            question: 'How do I grow a pressure washing business beyond $100K a year?',
            answer: "Two-thirds of pressure washing businesses gross under $50,000. Breaking through requires three shifts. First, move from residential-only to commercial contracts — property managers, HOAs, and retail centers provide recurring revenue at higher values. Second, optimize routes for density — serving 8\u201312 properties per day instead of 4\u20135 doubles revenue without doubling crew. Third, add crew with systems in place so quality stays consistent as you scale.",
          },
        ],
        cta: {
          headline: 'STOP LOSING JOBS TO THE FASTER REPLY.',
          subtext: 'Respond faster. Route smarter. Get paid on site. Free to start — no sales call, no contract, no per-user pricing.',
        },
      },
    },
  },

  // ─── Snow Removal ─────────────────────────────────────────────────────
  {
    slug: 'snow-removal',
    name: 'Snow Removal',
    painPointConfig: [
      { variant: 'apps' },
      { variant: 'dashboard' },
      { variant: 'messages' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left-to-right' },
      { deviceType: 'desktop', flowDirection: 'top-to-bottom' },
      { deviceType: 'tablet', flowDirection: 'right-to-left' },
      { deviceType: 'laptop', flowDirection: 'left-to-right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Snow Removal & Plowing Management Software | OPS',
          description: 'Storm dispatch, route tracking, proof of service — built for snow crews working at 3 AM in truck cabs with gloved hands. Not another 9-to-5 scheduling app.',
          keywords: [
            'snow removal software',
            'snow plowing dispatch software',
            'snow removal management software',
            'snow plow route planning app',
            'snow removal billing software',
            'snow contractor scheduling app',
            'snow removal proof of service app',
            'snow plowing GPS tracking',
            'snow removal crew tracking',
            'snow plow dispatch app',
          ],
        },
        hero: {
          sectionLabel: 'For Snow Removal Companies',
          headline: "IT'S 3 AM.\nYOUR CREWS NEED ROUTES.",
          subtext: "The radar just hit trigger depth. You have 45 minutes to mobilize crews, assign routes, and get trucks rolling — while your phone blows up with client calls. OPS turns overnight dispatch chaos into a structured, one-tap operation. Built for gloved hands in a dark truck cab, not a desk jockey at 9 AM.",
        },
        painPoints: [
          {
            title: 'Storm dispatch at 2 AM is pure chaos',
            bullets: [
              'Trigger thresholds vary by contract — commercial at 1.5 inches, residential at 2, some at 3+. A contractor with 50 properties has 3\u20134 different triggers active at once. That is one person staring at radar at 3 AM making dispatch decisions from memory.',
              'Communication breaks down under storm pressure. Phone trees and group texts do not scale during a 12-hour event with dozens of properties and multiple crews.',
              'Routes need reoptimization mid-storm. Blocked roads, equipment breakdowns, last-minute service calls — all require instant rerouting that paper dispatch cannot handle.',
              'Paper work orders have to be processed and billing manually entered after the storm. After a 14-hour overnight event, you spend 3 more hours transcribing logs into QuickBooks.',
            ],
            forLine: 'For: Snow removal dispatchers and owners mobilizing crews before dawn',
          },
          {
            title: 'Multi-model billing is a nightmare without the right tools',
            bullets: [
              'Hourly, per push, per inch, seasonal flat rate, seasonal with caps — five or more billing models coexist in a single business. Jobber and Housecall Pro do not natively support per-inch or capped-seasonal billing.',
              'A single storm triggers 50+ billable events across different contract types, each requiring different calculation logic. Costs vary wildly month to month.',
              'Crews forget to clock in at 3 AM in a blizzard. That leads to inaccurate timesheets, billing disputes, and thousands in lost unbillable hours.',
              'QuickBooks syncing is a constant headache. Duplicated invoices, manual reconciliation, and hours of data entry after every storm event.',
            ],
            forLine: 'For: Snow removal owners drowning in spreadsheets after every storm',
          },
          {
            title: 'One slip-and-fall claim can end your season',
            bullets: [
              "Slip-and-fall claims average $30,000 per incident. Insurance premiums are rising 6% annually. Carriers are leaving the snow market. A single undefended claim wipes out a season's profit for a company doing $152,000 a year.",
              'Courts require proof of reasonable care — GPS routing, timestamps, photos, material application logs. Without documentation, you are presumed negligent even if service was performed.',
              'Paper logs are not enough. Courts require date, time, weather conditions, materials used, areas serviced, and before/after photographs.',
              'GPS-verified, timestamped digital records with photos are the new standard of care. Contractors without them face both legal and competitive disadvantage.',
            ],
            forLine: 'For: Snow removal contractors exposed to $30,000 slip-and-fall claims with paper-only records',
          },
        ],
        solutions: [
          {
            title: 'Storm-ready dispatch. One tap.',
            copy: "Pre-built master routes with trigger thresholds mapped to each property. When snow hits the trigger depth, the right crews get notified with the right routes automatically. Real-time GPS tracking shows where every truck is. Route adjustments happen in-app, not over frantic phone calls. 56dp touch targets mean gloved hands hit the right button every time in a freezing truck cab at 3 AM. Dark theme for cab visibility.",
            painPointRef: 0,
          },
          {
            title: 'Every billing model. One system.',
            copy: "Per push, per inch, seasonal, capped seasonal, hourly — all native, within the same account, across the same client list. Service completion triggers automatic invoice generation based on contract type. No manual calculation. No spreadsheet reconciliation. No QuickBooks gymnastics after a 14-hour storm event. Crews clock in and out digitally so nothing is lost to 3 AM memory lapses.",
            painPointRef: 1,
          },
          {
            title: 'GPS-verified proof of service. Automatic.',
            copy: "Every service event is documented with GPS route verification, timestamps, before/after photos, and material application logs. Court-ready proof-of-service records that protect against slip-and-fall claims and satisfy insurer requirements. Zero extra steps for your crews — they do their jobs, OPS captures the proof. No separate GPS fleet tracking subscription at $15\u2013$40 per truck per month required.",
            painPointRef: 2,
          },
          {
            title: 'One platform. Snow season and mow season.',
            copy: "Over half of snow contractors also run landscaping, lawn care, or property maintenance. OPS is not snow-only software that sits idle 7 months a year. One platform, one price, twelve months of value. Snow-specific tools like CrewTracker charge monthly even during the off-season, or force a separate platform for summer work. OPS at $79 a month flat covers both seasons without dual subscriptions.",
            painPointRef: 2,
          },
        ],
        comparison: {
          competitors: ['Jobber', 'Yeti Snow'],
          rows: [
            { feature: 'Storm-trigger crew dispatch', ops: true, comp1: false, comp2: true },
            { feature: 'Per-inch / capped-seasonal billing', ops: true, comp1: false, comp2: 'Basic' },
            { feature: 'GPS proof of service with photos', ops: true, comp1: false, comp2: true },
            { feature: 'Year-round multi-trade use', ops: true, comp1: true, comp2: 'Snow + lawn only' },
            { feature: 'Glove-ready mobile UI', ops: true, comp1: false, comp2: false },
            { feature: 'Pricing', ops: '$79/mo flat', comp1: '$69\u2013349/mo + $29/user', comp2: 'Free\u2013$95+/mo (scales)' },
          ],
        },
        faq: [
          {
            question: 'How is snow removal scheduling different from other field services?',
            answer: "Snow removal is reactive, not scheduled. Unlike HVAC or plumbing where jobs are booked days out, snow removal is triggered by weather — often at 2\u20134 AM with no advance notice. You need software that mobilizes entire crews and optimizes routes within minutes of a storm trigger, not one that schedules appointments during business hours. OPS is built for this with glove-ready mobile dispatch that works at 3 AM in a truck cab.",
          },
          {
            question: 'What billing models do snow removal companies use?',
            answer: "Most snow contractors juggle five or more billing models: per push, per inch, seasonal flat rate, seasonal with caps, and hourly. You may use three or four simultaneously — commercial clients want seasonal for budget predictability, residential clients want per push. OPS handles all of them natively within the same platform, across the same client list.",
          },
          {
            question: 'Why is proof of service documentation critical for snow contractors?',
            answer: "Slip-and-fall claims average $30,000 per incident, and snow contractors bear liability if they cannot prove service was performed to a reasonable standard. Courts require timestamped documentation including service times, weather conditions, materials applied, areas serviced, and photos. GPS-verified digital records have become the standard — paper logs are no longer enough. OPS captures all of this automatically with every service event.",
          },
          {
            question: 'Can general field service software handle snow removal?',
            answer: "General FSM tools like Jobber and Housecall Pro have snow removal pages, but they lack storm-trigger dispatch, per-inch billing, material tracking, GPS route verification, and multi-model contract management. Snow-specific tools like CrewTracker and Yeti address these gaps but cost $95\u2013$500+ a month and are often winter-only. OPS bridges both — snow-specific workflows at $79 a month flat, with year-round capability for dual-season operators.",
          },
          {
            question: 'What is a trigger threshold in snow removal contracts?',
            answer: "A trigger threshold is the minimum snow accumulation in inches that activates your obligation to service a property. Common triggers are 1.5\u20132 inches for commercial and 2\u20133 inches for residential. Zero-tolerance contracts require service at any measurable accumulation. Different properties in your portfolio may have different triggers, requiring software that maps trigger rules to conditions and dispatches accordingly.",
          },
        ],
        cta: {
          headline: 'YOUR CREWS ARE OUT AT 3 AM.\nYOUR SOFTWARE SHOULD BE READY TOO.',
          subtext: 'Storm dispatch. Route tracking. Proof of service. Built for gloved hands in a dark truck cab. Free to start. $79 a month flat.',
        },
      },
    },
  },

  // ─── Window Cleaning ──────────────────────────────────────────────────
  {
    slug: 'window-cleaning',
    name: 'Window Cleaning',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'apps' },
      { variant: 'dashboard' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'top-to-bottom' },
      { deviceType: 'tablet', flowDirection: 'left-to-right' },
      { deviceType: 'laptop', flowDirection: 'right-to-left' },
      { deviceType: 'desktop', flowDirection: 'left-to-right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Window Cleaning Business Software | OPS',
          description: 'Route scheduling, recurring customer management, and crew tools — built for window cleaning crews running 8\u201315 stops a day, not desk workers clicking through menus.',
          keywords: [
            'window cleaning software',
            'window cleaning business software',
            'window cleaning scheduling software',
            'window cleaning route optimization',
            'window cleaning scheduling app',
            'window cleaning CRM',
            'window cleaning invoicing software',
            'window cleaning crew management app',
            'best software for window cleaning business',
            'window cleaning recurring schedule software',
          ],
        },
        hero: {
          sectionLabel: 'For Window Cleaning Companies',
          headline: 'STOP MANAGING ROUTES\nIN A SPREADSHEET.',
          subtext: "Customer A wants monthly. Customer B wants quarterly. Customer C wants twice a year. They all live on the same street. Then it rains Monday and the whole week cascades. OPS handles recurring routes, weather rescheduling, and per-property details — so your crew runs routes, not phone tag.",
        },
        painPoints: [
          {
            title: 'Recurring schedules at different frequencies create impossible complexity',
            bullets: [
              'Monthly, quarterly, bi-annual, annual — and they all overlap on the same routes. Managing who is due, when, and which route they belong to breaks every spreadsheet eventually.',
              'Route density collapses without optimization. Adding 10 customers degrades every existing route. Crews drive past stops they should be hitting because the schedule was built by address, not geography.',
              "Rain cancels Monday. Monday pushes to Tuesday. Tuesday pushes to Wednesday. Within 48 hours the entire week is reshuffled. Manual rescheduling means dozens of phone calls and double-bookings.",
              'Spring brings 2\u20133x demand. What worked at 40 stops a week cannot handle 100. Hiring seasonal crew means more routes, more rescheduling, more communication — on the same spreadsheet that barely worked at half the volume.',
            ],
            forLine: 'For: Window cleaning operators drowning in Google Sheets and rescheduling phone calls',
          },
          {
            title: 'Customers disappear when you stop communicating',
            bullets: [
              'A quarterly customer who has not heard from you in 3 months assumes you forgot about them. Without automated reminders, retention drops from 80% to below 60%.',
              "Per-property details — pane counts, stories, access notes, gate codes, hard water flags — live in one tech's head. Send a different crew member and the context is gone.",
              'Upsell opportunities for gutter cleaning, pressure washing, or screen repair disappear because no system prompts the add-on. You leave money on the table every week.',
              'Invoice disputes eat admin hours. When pricing is per-pane and details are on paper, disagreements about pane counts become arguments. Digital records eliminate this.',
            ],
            forLine: 'For: Window cleaning businesses losing recurring customers to silence and missed appointments',
          },
          {
            title: 'Software built for plumbers, priced for margins you do not have',
            bullets: [
              "Jobber, Housecall Pro, and ServiceTitan are built for HVAC techs doing 3\u20135 jobs a day. Window cleaning runs 8\u201315 route stops with recurring frequencies, per-pane pricing, and weather rescheduling. Different workflow. Wrong tool.",
              'Jobber charges $39 for one user but $169 for 5 and $349 for 10. Route optimization requires the $119 Connect plan. For a 3-crew operation with 5% margins, $200\u2013$350 a month in software eats real profit.',
              'Every competitor markets to the owner. The tech using the app 8 hours a day while holding a squeegee on a ladder is invisible in product design. Small buttons and white screens that glare in sunlight do not work at 24 feet.',
              'A solo window cleaner does not have weeks to configure software, attend webinars, or sit through demos. If it is not working in a day, it gets abandoned.',
            ],
            forLine: 'For: Window cleaning owners tired of paying $200+ a month for software their crew ignores',
          },
        ],
        solutions: [
          {
            title: 'Route scheduling built for recurring rounds.',
            copy: "Build routes by geography, not alphabetical customer list. Cluster Monday's stops in the north end, Tuesday's in the south. Recurring frequency management handles weekly through annual customers on the same schedule without conflicts. Set it once — OPS auto-populates the calendar going forward. Cancel Monday's rain-soaked route and OPS redistributes stops across the week by crew availability and proximity. No random slot-filling. No phone tag.",
            painPointRef: 0,
          },
          {
            title: 'Per-property details. Zero guesswork.',
            copy: "Store pane counts, stories, accessibility, window types, and special instructions per property. Quote once, then every recurring visit invoices automatically at the correct amount. No re-counting. No disputes. Difficulty-based pricing factors let you build rate cards that reflect real complexity. Upsell prompts during quoting catch the gutter cleaning and screen repair revenue you are currently leaving behind.",
            painPointRef: 1,
          },
          {
            title: 'Built for ladders, not laptops.',
            copy: "56dp touch targets mean gloved, wet, or cold hands hit the right button every time. Dark theme eliminates screen glare on sunny exteriors. The app matches how window cleaners work: see your route, drive to the stop, check property notes, do the work, mark complete, next stop. Per-property details travel with the crew. Send a different tech and they have full context instantly. Photo documentation at completion protects against disputes.",
            painPointRef: 2,
          },
          {
            title: 'Free to start. $79 flat. No sales call.',
            copy: "No 14-day trial that expires during your busy season. No demo wall. Download and start building routes. $79 a month flat — no per-user upsells, no module-gating. Jobber charges $169 for 5 users. Housecall Pro charges $199+ with features locked behind higher tiers. OPS includes route optimization in the core product, not behind a premium paywall. Setup takes hours, not weeks. A two-person crew should be running routes end-to-end in a day.",
            painPointRef: 2,
          },
        ],
        comparison: {
          competitors: ['Jobber', 'Housecall Pro'],
          rows: [
            { feature: 'Route optimization included', ops: true, comp1: '$119+/mo plan required', comp2: 'Max plan only' },
            { feature: 'Recurring multi-frequency scheduling', ops: true, comp1: true, comp2: true },
            { feature: 'Weather cascade rescheduling', ops: true, comp1: false, comp2: false },
            { feature: 'Crew-first field app (dark theme, 56dp targets)', ops: true, comp1: false, comp2: false },
            { feature: 'Free tier available', ops: true, comp1: false, comp2: false },
            { feature: 'Pricing (5-person team)', ops: '$79/mo flat', comp1: '$169\u2013349/mo', comp2: '$199+/mo + $35/user' },
          ],
        },
        faq: [
          {
            question: 'What is the best software for a small window cleaning business?',
            answer: "For a 1\u20135 person operation, the best software handles recurring route scheduling, stores per-property details, and does not cost more than your monthly squeegee budget. Most FSM platforms were built for HVAC and plumbing — they work but you pay for features you never use while missing route tools you need. OPS is free to start at $79 a month flat, requires no sales call, and your crew can be running routes the same day.",
          },
          {
            question: 'How much does window cleaning business software cost per month?',
            answer: "Jobber charges $39 for one user, $169 for 5, $349 for 10 — route optimization requires the $119+ Connect plan. Housecall Pro starts at $59 but locks route optimization behind the Max plan. GorillaDesk gates it behind the $99 Pro plan. OPS offers a free tier and flat $79 a month pricing with no per-user charges. For a 3-person crew doing $150K\u2013$300K in revenue, the gap between $79 and $200\u2013$350 a month is real margin.",
          },
          {
            question: 'How do I manage recurring schedules for customers on different frequencies?',
            answer: "This is the core challenge for route-based window cleaning. Monthly, quarterly, bi-annual, annual — all overlapping on the same routes. Set each customer's frequency once and the system auto-populates your calendar, groups stops geographically, and alerts you when visits are due. When weather forces a cancellation, OPS cascades the rescheduling automatically instead of requiring you to call 15 customers and rebuild the week by hand.",
          },
          {
            question: 'How do I handle weather cancellations without losing customers?',
            answer: "Three things. First, automated customer notifications when weather forces a reschedule — so they know before they call you. Second, intelligent cascade rescheduling that redistributes cancelled stops based on crew availability and proximity. Third, a weather buffer in your weekly schedule so one lost day does not destroy the week. OPS automates the communication and schedule adjustments so a rainy Monday does not turn into a week of phone tag.",
          },
          {
            question: 'Do I need different software for residential and commercial window cleaning?',
            answer: "No, but your software needs to handle both. Residential is route-based with 8\u201315 stops a day, per-pane pricing, and recurring frequencies. Commercial means fewer, larger jobs with contract pricing and compliance documentation. Your Monday might be 12 residential stops and Tuesday might be one 8-hour commercial building. OPS handles both in a single platform with per-property details for residential and contract tracking for commercial.",
          },
        ],
        cta: {
          headline: 'YOUR ROUTES SHOULD RUN THEMSELVES.',
          subtext: 'Recurring schedules. Route optimization. Weather rescheduling. One app. Free to start — no demo, no contract, no per-user pricing.',
        },
      },
    },
  },

  // —— CHIMNEY SWEEP ——
  {
    slug: 'chimney-sweep',
    name: 'Chimney Sweep',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'phone', flowDirection: 'right' },
      { deviceType: 'tablet', flowDirection: 'left' },
      { deviceType: 'phone', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Chimney Sweep Software — Scheduling, Inspections & Job Management | OPS',
          description: 'OPS helps chimney sweep businesses manage fall rush scheduling, inspection documentation, annual recurring appointments, and crew dispatch — all from one mobile app at $79/mo flat.',
          keywords: [
            'chimney sweep software',
            'chimney sweep scheduling app',
            'chimney sweep business software',
            'chimney inspection software',
            'chimney sweep business management',
            'best software for chimney sweeps',
            'chimney sweep CRM',
            'NFPA 211 inspection app',
            'chimney sweep recurring appointments',
            'chimney inspection report app',
          ],
        },
        hero: {
          sectionLabel: 'chimney sweep software',
          headline: 'OCTOBER IS COMING.\nIS YOUR SCHEDULE READY?',
          subtext: '60% of your annual revenue hits in 10 weeks. OPS handles the fall rush, automates annual reminders, and documents every inspection — from a phone that works on the rooftop.',
        },
        painPoints: [
          {
            title: 'THE FALL RUSH BREAKS YOUR SCHEDULE EVERY YEAR',
            bullets: [
              '60–70% of annual revenue compresses into a 10-week window. Late August to October, every homeowner calls at once. Waitlists grow to 6 weeks. Customers defect or skip their annual cleaning entirely.',
              'Double-booking and missed appointments multiply. When call volume triples overnight and you are still managing by phone and paper, errors become inevitable.',
              'Off-season revenue drops create cash flow gaps. Spring and summer become dead zones unless you fill them with masonry repair, relining, and cap installations — but most sweep companies have no system to manage that pipeline.',
              'Annual recurring appointments are your best retention tool — and most sweeps do not automate them. When a customer\'s cleaning is due, they should get a reminder and book directly. Without automation, they book whoever they find first on Google.',
            ],
            forLine: 'For chimney sweep owners drowning in fall booking requests while struggling to fill spring and summer schedules',
          },
          {
            title: 'INSPECTION DOCUMENTATION IS STILL ON CARBON COPY',
            bullets: [
              'NFPA 211 requires three distinct inspection levels — Level I visual, Level II with camera, Level III destructive — each with different documentation requirements that paper forms handle poorly.',
              'Camera inspections generate photos and video with no standard way to organize them. Flue conditions, creosote buildup, liner damage, crown deterioration — all captured but rarely delivered professionally.',
              'Creosote staging must be documented accurately. Stage 1 soot, Stage 2 flaky tar, Stage 3 glazed hardite — the stage determines cleaning approach and urgency. Inconsistent documentation undermines your credibility.',
              'Customers and insurers now expect professional digital reports. Not handwritten carbon-copy forms. Real estate transactions and insurance claims increasingly require digital documentation with photos.',
            ],
            forLine: 'For chimney professionals spending more time on paperwork than on actual inspections',
          },
          {
            title: 'SOFTWARE BUILT FOR HVAC EMPIRES, PRICED FOR PLUMBING FLEETS',
            bullets: [
              'ServiceTitan costs $245+/technician/month plus $5,000–$10,000 implementation. For a 3-person chimney sweep company, that is $8,820/year in software before you have cleaned a single flue.',
              'Jobber scales to $349/month with $29/user overages. Housecall Pro costs $59–$329/month with add-on packages pushing real costs above $200/month.',
              'Per-user pricing punishes seasonal hiring. Bringing on 2 extra sweeps for the fall rush adds $60–$490/month in software costs alone.',
              'None of these platforms have chimney-specific features. No NFPA 211 templates, no creosote stage tracking, no Level I/II/III workflows, no annual recurring scheduling built for the sweep cycle.',
            ],
            forLine: 'For chimney sweep owners paying enterprise prices for generic software that does not understand their trade',
          },
        ],
        solutions: [
          {
            title: 'ONE CALENDAR FOR YOUR BUSIEST 10 WEEKS AND YOUR QUIETEST 6 MONTHS',
            copy: 'Batch-book fall cleanings by neighborhood. Route optimization groups nearby appointments for maximum completions per day during peak season. Automated annual reminders ensure customers book with you every year — not whoever shows up first on Google. Off-season scheduling for repairs, relining, and cap installations keeps revenue flowing year-round. No penalty for adding seasonal crew during the rush.',
            painPointRef: 'The Fall Rush Breaks Your Schedule Every Year',
          },
          {
            title: 'PROFESSIONAL INSPECTION REPORTS FROM THE CHIMNEY TOP',
            copy: 'Document every inspection with photos, video, and NFPA-compliant findings — then send a professional report to the customer before you have left their driveway. Structured inspection notes follow consistent process across Level I, II, and III inspections. Works offline because chimneys do not always have WiFi. Sync when you are back in the truck. Replaces a separate $99/month inspection-only tool.',
            painPointRef: 'Inspection Documentation Is Still on Carbon Copy',
          },
          {
            title: 'BUILT FOR SWEEPS, NOT FOR SALES TEAMS',
            copy: 'Your crew does not need a CRM with 200 features. They need to know where they are going, what they are inspecting, and how to document what they find. 56dp touch targets work with work gloves. Dark theme readable from a dark flue to a bright rooftop. Download today, schedule your first job today. No 3-week implementation, no $5,000 setup fee, no sales call.',
            painPointRef: 'Software Built for HVAC Empires, Priced for Plumbing Fleets',
          },
          {
            title: '$79/MONTH FLAT — NOT PER-SWEEP, NOT PER-SEASON',
            copy: 'Stop paying more for software than you pay for chimney brushes. $79/month flat regardless of team size — bring on 2 extra sweeps for the fall rush, no price increase. Free to start with no credit card required. Compare: ServiceTitan at $8,820+/year for 3 techs, Jobber at $4,188+/year with overages, ChimSpect at $1,188+/year for inspection only. OPS at $948/year flat — scheduling, inspections, and job management in one app.',
            painPointRef: 'Software Built for HVAC Empires, Priced for Plumbing Fleets',
          },
        ],
        comparison: {
          competitors: ['Housecall Pro', 'ChimSpect'],
          rows: [
            { feature: 'Free plan available', ops: true, comp1: false, comp2: false },
            { feature: 'Scheduling + dispatching included', ops: true, comp1: true, comp2: false },
            { feature: 'Inspection documentation with photos', ops: true, comp1: 'Basic (no NFPA structure)', comp2: true },
            { feature: 'Annual recurring appointment reminders', ops: true, comp1: 'Limited', comp2: false },
            { feature: 'Works offline', ops: true, comp1: 'Limited', comp2: true },
            { feature: 'Pricing (3-person team)', ops: '$79/mo flat', comp1: '$59–329/mo + per-user', comp2: '$99/inspector/mo (inspection only)' },
          ],
        },
        faq: [
          {
            question: 'What is the best software for chimney sweep businesses?',
            answer: 'For inspection documentation only, ChimSpect runs $99 a month per inspector with NFPA 211 compliant reports — but no scheduling or business management. For general FSM, Housecall Pro and Jobber have chimney landing pages but zero chimney-specific features. Most chimney sweep companies end up paying for two tools that do not talk to each other: one for inspections and one for scheduling. OPS combines scheduling, job management, photo documentation, and inspection workflows in one app at $79 a month flat.',
          },
          {
            question: 'How do chimney sweeps handle the fall rush season?',
            answer: 'Start booking fall appointments in July and August. Batch-schedule by neighborhood for route efficiency. Set clear customer expectations on 3 to 6 week lead times during peak. Offer spring and summer discounts to shift demand earlier. Automated annual reminders ensure customers schedule during spring instead of waiting until October. OPS handles batch scheduling, route grouping, and automated reminders so the 10-week rush does not break your operation.',
          },
          {
            question: 'What are the NFPA 211 inspection levels?',
            answer: 'Level I is a basic visual inspection of readily accessible components — required annually, typically $100 to $250. Level II includes video scanning of internal flue surfaces — required upon property sale or fuel type change, typically $300 to $600. Level III may require removal of chimney components — required when Level I or II reveals suspected hidden hazards, $1,000 to $5,000 or more. Professional documentation at each level protects the sweep company legally and supports insurance claims.',
          },
          {
            question: 'How much does chimney sweep business software cost?',
            answer: 'ChimSpect charges $99 a month for one inspector — inspection only, no scheduling. Jobber runs $39 to $349 a month plus $29 per user overages. Housecall Pro costs $59 to $329 a month plus add-ons. ServiceTitan charges $245 or more per technician per month plus $5,000 to $10,000 for implementation. OPS is free to start and $79 a month flat with no per-user charges. For a 3-person company currently paying for both inspection and scheduling tools, that is $150 to $500 a month elsewhere versus $79 with OPS.',
          },
          {
            question: 'How do I grow my chimney sweep business year-round?',
            answer: 'Service diversification is the biggest lever. Average revenue per repair job is $600 — 3.3 times higher than cleaning at $180. Key upsell services: chimney cap installation at $200 to $850, liner replacement at $1,500 to $5,000, crown repair at $150 to $1,500. Annual recurring appointments are the foundation of predictable revenue. Use inspection photos to educate customers on needed repairs — documented evidence converts better than a verbal recommendation every time.',
          },
        ],
        cta: {
          headline: 'YOUR BUSIEST SEASON IS COMING. ARE YOU READY?',
          subtext: 'Fall rush scheduling. Inspection documentation. Annual recurring reminders. One app. Free to start — no demo, no contract, no per-user pricing.',
        },
      },
    },
  },

  // —— LOCKSMITH ——
  {
    slug: 'locksmith',
    name: 'Locksmith',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'phone', flowDirection: 'right' },
      { deviceType: 'tablet', flowDirection: 'left' },
      { deviceType: 'phone', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Locksmith Software — Emergency Dispatch, Mobile Jobs & Crew Management | OPS',
          description: 'OPS helps locksmith businesses dispatch emergency calls faster, manage mobile van operations, document jobs with photos, and coordinate 24/7 crews — all at $79/mo flat.',
          keywords: [
            'locksmith software',
            'locksmith dispatch software',
            'locksmith scheduling app',
            'locksmith business software',
            'locksmith business management',
            'best software for locksmiths',
            'locksmith CRM',
            'locksmith invoicing app',
            'locksmith field service management',
            'mobile locksmith business app',
          ],
        },
        hero: {
          sectionLabel: 'locksmith software',
          headline: 'THE CALL CAME IN.\nWHO IS CLOSEST?',
          subtext: '16,000 lockouts happen every day. The first responder wins the job. OPS shows every tech\'s location, routes the closest one, and gets them on-site before the customer calls someone else.',
        },
        painPoints: [
          {
            title: 'EMERGENCY DISPATCH IS YOUR ENTIRE BUSINESS — AND YOU RUN IT FROM A PHONE',
            bullets: [
              'Over 16,000 lockouts happen every day in the United States. Your phone rings at 2 AM and you need to know which tech is closest, which van has the right key blanks, and whether the job is residential, commercial, or automotive — all before the customer calls someone else.',
              'The first responder wins the job. In an emergency-driven industry, response time is everything. If your dispatch process involves calling or texting multiple technicians to find who is available, you are losing jobs to competitors with faster systems.',
              'Route inefficiency burns fuel and kills margins. Mobile locksmiths cover large service areas. Without GPS-based routing and real-time technician tracking, you are sending crews across town when a closer tech could have handled the call in 15 minutes.',
              'After-hours dispatch is where most small shops break down. You either take every call yourself or miss revenue. There is no middle ground without a system that routes emergency calls to on-duty technicians automatically.',
            ],
            forLine: 'For locksmith owners juggling 24/7 emergency calls while trying to route technicians efficiently across the city',
          },
          {
            title: 'YOUR VAN IS YOUR SHOP — AND INVENTORY IS A GUESSING GAME',
            bullets: [
              'A mobile locksmith van carries hundreds of SKUs. Key blanks, lock sets, deadbolts, smart lock kits, transponder programming tools, and specialty hardware. Knowing what is on which van is critical to dispatching the right tech for each job.',
              'Running out of a common key blank on a job means a wasted trip. The customer waited 30 minutes for you to arrive and now you cannot complete the service. That is a lost job, a frustrated customer, and wasted fuel.',
              'Automotive key programming requires specific tools and inventory. Transponder keys, proximity fobs, and programming devices vary by vehicle make and model. Sending a tech without the right equipment wastes everyone\'s time.',
              'No FSM platform tracks locksmith-specific inventory. General field service tools track parts generically. They do not understand key blank catalogs, lock manufacturer SKUs, or automotive key compatibility.',
            ],
            forLine: 'For locksmiths managing hundreds of key blanks, lock hardware, and automotive tools from a mobile van',
          },
          {
            title: 'SOFTWARE BUILT FOR PLUMBERS, PRICED FOR FRANCHISES',
            bullets: [
              'ServiceTitan costs $245–$500+ per technician per month plus $5,000–$50,000 implementation. For a 3-tech locksmith operation, that is $9,000–$18,000/year in software before you have cut a single key.',
              'Housecall Pro scales to $329/month with add-on packages pushing real costs above $200/month. Per-user pricing punishes growth — adding a van for commercial contracts means adding software costs.',
              'Jobber charges $39–$349/month with $29/user overages. The Marketing Suite add-on costs an additional $79/month. For a growing locksmith company, costs compound fast.',
              'None of these platforms understand locksmith workflows. No emergency priority queuing, no automotive job categorization, no smart lock credential documentation. You are paying enterprise prices for a generic scheduling calendar.',
            ],
            forLine: 'For locksmith shop owners paying enterprise prices for generic software that does not understand emergency service workflows',
          },
        ],
        solutions: [
          {
            title: 'EMERGENCY DISPATCH THAT WORKS AT 2 AM',
            copy: 'One tap shows every technician\'s location, availability, and job status. Route the closest available tech to every emergency call — residential lockout, car key replacement, or commercial access issue. Real-time tracking shows customers accurate ETAs. Emergency priority flagging ensures urgent calls jump to the top. After-hours routing sends calls directly to on-duty techs without waking the whole crew.',
            painPointRef: 'Emergency Dispatch Is Your Entire Business',
          },
          {
            title: 'COMPLETE EVERY JOB FROM THE VAN',
            copy: 'Photograph the lock, document the work, capture the customer signature, and collect payment — all from your phone in the driveway. Customer history shows previous service, installed hardware, and key records for repeat calls. On-site digital invoicing eliminates paper and speeds up cash flow. Works offline because basements and parking garages do not have WiFi. Sync when you are back on the road.',
            painPointRef: 'Your Van Is Your Shop',
          },
          {
            title: 'BUILT FOR THE VAN, NOT THE CORNER OFFICE',
            copy: 'Your technicians work with their hands, often in poor lighting, often in a rush. They need to know where the next job is, what the customer needs, and how to document what they did. 56dp touch targets work with gloves. Dark theme readable from a dim hallway to a bright parking lot. Download today, dispatch your first job today. No 3-week implementation, no $5,000 setup fee, no sales call.',
            painPointRef: 'Software Built for Plumbers, Priced for Franchises',
          },
          {
            title: '$79/MONTH FLAT — NOT PER-TECH, NOT PER-VAN',
            copy: 'Stop paying more for software than you spend on key blanks. $79/month flat regardless of team size — add a van for commercial contracts or hire for after-hours rotation, no price increase. Free to start with no credit card required. Compare: ServiceTitan at $9,000–$18,000+/year for 3 techs, Jobber at $4,188+/year with overages, Housecall Pro at $3,948+/year with add-ons. OPS at $948/year flat.',
            painPointRef: 'Software Built for Plumbers, Priced for Franchises',
          },
        ],
        comparison: {
          competitors: ['Housecall Pro', 'Workiz'],
          rows: [
            { feature: 'Free plan available', ops: true, comp1: false, comp2: false },
            { feature: 'Emergency dispatch with GPS routing', ops: true, comp1: 'Basic scheduling', comp2: 'Basic scheduling' },
            { feature: 'On-site photo documentation', ops: true, comp1: true, comp2: true },
            { feature: 'Works offline', ops: true, comp1: 'Limited', comp2: false },
            { feature: 'Mobile-first dark theme UI', ops: true, comp1: false, comp2: false },
            { feature: 'Pricing (3-tech team)', ops: '$79/mo flat', comp1: '$59–329/mo + per-user', comp2: '$198+/mo (per-user pricing)' },
          ],
        },
        faq: [
          {
            question: 'What is the best software for locksmith businesses?',
            answer: 'It depends on size and primary need. ServiceTitan at $245 to $500 per technician per month is built for large operations with 20 or more techs. Housecall Pro at $59 to $329 a month and Jobber at $39 to $349 a month are general FSM tools with locksmith landing pages but no locksmith-specific features. Workiz offers call tracking that locksmiths value but charges per user. OPS combines emergency dispatch, mobile job management, photo documentation, and GPS routing in one app at $79 a month flat.',
          },
          {
            question: 'How do locksmiths handle emergency dispatch efficiently?',
            answer: 'The most efficient locksmith operations use GPS-based dispatch to route the closest available technician to every call. Real-time tracking provides accurate ETAs — 30-minute response is the competitive standard in major metro areas. Priority queuing ensures emergency lockouts are handled before scheduled appointments. After-hours call routing sends jobs to on-duty techs automatically. The difference between a 15-minute response and a 45-minute response is whether you win the job or lose it.',
          },
          {
            question: 'How much does locksmith business software cost?',
            answer: 'ServiceTitan charges $245 to $500 per technician per month plus $5,000 to $50,000 for implementation and a 12-month contract. Housecall Pro runs $59 to $329 a month plus add-ons. Jobber costs $39 to $349 a month plus $29 per user overages. Workiz uses custom per-user pricing. OPS is free to start and $79 a month flat regardless of team size. For a 3-tech locksmith operation, annual software costs range from $4,000 to $20,000 elsewhere versus $948 a year with OPS.',
          },
          {
            question: 'Can locksmith software handle both emergency and scheduled work?',
            answer: 'It should. Emergency lockouts and scheduled installations are two fundamentally different workflows. Emergency calls need priority dispatch with the closest available tech. Scheduled work — rekeying, smart lock installations, commercial access systems — needs route optimization and customer coordination. Most FSM tools treat everything as the same calendar appointment. OPS separates emergency priority jobs from scheduled work so urgent calls get handled immediately without disrupting the day\'s route.',
          },
          {
            question: 'How is smart lock technology changing the locksmith industry?',
            answer: 'Smart locks and electronic access systems are expanding the locksmith service mix. Locksmiths now install, program, and maintain WiFi, Bluetooth, and Z-Wave locks alongside traditional mechanical hardware. This creates documentation needs that paper cannot handle: access credentials, programming codes, system configurations, and user permissions must be recorded for each installation. Smart lock installations command premium pricing at $200 to $500 or more per unit. The locksmiths who document professionally and build digital customer records are winning this growing segment.',
          },
        ],
        cta: {
          headline: 'YOUR NEXT CALL IS ALREADY RINGING.',
          subtext: 'Emergency dispatch. GPS routing. Mobile job management. One app. Free to start — no demo, no contract, no per-user pricing.',
        },
      },
    },
  },

  // —— HVAC ——
  {
    slug: 'hvac',
    name: 'HVAC',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'phone', flowDirection: 'right' },
      { deviceType: 'tablet', flowDirection: 'left' },
      { deviceType: 'phone', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'HVAC Software — Scheduling, Dispatch & Crew Management | OPS',
          description: 'OPS helps HVAC contractors schedule peak-season calls, dispatch the closest tech, and keep field crews connected — even in basements with no signal. Free to start at $79/mo flat.',
          keywords: [
            'hvac software',
            'hvac scheduling software',
            'hvac dispatch software',
            'best hvac software',
            'hvac crew scheduling app',
            'hvac field service app',
            'hvac software with offline mode',
            'free hvac scheduling app',
            'hvac business management software',
            'servicetitan alternative hvac',
          ],
        },
        hero: {
          sectionLabel: 'hvac software',
          headline: 'JULY HITS. THE PHONE RINGS 50 TIMES\nBEFORE LUNCH.',
          subtext: 'Your dispatcher is drowning. Your whiteboard is full. Your techs are in attics with no signal. OPS handles peak-season scheduling, emergency dispatch, and real-time crew sync — from a phone that works where your techs actually work.',
        },
        painPoints: [
          {
            title: 'PEAK SEASON TURNS YOUR SCHEDULE INTO A WAR ZONE',
            bullets: [
              'Call volume spikes 300% when the first heat wave hits. Dispatchers go from 15 calls a day to 50 overnight. Whiteboards, spreadsheets, and basic software collapse under the pressure — double-bookings, missed appointments, and angry callbacks become daily events.',
              '62% of after-hours calls go unanswered. That is $180,000 or more in lost annual revenue per shop. Most scheduling tools have no after-hours dispatch workflow — the on-call tech gets a text, maybe, and figures it out from there.',
              'Emergency calls blow up the schedule. An AC failure in a 95-degree home is an emergency. Fitting it into a packed schedule means bumping existing appointments, creating a cascade of reschedules and customer complaints that lasts all week.',
              'Spring and fall are wasted revenue. Fewer than 35% of residential HVAC companies actively sell maintenance agreements that smooth demand across the year. The software they use does not help them build or manage recurring revenue streams.',
            ],
            forLine: 'For HVAC owners and dispatchers drowning in summer call volume while the slow season bleeds cash',
          },
          {
            title: 'YOUR DISPATCHER AND YOUR TECH ARE IN DIFFERENT WORLDS',
            bullets: [
              'A tech arrives on site without knowing the equipment history, the customer complaints, or that the dispatcher changed the job scope 20 minutes ago. The result: wrong parts pulled, wasted trips, and callbacks that eat your margin.',
              'Phone tag replaces real communication. The office calls the tech. The tech calls back from a noisy rooftop. The message gets garbled. The wrong part gets pulled from the truck. Repeat five times a day.',
              'HVAC techs work in basements, attics, crawl spaces, and mechanical rooms — all dead zones for cell signal. If the app requires constant connectivity, the tech cannot update job status, view work orders, or capture photos until they climb back out.',
              'Notes and photos vanish. Techs take notes on clipboards, snap photos on personal phones, and promise to enter it when they get back to the truck. Half the time it never makes it into the system.',
            ],
            forLine: 'For HVAC techs and dispatchers tired of phone tag, lost notes, and signal dead zones',
          },
          {
            title: 'YOU ARE PAYING $250/TECH/MONTH FOR SOFTWARE YOUR CREW REFUSES TO OPEN',
            bullets: [
              'ServiceTitan costs $250-$500 per technician per month plus $5,000-$50,000 in implementation fees. Their own support team says the platform is "not optimized for companies with 3 or fewer technicians." Most HVAC companies have fewer than 5 employees.',
              'Implementation takes months, not minutes. ServiceTitan onboarding runs 3-12 months. FieldEdge requires a 5-week onboarding period. One contractor paid for a full year of ServiceTitan and was never onboarded.',
              'The crew refuses to use it. The owner buys the software, the admin learns 30% of it, and the techs use 5% or nothing. "It is almost like it is too big to where my people are scared to dive in and learn."',
              'Cancellation is a trap. ServiceTitan requires 12-month contracts with documented termination fees of $5,000-$39,000. One contractor who quit 10 days in was quoted a $39,375 buyout.',
            ],
            forLine: 'For HVAC owners paying enterprise prices for software their crew will not touch',
          },
        ],
        solutions: [
          {
            title: 'SCHEDULING THAT SURVIVES PEAK SEASON',
            copy: 'Drag-and-drop scheduling with real-time crew visibility. See every tech, every job, every open slot. Drag an emergency call into the schedule and OPS identifies conflicts and open windows. Emergency dispatch in two taps — the nearest available tech gets the full job details, directions, and customer history on their phone. Recurring maintenance scheduling helps smooth demand from peak months to slow months. Build a maintenance agreement base that generates predictable revenue year-round instead of feast-or-famine cycles.',
            painPointRef: 'Peak Season Turns Your Schedule Into a War Zone',
          },
          {
            title: 'ONE APP FOR THE OFFICE AND THE ATTIC',
            copy: 'When the dispatcher updates a job, the tech sees it instantly. When the tech marks complete, the office knows. No phone calls. No "did you get my text." True offline mode works in basements, mechanical rooms, attics, and crawl spaces. Capture photos, update job status, add notes — all without signal. Data syncs automatically when connectivity returns. No lost work, no "I will enter it later."',
            painPointRef: 'Your Dispatcher and Your Tech Are in Different Worlds',
          },
          {
            title: 'BUILT FOR THE TECH ON THE ROOFTOP, NOT THE ADMIN AT THE DESK',
            copy: '56dp touch targets built for gloved hands on a cracked screen in a 130-degree attic. Dark theme that cuts sunlight glare on rooftops and reads clearly in dim mechanical rooms. Your crew opens it and knows where to go, what to do, and who they are working with. No training department required. Download today, schedule your first job today.',
            painPointRef: 'You Are Paying $250/Tech/Month for Software Your Crew Refuses to Open',
          },
          {
            title: '$79/MONTH FLAT — NOT $250/TECH/MONTH',
            copy: 'Stop paying more for software than you pay your apprentice. $79/month flat regardless of team size — add 3 seasonal techs for summer, no price increase. Free to start with no credit card required. Compare: ServiceTitan at $15,000-$30,000/year for a 5-person shop, Jobber at $2,028-$4,188/year with per-user overages, FieldEdge at $9,900+/year with mandatory onboarding. OPS at $948/year flat. No demo wall, no sales call, no 12-month contract, no $39,000 cancellation fee.',
            painPointRef: 'You Are Paying $250/Tech/Month for Software Your Crew Refuses to Open',
          },
        ],
        comparison: {
          competitors: ['ServiceTitan', 'Jobber'],
          rows: [
            { feature: 'Free plan available', ops: true, comp1: false, comp2: false },
            { feature: 'Same-day setup (no implementation period)', ops: true, comp1: '3-12 months; $5K-$50K setup', comp2: '1-2 weeks' },
            { feature: 'True offline mode (basements, attics, mechanical rooms)', ops: true, comp1: 'Limited — sync issues documented', comp2: 'Added Jan 2026 — notes only' },
            { feature: 'Crew-first mobile design (56dp targets, dark theme)', ops: true, comp1: 'Desktop-first; mobile is companion', comp2: 'Mobile-friendly but admin-first' },
            { feature: 'No annual contract or cancellation fees', ops: true, comp1: '12+ month contract; $5K-$39K exit fees', comp2: 'Month-to-month available' },
            { feature: 'Pricing (5-tech team)', ops: '$79/mo flat', comp1: '$1,250-$2,500/mo', comp2: '$169-$349/mo + $29/user' },
          ],
        },
        faq: [
          {
            question: 'What is the best scheduling software for a small HVAC company?',
            answer: 'For small HVAC companies with 1-10 employees, the best software is affordable, fast to set up, and usable by techs in the field — not just the owner at a desk. ServiceTitan starts at $250 per technician per month, takes 3-12 months to implement, and their own team says it is not optimized for shops with fewer than 3 techs. Jobber starts at $39 a month for one user but jumps to $169 or more for teams with per-user charges. OPS is free to start, requires no sales demo, includes offline mode for basements and attics, and was designed for field crews first.',
          },
          {
            question: 'How much does HVAC software cost per month?',
            answer: 'ServiceTitan charges $250-$500 per technician per month plus $5,000-$50,000 in implementation fees. FieldEdge costs approximately $100 per office user plus $125 per technician per month with a $500-$2,000 setup fee. Housecall Pro ranges from $59 to $189 a month. Jobber runs $39-$599 a month depending on users and features. OPS starts at $0 with a free tier — no credit card, no sales call, no demo gate. For a 5-person HVAC crew, that is the difference between $0 and $15,000-$30,000 per year.',
          },
          {
            question: 'Do I need HVAC software that works offline?',
            answer: 'Yes. HVAC technicians regularly work in basements, crawl spaces, mechanical rooms, and attics — all areas with weak or no cell signal. If your app requires constant internet, your techs cannot update job status, capture equipment photos, or add notes until they leave the work area. OPS was built offline-first: techs can do everything without signal and data syncs automatically when connectivity returns. Most competitors either lack this capability or added it recently as an afterthought.',
          },
          {
            question: 'Is it worth switching from ServiceTitan to a simpler HVAC app?',
            answer: 'If your team has fewer than 15-20 technicians and you use less than 30% of ServiceTitan features, you are likely overpaying. One contractor reported paying $400-$600 a month while only using the estimating feature. Another was quoted a $39,375 buyout after canceling 10 days in. The key question: is your crew actually using the software in the field? If not, you are paying enterprise prices for an admin tool. OPS is free to start — you can test it alongside your current platform with zero risk before committing to a switch.',
          },
          {
            question: 'What features should HVAC scheduling software have for technicians?',
            answer: 'Your techs need five things: see the next job, address, and customer details without scrolling through menus. Offline access for basements, attics, and mechanical rooms. Large touch targets they can tap with work gloves. Photo capture and notes that sync back to the office. Real-time schedule updates so they know immediately when a job changes. Most HVAC software is designed for the office computer, not the person on the rooftop. OPS was built for the technician first — 56dp touch targets, dark theme for sunlight, offline mode, and a stripped-down interface that shows what matters.',
          },
        ],
        cta: {
          headline: 'YOUR CREW DESERVES BETTER THAN A WHITEBOARD.',
          subtext: 'Peak-season scheduling. Emergency dispatch. Offline mode that works in every attic and basement. One app. Free to start — no demo, no contract, no per-tech pricing.',
        },
      },
    },
  },

  // —— PLUMBING ——
  {
    slug: 'plumbing',
    name: 'Plumbing',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'phone', flowDirection: 'right' },
      { deviceType: 'tablet', flowDirection: 'left' },
      { deviceType: 'phone', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Plumbing Software — Dispatch, Scheduling & Crew Management | OPS',
          description: 'OPS helps plumbing contractors dispatch emergency calls in seconds, schedule crews across residential and commercial jobs, and keep techs connected from the basement. Free to start at $79/mo flat.',
          keywords: [
            'plumbing software',
            'plumbing scheduling software',
            'plumbing dispatch software',
            'best plumbing app for small business',
            'plumbing crew scheduling app',
            'plumbing technician dispatch app',
            'free plumbing scheduling app',
            'plumbing job management app',
            'plumber field service app offline',
            'servicetitan alternative plumbing',
          ],
        },
        hero: {
          sectionLabel: 'plumbing software',
          headline: 'A PIPE BURST.\nYOUR DISPATCHER HAS 3 SECONDS.',
          subtext: 'Plumbing businesses miss 27-40% of incoming calls. Each one is $500-$1,200 walking out the door. OPS shows every tech on the map, routes the closest one, and gets them to the job before the customer calls the next plumber.',
        },
        painPoints: [
          {
            title: 'EMERGENCY CALLS DESTROY THE SCHEDULE EVERY SINGLE DAY',
            bullets: [
              'A morning of scheduled drain cleanings gets blown apart by one burst pipe. Manual dispatch means calling every tech individually, hoping they answer, and verbally rearranging the day. By the time you finish, two customers have already rescheduled.',
              'Double-booking is rampant without real-time visibility. Jobber users report the app allows double-booking with no alerts. Without a live schedule view, dispatchers send two techs to the same address while another job goes unserved.',
              '$15,000 a month walks out the door from missed calls. Only 5% of callers leave voicemails — the other 95% call the next plumber. Emergency jobs command 1.5-2x premium pricing. Every missed call is a missed premium.',
              'Manual scheduling caps out at 10 jobs a day. Paper calendars and spreadsheets work for a solo operator but collapse once you have 2-3 trucks. Beyond that threshold, the complexity of technician availability, emergency calls, and travel time exceeds human capacity.',
            ],
            forLine: 'For plumbing dispatchers juggling emergencies and scheduled jobs on paper and prayers',
          },
          {
            title: 'YOUR TECH IS IN A BASEMENT. THE OFFICE HAS NO IDEA.',
            bullets: [
              'Jobs change mid-day and details vanish. Verbal dispatch over phone calls means no written record of scope changes, parts needed, or customer notes. The tech arrives without knowing the equipment history or that the job scope changed 20 minutes ago.',
              'Nobody knows where the trucks are. Even paid GPS features update too slowly for emergency reassignment. When a burst pipe call comes in at 2 PM, you need real-time locations — not a position from 15 minutes ago.',
              'Technicians lose an hour a day to paperwork. A 10-employee plumbing company wastes $198,000 a year on manual paperwork — forms filled by hand in the truck, photos texted to the office, notes scribbled on invoices that never get entered.',
              'Software that works in the office fails in the field. Sync issues between field and office are the most common Capterra complaint. Plumbers work in basements, crawl spaces, and mechanical rooms where cell signal is zero. An app that needs constant internet is useless at the point of work.',
            ],
            forLine: 'For plumbing owners who cannot see what is happening in the field until something goes wrong',
          },
          {
            title: 'SERVICETITAN WANTS $50,000 IN YEAR ONE. FOR A 5-TRUCK SHOP.',
            bullets: [
              'ServiceTitan costs $245-$500 per technician per month plus $5,000-$50,000 in implementation fees. A 5-person plumbing shop pays $1,750 a month minimum before add-ons — and setup takes 3-12 months. Their platform is explicitly "not optimized for companies with 3 or fewer technicians."',
              'Even affordable tools gate critical features. Jobber jumps from $39 to $169 the moment you add a second user. Housecall Pro locks GPS tracking and QuickBooks integration behind the $149 Essentials plan. "Buttons all over the screen with lock symbols to remind you to pay more."',
              'Implementation kills momentum. ServiceTitan requires a sales demo just to see pricing. Multiple BBB complaints describe contractors who paid for a full year of their subscription while still waiting to get fully onboarded.',
              'Support has collapsed across the board. Housecall Pro replaced human support with AI chatbots in 2025. ServiceTitan users report "absolutely the worst customer service I have ever had in my entire life." When your dispatch goes down at 7 AM on a Monday, a chatbot is not going to fix it.',
            ],
            forLine: 'For plumbing business owners paying enterprise prices for features they never use and support that does not exist',
          },
        ],
        solutions: [
          {
            title: 'DISPATCH A BURST PIPE IN 3 SECONDS, NOT 30 MINUTES',
            copy: 'Drag-and-drop scheduling lets dispatchers visually reassign jobs when an emergency hits. No phone trees, no verbal relay, no hoping the tech checks their texts. Real-time sync means when the dispatcher moves a job, the technician sees it instantly with the new address, scope, and customer history. Offline mode means the reassignment works even when the tech is in a basement with no signal. The update queues and syncs the moment they surface.',
            painPointRef: 'Emergency Calls Destroy the Schedule Every Single Day',
          },
          {
            title: 'YOUR CREW SEES WHAT THEY NEED. YOU SEE WHAT YOU NEED.',
            copy: '56dp touch targets mean plumbers with wet hands or work gloves can actually use the app. Dark theme designed for readability in bright sunlight and dim mechanical rooms. Job details, customer history, and notes travel with the technician — not locked in the dispatcher head or scrawled on a whiteboard. Works offline in basements, crawl spaces, and mechanical rooms where competing apps fail. Data syncs automatically when connectivity returns.',
            painPointRef: 'Your Tech Is in a Basement. The Office Has No Idea.',
          },
          {
            title: 'BUILT FOR THE PLUMBER HOLDING THE WRENCH',
            copy: 'Every plumbing FSM app talks to the owner. OPS talks to the plumber in the crawl space. The mobile experience is the product, not a bolted-on afterthought. Field workers were the first design consideration. Multi-trade capable: if your plumbing company also does HVAC, drain cleaning, or gas fitting, OPS handles it without forcing you into a single-trade tool. Simple by design — one app that does the job without a training department.',
            painPointRef: 'ServiceTitan Wants $50,000 in Year One. For a 5-Truck Shop.',
          },
          {
            title: '$79/MONTH FLAT — NOT $1,750/MONTH FOR 5 TECHS',
            copy: 'Free to start. No credit card. No sales call. No 6-month implementation. Download OPS today, dispatch your first job tomorrow. Published pricing with no surprise add-ons. No lock-in contracts, no termination fees. Compare: ServiceTitan at $15,000-$30,000/year for a 5-tech shop, Jobber Grow at $2,388/year plus per-user overages, Housecall Pro at $1,788/year plus add-ons. OPS at $948/year flat. If OPS does not earn your business every month, you leave.',
            painPointRef: 'ServiceTitan Wants $50,000 in Year One. For a 5-Truck Shop.',
          },
        ],
        comparison: {
          competitors: ['ServiceTitan', 'Jobber'],
          rows: [
            { feature: 'Free plan available', ops: true, comp1: false, comp2: false },
            { feature: 'Same-day setup', ops: true, comp1: '3-12 months; $5K-$50K implementation', comp2: 'Hours to days; 14-day trial' },
            { feature: 'True offline mode (basements, crawl spaces)', ops: true, comp1: 'Limited; sync issues documented', comp2: 'Not documented as core feature' },
            { feature: 'Crew-first mobile UX (56dp targets, dark theme)', ops: true, comp1: 'Desktop-first; mobile is secondary', comp2: '"On site it may feel heavier than necessary" (G2)' },
            { feature: 'No annual contract or exit fees', ops: true, comp1: '12+ month contract; $5K-$20K termination', comp2: 'Month-to-month available' },
            { feature: 'Pricing (5-tech team)', ops: '$79/mo flat', comp1: '$1,250-$2,500/mo', comp2: '$169-$349/mo + $29/user' },
          ],
        },
        faq: [
          {
            question: 'What is the best scheduling software for a small plumbing business?',
            answer: 'For plumbing businesses with 2-10 technicians, the best software is affordable, handles emergency dispatch, and works for techs in the field — not just the office. ServiceTitan is powerful but starts at $245 per technician per month, requires a 12-month contract, and takes 3-12 months to implement. Jobber starts at $39 a month for one user but jumps to $169 or more for teams with double-booking issues. OPS is free to start, requires no sales call, includes offline mode for basements, and was designed for field crews first.',
          },
          {
            question: 'How much does plumbing dispatch software cost per month?',
            answer: 'ServiceTitan charges $245-$500 per technician per month plus $5,000-$50,000 in implementation fees. A 5-tech shop pays $1,250-$2,500 a month before add-ons. Jobber starts at $39 a month but jumps to $169 for teams with $29 per additional user. Housecall Pro starts at $59 a month but the functional Essentials plan is $149. OPS starts at $0 with no credit card required, no implementation fee, and no annual contract. You can be dispatching plumbing jobs the same day you download it.',
          },
          {
            question: 'Does plumbing scheduling software work offline in basements?',
            answer: 'Most popular plumbing software requires internet, which is a real problem for plumbers who work in basements, crawl spaces, and mechanical rooms. ServiceTitan and Jobber do not prominently feature offline capabilities. OPS was built with true offline mode from the ground up — techs can view job details, update status, and capture information with zero connection. Everything syncs automatically when connectivity returns.',
          },
          {
            question: 'Is ServiceTitan worth it for a plumbing company with 5 technicians?',
            answer: 'For most 5-technician plumbing companies, ServiceTitan is significantly more than you need. At $245-$500 per tech per month, you are looking at $14,700-$30,000 a year in subscription costs alone — before the $5,000-$50,000 implementation fee. Multiple reviewers note that small businesses under 10 technicians find it too expensive and too complex. One BBB reviewer called it "absolutely the worst customer service I have ever had." OPS is free to start, takes minutes to set up, and scales without the enterprise overhead.',
          },
          {
            question: 'How do I switch from Jobber or Housecall Pro to a different plumbing app?',
            answer: 'Switching is easier than most owners expect. Common frustrations that trigger a switch include Jobber double-booking issues, Housecall Pro AI-only support since 2025, and feature-gating that forces upgrades. Sign up for OPS for free, import your customer data, run both systems in parallel for 1-2 weeks, then cancel your old subscription. OPS has no annual contract so there is zero financial risk to trying it alongside your current tool.',
          },
        ],
        cta: {
          headline: 'YOUR CREW RUNS PLUMBING. NOT SPREADSHEETS.',
          subtext: 'Emergency dispatch in seconds. Offline mode in every basement. Real-time crew sync. One app. Free to start — no demo, no contract, no per-tech pricing.',
        },
      },
    },
  },

  // —— ELECTRICAL ——
  {
    slug: 'electrical',
    name: 'Electrical',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'phone', flowDirection: 'right' },
      { deviceType: 'tablet', flowDirection: 'left' },
      { deviceType: 'phone', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Electrical Contractor Software — Scheduling, Crew Management & Dispatch | OPS',
          description: 'OPS helps electrical contractors schedule multi-day jobs, coordinate crews across job sites, and manage inspections — all from a phone that works in panel rooms and basements. Free to start at $79/mo flat.',
          keywords: [
            'electrical contractor software',
            'electrician scheduling app',
            'electrical contractor scheduling software',
            'crew scheduling app for electricians',
            'electrician job management app',
            'best software for electrical contractors',
            'free electrical contractor software',
            'electrical contractor dispatch software',
            'electrician crew management app',
            'servicetitan alternative electricians',
          ],
        },
        hero: {
          sectionLabel: 'electrical contractor software',
          headline: 'YOUR CREW IS ON SITE.\nTHE SCHEDULE JUST CHANGED.',
          subtext: '88% of electrical firms have fewer than 20 employees. Every one of them juggles permits, inspections, emergency calls, and multi-day projects. OPS keeps your crews and your office on the same page — even from a panel room with no signal.',
        },
        painPoints: [
          {
            title: 'SCHEDULING IS A MULTI-DIMENSIONAL PUZZLE',
            bullets: [
              'Most electrical jobs require 3 separate inspections — cover, service, and final — each scheduled with the municipality by 3 PM the day before. A failed inspection cascades delays across every downstream job. No mainstream FSM tool models these dependencies.',
              'Emergency service calls destroy planned schedules daily. A crew planned for a panel upgrade gets pulled to a no-power emergency, and the original job slides with no automatic rescheduling.',
              'Multi-day projects compound the problem. Unlike HVAC service calls, electrical work spans days with material deliveries, permit waits, and inspection gates between phases. Basic FSM tools treat every job as a single-visit event.',
              'Jobber allows double-booking without alerting you. When you have 6 technicians across 4 job sites, one double-book costs an entire day of labor. "Twice in one week crews went to the wrong address."',
            ],
            forLine: 'For electrical contractors juggling permits, inspections, and emergency calls across multiple sites',
          },
          {
            title: 'CREW COORDINATION BREAKS DOWN AS YOU GROW',
            bullets: [
              'Text-message scheduling creates chaos at scale. Electricians report managing crews through WhatsApp groups with "as many as 100 messages a day." A dispatcher updates a job scope on a sticky note that gets buried — the update never reaches the tech.',
              'The 5-7 technician tipping point is where manual methods collapse. Spreadsheets and texts start breaking down at this size, costing real money in wrong-address trips, missed scope changes, and wasted callbacks.',
              'Apprentice-to-journeyman pairing is a compliance requirement that varies by state. Assigning crews without tracking license types creates regulatory exposure. No mainstream FSM tool tracks crew composition.',
              'Field workers are the last to know when plans change. By the time a schedule change reaches the field through calls and texts, the crew has already driven to the wrong site or started the wrong task.',
            ],
            forLine: 'For electrical shop owners managing 5-15 technicians across multiple sites with text messages and hope',
          },
          {
            title: 'ENTERPRISE SOFTWARE FOR A $2M ELECTRICAL SHOP',
            bullets: [
              'ServiceTitan costs $245-$500 per technician per month, requires 3 or more technicians, and takes 3-12 months to implement. For a 5-person electrical shop, that is $14,700-$30,000 a year before the $5,000-$50,000 implementation fee. "It seems they are here to destroy small businesses."',
              'FieldEdge charges $100 per office user plus $125 per technician per month with a $500-$2,000 setup fee and a mandatory 5-week onboarding period. Their mobile app has sub-2.0 ratings on both app stores.',
              'Jobber pricing escalates sharply. Solo at $39 a month, but adding one employee forces the Teams tier. The Connect plan for 5 users is $169 and each user beyond costs $29 more. Critical features locked behind the $349 Grow plan.',
              '42% of electrical firms generate less than $1 million in revenue. These companies cannot absorb $15,000-$30,000 a year in software costs. "After spending a lot of time comparing multiple softwares, none of them does everything."',
            ],
            forLine: 'For 2-10 person electrical companies tired of paying enterprise prices for tools built for 50-tech operations',
          },
        ],
        solutions: [
          {
            title: 'SCHEDULING THAT UNDERSTANDS ELECTRICAL WORK',
            copy: 'Drag-and-drop scheduling handles multi-day projects natively — not as repeated single-visit entries. Real-time sync means schedule changes propagate to every crew member phone instantly, not through a chain of texts. Visual calendar designed for how electrical contractors think: by crew, by site, by day. Unlike Jobber which allows double-booking without alerts, OPS keeps the calendar clean. Unlike ServiceTitan which takes months to configure, OPS works the day you download it.',
            painPointRef: 'Scheduling Is a Multi-Dimensional Puzzle',
          },
          {
            title: 'EVERY CREW MEMBER SEES THE SAME PICTURE',
            copy: 'Your apprentice, your journeyman, and your office admin — all on the same page. 56dp touch targets mean electricians with insulated gloves can use the app without frustration. Dark theme readable in direct sunlight on rooftops and in low-light panel rooms. Real-time sync eliminates the telephone game where schedule changes get lost between dispatch and field. No per-user pricing tiers that force owners to decide which crew members deserve access to the schedule.',
            painPointRef: 'Crew Coordination Breaks Down as You Grow',
          },
          {
            title: 'FREE TO START. NO SALES CALL. NO DEMO WALL.',
            copy: 'ServiceTitan wants $245 per tech per month and a 12-month contract before you can test it. OPS is free to start with no credit card required, no sales demo, and no contract commitment. Published pricing with no hidden add-ons. For a 5-person electrical shop: ServiceTitan is $14,700-$30,000 a year. Jobber Grow is $4,188 a year. OPS is free to start. Download today. Schedule your first job tomorrow.',
            painPointRef: 'Enterprise Software for a $2M Electrical Shop',
          },
          {
            title: 'WORKS IN THE PANEL ROOM. WORKS ON THE ROOF. WORKS OFFLINE.',
            copy: 'Electricians work in basements, crawl spaces, panel rooms, and underground service areas where cell signal dies. OPS works fully offline — schedules, job details, and updates sync automatically when you reconnect. Dark theme reduces glare on job sites, in attics, and on rooftops. Multi-trade support means electrical contractors who also do low-voltage, fire alarm, or solar do not need separate software. Not an ERP with 6 modules. One app that does the job.',
            painPointRef: 'Crew Coordination Breaks Down as You Grow',
          },
        ],
        comparison: {
          competitors: ['ServiceTitan', 'Jobber'],
          rows: [
            { feature: 'Free plan available', ops: true, comp1: false, comp2: false },
            { feature: 'Same-day setup', ops: true, comp1: '3-6 months; $5K-$50K implementation', comp2: '30-60 minutes; 14-day trial' },
            { feature: 'Full offline mode (panel rooms, basements)', ops: true, comp1: 'Cloud-dependent features limited offline', comp2: 'Limited — read-only schedule, notes only' },
            { feature: 'Crew-first mobile design', ops: true, comp1: 'Admin/dispatch-first platform', comp2: 'Admin-friendly but not field-optimized' },
            { feature: 'Double-booking prevention', ops: true, comp1: true, comp2: '"Allows double booking without alerting me"' },
            { feature: 'Pricing (5-tech team)', ops: '$79/mo flat', comp1: '$1,225-$2,500/mo', comp2: '$169-$349/mo + $29/user' },
          ],
        },
        faq: [
          {
            question: 'What is the best scheduling software for a small electrical contractor?',
            answer: 'For electrical contractors with 2-15 technicians, the best software balances ease of use, mobile functionality, and cost. ServiceTitan starts at $245 per technician per month, requires a 12-month contract, and takes 3-6 months to implement. Jobber starts at $39 for one user but lacks true offline mode and allows double-booking. OPS is free to start, works offline in basements and panel rooms, and was designed for field crews. Download OPS today and schedule your first job tomorrow with no sales call.',
          },
          {
            question: 'How much does electrical contractor software cost per month?',
            answer: 'ServiceTitan runs $245-$500 per technician per month with $5,000-$50,000 in implementation fees. FieldEdge charges $100 per office user plus $125 per tech per month with a $500-$2,000 setup fee. Jobber starts at $39 a month for one user but scales to $169-$599 for teams with $29 per additional user. OPS is free to start with published pricing — no hidden add-ons, no per-module fees, no sales call required.',
          },
          {
            question: 'Does electrical contractor software work offline on job sites?',
            answer: 'This is critical for electricians who work in basements, crawl spaces, panel rooms, and underground service areas. Jobber offline mode is limited to viewing schedules and text notes — no timers, no signatures. Knowify users report offline mode does not work at all. OPS was built for the field and works fully offline. Schedules, job details, and updates sync automatically when you reconnect.',
          },
          {
            question: 'Can I switch from ServiceTitan to a simpler electrical contractor app?',
            answer: 'Yes. ServiceTitan is designed for large operations with 20 or more technicians. Small shops routinely report it is too complicated, onboarding is terrible, and support is slow. They also require at least 3 technicians and some contractors describe needing lawyers to retrieve their data after leaving. OPS provides a simpler path that your crew will actually use — free to start with no contract.',
          },
          {
            question: 'What features should an electrician look for in a job management app?',
            answer: 'Multi-day job support for work that spans days with permit holds and inspection gates. Offline mode because you work where there is no signal. Crew-level visibility so apprentices and journeymen see their schedule, not just the dispatcher. Real-time sync so changes reach every crew member instantly. Affordable pricing — if 42% of electrical firms generate less than $1 million, software should not cost $15,000 a year. OPS checks every box and is free to start.',
          },
        ],
        cta: {
          headline: 'YOUR CREW RUNS THE JOB.\nYOUR APP SHOULD RUN WITH THEM.',
          subtext: 'Multi-day scheduling. Offline mode in panel rooms and basements. Real-time crew sync. One app. Free to start — no demo, no contract, no per-tech pricing.',
        },
      },
    },
  },

  // —— ROOFING ——
  {
    slug: 'roofing',
    name: 'Roofing',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'phone', flowDirection: 'right' },
      { deviceType: 'tablet', flowDirection: 'left' },
      { deviceType: 'phone', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Roofing Contractor Software — Crew Scheduling, Weather & Job Management | OPS',
          description: 'OPS helps roofing contractors schedule crews around weather, coordinate multiple job sites, and keep foremen connected from the roof. Free to start at $79/mo flat.',
          keywords: [
            'roofing contractor software',
            'roofing crew scheduling app',
            'roofing business management software',
            'roofing project management app',
            'best software for roofers',
            'roofing crew management app',
            'roofing dispatch software',
            'roofing field service app',
            'free roofing contractor app',
            'acculynx alternative',
          ],
        },
        hero: {
          sectionLabel: 'roofing contractor software',
          headline: 'IT RAINED TUESDAY.\nYOUR WHOLE WEEK JUST CHANGED.',
          subtext: 'Two days of rain reshuffles every crew, every job, every customer expectation. OPS gives your office and your foremen the same real-time schedule — so when the weather changes, you adapt in minutes, not hours of phone calls.',
        },
        painPoints: [
          {
            title: 'WEATHER ROULETTE AND SCHEDULING CHAOS',
            bullets: [
              'An entire week of scheduling collapses from two days of rain, forcing every crew to be reshuffled. No buffer capacity means a domino effect of cascading reschedules that lasts days.',
              'Double-booking crews because the office lacks real-time visibility into who is where and what stage each job is at. "Jobs overlap, crews get mixed up, and you spend your morning calling people to track where everyone is."',
              'Pulling crews mid-job to start a new project breaks momentum and delays both jobs. Estimators underestimate labor time, project managers assume crews are available, and the field gets left out of scheduling conversations entirely.',
              'No mainstream roofing tool handles weather-driven rescheduling well. Top roofers build 1-2 buffer days per week per crew, but most software treats every day as equal — rain or shine.',
            ],
            forLine: 'For roofing owners and office managers juggling 2-5 crews across weather-dependent job sites',
          },
          {
            title: 'THE OFFICE-FIELD COMMUNICATION BLACK HOLE',
            bullets: [
              'Crews arrive on site without the right materials, without current job details, or at the wrong address because info was buried in a text thread. Poor communication costs the construction industry $31 billion a year in rework.',
              'Foremen cannot get answers from the office mid-job, so they make assumptions that lead to rework and wasted materials. The office invoices incomplete jobs because they have no real-time field visibility.',
              'Job status updates rely on phone calls and text messages that get lost, creating a "nobody told me" culture. The office only calls the field when there is a problem, creating hostility instead of cooperation.',
              'Language barriers compound everything. The fastest-growing segment of field workers is Latino, yet most communication tools do not support bilingual crews. Documentation is seen as "punishment or busy work" by field workers — not because they are lazy, but because the tools are terrible.',
            ],
            forLine: 'For roofing foremen and office coordinators tired of playing phone tag all day',
          },
          {
            title: 'SOFTWARE THAT COSTS MORE THAN A NEW CREW MEMBER',
            bullets: [
              'AccuLynx costs $60-$120 per user per month plus $500-$5,000 in setup fees with 12-month contracts. "Pricing continues to increase without any new features." Users report being bombarded with daily sales calls for over a year after inquiring.',
              'JobNimbus charges $49-$249 a month with hidden pricing and "horrendous customer support — NEVER available when needed." Users describe the onboarding as unorganized and rushed, and once done, "it is like they do not care anymore."',
              'ServiceTitan costs $245 per technician per month plus $5,000-$50,000 in implementation with 12-month contracts and documented exit fees of $15,000-$46,000. Implementation delays of over a year have been reported.',
              'Per-user pricing penalizes seasonal hiring. Adding 3 temporary crew members for storm season costs another $300-$900 a month in software alone. For a roofing company doing $1-$3 million, software should be a rounding error — not a line item that makes you wince.',
            ],
            forLine: 'For roofing company owners paying enterprise prices for tools their crews will not use',
          },
        ],
        solutions: [
          {
            title: 'WEATHER-SMART SCHEDULING THAT KEEPS EVERY CREW MOVING',
            copy: 'One drag-and-drop schedule for all your crews, all your jobs, at a glance. Foremen see their schedule on their phone before the morning huddle. Real-time crew visibility eliminates double-booking. When weather shuts down a job, the foreman flags it from the field and the office sees it instantly — no phone calls, no confusion. Batch scheduling by geography cuts travel time by 30%. OPS replaces the whiteboard, the group text, and the "call everyone at 5 AM" routine.',
            painPointRef: 'Weather Roulette and Scheduling Chaos',
          },
          {
            title: 'REAL-TIME FIELD-TO-OFFICE SYNC THAT KILLS PHONE TAG',
            copy: 'Every crew member knows their assignments before they leave the yard. Job status updates happen in real time from the field — the office dashboard reflects reality, not yesterday best guess. Photo documentation tied to each job, timestamped and organized. The foreman flags issues from the roof and it appears in the office instantly. Works offline because roofing crews work in places with no signal. OPS syncs when connectivity returns.',
            painPointRef: 'The Office-Field Communication Black Hole',
          },
          {
            title: 'BUILT FOR GLOVES, NOT FOR DESKTOPS',
            copy: 'Your crew is not going to sit through a training session. OPS was designed to be picked up and used by a foreman wearing work gloves, standing on a roof, squinting in sunlight. 56dp touch targets hit with a gloved hand on a phone that has been in a tool belt all morning. Dark theme readable in direct sunlight. No 3-week configuration process, no enterprise onboarding. Download today, schedule your first job tomorrow.',
            painPointRef: 'Software That Costs More Than a New Crew Member',
          },
          {
            title: '$79/MONTH FLAT — ADD STORM CREWS, NO PRICE INCREASE',
            copy: 'Published pricing, no hidden fees, no per-user charges that punish seasonal hiring. No demo wall, no "request a quote" form, no sales rep calling you daily for a year. Download from the app store, create your company, invite your crews, and start scheduling — same day. Compare: AccuLynx at $19,000 over 3 years, ServiceTitan at $5,000 just to set up, JobNimbus requiring 3 weeks of configuration. OPS at $948 a year flat. For a roofing company doing $1-$3 million, that is how software should be priced.',
            painPointRef: 'Software That Costs More Than a New Crew Member',
          },
        ],
        comparison: {
          competitors: ['JobNimbus', 'AccuLynx'],
          rows: [
            { feature: 'Free plan available', ops: true, comp1: false, comp2: false },
            { feature: 'No sales call required to start', ops: true, comp1: 'Contact sales', comp2: 'Contact sales' },
            { feature: 'Works offline', ops: true, comp1: 'Limited', comp2: false },
            { feature: 'Built for field crews (not just office)', ops: true, comp1: 'Office-first CRM', comp2: 'Office-first CRM' },
            { feature: 'Same-day setup', ops: true, comp1: '3+ weeks typical', comp2: 'Weeks + $500-$5K setup' },
            { feature: 'Pricing (5-person crew)', ops: '$79/mo flat', comp1: '$49-$249/mo (contact sales)', comp2: '$60-$120/user/mo + setup' },
          ],
        },
        faq: [
          {
            question: 'What is the best scheduling app for roofing contractors?',
            answer: 'For most roofing companies running 2-5 crews, the best scheduling app is one your foremen can use on the roof. AccuLynx and JobNimbus are popular roofing CRMs but they are office-first tools with limited field experiences. ServiceTitan offers AI dispatch but costs $245 per tech per month. OPS fills the gap: a scheduling and crew management app built for the field, not the office. No implementation period, no per-user fees, and a mobile experience designed for workers wearing gloves on a roof.',
          },
          {
            question: 'How do roofing companies handle weather delays in their schedule?',
            answer: 'Best practice: build 1-2 buffer days per week into each crew schedule. Batch similar jobs by geography to reduce travel time, saving up to 30%. Use weather forecast awareness to proactively reschedule before the morning of. Most roofing companies still handle this reactively — the owner checks the forecast at 5 AM and starts making calls. OPS lets foremen flag weather delays from the field and the office sees it instantly. Rescheduling is drag-and-drop, not a chain of phone calls.',
          },
          {
            question: 'How much does roofing contractor software cost?',
            answer: 'AccuLynx costs $60-$120 per user per month plus $500-$5,000 in setup fees with a 12-month contract. JobNimbus charges $49-$249 a month with pricing hidden behind a sales call. ServiceTitan runs approximately $245 per technician per month plus $5,000-$50,000 implementation with exit fees of $15,000-$46,000. OPS is free to start with no credit card, no sales call, and no contract. For a 10-person roofing company, annual costs range from $0 with OPS to $36,000 or more with ServiceTitan.',
          },
          {
            question: 'Do I need roofing-specific software or will a general app work?',
            answer: 'Roofing has unique needs: weather-dependent scheduling, multi-crew dispatch, insurance claims workflows, and aerial measurement integration. However, many "roofing-specific" tools are CRMs with roofing branding built around sales pipelines, not daily field operations. If your primary need is crew scheduling, job tracking, and field communication, a well-designed multi-trade app that understands field work is often more practical than a roofing CRM loaded with features you will never use.',
          },
          {
            question: 'How do I get my roofing crews to actually use the app?',
            answer: 'If the app is hard to use, the crew will not use it. Construction workers view software as busy work if it requires training sessions or typing long notes. What works: big buttons for gloved hands, minimal text, clear visual design readable in sunlight, and offline capability. The test: can your foreman open the app on a roof, check today schedule, update a job status, and take a photo — all in under 30 seconds without removing gloves? OPS was designed starting from the field worker experience.',
          },
        ],
        cta: {
          headline: 'STOP MANAGING ROOFS FROM A SPREADSHEET.',
          subtext: 'Weather-smart scheduling. Real-time crew sync. Built for the foreman on the roof. One app. Free to start — no demo, no contract, no per-user pricing.',
        },
      },
    },
  },

  // —— PEST CONTROL ——
  {
    slug: 'pest-control',
    name: 'Pest Control',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'phone', flowDirection: 'right' },
      { deviceType: 'tablet', flowDirection: 'left' },
      { deviceType: 'phone', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Pest Control Software — Route Scheduling, Chemical Tracking & Crew Management | OPS',
          description: 'OPS helps pest control companies schedule recurring routes, track chemical applications for EPA compliance, and keep technicians connected from the crawlspace. Free to start at $79/mo flat.',
          keywords: [
            'pest control software',
            'pest control scheduling software',
            'pest control scheduling app',
            'best pest control software for small business',
            'pest control route optimization software',
            'pest control technician app',
            'pestpac alternative',
            'fieldroutes alternative',
            'pest control business software free',
            'pest control chemical tracking software',
          ],
        },
        hero: {
          sectionLabel: 'pest control software',
          headline: 'YOUR TECH RUNS 10 STOPS A DAY.\nTHE APP SHOULD KEEP UP.',
          subtext: '35% of pest control companies still run on paper route sheets. The ones that switch to digital scheduling service 21% more jobs while cutting drive time by 30%. OPS handles routes, recurring schedules, and chemical logging — from a phone that works in the crawlspace.',
        },
        painPoints: [
          {
            title: 'ROUTE CHAOS AND RECURRING SCHEDULE NIGHTMARES',
            bullets: [
              'When scheduling depends on memory and manual coordination, adding customers degrades every route. One technician calling in sick means reworking the entire day by hand. What took 10 minutes each morning eventually demands constant attention throughout the day.',
              'Recurring services collide with emergency calls. The biggest scheduling challenge is not the monthly treatments — it is everything disrupting them. Emergency call-outs, new customer requests, and equipment failures all compete for technician time.',
              'Seasonal surges break manual systems. Spring brings 2-3x demand with termite swarms and ant season. Companies managing fine at 50 customers a week cannot handle 150 without software.',
              'Paper route sheets lose money. Spreadsheets show what was entered, not what is happening. Technicians waste time driving inefficient routes, appointments run late, and growth stalls because the business cannot handle more volume without more stress.',
            ],
            forLine: 'For pest control operators drowning in route sheets and rescheduling calls',
          },
          {
            title: 'ONE FAILED AUDIT AWAY FROM FINES AND LICENSE SUSPENSION',
            bullets: [
              'EPA and state regulations require tracking product name, EPA registration number, active ingredients, dilution rates, quantity applied, application method, and applicator certification. Many states mandate 7-year records. Paper tracking is a compliance time bomb.',
              'Apps without offline mode mean technicians in crawlspaces, basements, and rural properties lose work mid-entry. ServiceTracker users report losing all input data when relaunching after a crash. Jobber users note "no offline capability" with "risk of data loss."',
              'Commercial contracts demand documentation. Food service, healthcare, and multi-family accounts require detailed treatment logs. Losing a top-5 commercial account because your documentation is sloppy costs $30,000 or more over five years.',
              'Generating pesticide usage logs for state reporting by hand — compiling technician notes, cross-referencing products, calculating totals — consumes admin hours that could go toward growth.',
            ],
            forLine: 'For pest control companies one failed audit away from fines and license suspension',
          },
          {
            title: 'PESTPAC CHARGES $600/MONTH. OPS IS FREE TO START.',
            bullets: [
              'PestPac charges $150-$600 or more per month with every feature as an upsell. Users report being quoted $250, then discovering the actual cost is $600 with required modules. One user reported a $40,000 cancellation fee and 8-week payment withholding.',
              'FieldRoutes starts at $199 a month with multi-year contracts. Users report signing 2-3 year deals at $225 a month that jump to $450 in years 2-3, then discovering support is non-existent once locked in. One user left "8-10 voicemails over 6 weeks without responses."',
              'Onboarding takes weeks or months. One PestPac customer spent 4 months and $1,200 in monthly fees during onboarding and still could not use the software. A 3-technician team does not have weeks to configure software.',
              'Support is AI chatbots and unanswered tickets. "They never answer the phone and it takes five days for a call back." When your route schedule breaks at 6 AM, a chatbot will not fix it.',
            ],
            forLine: 'For pest control owners paying too much for software their techs hate and support that does not exist',
          },
        ],
        solutions: [
          {
            title: 'ROUTE SCHEDULING THAT ACTUALLY WORKS FOR RECURRING SERVICE',
            copy: 'Drag-and-drop scheduling lets operators build and adjust routes visually. No spreadsheets, no whiteboards, no deciphering technician handwriting. Real-time sync means when an emergency call comes in, the dispatcher adjusts and every technician sees the change instantly. Recurring service templates set monthly, quarterly, and annual visit cadences once and auto-populate calendars. Seasonal scaling is simple: add a technician, drag stops onto their route, live the same day.',
            painPointRef: 'Route Chaos and Recurring Schedule Nightmares',
          },
          {
            title: 'WORKS IN THE CRAWLSPACE. WORKS WITHOUT A SIGNAL.',
            copy: 'OPS offline mode is core architecture, not an afterthought. Technicians view schedules, log treatments, capture signatures, and complete jobs with zero connectivity. Everything syncs automatically when signal returns. 56dp touch targets mean gloved hands hit the right button. Dark theme reduces glare on sunny properties. Chemical application logging is built into the job completion flow — technicians record product, EPA number, dilution rate, quantity, and method as they work, not after they get home.',
            painPointRef: 'One Failed Audit Away from Fines and License Suspension',
          },
          {
            title: 'DOWNLOAD TODAY. RUNNING ROUTES TOMORROW. NO SALES CALL.',
            copy: 'OPS is free to start. No demo wall, no "talk to sales," no 14-day trial that expires before you finish onboarding. Published pricing with no hidden modules. What you see is what you pay. No annual contracts, no multi-year lock-in, no $40,000 cancellation fees. Setup takes hours, not weeks. A 3-technician operation should be running end-to-end in a day.',
            painPointRef: 'PestPac Charges $600/Month. OPS Is Free to Start.',
          },
          {
            title: 'BUILT FOR THE CREW, NOT THE CORNER OFFICE',
            copy: 'Every pest control software competitor markets to the owner or admin. The technician — the person using the app 8 hours a day in the field — is invisible. OPS is built crew-first. Field-real design: dark theme for outdoor visibility, 56dp touch targets for gloved hands, simplified job flow that matches how techs actually work. Route, stop, treat, log, next. When technicians actually use the software, data quality goes up, compliance gets handled automatically, and owners get visibility they have never had.',
            painPointRef: 'PestPac Charges $600/Month. OPS Is Free to Start.',
          },
        ],
        comparison: {
          competitors: ['PestPac (WorkWave)', 'FieldRoutes (ServiceTitan)'],
          rows: [
            { feature: 'Free plan available', ops: true, comp1: false, comp2: false },
            { feature: 'Same-day setup', ops: true, comp1: '4+ months onboarding reported', comp2: 'No free trial; custom implementation' },
            { feature: 'Offline mode (crawlspaces, rural properties)', ops: true, comp1: 'Inconsistent; crashes and poor offline documented', comp2: 'Glitchy; "constant loading" in the field' },
            { feature: 'Crew-first mobile design', ops: true, comp1: 'Desktop-first; mobile bolted on', comp2: 'Web-first; mobile "lacking some capabilities"' },
            { feature: 'Pricing transparency', ops: 'Published, no hidden fees', comp1: 'Not published; $40K cancellation fees reported', comp2: 'Not published; price doubles after year 1' },
            { feature: 'Pricing (3-tech team)', ops: '$79/mo flat', comp1: '$150-$600+/mo + module upsells', comp2: '$199-$450+/mo + multi-year contracts' },
          ],
        },
        faq: [
          {
            question: 'What is the best pest control software for a small company?',
            answer: 'For small pest control operations with 2-5 technicians, the best software sets up in a day, your techs will actually use in the field, and does not cost more than one of your service trucks. PestPac and FieldRoutes are built for 20-plus technician operations at $200-$600 a month. OPS is free to start with published pricing, requires no sales call, and is designed for small crews running route-based service. Your technicians can download the app and be running routes the same day.',
          },
          {
            question: 'How much does pest control business software cost per month?',
            answer: 'PestPac charges $150-$600 or more per month depending on modules, with annual contracts. FieldRoutes starts at $199 a month and scales based on active customers with multi-year contracts reported. GorillaDesk starts at $49-$99 per technician schedule. Jobber starts at $39 but caps at 15 users on its largest plan. OPS offers a free starting tier with transparent, published pricing — no sales call, no hidden modules, no annual contracts.',
          },
          {
            question: 'Does pest control software work offline in crawlspaces and rural areas?',
            answer: 'This is critical for pest control technicians who work in crawlspaces, basements, rural properties, and commercial buildings with dead zones. PestPac has offline mode but users report inconsistent performance and crashes. Jobber users note no offline capability with risk of data loss. One company nearly lost $300,000 in commercial accounts after switching to FieldRoutes because technicians spent too much time waiting for data to load. OPS is built offline-first: complete jobs, log chemical applications, and capture signatures with zero connectivity.',
          },
          {
            question: 'What chemical tracking features should pest control software include?',
            answer: 'Federal and state regulations require tracking product name, EPA registration number, active ingredients, dilution rates, quantity applied, application method, device used, and applicator information. Many states mandate 7-year retention. Your software should let technicians log this during the job, not after, and generate state chemical reports automatically. If you track chemical usage on paper, you are one failed audit away from fines or license suspension.',
          },
          {
            question: 'How do I switch from PestPac or FieldRoutes without losing data?',
            answer: 'Switching pest control software is the number-one fear for operators locked into legacy platforms. PestPac users report cancellation fees up to $40,000. FieldRoutes locks users into 2-3 year contracts. First step: review your contract terms and data export options. Most platforms must legally provide your data. OPS is free to start with no annual contract, so you can run both systems in parallel during transition with zero financial risk. Many companies switch during the slow winter season when route volume is lower.',
          },
        ],
        cta: {
          headline: 'YOUR ROUTES SHOULD RUN THEMSELVES.',
          subtext: 'Recurring schedules. Route optimization. Chemical logging. Offline mode. One app. Free to start — no demo, no contract, no $600/month surprise bills.',
        },
      },
    },
  },

  // —— PAINTING ——
  {
    slug: 'painting',
    name: 'Painting',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'phone', flowDirection: 'right' },
      { deviceType: 'tablet', flowDirection: 'left' },
      { deviceType: 'phone', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Painting Contractor Software — Crew Scheduling, Job Management & Estimating | OPS',
          description: 'OPS helps painting contractors schedule crews across multiple jobs, track labor hours against budgets, and document work with photos — all from a phone that works inside buildings. Free to start at $79/mo flat.',
          keywords: [
            'painting contractor software',
            'painting business management app',
            'painting crew scheduling software',
            'best software for painting contractors',
            'painting company software',
            'painting business app',
            'painting job costing software',
            'free painting contractor software',
            'paintscout alternative',
            'jobber alternative painters',
          ],
        },
        hero: {
          sectionLabel: 'painting contractor software',
          headline: 'YOUR CREW IS ON THREE JOBS.\nWHO IS WHERE?',
          subtext: '75% of painting industry revenue comes from companies with 1-4 employees. Most still schedule on whiteboards and group chats. OPS gives your crews and your office the same real-time schedule — so everyone knows where to go, what to do, and when they are done.',
        },
        painPoints: [
          {
            title: 'SCHEDULING IS YOUR BIGGEST NIGHTMARE',
            bullets: [
              '"Scheduling is my biggest nightmare." One contractor managing 35 jobs a week said it on PaintTalk — and every painting business owner reading this felt it. Once you run 3 or more crews, the manual approach collapses into daily chaos.',
              'No-shows are endemic. One painting business owner ran through 30 painters in a single year. Crew leaders deal with drama, no-shows, and a workforce with average tenure of 1-2 years. Inefficient scheduling overloads some crews while others sit idle.',
              'Paper whiteboards work until they do not. Some contractors photograph whiteboard schedules on their phones to keep them accessible. When key people are away, the system breaks. When cancellations cascade, the board cannot keep up.',
              'Resource allocation failures cost money you never see. When some crew members are overloaded while others idle, you lose on both ends — burned-out crews quit, idle crews cost money. Target billable utilization is 80 percent. Most painting companies have no idea where they actually land.',
            ],
            forLine: 'For painting contractors managing 2 or more crews across multiple job sites with whiteboards and gut feelings',
          },
          {
            title: 'COMMUNICATION BLACK HOLES BETWEEN OFFICE, CREW, AND CUSTOMER',
            bullets: [
              '80% of callers will not leave a voicemail. When a crew lead is on a ladder with a roller in hand, they cannot answer. Leads go cold. Jobs go to the next painter who picks up the phone.',
              '59-61% of the painting workforce is Hispanic or Latino and 74% speak Spanish as their primary language. English-only software creates daily friction and language barriers contribute to up to 25% of workplace accidents according to OSHA.',
              'Customers are left in the dark. Painting projects span multiple days and homeowners want to know when crews are coming. Without a clear communication system, important information gets lost and clients are uninformed about arrival times.',
              'Scope confusion between field and office. An owner sells a job and a crew shows up without clear scope documentation. "Contractors are not paid for work performed — they are paid for the work that is documented." Undocumented changes lead to disputes.',
            ],
            forLine: 'For painting business owners losing leads, losing context, and losing money between the phone, the crew, and the customer',
          },
          {
            title: 'PER-USER PRICING PUNISHES GROWING CREWS',
            bullets: [
              'PaintScout costs $99 per user per month and only handles estimating — no scheduling, no crew management, no dispatching, no time tracking. To run your operation you need PaintScout plus Jobber, paying for two systems that still do not talk to each other.',
              'Jobber charges $39 a month for one user but jumps to $169 for teams. A 20-person painting company on the Plus plan pays $744 or more per month. Each additional user beyond the plan limit costs $29 more. At 10 crew members, Jobber costs 7-8 times more than OPS.',
              'No competitor offers a Spanish-language interface for field crews. With the majority of painters speaking Spanish as their primary language, this is not a nice-to-have — it is a workforce necessity.',
              'None of these tools are built for the painter. Jobber is generic — no production rates, no paint catalogs, no coverage calculations. PaintScout solves estimating but leaves crews invisible. Every app talks to the owner. Nobody talks to the guy on the ladder.',
            ],
            forLine: 'For painting company owners whose software bills grow faster than their crew',
          },
        ],
        solutions: [
          {
            title: 'ONE SCHEDULE FOR EVERY CREW, EVERY JOB, EVERY DAY',
            copy: 'Drag-and-drop scheduling with automatic conflict detection prevents double-bookings. Assign crews to jobs by availability and proximity. When a cancellation comes in, reassign in seconds and the crew phone updates instantly. No more photographing whiteboards. No more "I did not get the text" disasters. The schedule is the single source of truth, always current, always accessible — even offline inside commercial buildings with no signal.',
            painPointRef: 'Scheduling Is Your Biggest Nightmare',
          },
          {
            title: 'YOUR CREW KNOWS WHERE TO GO BEFORE THE TRUCK STARTS',
            copy: 'Crew members open OPS and see exactly where they are going, what they are doing, and what they need — before they leave the yard. Photo documentation tied to each job replaces the "which house was that" camera roll search. 56dp touch targets work with paint-covered hands. Dark theme readable on exterior jobs in direct sunlight and inside dim commercial interiors. Works offline because painters work inside buildings where signal drops.',
            painPointRef: 'Communication Black Holes Between Office, Crew, and Customer',
          },
          {
            title: 'BUILT FOR THE PAINTER ON THE LADDER',
            copy: 'Every painting software talks to the owner. OPS talks to the crew lead on the ladder. Painters need four things: where am I going, what am I doing, what do I need, and when am I done. OPS delivers exactly that without 6 modules or a training department. New hires download the app and see their schedule on day one. Reduced friction means reduced turnover — and in an industry where crew tenure averages 1-2 years, every day of retention matters.',
            painPointRef: 'Per-User Pricing Punishes Growing Crews',
          },
          {
            title: '$79/MONTH FLAT — NOT $99/USER OR $29/EXTRA PAINTER',
            copy: 'Stop paying per-user fees that punish you for hiring. $79 a month flat regardless of team size. Add 5 painters for a commercial job, no price increase. Compare: PaintScout at $99 per user (estimating only), Jobber Grow at $349 a month plus $29 per extra user, combined stack at $500 or more a month. OPS at $79 a month flat — scheduling, job management, crew communication, and photo documentation in one app. Free to start with no credit card.',
            painPointRef: 'Per-User Pricing Punishes Growing Crews',
          },
        ],
        comparison: {
          competitors: ['Jobber', 'PaintScout'],
          rows: [
            { feature: 'Free plan available', ops: true, comp1: '14-day trial only', comp2: 'Limited free tier (solo only)' },
            { feature: 'Scheduling + crew management', ops: true, comp1: true, comp2: 'No — estimating only' },
            { feature: 'Works offline (inside buildings)', ops: true, comp1: 'Not documented', comp2: 'Not documented' },
            { feature: 'Crew-first mobile design', ops: true, comp1: 'Admin-first; field feels heavy', comp2: 'Office-focused estimating tool' },
            { feature: 'All-in-one (schedule + jobs + photos)', ops: true, comp1: true, comp2: 'Requires pairing with Jobber/other FSM' },
            { feature: 'Pricing (owner + 10 crew)', ops: '$79/mo flat', comp1: '$593+/mo (Grow + extra users)', comp2: '$99/user/mo (estimating only)' },
          ],
        },
        faq: [
          {
            question: 'What is the best software for painting contractors?',
            answer: 'For estimating specifically, PaintScout is popular at $99 per user per month but it only handles estimates and proposals — no scheduling, crew management, or field operations. For general FSM, Jobber offers quoting, scheduling, and invoicing but charges per user and has no painting-specific features. Most painting companies end up paying for two tools that do not integrate. OPS combines scheduling, job management, photo documentation, and crew communication in one app at $79 a month flat.',
          },
          {
            question: 'How do painting contractors manage multiple crew schedules?',
            answer: 'Most still use whiteboards, paper calendars, or group text chats — and it works until it does not. The breaking point is usually 3 or more crews, where the complexity of availability, travel time, job overlap, and cancellations exceeds what manual methods can handle. OPS drag-and-drop scheduling gives the office a full view of every crew while each crew lead sees only their own assignments on their phone. Changes propagate in real time. No more "I did not get the text."',
          },
          {
            question: 'How much does painting business software cost?',
            answer: 'PaintScout charges $99 per user per month for estimating only — a 3-person estimating team pays $297 a month without scheduling or crew management. Jobber ranges from $39 to $599 a month plus $29 per additional user. A 20-person painting company on Jobber Plus pays $744 or more monthly. OPS is free to start and $79 a month flat — no per-user charges, no hidden modules. For a painting company with 10 crew members, that is $79 versus $500 or more elsewhere.',
          },
          {
            question: 'Do I need software that supports Spanish-speaking crews?',
            answer: '59-61 percent of the painting workforce is Hispanic or Latino, and 74 percent speak Spanish as their primary language. If your crew cannot read work orders in their primary language, they will make mistakes or stop using the software entirely. OSHA estimates language barriers contribute to 25 percent of workplace accidents. Almost no painting contractor software offers a Spanish-language interface. OPS was built with multilingual crews in mind.',
          },
          {
            question: 'How do I reduce crew turnover in my painting business?',
            answer: 'The painting industry has extreme turnover — one owner reported running through 30 painters in a single year. Average tenure is 1-2 years. Reducing turnover starts with reducing daily frustration: give crews clear daily schedules on their phones, make expectations explicit through job details and checklists, and eliminate the "nobody told me" problem with real-time updates. OPS makes new hires productive on day one with zero training. When people understand their role and can see their progress, they stay longer.',
          },
        ],
        cta: {
          headline: 'YOUR CREW IS ON THE LADDER.\nGIVE THEM AN APP THAT WORKS UP THERE.',
          subtext: 'Crew scheduling. Job documentation. Real-time updates. One app for every painter on every job. Free to start — no demo, no contract, no per-user pricing.',
        },
      },
    },
  },

  // —— GENERAL CONTRACTING ——
  {
    slug: 'general-contracting',
    name: 'General Contracting',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'phone', flowDirection: 'right' },
      { deviceType: 'tablet', flowDirection: 'left' },
      { deviceType: 'phone', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'General Contractor Software — Crew Scheduling, Sub Coordination & Job Management | OPS',
          description: 'OPS helps general contractors coordinate crews and subs across multiple job sites, track project status in real time, and keep field teams connected. Free to start at $79/mo flat.',
          keywords: [
            'general contractor software',
            'contractor scheduling software',
            'construction crew management app',
            'best software for small general contractor',
            'gc project management app',
            'subcontractor coordination software',
            'contractor job costing software',
            'buildertrend alternative',
            'procore alternative small gc',
            'construction scheduling app offline',
          ],
        },
        hero: {
          sectionLabel: 'general contractor software',
          headline: '96% OF CONTRACTORS FAIL\nBEFORE YEAR 10.',
          subtext: 'Cash flow strangulation, sub coordination chaos, and rework from miscommunication cost the industry $177 billion a year. Most of it is preventable. OPS keeps your crews, your subs, and your office on the same page — for $79 a month, not $60,000 a year.',
        },
        painPoints: [
          {
            title: 'SUBCONTRACTOR COORDINATION CHAOS',
            bullets: [
              '54% of contractors blame delays on poor sub coordination. 70% say poor jobsite coordination causes cost overruns and schedule blowouts. A typical project manager negotiates with 30-40 subs across a couple dozen trades — all through phone calls, texts, and emails.',
              '"Ask any contractor about their worst day and you will hear about a scheduling disaster — subs showing up with no materials, concrete trucks arriving before forms are ready, critical path delays cascading into weeks of setbacks."',
              '35% of construction professionals time is spent on non-productive activities. Over 14 hours per week wasted on looking for project information, resolving conflicts, and managing rework.',
              'When office teams, field crews, and subs operate from different versions of the schedule, communication breaks down. Subcontractors live in the chaos between jobsite expectations and crew availability.',
            ],
            forLine: 'For general contractors juggling 2-8 active projects with subs who never answer their phones',
          },
          {
            title: 'PROCORE COSTS $60,000/YEAR. YOU DO $3.7 MILLION.',
            bullets: [
              'Procore starts at $4,500-$10,000 a year for small contractors with most paying $20,000-$60,000 a year. Revenue-based pricing means costs scale with success. "Procore was overkill for our team." "If you are a small account, you might not get the same attention as enterprise clients paying $50K per year."',
              'Buildertrend ranges from $199-$900 a month with $400-$1,500 onboarding costs and $39 per user beyond 3. "It is a hard product to learn and there is like 10 times more clicking than there needs to be." Pricing nearly doubles after the introductory period.',
              'Data lock-in traps small GCs. "Once information is inside their system, retrieving it later is a massive challenge. There is no simple or bulk way to download years worth of files, photos, and customer information."',
              '70% of contractors have no formal technology roadmap. Most firms allocate only 1-5% of revenue to technology. The payback period for enterprise tools often exceeds 24 months — a lifetime for a small GC.',
            ],
            forLine: 'For small general contractors caught between enterprise software they cannot afford and spreadsheets they have outgrown',
          },
          {
            title: '$177 BILLION IN REWORK. 48% FROM MISCOMMUNICATION.',
            bullets: [
              '30% of all work on construction sites is rework. Poor communication and bad project data cause 48% of it. That is $177 billion a year in wasted labor, materials, and time across the US construction industry.',
              '82% of contractors face payment waits over 30 days. Subcontractors wait 56 days on average. A $3.7 million revenue GC billing $300,000 a month with a 47-day collection cycle has $470,000 outstanding at any time.',
              '96% of construction companies fail before year 10. The primary driver is cash flow — long payment cycles, low margins, and slow collections. Every dollar lost to rework and communication failures is a dollar closer to insolvency.',
              '5.5 hours per week per person spent just looking for project data. When information lives in email threads, text messages, and filing cabinets, finding it becomes a full-time job.',
            ],
            forLine: 'For GCs losing money to rework, delayed payments, and information buried in text threads',
          },
        ],
        solutions: [
          {
            title: 'ONE SCHEDULE FOR YOUR CREWS, YOUR SUBS, AND YOUR OFFICE',
            copy: 'Drag-and-drop scheduling shows every crew, every job, every day at a glance. When the schedule changes — and it will — every affected person sees the update on their phone instantly. No phone trees, no group text chains, no "I did not get the message." Crew members open the app before they leave the yard and know exactly where to go and what to do. Subs can see their assigned jobs without accessing your entire system. The schedule becomes the single source of truth.',
            painPointRef: 'Subcontractor Coordination Chaos',
          },
          {
            title: 'REAL-TIME FIELD VISIBILITY WITHOUT THE ENTERPRISE PRICE TAG',
            copy: 'See job status updates from every site in real time. Photo documentation tied to each job, timestamped and organized — no more digging through email for before-and-after photos. Crews flag issues from the job site and the office sees them instantly. Works offline because new-build sites frequently have no connectivity infrastructure. OPS syncs when signal returns. You get the field visibility of a $60,000 platform at $79 a month.',
            painPointRef: '$177 Billion in Rework. 48% from Miscommunication.',
          },
          {
            title: 'DOWNLOAD TODAY. SCHEDULE YOUR FIRST JOB TOMORROW.',
            copy: 'No $20,000-$60,000 annual subscription. No $400-$1,500 onboarding fee. No 2-week to 12-month implementation timeline. OPS is free to start with published pricing — no sales call, no demo wall, no "request a quote" form. A GC doing $3.7 million in revenue spends 0.026% of annual revenue on OPS versus Procore at 0.1-0.2%. Download the app, create your company, invite your crews, and schedule your first job the same day.',
            painPointRef: 'Procore Costs $60,000/Year. You Do $3.7 Million.',
          },
          {
            title: 'BUILT FOR THE JOB SITE, NOT THE CONFERENCE ROOM',
            copy: '90% of construction firms have fewer than 20 employees. Most do not have a dedicated IT person or a project coordinator with time to learn enterprise software. OPS was designed for the foreman on the job site, not the PM in a conference room. 56dp touch targets for gloved hands. Dark theme for sunlight readability. Offline mode for new-build sites with zero connectivity. Spanish-language support for the 30% of construction workers who speak it natively. Simple by design — because the person using it has a hammer in their other hand.',
            painPointRef: 'Procore Costs $60,000/Year. You Do $3.7 Million.',
          },
        ],
        comparison: {
          competitors: ['Buildertrend', 'Procore'],
          rows: [
            { feature: 'Free plan available', ops: true, comp1: false, comp2: false },
            { feature: 'Same-day setup', ops: true, comp1: '$400-$1,500 onboarding; weeks to learn', comp2: 'Sales call required; weeks-months implementation' },
            { feature: 'Offline mode (new-build sites)', ops: true, comp1: 'Cloud-only', comp2: 'Mobile app available; cloud-dependent' },
            { feature: 'Crew-first field app', ops: true, comp1: 'Office-first; "10x more clicking than needed"', comp2: 'Strong mobile but enterprise-first' },
            { feature: 'Pricing transparency', ops: 'Published, no hidden fees', comp1: '$199-$900+/mo + $39/user beyond 3', comp2: 'Hidden; revenue-based; $4,500-$60K+/yr' },
            { feature: 'Pricing (8-person team)', ops: '$79/mo flat', comp1: '$394+/mo ($199 + 5 extra users)', comp2: '$4,500-$60,000+/yr' },
          ],
        },
        faq: [
          {
            question: 'What is the best project management software for a small general contractor?',
            answer: 'For GCs with 2-10 employees, the best software is simple enough that your crew uses it and affordable enough that it does not eat your margin. Procore starts at $4,500 a year and most small GCs pay $20,000-$60,000 — designed for enterprise operations. Buildertrend ranges from $199-$900 a month with a steep learning curve. OPS is free to start, takes minutes to set up, and was built for the job site, not the conference room.',
          },
          {
            question: 'How much does general contractor software cost?',
            answer: 'Procore charges $4,500-$60,000 or more per year based on annual construction volume. Buildertrend ranges from $199-$900 a month with $400-$1,500 onboarding costs and $39 per user beyond 3. Contractor Foreman starts at $49 a month. OPS is free to start and $79 a month flat regardless of team size — no per-user charges, no volume-based pricing, no annual contracts.',
          },
          {
            question: 'Do I need construction-specific software or can I use a general app?',
            answer: 'Construction has unique needs — multi-day projects, sub coordination, material-dependent scheduling, and field conditions that destroy consumer apps. But you also do not need enterprise construction software if your core problem is crew scheduling and field communication. OPS handles the operational core that every job shares: who is going where, when, with what information. If you are currently using spreadsheets and texts, OPS is the bridge between manual chaos and enterprise software you do not need.',
          },
          {
            question: 'How do general contractors coordinate subcontractors effectively?',
            answer: 'The most effective approach is a shared, real-time schedule that every stakeholder can see. When the concrete pour moves, the framing crew needs to know immediately — not through a chain of phone calls. OPS provides that shared view. Crews and subs see their assignments on their phone. Changes propagate instantly. The "nobody told me" problem disappears when everyone operates from the same source of truth.',
          },
          {
            question: 'Why do 96 percent of construction companies fail?',
            answer: 'Cash flow is the primary killer. GCs front labor, materials, and sub payments while waiting 45-90 days for draws. 82% now face payment waits over 30 days. When you add $177 billion in annual rework — 48% caused by miscommunication — the margin for error vanishes. Every scheduling error, every missed update, every rework event drains cash from a business already operating on thin margins. Better field communication and scheduling directly reduces the two biggest failure drivers.',
          },
        ],
        cta: {
          headline: 'YOUR SUBS SHOWED UP.\nDO THEY KNOW WHAT THEY ARE DOING?',
          subtext: 'Crew scheduling. Sub coordination. Real-time field sync. One app for the job site. Free to start — no demo, no contract, no $60,000 annual subscription.',
        },
      },
    },
  },

  // —— CLEANING ——
  {
    slug: 'cleaning',
    name: 'Cleaning & Janitorial',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'phone', flowDirection: 'right' },
      { deviceType: 'tablet', flowDirection: 'left' },
      { deviceType: 'phone', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Cleaning Business Software — Crew Scheduling, Job Tracking & Management | OPS',
          description: 'OPS helps cleaning businesses schedule recurring jobs, manage multiple crews, and prove work was done — all from a phone that works inside buildings. Free to start at $79/mo flat.',
          keywords: [
            'cleaning business software',
            'cleaning crew scheduling app',
            'janitorial scheduling software',
            'cleaning company management app',
            'commercial cleaning crew management',
            'cleaning business app for crews',
            'cleaning dispatch software',
            'best app for cleaning business',
            'free cleaning business scheduling app',
            'jobber alternative cleaning',
          ],
        },
        hero: {
          sectionLabel: 'cleaning business software',
          headline: 'YOUR CREW CLEANS THE BUILDING.\nGIVE THEM AN APP THAT WORKS IN IT.',
          subtext: '1.2 million cleaning businesses in the US. 90% have fewer than 10 employees. Most run on Google Calendar, WhatsApp group chats, and spreadsheets. OPS replaces the patchwork with one app your crew can actually use.',
        },
        painPoints: [
          {
            title: 'SCHEDULING THAT COLLAPSES UNDER RECURRING WORK',
            bullets: [
              'Recurring appointments — weekly, biweekly, monthly — create scheduling complexity that Google Calendar cannot handle. No conflict detection, no automatic rebooking, no crew-job matching. Double-bookings happen constantly.',
              'Last-minute cancellations cascade through the entire day. One no-show disrupts 3-4 subsequent appointments as crews scramble to fill or rearrange. The schedule that looked solid at 7 AM is destroyed by 9.',
              'Route inefficiency bleeds profit. Crews driving 45 minutes between jobs that could be 10 minutes apart with proper sequencing. In cleaning, travel time is dead time — every minute driving is a minute not billing.',
              '"Google Calendar is fundamentally incapable of running a granulated service business" — no native conflict checking, no shift overlap detection, no round-robin scheduling to balance load across crews.',
            ],
            forLine: 'For cleaning business owners managing 2 or more crews across multiple sites with tools that were not built for this',
          },
          {
            title: 'CREWS QUIT FASTER THAN YOU CAN TRAIN THEM',
            bullets: [
              'Industry turnover averages 200-400% annually. You replace your entire cleaning staff 2-4 times per year. Each replacement costs $1,000-$5,000 in recruiting, screening, training, and lost productivity.',
              'New cleaners get vague instructions, inconsistent training, and feel anonymous. They work alone in buildings at night and go weeks without seeing a supervisor. The result: disengagement and quitting within the first two weeks.',
              '65% of cleaning companies say finding reliable staff is their single biggest challenge. And every time a cleaner quits, their route knowledge, client preferences, and site access information walks out the door.',
              'Cleaning businesses using operational tools see turnover reductions of 20-40%. When people understand their role, can see their progress, and feel connected to the operation, they stay longer.',
            ],
            forLine: 'For cleaning companies losing employees faster than they can hire and train replacements',
          },
          {
            title: 'WHATSAPP IS NOT A BUSINESS SYSTEM',
            bullets: [
              'Most cleaning businesses run on Google Calendar, WhatsApp groups, Excel spreadsheets, and paper checklists — none of which talk to each other. Data silos and communication black holes are the default state.',
              'You cannot verify work was done, track crew locations, confirm clock-in times, or prove quality to clients when your entire system is text messages and trust.',
              'Non-English-speaking crew members miss instructions sent in English-only group chats, leading to wrong supplies at wrong sites, skipped rooms, and accidents. 25% of job-related accidents in cleaning involve language barriers.',
              'When the owner is the only person who knows the schedule, the client list, and the access codes, the business cannot survive a sick day — let alone scale to multiple crews.',
            ],
            forLine: 'For cleaning businesses still running on texts, spreadsheets, and one person memory',
          },
        ],
        solutions: [
          {
            title: 'ONE APP FOR THE WHOLE DAY — SCHEDULE TO DONE',
            copy: 'OPS replaces the fragmented stack of calendar apps, group chats, and spreadsheets with a single view of every crew day. Drag-and-drop scheduling with automatic conflict detection prevents double-bookings. Recurring job templates handle weekly, biweekly, and monthly appointments without manual re-entry. Crews see their entire day on their phone — addresses, access codes, client notes, checklists. When a cancellation comes in, the admin reassigns in seconds and the crew phone updates instantly.',
            painPointRef: 'Scheduling That Collapses Under Recurring Work',
          },
          {
            title: 'CREW-FIRST DESIGN THAT REDUCES TURNOVER',
            copy: 'New hires download OPS and see their schedule, route, and task lists on day one — no week-long training on complex software. 56dp touch targets work with wet or gloved hands. Dark theme legible in bright bathrooms and dim commercial hallways. Crew leads check off tasks, upload completion photos, and clock in from the field. Cleaners feel connected to the operation instead of isolated. Tools that reduce operational chaos lower turnover by 20-40% in cleaning businesses.',
            painPointRef: 'Crews Quit Faster Than You Can Train Them',
          },
          {
            title: 'PROVE THE WORK WAS DONE — WITHOUT BEING THERE',
            copy: 'Custom checklists per job type ensure nothing gets skipped. Photo uploads at task completion create a timestamped record. GPS-verified clock-in confirms the crew was at the site. When a client questions whether the baseboards were wiped or the break room restocked, you have documentation — not a "he said, she said" text thread. Critical for commercial janitorial contracts where inspections determine whether you keep the account.',
            painPointRef: 'WhatsApp Is Not a Business System',
          },
          {
            title: '$79/MONTH FLAT — NOT $169/MONTH FOR 5 USERS',
            copy: 'Most cleaning businesses have avoided software because the options are either too expensive, too complex, or too narrow. Jobber charges $169 or more for teams. Swept costs $150 or more for commercial-only. ZenMaid is residential-only. OPS is free to start, works for both residential and commercial cleaning, and was designed for the field worker. No contracts, no feature gating, no bait-and-switch pricing. Download today, cleaning tomorrow.',
            painPointRef: 'WhatsApp Is Not a Business System',
          },
        ],
        comparison: {
          competitors: ['Jobber', 'ZenMaid'],
          rows: [
            { feature: 'Free to start, no credit card', ops: true, comp1: '14-day trial only', comp2: '14-day trial only; then $19+/mo + per-seat' },
            { feature: 'Built for field crews', ops: true, comp1: 'Desktop-first; mobile described as limited', comp2: 'Mobile connectivity "spotty"' },
            { feature: 'Works for residential AND commercial', ops: true, comp1: 'Yes but no cleaning-specific features', comp2: 'Residential maid services only' },
            { feature: 'Offline capability', ops: true, comp1: '"Does not work offline" — G2', comp2: 'Not documented; connectivity issues reported' },
            { feature: 'Crew onboarding time', ops: 'Minutes — download and see schedule', comp1: 'Admin setup + training required', comp2: 'Admin-focused; cleaners are secondary users' },
            { feature: 'Pricing (5-person team)', ops: '$79/mo flat', comp1: '$169-$349/mo + $29/extra user', comp2: '$19-$49/mo + $4-$24/seat fees' },
          ],
        },
        faq: [
          {
            question: 'What is the best scheduling app for a cleaning business?',
            answer: 'For residential maid services, ZenMaid is purpose-built but limited to residential only and has spotty mobile connectivity. For general home services, Jobber offers broad functionality but lacks cleaning-specific features and does not work offline. For commercial janitorial, Swept handles inspections but costs $150 or more per month with documented reliability issues. OPS is the only option that is free to start, works for both residential and commercial, and was designed for field crews.',
          },
          {
            question: 'How do I manage multiple cleaning crews across different job sites?',
            answer: 'Managing multiple crews requires centralized scheduling that shows every crew assignments, locations, and availability in one view. The most common failure mode is separate group chats per crew, which fragments information and guarantees missed updates. A proper crew management app assigns jobs by proximity, pushes schedule changes instantly, tracks clock-in with GPS, and shows real-time job status. Each crew lead sees their schedule while the admin sees everything.',
          },
          {
            question: 'How do I reduce employee turnover in my cleaning business?',
            answer: 'The cleaning industry averages 200-400 percent annual turnover. Research shows the top drivers are anonymity, irrelevance, and lack of measurement. Give every cleaner a clear daily schedule on their phone. Use checklists so expectations are explicit. Enable crew leads to communicate with management. Cleaning businesses that implement operational software report 20-40 percent reductions in turnover. The cost of one $2,000 replacement pays for a year of OPS.',
          },
          {
            question: 'Do I really need software or can I use Google Calendar and texts?',
            answer: 'You can start with Google Calendar and most cleaning businesses do. The problems emerge past 1-2 crews: no conflict detection, no automatic recurring job management, no work verification, no audit trail. Google Calendar is "fundamentally incapable of running a granulated service business." The transition point is 3 or more employees and 20 or more recurring clients. With OPS being free to start, there is no financial risk in making the switch.',
          },
          {
            question: 'What features should cleaning business software have?',
            answer: 'In priority order: mobile-first scheduling your crews can use in the field. Recurring job support for weekly and biweekly appointments. Real-time updates so schedule changes reach crews instantly. GPS-verified clock-in for time tracking. Photo documentation and checklists to prove work was done. Offline capability for basements and commercial buildings. Simple onboarding — if your crew cannot figure it out in 10 minutes, they will not use it.',
          },
        ],
        cta: {
          headline: 'STOP RUNNING YOUR CLEANING BUSINESS\nON GROUP CHATS AND GUT FEELINGS.',
          subtext: 'Recurring schedules. Crew tracking. Work verification. One app for every cleaner on every job. Free to start — no demo, no contract, no per-user pricing.',
        },
      },
    },
  },
  // ─── PROPERTY MAINTENANCE ──────────────────────────────────────
  {
    slug: 'property-maintenance',
    name: 'Property Maintenance',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Property Maintenance Software for Crews | OPS',
          description:
            'OPS is built for the maintenance tech in the boiler room, not the manager behind a desk. Schedule crews across properties, track work orders offline, and stop paying per unit. Free to start.',
          keywords: [
            'property maintenance software',
            'property maintenance crew management',
            'maintenance work order app',
            'property maintenance scheduling software',
            'maintenance request tracking',
            'recurring maintenance scheduling',
            'property maintenance tracking app',
            'property maintenance management software',
            'maintenance crew app',
            'property maintenance work order software',
          ],
        },
        hero: {
          sectionLabel: 'Property Maintenance',
          headline: 'YOUR MAINTENANCE CREW\nDESERVES MORE THAN A\nDESK APP AFTERTHOUGHT.',
          subtext:
            'Every property maintenance platform builds for the manager behind the screen. OPS builds for the tech in the mechanical room. Schedule crews across scattered properties, track work orders that survive dead zones, and stop paying per door for software nobody in the field uses.',
        },
        painPoints: [
          {
            title: 'WORK ORDERS BURIED IN\nTEXT THREADS AND SPREADSHEETS.',
            bullets: [
              'Requests pour in from tenants, property managers, owners, and inspections — across dozens of scattered properties. Without one system, work orders vanish into email chains, group chats, and Excel tabs nobody updates.',
              '76% of landlords spend 40 hours a month monitoring properties. Most of that time is wasted manually tracking maintenance across fragmented tools that were never designed for field work.',
              'A missed repair request does not stay a missed repair request. It becomes a burst pipe, a mold claim, or a lease non-renewal. Small issues deferred cost $4-$7 for every $1 not spent today.',
              '70% of organizations still track maintenance in spreadsheets. That is not a system. That is a liability.',
            ],
            forLine: 'For property maintenance managers and dispatchers',
          },
          {
            title: 'SOFTWARE BUILT FOR DESKS,\nNOT FOR BOILER ROOMS.',
            bullets: [
              'The entire property maintenance software market is built for the person behind the desk. The maintenance tech who actually turns the wrench gets a clunky mobile afterthought — if they get anything at all.',
              'Property Meld forces every vendor, owner, and tenant to create separate accounts. Expecting a maintenance tech to onboard into another platform mid-workday is not realistic. It is a feature designed by someone who has never dispatched a crew.',
              'Most property maintenance apps require constant connectivity. Maintenance work happens in basements, elevator shafts, mechanical rooms, and underground parking garages where signal dies.',
              'When your crew cannot use the software, they stop using it. Then you are back to phone calls, text messages, and "I thought you told Mike about that job."',
            ],
            forLine: 'For maintenance technicians and field supervisors',
          },
          {
            title: 'PER-UNIT PRICING THAT\nPUNISHES GROWTH.',
            bullets: [
              'Most property maintenance software charges per unit, per door, or per property. As your portfolio grows, your software bill scales linearly — while the software itself does not get any better.',
              'Property Meld costs $1.60-$2.00 per unit per month with a $160 minimum and a mandatory 12-month contract. A 500-unit portfolio pays $800-$1,000 per month just for maintenance coordination.',
              'Propertyware charges $1 per unit with a $250 minimum — cost-prohibitive for operators managing fewer than 250 units. You are paying for doors, not for value.',
              'Contract lock-in is the industry norm. When the product does not work as pitched — and the reviews say it often does not — you pay a penalty to leave.',
            ],
            forLine: 'For property maintenance company owners',
          },
        ],
        solutions: [
          {
            title: 'ONE SCHEDULE. EVERY PROPERTY.\nEVERY CREW.',
            copy: 'Your techs cover dozens of properties scattered across town. OPS shows every crew member their full day — which property, what unit, what is the issue, who reported it. Drag, drop, reassign. When a burst pipe at 2 AM reshuffles the morning, update the schedule from your phone and every tech sees the change instantly. No more calling five people at 6 AM to rearrange the day.',
            painPointRef: 'work-order-chaos',
          },
          {
            title: 'BUILT FOR THE TECH\nIN THE MECHANICAL ROOM.',
            copy: 'OPS works in the places your current software dies — basements with concrete walls, elevator machine rooms, underground parking structures, utility tunnels. 56dp touch targets for gloved hands. Dark theme readable under fluorescent lights or on a rooftop at noon. Offline mode that syncs when your tech surfaces. Your crew opens it, sees the job, does the work. No training manual. No onboarding consultant.',
            painPointRef: 'desk-software',
          },
          {
            title: '$79 A MONTH.\nNOT $79 A DOOR.',
            copy: 'Property Meld at 500 units: $800/month. OPS at 500 units: $79/month. At 1,000 units: $1,600/month versus $79/month. No per-unit surcharges. No year-long contracts. No exit fees. No sales calls required. The math is simple because the pricing is simple. Grow your portfolio without watching your software bill grow alongside it.',
            painPointRef: 'per-unit-pricing',
          },
          {
            title: 'RECURRING MAINTENANCE\nTHAT ACTUALLY RECURS.',
            copy: 'Property maintenance is inherently recurring — HVAC filters, gutter cleaning, landscaping, seasonal inspections. Competitors handle this poorly. One user called recurring scheduling "totally bad." OPS lets you set preventive maintenance schedules once and they run. Filter changes every 90 days. Gutter cleaning every fall. Inspection routes every quarter. Your techs see it on their schedule. The work gets done. No manual re-entry.',
            painPointRef: 'operational-complexity',
          },
        ],
        comparison: {
          competitors: ['Property Meld', 'Buildium'],
          rows: [
            {
              feature: 'Pricing',
              ops: 'Free to start, $79/mo flat',
              comp1: '$1.60-$2.00/unit/mo, $160 minimum, 12-month contract',
              comp2: '$58-$375/mo by tier',
            },
            {
              feature: 'Field crew app',
              ops: 'Native mobile, offline, glove-ready',
              comp1: 'Vendor portal — forces separate account creation',
              comp2: 'Desktop-first, maintenance module secondary',
            },
            {
              feature: 'Offline mode',
              ops: 'Full offline, syncs on reconnect',
              comp1: 'No offline mode',
              comp2: 'No offline mode',
            },
            {
              feature: 'Spanish interface',
              ops: 'Native Spanish-language support',
              comp1: 'English only',
              comp2: 'English only',
            },
            {
              feature: 'Recurring scheduling',
              ops: 'Set once, runs automatically',
              comp1: 'Users report recurring is "totally bad"',
              comp2: 'Basic recurring work orders',
            },
            {
              feature: 'Time to start',
              ops: 'Download and go, same day',
              comp1: 'Onboarding + 12-month contract',
              comp2: 'Setup + plan selection required',
            },
          ],
        },
        faq: [
          {
            question: 'Is OPS built for property managers or maintenance crews?',
            answer:
              'Maintenance crews. Every competitor builds for the property manager at a desk. OPS builds for the tech standing in front of a broken unit with work gloves on and no signal. Your dispatchers get a real-time schedule view. Your techs get a mobile app that works in basements and mechanical rooms. Both get one source of truth.',
          },
          {
            question: 'How does OPS pricing compare to per-unit software?',
            answer:
              'OPS is $79/month flat — regardless of how many units you manage. Property Meld charges $1.60-$2.00 per unit per month with a $160 minimum and 12-month contract. At 300 units, that is $480/month versus $79/month. At 1,000 units, $1,600/month versus $79/month. No per-unit surcharges, no exit fees, no sales call required.',
          },
          {
            question: 'Does OPS work offline in basements and mechanical rooms?',
            answer:
              'Yes. Maintenance work happens in the worst connectivity environments — basements with concrete walls, elevator machine rooms, underground parking structures, rooftop mechanical penthouses. OPS works fully offline and syncs when connectivity returns. Your tech never loses work order data.',
          },
          {
            question: 'Can OPS handle recurring preventive maintenance schedules?',
            answer:
              'Yes. Set up recurring schedules for HVAC filter changes, gutter cleaning, seasonal inspections, landscaping — any repeating task. OPS creates the jobs automatically on your schedule. No manual re-entry every month or quarter. Preventive maintenance delivers 545% ROI and reduces operating expenses by 12-18% versus reactive maintenance.',
          },
          {
            question: 'We manage both residential and commercial properties. Does OPS handle that?',
            answer:
              'Yes. Residential units, commercial properties, multi-family complexes — OPS handles all property types through flexible scheduling and job tracking. Unlike per-unit tools that penalize portfolio diversity, OPS charges one flat rate regardless of property type or count.',
          },
        ],
        cta: {
          headline: 'YOUR MAINTENANCE CREW IS TIRED\nOF SOFTWARE BUILT FOR SOMEONE ELSE.',
          subtext: 'One app for every property, every work order, every tech. Offline mode for the mechanical room. Spanish for the crew. $79/month for the whole team — not $79 per door. Free to start.',
        },
      },
    },
  },

  // ─── GLASS & WINDOWS ─────────────────────────────────────────
  {
    slug: 'glass',
    name: 'Glass & Windows',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Glass & Window Installation Software for Crews | OPS',
          description:
            'OPS replaces the whiteboard your glass company runs on. Schedule crews, track jobs from measurement to install, capture insurance photos, and dispatch emergency board-ups — all offline. Free to start.',
          keywords: [
            'glass company software',
            'glazier scheduling app',
            'window installation scheduling software',
            'glass business management app',
            'glass contractor crew management',
            'glazing contractor field service app',
            'glass shop scheduling software',
            'window replacement business software',
            'emergency glass repair dispatch',
            'glass company quoting software',
          ],
        },
        hero: {
          sectionLabel: 'Glass & Windows',
          headline: 'YOUR GLASS CREW DESERVES\nBETTER THAN A WHITEBOARD.',
          subtext:
            'Glass companies still run on whiteboards with magnets, carbon-copy books, and verbal handoffs between the shop and the field. One person out sick and the whole schedule collapses. OPS gives your shop crew and your field crew one source of truth — jobs, schedules, photos, and status updates that survive basements, storefronts, and rooftops.',
        },
        painPoints: [
          {
            title: 'QUOTING TAKES DAYS\nWHEN IT SHOULD TAKE MINUTES.',
            bullets: [
              'A customer calls for a quote. Your staff checks spreadsheets, calls suppliers for pricing, verifies material availability, and manually calculates square footage. By the time the quote goes out, the customer has called a competitor.',
              'The measurement-to-quote pipeline is a relay race nobody wins. A field tech drives out, writes dimensions on paper, drives back, hands it to the office, who manually enters it into a spreadsheet, then creates a quote. One glass shop documented this as a 5-hour process per quote.',
              'Every piece of glass has variables — type, thickness, tint, edge finish, hardware. Without a system, quoting is a manual pricing exercise every single time. Tempered, laminated, insulated, low-E — each one a lookup.',
              'When the response is "let me call you back," the urgency shifts and customers start calling competitors. Speed is the differentiator between winning and losing the job.',
            ],
            forLine: 'For glass company owners and office managers',
          },
          {
            title: 'SCHEDULING IS A WHITEBOARD\nAND A PRAYER.',
            bullets: [
              'One glass company ran their entire scheduling operation on a whiteboard with magnets, supplemented by verbal handoffs. When key people were away, things fell apart. This is not an outlier. It is the norm in glass.',
              'You cannot install glass that has not arrived. Tempered panels take 1-7 business days domestically, 4-8 weeks imported. Scheduling must account for fabrication lead times, but most shops track this in their heads or on sticky notes.',
              'Emergency board-ups for storm damage, break-ins, and vandalism are 24/7 operations. An emergency call at 2 AM means reshuffling the next day. Without a digital system, the dispatcher is calling everyone individually.',
              'Glass companies have two workforces — shop crews and field crews. A job is not ready for the field until the shop finishes. Tracking that handoff on paper means field crews show up to jobs where the glass is not ready.',
            ],
            forLine: 'For foremen and dispatchers at glass companies',
          },
          {
            title: 'FIELD ERRORS ARE EXPENSIVE\nAND UNRECOVERABLE.',
            bullets: [
              'Tempered glass cannot be recut. A measurement error of a few millimeters means scrapping the entire panel and starting over — new material, new fabrication time, new delivery. Custom panels can cost hundreds of dollars per mistake.',
              'Job details collected on paper, then re-entered into another system, create a telephone game of errors. "If you have one tiny little piece of information not right, it will not export." One wrong digit. One transposed dimension. Start over.',
              'Insurance claims for storm damage and break-ins require before, during, and after photos from multiple angles. Without a system that attaches photos to jobs, crews take photos on personal phones that never get filed properly.',
              'Double entry wastes hours. Paper work order to accounting software to invoicing tool. One case study documented that this "doubled the time required for quoting." Every hour on double entry is an hour not spent on billable work.',
            ],
            forLine: 'For glass installation crews and field supervisors',
          },
        ],
        solutions: [
          {
            title: 'CAPTURE IN THE FIELD.\nQUOTE FROM THE TRUCK.',
            copy: 'OPS eliminates the round-trip between field and office. Your tech measures, documents, and the office sees it instantly. No driving back to the shop with scribbled dimensions. No re-entering numbers into a spreadsheet. No calling the customer back two days later only to hear they already hired someone else. In glass, the company that quotes first wins. OPS makes you that company.',
            painPointRef: 'quoting-delays',
          },
          {
            title: 'SCHEDULE AROUND MATERIALS,\nNOT AROUND GUESSWORK.',
            copy: 'Glass scheduling is not like HVAC scheduling. You cannot install what has not been fabricated. OPS gives your dispatcher a real-time view of every crew, every job, and every status — so you stop sending crews to jobs where the glass is not ready. When an emergency board-up call comes in at midnight, update the schedule from your phone and every affected crew sees the change. No more whiteboard with magnets that only one person can read.',
            painPointRef: 'whiteboard-scheduling',
          },
          {
            title: 'YOUR CREW RUNS THE JOB,\nNOT THE PAPERWORK.',
            copy: 'Your installers are skilled tradespeople, not data entry clerks. OPS puts job details, measurements, customer notes, and photo capture in their hands. 56dp touch targets for gloved hands. Dark theme readable in direct sunlight on a rooftop or inside a bright storefront. Offline mode for basements and behind curtain walls. Before, during, and after photos attached directly to the job. One entry, everywhere it needs to be.',
            painPointRef: 'field-errors',
          },
          {
            title: 'ONE APP FROM BOARD-UP\nTO FINAL INVOICE.',
            copy: 'Glass companies are not single-service businesses. Residential shower doors Monday, commercial storefront Tuesday, emergency board-ups Wednesday, auto glass Thursday. Most software forces you to pick a lane. OPS handles the full lifecycle of any glass job — dispatch the crew, track the work, capture insurance photos, log materials, generate the invoice. No switching apps. No re-entering data. Your office, your shop, and your field crews all see the same jobs in real time.',
            painPointRef: 'operational-complexity',
          },
        ],
        comparison: {
          competitors: ['GlassManager', 'Glazier Software'],
          rows: [
            {
              feature: 'Pricing',
              ops: 'Free to start, no credit card',
              comp1: '$65-95/user/mo + $12/field user + setup fee',
              comp2: 'Hidden — demo required',
            },
            {
              feature: 'Time to start',
              ops: 'Download and go, same day',
              comp1: 'Setup fee + onboarding required',
              comp2: 'Demo call + onboarding',
            },
            {
              feature: 'Field crew app',
              ops: 'Native mobile, offline, glove-ready',
              comp1: 'Basic mobile web, $12/month per field user',
              comp2: 'Native iOS/Android',
            },
            {
              feature: 'Photo documentation',
              ops: 'Photos attached to jobs, in-app capture',
              comp1: 'Photo upload to jobs',
              comp2: 'Digital field reports',
            },
            {
              feature: 'Multi-trade support',
              ops: 'All trades in one app',
              comp1: 'Glass only',
              comp2: 'Glass only',
            },
            {
              feature: 'Offline mode',
              ops: 'Full offline, syncs on reconnect',
              comp1: 'No offline mode',
              comp2: 'Not documented',
            },
          ],
        },
        faq: [
          {
            question: 'Do I need glass-specific software, or can a general scheduling app work?',
            answer:
              'Glass companies have unique workflows — material-dependent scheduling, shop-to-field handoffs, emergency board-up dispatch, insurance photo documentation. But you do not need a $95/user/month glass ERP if your core problem is scheduling and crew coordination. OPS gives you the field-level tools that matter without forcing you into a complex system you will spend months learning.',
          },
          {
            question: 'What does glass company management software cost?',
            answer:
              'Glass-specific software ranges from $65 to $230+ per user per month. GlassManager charges $65-$95/user plus $12/month per field user plus $250-$495 setup fees. Glazier Software does not publish pricing and requires a demo call. OPS is free to start with no credit card, no per-field-user charges, and no setup fees.',
          },
          {
            question: 'Can OPS handle both residential and commercial glass work?',
            answer:
              'Yes. Shower door installations, commercial storefronts, emergency board-ups, auto glass — OPS handles all job types through flexible scheduling and job tracking. Unlike glass-specific ERPs built for commercial contract glazing, OPS focuses on what every glass job shares: who is going where, when, with what information.',
          },
          {
            question: 'Does OPS work offline on job sites with no signal?',
            answer:
              'Yes. Glass installation happens behind curtain walls, in basements, on rooftops, and inside storefronts where signal drops. OPS works fully offline — your crew sees their jobs, captures photos, logs updates, and everything syncs when connectivity returns.',
          },
          {
            question: 'We are a small glass shop with 3-5 people. Is OPS overkill?',
            answer:
              'The opposite. Most glass software is overkill for small shops. GlassManager requires minimum users, Smart Glazier starts at $150/month, and others require demos and onboarding consultants. OPS is built for teams too small for a "back office" — where the owner is also the estimator, the dispatcher, and sometimes the installer. Download it today and start scheduling jobs.',
          },
        ],
        cta: {
          headline: 'YOUR GLASS CREW DESERVES\nBETTER THAN A WHITEBOARD.',
          subtext: 'Download OPS free. Set up your crew in minutes. Start scheduling glass jobs today — no demo, no sales call, no credit card. Built for the crew, not the corner office.',
        },
      },
    },
  },
  // ─── SEPTIC & SEWER ────────────────────────────────────────────
  {
    slug: 'septic',
    name: 'Septic & Sewer',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Septic & Sewer Service Software for Crews | OPS',
          description:
            'OPS is built for septic and sewer crews who work in the field, not behind a desk. Schedule pump-outs, track compliance, manage emergency calls, and keep every job documented. Free to start.',
          keywords: [
            'septic service software',
            'sewer service crew management',
            'septic pumping scheduling app',
            'septic business management software',
            'sewer line service scheduling',
            'septic company software',
            'septic compliance tracking',
            'septic pump-out scheduling',
            'sewer crew dispatch app',
            'septic tank service app',
          ],
        },
        hero: {
          sectionLabel: 'Septic & Sewer',
          headline: 'SEPTIC WORK IS\nTOO REGULATED TO RUN\nON MEMORY.',
          subtext:
            'Pump-out intervals, inspection certificates, county compliance forms, emergency overflow calls at midnight. Your septic business runs on recurring schedules and documentation that cannot slip through the cracks. OPS keeps every job tracked, every truck dispatched, and every compliance record where it belongs — on the phone in your crew\'s pocket.',
        },
        painPoints: [
          {
            title: 'RECURRING SCHEDULES\nTHAT LIVE IN YOUR HEAD.',
            bullets: [
              'Septic systems need pumping every 3-5 years. That is hundreds of customers on staggered cycles — and most septic companies track this in spreadsheets, notebooks, or memory. One missed pump-out becomes a $10,000 failure.',
              'Customer callback schedules are revenue you already earned — but only if you actually call them back. Most septic companies lose 20-30% of recurring revenue simply because nobody remembered to follow up.',
              'County and state regulations require inspection records, pump-out documentation, and compliance certificates. Paper records get lost. Digital records on scattered systems get forgotten.',
              'When the owner is the only person who knows which customer is due next, the business cannot grow. The schedule lives in one brain, and that brain is also running a pump truck.',
            ],
            forLine: 'For septic company owners and office managers',
          },
          {
            title: 'EMERGENCY CALLS\nWITH NO SYSTEM TO DISPATCH.',
            bullets: [
              'A septic overflow is not a "schedule it for next Tuesday" problem. It is a hazmat situation that needs a truck within hours. Most septic companies dispatch emergency calls by calling drivers one by one until someone picks up.',
              'Your trucks are spread across the county. You have no idea which truck is closest to the emergency, which one has capacity, or which driver is already on a job that cannot be interrupted.',
              'Emergency calls come in at 6 PM on Friday, at 11 PM on Saturday, at 5 AM on Monday. Without a system that every driver can check from their phone, you are the dispatcher 24/7 — and your phone is your single point of failure.',
              'When you finally dispatch someone, they need the address, the access instructions, the system type, and the history. That information is in your head, on a sticky note, or in a file cabinet at the office.',
            ],
            forLine: 'For dispatchers and field supervisors',
          },
          {
            title: 'DOCUMENTATION THAT\nDOES NOT SURVIVE THE TRUCK.',
            bullets: [
              'Septic work requires documentation — photos of tank condition, measurements of sludge levels, notes on system health, compliance forms for the county. Your crew takes photos on personal phones that never get filed.',
              'Paper work orders get wet, get lost, or arrive back at the office illegible. The information that was captured in the field dies in the truck cab.',
              'When a customer calls three years later asking about their last service, you need that record. If it is buried in someone\'s phone gallery or a box of carbon copies, you have no record at all.',
              'Compliance failures are not just inconvenient — they can result in fines, failed inspections, and lost operating permits. The stakes of bad documentation in septic are higher than most trades.',
            ],
            forLine: 'For septic technicians and field crews',
          },
        ],
        solutions: [
          {
            title: 'RECURRING SCHEDULES\nTHAT RUN THEMSELVES.',
            copy: 'Set pump-out intervals once — every 3 years, every 5 years, whatever the system requires — and OPS creates the jobs automatically when they come due. No spreadsheet reviews. No memory-based callbacks. Your recurring revenue stays recurring because the system remembers what your brain cannot hold.',
            painPointRef: 'recurring-schedules',
          },
          {
            title: 'DISPATCH THE CLOSEST TRUCK\nIN 30 SECONDS.',
            copy: 'Emergency overflow call comes in. OPS shows you every truck, every driver, every current job. Tap the closest available driver, assign the job, and they see it on their phone immediately — address, access notes, system history, everything. No calling around. No guessing who is available. The truck rolls in minutes, not hours.',
            painPointRef: 'emergency-dispatch',
          },
          {
            title: 'EVERY JOB DOCUMENTED.\nEVERY PHOTO FILED.',
            copy: 'Your crew captures photos, notes, sludge measurements, and compliance data directly in OPS — attached to the job, attached to the customer, searchable forever. When the county asks for records or a customer calls about their last service, the answer is two taps away. Not in a filing cabinet. Not in someone\'s phone gallery. In the system.',
            painPointRef: 'documentation',
          },
          {
            title: 'ONE APP FOR THE OFFICE\nAND THE PUMP TRUCK.',
            copy: 'Your office sees every job, every truck, and every customer in one view. Your drivers see their schedule, their route, and their job details on their phone. No paper work orders. No radio dispatch. No "I thought you said Thursday." What the office assigns is exactly what the crew sees — in real time, or offline when they are on a rural property with no signal.',
            painPointRef: 'operational-complexity',
          },
        ],
        comparison: {
          competitors: ['ServiceTitan', 'Jobber'],
          rows: [
            {
              feature: 'Pricing',
              ops: 'Free to start, $79/mo flat',
              comp1: '$298+/mo, annual contract',
              comp2: '$49-$199/mo, feature-gated',
            },
            {
              feature: 'Recurring job scheduling',
              ops: 'Set once, auto-generates jobs',
              comp1: 'Available on higher tiers',
              comp2: 'Available on higher tiers',
            },
            {
              feature: 'Offline mode',
              ops: 'Full offline, syncs on reconnect',
              comp1: 'Limited offline',
              comp2: 'Limited offline',
            },
            {
              feature: 'Photo documentation',
              ops: 'Photos attached to jobs, in-app',
              comp1: 'Photo capture available',
              comp2: 'Photo capture on paid plans',
            },
            {
              feature: 'Crew app usability',
              ops: '56dp touch targets, dark theme, glove-ready',
              comp1: 'Full-featured but complex',
              comp2: 'Clean but limited on lower tiers',
            },
            {
              feature: 'Time to start',
              ops: 'Download and go, same day',
              comp1: 'Demo + implementation required',
              comp2: 'Setup + plan selection',
            },
          ],
        },
        faq: [
          {
            question: 'Can OPS handle recurring septic pump-out schedules?',
            answer:
              'Yes. Set customer-specific intervals — 3 years, 5 years, annual inspections — and OPS auto-generates the jobs when they come due. No manual spreadsheet reviews. No missed callbacks. Your recurring revenue stays on schedule.',
          },
          {
            question: 'Does OPS work in rural areas with poor cell coverage?',
            answer:
              'Yes. Septic work often happens on rural properties with little to no signal. OPS works fully offline — your crew sees their jobs, captures photos, logs notes, and everything syncs when they get back to a connection.',
          },
          {
            question: 'Can I dispatch emergency calls through OPS?',
            answer:
              'Yes. See every truck and driver on one screen, assign the closest available crew, and they see the job immediately on their phone — address, access notes, system history, and all.',
          },
          {
            question: 'Does OPS help with septic compliance documentation?',
            answer:
              'OPS stores photos, notes, and job records attached to each customer and property. When you need records for county inspections or customer inquiries, they are searchable and permanent — not buried in a filing cabinet or someone\'s phone gallery.',
          },
          {
            question: 'We are a 3-person septic company. Is OPS too much?',
            answer:
              'OPS is built for small crews. No implementation timeline, no training consultant, no feature bloat. Download it, add your crew, and start scheduling pump-outs. If your biggest problem is "everything is in my head," OPS fixes that on day one.',
          },
        ],
        cta: {
          headline: 'YOUR SEPTIC BUSINESS IS TOO IMPORTANT\nTO RUN ON MEMORY AND STICKY NOTES.',
          subtext: 'Recurring schedules. Emergency dispatch. Compliance documentation. One app for the office and the pump truck. Free to start — no demo, no contract.',
        },
      },
    },
  },

  // ─── IRRIGATION & SPRINKLER ───────────────────────────────────
  {
    slug: 'irrigation',
    name: 'Irrigation & Sprinkler',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Irrigation & Sprinkler Service Software for Crews | OPS',
          description:
            'OPS is built for irrigation crews managing seasonal startups, blowouts, repairs, and route-based service. Schedule crews, track jobs, and stop losing customers between seasons. Free to start.',
          keywords: [
            'irrigation service software',
            'sprinkler company scheduling app',
            'irrigation business management',
            'sprinkler system service software',
            'irrigation crew scheduling',
            'irrigation route management',
            'sprinkler repair scheduling app',
            'irrigation company software',
            'lawn sprinkler service app',
            'irrigation dispatch software',
          ],
        },
        hero: {
          sectionLabel: 'Irrigation & Sprinkler',
          headline: 'IRRIGATION IS SEASONAL.\nYOUR SCHEDULE SHOULD NOT\nDISAPPEAR BETWEEN SEASONS.',
          subtext:
            'Spring startups. Summer repairs. Fall blowouts. Your irrigation business runs in compressed bursts where every day is 15 jobs and every missed appointment is a lost customer. OPS keeps your routes tight, your crews moving, and your customer list intact from blowout season to startup season.',
        },
        painPoints: [
          {
            title: 'SEASONAL CHAOS THAT\nCRUSHES YOUR CREW.',
            bullets: [
              'Spring startup and fall blowout seasons compress 80% of your revenue into a few brutal weeks. Every customer wants their system done this week. Your crew is running 12-15 stops per day, and one delay cascades into a week of rescheduling.',
              'Between seasons, your customer list goes cold. You lose 15-25% of customers annually simply because nobody followed up. They called someone else because you did not call them first.',
              'Seasonal hiring means new crew members every spring who need to learn routes, customer preferences, and system layouts from scratch. Without a system that stores this information, your senior tech becomes the bottleneck.',
              'Weather cancellations are not exceptions — they are the norm. A rainy week in April means every startup on that schedule needs to shift, and the cascade affects every week after it.',
            ],
            forLine: 'For irrigation company owners and managers',
          },
          {
            title: 'ROUTES THAT WASTE HOURS\nON THE ROAD.',
            bullets: [
              'Irrigation service is route-based — your crew hits 10-15 properties per day in sequence. A poorly planned route wastes hours of drive time between stops. Hours you are paying for with zero billable work.',
              'Most irrigation companies plan routes by memory or by sorting addresses in a spreadsheet. When the senior tech who "knows the routes" is out sick, the whole day falls apart.',
              'Mid-day changes — an emergency repair call, a customer not home, a gate code that does not work — mean your crew needs to reroute on the fly. Without a digital schedule they can reference, they call the office. The office calls them back. The crew sits idle.',
              'Route efficiency is the difference between 12 stops per day and 15 stops per day. Over a 6-week blowout season, that is hundreds of additional jobs — or hundreds of lost ones.',
            ],
            forLine: 'For irrigation crew leaders and dispatchers',
          },
          {
            title: 'CUSTOMER HISTORY TRAPPED\nIN ONE PERSON\'S HEAD.',
            bullets: [
              'Every irrigation system is different — zone counts, head types, valve locations, backflow device specs, controller model. Your senior tech knows this by heart. Your new hire does not. Without a record, every job starts from scratch.',
              'When a customer calls about a problem, your office needs to know what system they have, when you last serviced it, and what was done. If that information is in a notebook in someone\'s truck, you have no answer.',
              'Photos from last year\'s repair — the valve location behind the shed, the buried wire splice, the controller wiring — save hours of diagnostic time this year. But they are on a former employee\'s phone.',
              'Irrigation systems have 10-20 year lifespans with annual service. A customer relationship worth $200/year for 15 years is worth $3,000 in lifetime value. Losing that customer because nobody followed up is expensive.',
            ],
            forLine: 'For irrigation technicians and field crews',
          },
        ],
        solutions: [
          {
            title: 'SEASONAL SCHEDULES\nTHAT FILL THEMSELVES.',
            copy: 'Import your customer list. Set the season dates. OPS builds the schedule. Spring startups slot in by zone. Fall blowouts route by geography. Your crew sees their full day — every stop, every address, every system note — on their phone before they leave the shop. When weather cancels a day, drag the block and the rest of the season adjusts.',
            painPointRef: 'seasonal-chaos',
          },
          {
            title: 'TIGHTER ROUTES.\nMORE STOPS. LESS WINDSHIELD TIME.',
            copy: 'OPS shows your crew their daily route with every stop in sequence. Mid-day changes update instantly — a canceled appointment, an added emergency repair, a customer not home. Your crew sees the new route on their phone without calling the office. Spend time on properties, not between them.',
            painPointRef: 'route-waste',
          },
          {
            title: 'CUSTOMER HISTORY\nTHAT OUTLASTS YOUR CREW.',
            copy: 'Every job creates a record — zone count, head types, controller model, valve locations, photos of tricky spots. When your tech visits next spring, they see everything from last year on their phone. New hires work with full system history from day one. No more "ask Dave, he knows that property." Dave\'s knowledge is in the system now.',
            painPointRef: 'customer-history',
          },
          {
            title: 'ONE APP FROM STARTUP\nTO BLOWOUT.',
            copy: 'Startups, repairs, installs, blowouts — every job type in one schedule, one app, one crew view. Your office books the work. Your crew sees it instantly. Photos, notes, and time stamps flow back to the office without a phone call. No paper route sheets. No whiteboard in the shop. No "I thought you said 42 Oak Street, not 42 Oak Lane."',
            painPointRef: 'operational-complexity',
          },
        ],
        comparison: {
          competitors: ['Jobber', 'Service Autopilot'],
          rows: [
            {
              feature: 'Pricing',
              ops: 'Free to start, $79/mo flat',
              comp1: '$49-$199/mo, feature-gated',
              comp2: '$49-$499/mo, steep learning curve',
            },
            {
              feature: 'Route-based scheduling',
              ops: 'Visual daily routes with drag-drop',
              comp1: 'Route optimization on higher tiers',
              comp2: 'Advanced routing, complex setup',
            },
            {
              feature: 'Offline mode',
              ops: 'Full offline, syncs on reconnect',
              comp1: 'Limited offline',
              comp2: 'Requires connectivity',
            },
            {
              feature: 'Crew app simplicity',
              ops: 'Open and see your route, no training',
              comp1: 'Clean but feature-gated',
              comp2: 'Powerful but steep learning curve',
            },
            {
              feature: 'Customer history & photos',
              ops: 'Photos and notes attached to every job',
              comp1: 'Job history available',
              comp2: 'Full CRM, complex interface',
            },
            {
              feature: 'Time to start',
              ops: 'Download and go, same day',
              comp1: 'Setup + plan selection',
              comp2: 'Implementation + training required',
            },
          ],
        },
        faq: [
          {
            question: 'Can OPS handle seasonal irrigation schedules like spring startups and fall blowouts?',
            answer:
              'Yes. Build your seasonal schedule once — startups in spring, blowouts in fall — and OPS slots customers into route-optimized days. When weather or cancellations shift the plan, drag and the rest of the season adjusts.',
          },
          {
            question: 'Does OPS work for route-based irrigation service?',
            answer:
              'Yes. Your crew sees their full daily route with every stop in order. Mid-day changes — cancellations, emergency adds, no-shows — update the route on their phone instantly without calling the office.',
          },
          {
            question: 'Can my crew access customer system details in the field?',
            answer:
              'Yes. Zone counts, head types, controller models, valve locations, and photos from past visits are all attached to the customer record. Your crew sees the full history on their phone before they even pull into the driveway.',
          },
          {
            question: 'Does OPS work offline on properties with poor signal?',
            answer:
              'Yes. Irrigation work happens on large properties, rural lots, and in backyard areas where signal drops. OPS works fully offline and syncs when connectivity returns.',
          },
          {
            question: 'We are a small irrigation crew that only works 8 months a year. Is OPS worth it?',
            answer:
              'Especially then. Your revenue is compressed into a few seasonal bursts. Every missed appointment, every lost customer, every wasted drive between stops costs more when your season is short. OPS keeps your routes tight and your customer list intact between seasons.',
          },
        ],
        cta: {
          headline: 'STOP LOSING CUSTOMERS\nBETWEEN SEASONS.',
          subtext: 'Seasonal schedules. Route-based dispatch. Customer history that outlasts your crew. One app for startups, repairs, and blowouts. Free to start — no demo, no contract.',
        },
      },
    },
  },
  // ─── WATER TREATMENT ───────────────────────────────────────────
  {
    slug: 'water-treatment',
    name: 'Water Treatment',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Water Treatment Service Software for Crews | OPS',
          description:
            'OPS is built for water treatment crews running salt deliveries, filter changes, and system inspections on tight recurring schedules. Track every customer, every system, every service date. Free to start.',
          keywords: [
            'water treatment service software',
            'water softener service scheduling',
            'water treatment company management',
            'water filtration service app',
            'water treatment crew scheduling',
            'water softener delivery route software',
            'water treatment business software',
            'water purification service app',
            'water treatment dispatch software',
            'water softener company software',
          ],
        },
        hero: {
          sectionLabel: 'Water Treatment',
          headline: 'WATER TREATMENT RUNS ON\nRECURRING SERVICE.\nYOUR SOFTWARE SHOULD TOO.',
          subtext:
            'Salt deliveries every 8 weeks. Filter changes every 6 months. Annual inspections. Water quality testing on schedule. Your water treatment business is a recurring revenue machine — but only if the schedule actually runs. OPS keeps every customer cycle tracked, every route optimized, and every service record documented.',
        },
        painPoints: [
          {
            title: 'RECURRING SCHEDULES\nTOO COMPLEX FOR SPREADSHEETS.',
            bullets: [
              'Every customer has a different service interval. Salt deliveries every 6-10 weeks. Filter changes every 3-12 months. System inspections annually. Reverse osmosis membrane replacements every 2-3 years. Managing hundreds of overlapping cycles in a spreadsheet is a full-time job.',
              'Missed service dates do not just lose revenue — they damage equipment. A water softener without salt runs on hard water and builds scale. A filter past its life contaminates the water it was supposed to clean.',
              'When customer intervals shift — someone switches to a higher-capacity softener, someone downgrades their system — the spreadsheet does not auto-adjust. Someone has to remember to update it.',
              'Seasonal demand spikes create scheduling chaos. Well water customers surge in spring. Commercial accounts demand quarterly testing. Your 6-person crew is suddenly running 20 stops per day on routes that were built for 12.',
            ],
            forLine: 'For water treatment company owners and schedulers',
          },
          {
            title: 'ROUTE EFFICIENCY IS THE\nDIFFERENCE BETWEEN PROFIT AND LOSS.',
            bullets: [
              'Water treatment service is route-based. Salt delivery trucks cover 15-25 stops per day across wide territories. A poorly sequenced route wastes 2-3 hours of drive time — every day, every truck.',
              'Salt bags weigh 40-50 pounds each. Your crew is carrying 10-20 bags per stop, sometimes down basement stairs. When the route wastes time between stops, your crew wears out before the day is done.',
              'Mid-route changes — a customer not home, an emergency water quality call, a truck running low on salt — mean your crew needs to adjust on the fly. Without a digital route, they call the office, wait for instructions, and lose 15 minutes per disruption.',
              'Your most efficient route does not just save fuel. It saves your crew\'s bodies. It saves their energy. It gets more stops done before the 5 PM cutoff.',
            ],
            forLine: 'For route drivers and delivery crews',
          },
          {
            title: 'WATER QUALITY DATA\nYOU CANNOT AFFORD TO LOSE.',
            bullets: [
              'Water quality test results — TDS readings, hardness levels, iron content, pH — must be documented for every service visit. Customers expect it. Health departments may require it. Paper records get lost between the truck and the office.',
              'System specifications differ by customer. Softener size, resin type, filter model, UV sterilizer wattage, RO membrane date. Without a record attached to the customer, every service visit starts with "what system do they have?"',
              'Commercial accounts require documentation trails for health inspections, insurance, and compliance. A restaurant whose water treatment falls out of compliance faces shutdown. Your records protect them and you.',
              'When a customer disputes a service or claims their system was not maintained, your documentation is your defense. If it is in a spiral notebook in a truck that got traded in, you have no defense.',
            ],
            forLine: 'For water treatment technicians and field crews',
          },
        ],
        solutions: [
          {
            title: 'EVERY CUSTOMER CYCLE\nTRACKED AUTOMATICALLY.',
            copy: 'Set each customer\'s service intervals once — salt delivery every 8 weeks, filter change every 6 months, annual inspection — and OPS generates the jobs when they come due. No spreadsheet reviews. No mental math. No missed callbacks. Your recurring revenue stays recurring because the system never forgets.',
            painPointRef: 'recurring-schedules',
          },
          {
            title: 'ROUTES THAT RESPECT\nYOUR CREW\'S TIME AND BACKS.',
            copy: 'OPS shows your crew their daily route with every stop in sequence. 15 salt deliveries, 3 filter changes, 1 emergency water test — all in the most efficient order. Mid-route changes update on their phone instantly. No calling the office. No sitting in a driveway waiting for instructions. More stops, less windshield time, less wear on your crew.',
            painPointRef: 'route-efficiency',
          },
          {
            title: 'WATER QUALITY RECORDS\nATTACHED TO EVERY CUSTOMER.',
            copy: 'Your tech logs TDS readings, hardness levels, system specs, and photos directly in OPS — attached to the customer, searchable forever. Next visit, they see the full history before they walk in. Commercial compliance documentation lives in the system, not in a filing cabinet. When anyone asks "when was the last service?", the answer takes two taps.',
            painPointRef: 'water-quality-data',
          },
          {
            title: 'SALT DELIVERIES TO SYSTEM INSTALLS.\nONE APP.',
            copy: 'Salt routes, filter changes, new system installations, emergency water quality calls — every job type in one schedule, one app, one crew view. Your office sees the full picture. Your crew sees their day. What gets booked is what gets done, without a phone call in between.',
            painPointRef: 'operational-complexity',
          },
        ],
        comparison: {
          competitors: ['Jobber', 'ServiceTitan'],
          rows: [
            {
              feature: 'Pricing',
              ops: 'Free to start, $79/mo flat',
              comp1: '$49-$199/mo, feature-gated',
              comp2: '$298+/mo, annual contract',
            },
            {
              feature: 'Recurring job scheduling',
              ops: 'Custom intervals per customer, auto-generates',
              comp1: 'Recurring jobs on higher tiers',
              comp2: 'Recurring available, complex setup',
            },
            {
              feature: 'Route-based scheduling',
              ops: 'Visual daily routes per crew',
              comp1: 'Route optimization on higher tiers',
              comp2: 'Route optimization available',
            },
            {
              feature: 'Offline mode',
              ops: 'Full offline, syncs on reconnect',
              comp1: 'Limited offline',
              comp2: 'Limited offline',
            },
            {
              feature: 'Customer system records',
              ops: 'Photos, notes, specs per customer',
              comp1: 'Customer notes available',
              comp2: 'Full CRM, complex interface',
            },
            {
              feature: 'Time to start',
              ops: 'Download and go, same day',
              comp1: 'Setup + plan selection',
              comp2: 'Demo + implementation required',
            },
          ],
        },
        faq: [
          {
            question: 'Can OPS handle different recurring intervals per customer?',
            answer:
              'Yes. Salt delivery every 8 weeks for one customer, filter change every 6 months for another, annual inspection for a third — OPS tracks each customer\'s unique service cycle and generates jobs automatically when they come due.',
          },
          {
            question: 'Does OPS work for salt delivery routes?',
            answer:
              'Yes. Your driver sees their full route with every stop in order. Mid-route changes — cancellations, adds, customer not home — update instantly on their phone. Built for route-based service with 15-25 stops per day.',
          },
          {
            question: 'Can my techs log water quality readings in the field?',
            answer:
              'Yes. TDS readings, hardness levels, system specifications, and photos are logged directly in OPS and attached to the customer record. Full service history available on every future visit.',
          },
          {
            question: 'Does OPS work offline during basement service calls?',
            answer:
              'Yes. Water treatment work happens in basements, utility rooms, and mechanical spaces where signal dies. OPS works fully offline and syncs when your tech surfaces.',
          },
          {
            question: 'We do residential and commercial water treatment. Can OPS handle both?',
            answer:
              'Yes. Residential salt deliveries, commercial filtration maintenance, restaurant compliance testing — all job types in one app, one schedule, one crew view. No separate systems for different service types.',
          },
        ],
        cta: {
          headline: 'YOUR CUSTOMERS DEPEND ON CLEAN WATER.\nYOUR CREW DEPENDS ON A REAL SCHEDULE.',
          subtext: 'Recurring routes. Customer system records. Water quality documentation. One app for salt deliveries, filter changes, and system installs. Free to start.',
        },
      },
    },
  },

  // ─── INSULATION ───────────────────────────────────────────────
  {
    slug: 'insulation',
    name: 'Insulation',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Insulation Contractor Software for Crews | OPS',
          description:
            'OPS is built for insulation crews — spray foam, blown-in, batt, and removal. Schedule crews, document before and after, track material usage, and keep every job on record. Free to start.',
          keywords: [
            'insulation contractor software',
            'insulation company scheduling app',
            'spray foam insulation business software',
            'insulation crew management',
            'insulation job scheduling',
            'insulation business management app',
            'blown-in insulation service software',
            'insulation installer app',
            'insulation contractor crew scheduling',
            'insulation company management software',
          ],
        },
        hero: {
          sectionLabel: 'Insulation',
          headline: 'INSULATION WORK IS\nBOOMING. YOUR SCHEDULING\nSHOULD KEEP UP.',
          subtext:
            'Energy codes are tightening. Government rebates are driving demand. Homeowners are finally insulating their attics. Your phone does not stop ringing — but your crew is still running on paper job tickets and text message dispatch. OPS gives your insulation crew a real schedule, real documentation, and real job tracking.',
        },
        painPoints: [
          {
            title: 'DEMAND IS SURGING.\nYOUR SCHEDULING IS NOT.',
            bullets: [
              'New energy codes require higher R-values on every new build and major renovation. Government rebates through the Inflation Reduction Act are putting $1,600+ insulation credits in homeowners\' hands. Demand has outpaced your ability to schedule it.',
              'Your crew is booked 3-4 weeks out. Every day you cannot squeeze in an extra job is revenue left on the table. But your scheduling is a spreadsheet or a whiteboard, and fitting in one more job means calling your crew to rearrange the day.',
              'Multi-crew operations — spray foam team, blown-in team, removal team — run on separate schedules managed by separate people. Nobody has the full picture. Crews get double-booked or sit idle while the other team is overloaded.',
              'Weather and GC delays push insulation jobs constantly. The framing was not ready. The inspection got delayed. The spray foam truck cannot spray below 40 degrees. Every delay cascades into the next week.',
            ],
            forLine: 'For insulation company owners and schedulers',
          },
          {
            title: 'DOCUMENTATION THAT\nENERGY AUDITORS DEMAND.',
            bullets: [
              'Energy code compliance requires documentation — R-values achieved, material specifications, coverage area, thickness measurements, before and after photos. Paper records do not cut it when the inspector shows up.',
              'Spray foam jobs require specific documentation: foam type, lot number, thickness per cavity, ambient temperature during application, substrate temperature. Missing data means a failed inspection.',
              'Rebate programs require proof of work — photos, invoices, material specs, and contractor certifications. Your customer is counting on that documentation to get their $1,600 tax credit. Lose the paperwork, lose the customer.',
              'Before and after thermal imaging or photos are increasingly expected by customers, especially on retrofit jobs. They want to see what they paid for. Without a system that attaches photos to jobs, you are digging through phone galleries.',
            ],
            forLine: 'For insulation crews and field supervisors',
          },
          {
            title: 'MATERIAL TRACKING THAT\nLIVES IN NOBODY\'S SYSTEM.',
            bullets: [
              'Spray foam is expensive — $1.00-$2.50 per board foot. A 2,000 sq ft attic job uses $3,000-$6,000 in material. Overestimate and you waste money. Underestimate and your crew runs out mid-job.',
              'Different jobs require different materials — open cell, closed cell, blown-in fiberglass, blown-in cellulose, batt, mineral wool. Your crew needs to know what material and how much before they load the truck.',
              'Material waste on insulation jobs averages 5-15%. Without tracking usage per job, you have no idea which crews are efficient and which are burning profit.',
              'Supply chain issues in foam chemicals mean lead times vary. If your scheduler does not know what material is in stock, they book jobs they cannot fulfill.',
            ],
            forLine: 'For insulation company owners and estimators',
          },
        ],
        solutions: [
          {
            title: 'EVERY CREW. EVERY JOB TYPE.\nONE SCHEDULE.',
            copy: 'Spray foam team, blown-in team, removal team — all in one schedule your office can see at a glance. Drag, drop, reassign. When the GC pushes a job or the weather kills a spray day, update the schedule and every affected crew member sees the change on their phone. No more calling around. No more whiteboard with three different colors of marker.',
            painPointRef: 'scheduling-surge',
          },
          {
            title: 'DOCUMENTATION THAT PASSES\nINSPECTION THE FIRST TIME.',
            copy: 'Your crew captures R-values, material specs, thickness measurements, temperatures, and before/after photos directly in OPS — attached to the job, attached to the customer. When the energy auditor shows up or the customer needs rebate documentation, every detail is two taps away. Not in a filing cabinet. Not on someone\'s phone. In the system.',
            painPointRef: 'documentation',
          },
          {
            title: 'YOUR CREW SEES THE JOB\nBEFORE THEY LOAD THE TRUCK.',
            copy: 'Job details, material requirements, square footage, customer notes, access instructions — all on your crew\'s phone before they leave the shop. They know what to bring, how much, and where. No driving to a job with the wrong foam type. No calling the office from the attic asking "open cell or closed cell?" The answer is on their screen.',
            painPointRef: 'material-tracking',
          },
          {
            title: 'ONE APP FROM ESTIMATE\nTO FINAL PHOTO.',
            copy: 'Residential retrofits, new construction, commercial projects, removal jobs — every insulation job type in one app. Your office books the work. Your crew sees it instantly. Photos, notes, and completion records flow back without a phone call. Energy code compliance, rebate documentation, and customer records all in one place.',
            painPointRef: 'operational-complexity',
          },
        ],
        comparison: {
          competitors: ['Jobber', 'FieldPulse'],
          rows: [
            {
              feature: 'Pricing',
              ops: 'Free to start, $79/mo flat',
              comp1: '$49-$199/mo, feature-gated',
              comp2: 'Hidden pricing, demo required',
            },
            {
              feature: 'Multi-crew scheduling',
              ops: 'All crews in one view, drag-drop',
              comp1: 'Team scheduling on higher tiers',
              comp2: 'Crew scheduling available',
            },
            {
              feature: 'Photo documentation',
              ops: 'Before/after photos attached to jobs',
              comp1: 'Photo capture on paid plans',
              comp2: 'Photo capture available',
            },
            {
              feature: 'Offline mode',
              ops: 'Full offline, syncs on reconnect',
              comp1: 'Limited offline',
              comp2: 'Limited offline',
            },
            {
              feature: 'Crew app simplicity',
              ops: 'Open and see your jobs, no training',
              comp1: 'Clean but feature-gated',
              comp2: 'Full-featured but complex onboarding',
            },
            {
              feature: 'Time to start',
              ops: 'Download and go, same day',
              comp1: 'Setup + plan selection',
              comp2: 'Demo + onboarding required',
            },
          ],
        },
        faq: [
          {
            question: 'Can OPS handle multiple insulation crews with different specialties?',
            answer:
              'Yes. Spray foam team, blown-in team, removal team — all in one schedule. Your office sees every crew\'s workload and availability at a glance. Drag and drop to reassign when plans change.',
          },
          {
            question: 'Does OPS help with energy code documentation and rebate paperwork?',
            answer:
              'OPS stores photos, notes, material specs, and job details attached to every customer and job. When you need documentation for energy auditors, inspectors, or rebate applications, it is searchable and permanent.',
          },
          {
            question: 'Does OPS work in attics and crawlspaces with no signal?',
            answer:
              'Yes. Insulation work happens in attics, crawlspaces, and wall cavities where cell signal disappears. OPS works fully offline and syncs when your crew gets back to connectivity.',
          },
          {
            question: 'Can my crew see material requirements before loading the truck?',
            answer:
              'Yes. Job details including material type, quantity estimates, square footage, and customer notes are visible on your crew\'s phone before they leave the shop. No wrong materials. No wasted trips.',
          },
          {
            question: 'We are a small insulation crew riding the rebate boom. Is OPS right for us?',
            answer:
              'Especially now. Demand is surging and your schedule is compressed. Every missed job is lost revenue in a market that will not stay this hot forever. OPS keeps your crew moving efficiently so you capture every dollar while the demand lasts.',
          },
        ],
        cta: {
          headline: 'DEMAND IS HERE.\nDON\'T LET YOUR SCHEDULE\nBE THE BOTTLENECK.',
          subtext: 'Multi-crew scheduling. Energy code documentation. Job details your crew can see before they load the truck. Free to start — no demo, no contract.',
        },
      },
    },
  },
  // ─── FIRE PROTECTION & SPRINKLER SYSTEMS ────────────────────────
  {
    slug: 'fire-protection',
    name: 'Fire Protection & Sprinkler Systems',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Fire Protection & Sprinkler System Software for Crews | OPS',
          description:
            'OPS is built for fire protection crews running inspections, installations, and emergency service calls. Track compliance schedules, document every inspection, and dispatch crews in real time. Free to start.',
          keywords: [
            'fire protection software',
            'fire sprinkler service scheduling',
            'fire protection company management',
            'fire sprinkler inspection software',
            'fire protection crew scheduling',
            'fire alarm service software',
            'fire sprinkler contractor app',
            'fire protection inspection tracking',
            'fire sprinkler dispatch software',
            'fire protection business management',
          ],
        },
        hero: {
          sectionLabel: 'Fire Protection',
          headline: 'FIRE PROTECTION IS\nCOMPLIANCE-CRITICAL.\nYOUR RECORDS SHOULD BE TOO.',
          subtext:
            'Annual inspections. Quarterly testing. 5-year certifications. Emergency service calls that cannot wait. Fire protection is the most compliance-intensive trade in the building — and most fire protection companies track it all in spreadsheets and filing cabinets. OPS keeps every inspection documented, every schedule running, and every crew dispatched from one app.',
        },
        painPoints: [
          {
            title: 'COMPLIANCE DEADLINES\nTHAT CANNOT BE MISSED.',
            bullets: [
              'NFPA 25 requires annual inspections of sprinkler systems, quarterly inspections of fire pumps, and 5-year internal inspections of pipes. Miss one, and your customer faces fines, failed fire marshal inspections, and potential insurance voidance.',
              'Every building in your portfolio has different inspection dates, different system types, and different code requirements. Managing hundreds of overlapping compliance cycles in a spreadsheet is one forgotten cell away from a violation.',
              'When the fire marshal pulls inspection records, they expect dates, findings, deficiencies noted, corrective actions taken, and technician certification numbers. Paper records stuffed in a binder do not inspire confidence.',
              'Five-year certifications require historical documentation from every annual and quarterly inspection. If those records are scattered across filing cabinets, old laptops, and former employees\' phones, you cannot produce the trail.',
            ],
            forLine: 'For fire protection company owners and compliance managers',
          },
          {
            title: 'EMERGENCY CALLS\nON TOP OF A PACKED SCHEDULE.',
            bullets: [
              'A sprinkler head breaks at 2 AM in a hospital. A fire alarm panel faults in a high-rise at 6 PM on Friday. Fire protection emergencies are life-safety events that override every other job on the schedule.',
              'Your crews are running 4-6 inspections per day across the city. An emergency call means pulling someone off their route, dispatching them to the emergency, and rescheduling everything they were supposed to do today.',
              'Without a system that shows where every tech is and what they are doing, dispatching an emergency response takes multiple phone calls. The fire marshal does not care that your dispatcher was busy.',
              'Emergency service calls often require specific equipment — replacement heads, valve parts, panel components. Your tech needs to know what system they are walking into before they leave. That information is at the office, not on their phone.',
            ],
            forLine: 'For dispatchers and field supervisors',
          },
          {
            title: 'INSPECTION DATA TRAPPED\nIN PAPER REPORTS.',
            bullets: [
              'Every inspection generates data — system condition, deficiencies found, corrective actions recommended, test results, photos. Your techs write this on paper forms that travel back to the office days later.',
              'Deficiency tracking is where most fire protection companies fail. A deficiency noted on an inspection must be communicated to the building owner, tracked to resolution, and documented as corrected. Paper makes this impossible to track reliably.',
              'Fire protection systems in commercial buildings are complex — wet systems, dry systems, pre-action, deluge, standpipe, fire pumps, alarm panels, backflow preventers. Your tech needs the system details before they arrive, not after they open the riser room door.',
              'When a building changes ownership or management, inspection history needs to transfer cleanly. If your records are in a filing cabinet organized by the old building manager\'s last name, the new owner gets nothing.',
            ],
            forLine: 'For fire protection technicians and inspectors',
          },
        ],
        solutions: [
          {
            title: 'COMPLIANCE SCHEDULES\nTHAT NEVER SLIP.',
            copy: 'Set each building\'s inspection cycles — annual, quarterly, 5-year — and OPS generates the jobs automatically. No spreadsheet audits. No missed deadlines. No scrambling when the fire marshal calls. Every building, every system, every due date tracked in one place that your whole team can see.',
            painPointRef: 'compliance-deadlines',
          },
          {
            title: 'DISPATCH EMERGENCIES\nWITHOUT DESTROYING THE DAY.',
            copy: 'Emergency call comes in. OPS shows every tech, every current job, every location. Assign the closest qualified tech, and they see the emergency on their phone immediately — building address, system type, access details, and history. Reschedule the displaced inspections with a drag and drop. The emergency gets handled. The rest of the day survives.',
            painPointRef: 'emergency-calls',
          },
          {
            title: 'INSPECTION DATA\nCAPTURED IN THE RISER ROOM.',
            copy: 'Your tech logs findings, deficiencies, test results, and photos directly in OPS from the mechanical room floor. No paper forms. No driving back to the office. No re-entering data into a report template. The inspection record is complete before your tech walks out of the building. Deficiencies are flagged, tracked, and documented through resolution.',
            painPointRef: 'inspection-data',
          },
          {
            title: 'EVERY BUILDING. EVERY SYSTEM.\nONE RECORD.',
            copy: 'Wet systems, dry systems, fire pumps, alarm panels, backflow preventers — every system in every building documented with full inspection history, deficiency tracking, and photo records. When the building changes hands or the fire marshal wants five years of history, you pull it up in seconds. Not hours. Not "let me check the old files."',
            painPointRef: 'operational-complexity',
          },
        ],
        comparison: {
          competitors: ['ServiceTitan', 'BuildOps'],
          rows: [
            {
              feature: 'Pricing',
              ops: 'Free to start, $79/mo flat',
              comp1: '$298+/mo, annual contract',
              comp2: '$299/user/mo',
            },
            {
              feature: 'Compliance scheduling',
              ops: 'Recurring cycles per building, auto-generates',
              comp1: 'Recurring jobs available',
              comp2: 'Built for commercial service',
            },
            {
              feature: 'Offline mode',
              ops: 'Full offline, syncs on reconnect',
              comp1: 'Limited offline',
              comp2: 'Limited offline',
            },
            {
              feature: 'Photo documentation',
              ops: 'Photos attached to jobs and buildings',
              comp1: 'Photo capture available',
              comp2: 'Photo capture available',
            },
            {
              feature: 'Crew app simplicity',
              ops: 'Open and see your inspections, no training',
              comp1: 'Full-featured but complex',
              comp2: 'Commercial-focused, steep learning curve',
            },
            {
              feature: 'Time to start',
              ops: 'Download and go, same day',
              comp1: 'Demo + multi-month implementation',
              comp2: 'Demo + implementation required',
            },
          ],
        },
        faq: [
          {
            question: 'Can OPS track NFPA compliance inspection schedules?',
            answer:
              'Yes. Set annual, quarterly, and 5-year inspection cycles per building and OPS auto-generates the jobs when they come due. Every building, every system type, every due date — tracked in one place.',
          },
          {
            question: 'Does OPS work offline in mechanical rooms and riser rooms?',
            answer:
              'Yes. Fire protection work happens in basements, mechanical rooms, stairwells, and riser rooms where signal dies. OPS works fully offline — your tech captures inspection data, photos, and notes, and everything syncs when connectivity returns.',
          },
          {
            question: 'Can my techs document inspection findings in the field?',
            answer:
              'Yes. Findings, deficiencies, test results, and photos are logged directly in OPS from the job site and attached to the building record. The inspection is documented before your tech leaves the building.',
          },
          {
            question: 'Does OPS handle emergency dispatch for fire protection?',
            answer:
              'Yes. See every tech and their current jobs on one screen. Assign the closest qualified tech to the emergency and they see it immediately on their phone — building details, system type, access information, and full history.',
          },
          {
            question: 'We run a 5-person fire protection crew. Is OPS right for that size?',
            answer:
              'OPS is built for small to mid-size crews. No multi-month implementation, no per-user enterprise pricing, no training consultants. Your crew downloads the app, sees their inspections, and starts working. If ServiceTitan or BuildOps pricing made you flinch, OPS is the answer.',
          },
        ],
        cta: {
          headline: 'FIRE PROTECTION IS LIFE SAFETY.\nYOUR SCHEDULING SHOULD NOT BE GUESSWORK.',
          subtext: 'Compliance scheduling. Inspection documentation. Emergency dispatch. One app for every building, every system, every crew. Free to start — no demo, no contract.',
        },
      },
    },
  },

  // ─── DEMOLITION ───────────────────────────────────────────────
  {
    slug: 'demolition',
    name: 'Demolition',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Demolition Contractor Software for Crews | OPS',
          description:
            'OPS is built for demolition crews managing multi-phase teardowns, equipment logistics, and safety documentation. Schedule crews, track permits, and keep every job documented. Free to start.',
          keywords: [
            'demolition contractor software',
            'demolition company scheduling',
            'demolition crew management app',
            'demolition business software',
            'demolition project scheduling',
            'demolition dispatch software',
            'demolition crew scheduling app',
            'demolition company management',
            'demo contractor scheduling',
            'demolition field service software',
          ],
        },
        hero: {
          sectionLabel: 'Demolition',
          headline: 'DEMOLITION IS CONTROLLED\nCHAOS. YOUR SCHEDULE\nSHOULD BE JUST CONTROLLED.',
          subtext:
            'Multi-phase teardowns. Equipment coordination. Permit timelines. Hazmat documentation. Demolition jobs have more moving parts than most trades — and most demo contractors manage them with phone calls and yellow legal pads. OPS gives your crew a system that handles the complexity so they can focus on the work.',
        },
        painPoints: [
          {
            title: 'MULTI-PHASE JOBS WITH\nZERO MARGIN FOR SEQUENCE ERRORS.',
            bullets: [
              'Demolition is not "show up and swing a hammer." It is a sequence — utility disconnect, hazmat abatement, selective interior demo, structural demo, debris removal, site grading. Skip a step or do them out of order and you have a safety incident or a permit violation.',
              'Each phase requires different crews, different equipment, and different timelines. Your framing crew cannot start until structural demo is complete. Debris hauling cannot start until the dumpsters arrive. One delay cascades through every phase.',
              'Most demo contractors track phase sequencing in their heads or on a whiteboard. When the owner is not on site, nobody knows which phase is next, what is blocking it, or who is supposed to be where.',
              'Subcontractors — asbestos abatement, environmental testing, utility companies — each have their own timelines that your schedule must accommodate. Coordinating them via text messages is a full-time job.',
            ],
            forLine: 'For demolition company owners and project managers',
          },
          {
            title: 'EQUIPMENT IN THE WRONG PLACE\nAT THE WRONG TIME.',
            bullets: [
              'Excavators, skid steers, dumpsters, concrete crushers — your equipment moves between job sites constantly. An excavator scheduled for Site A on Monday but still stuck at Site B on Friday means your Monday crew is standing around.',
              'Equipment rental costs $500-$2,000+ per day. Every day a rented excavator sits unused because the schedule slipped is money burning. Every day your crew cannot work because the equipment has not arrived is a day of labor wasted.',
              'Dumpster logistics alone can derail a job. Full dumpsters need to be swapped. New dumpsters need to be scheduled. Hauling companies have their own timelines. If nobody is tracking dumpster status, your debris pile grows and your site becomes unsafe.',
              'Without a system that tracks what equipment is where, your dispatcher relies on phone calls and memory. "I thought the mini-ex was at the Oak Street job" is not a scheduling system.',
            ],
            forLine: 'For dispatchers and equipment managers',
          },
          {
            title: 'SAFETY DOCUMENTATION\nTHAT PROTECTS YOUR LICENSE.',
            bullets: [
              'Demo permits require documentation — structural assessments, utility disconnect confirmations, hazmat clearances, neighbor notifications. Miss one and the permit gets pulled. Your crew stands idle.',
              'OSHA compliance on demo sites is not optional. Fall protection plans, dust mitigation, noise monitoring, PPE logs — all require documentation that paper forms handle poorly.',
              'Before and after photos are essential for demo work — proof that the scope was followed, that protected structures were not damaged, that the site was left as specified. Photos on personal phones disappear when the crew member leaves.',
              'Environmental documentation — lead paint testing, asbestos surveys, soil contamination reports — must be preserved for years after the job. A box of paper in the back of the office is not a reliable archive.',
            ],
            forLine: 'For demolition crews and safety officers',
          },
        ],
        solutions: [
          {
            title: 'PHASE-BY-PHASE SCHEDULING\nYOUR WHOLE CREW CAN SEE.',
            copy: 'Map out every phase of the teardown — utility disconnect, abatement, selective demo, structural demo, debris removal, grading — with crews and dates assigned to each. Every team member sees the full sequence on their phone. When one phase runs long, adjust the timeline and every downstream phase updates automatically. No more "I thought we were starting structural today."',
            painPointRef: 'multi-phase-jobs',
          },
          {
            title: 'KNOW WHERE YOUR\nEQUIPMENT IS. ALWAYS.',
            copy: 'Track every piece of equipment by job site. Excavator at Oak Street until Wednesday. Dumpster swap needed at Elm Thursday. Concrete crusher moving to Pine on Friday. Your dispatcher sees the full picture. Your crew knows what is on site and what is coming. No more rental days burned because someone forgot to schedule the move.',
            painPointRef: 'equipment-logistics',
          },
          {
            title: 'SAFETY RECORDS THAT\nSURVIVE THE JOB SITE.',
            copy: 'Your crew captures permit documents, safety inspection photos, hazmat clearances, and site condition records directly in OPS — attached to the job, searchable forever. When OSHA shows up or the permit office asks for documentation, every record is two taps away. Not in a filing cabinet. Not in an email thread. In the system.',
            painPointRef: 'safety-documentation',
          },
          {
            title: 'ONE APP FROM PERMIT\nTO FINAL GRADING.',
            copy: 'Selective interior demo, full structural teardown, site clearing, debris hauling — every phase, every crew, every piece of equipment in one schedule. Your office sees the project timeline. Your crew sees their day. What gets assigned is what gets done. No radio dispatch. No guessing.',
            painPointRef: 'operational-complexity',
          },
        ],
        comparison: {
          competitors: ['Procore', 'Jobber'],
          rows: [
            {
              feature: 'Pricing',
              ops: 'Free to start, $79/mo flat',
              comp1: 'Custom pricing, $$$',
              comp2: '$49-$199/mo, feature-gated',
            },
            {
              feature: 'Multi-phase scheduling',
              ops: 'Phase sequencing with crew assignments',
              comp1: 'Full project management, complex',
              comp2: 'Basic job scheduling',
            },
            {
              feature: 'Offline mode',
              ops: 'Full offline, syncs on reconnect',
              comp1: 'Requires connectivity',
              comp2: 'Limited offline',
            },
            {
              feature: 'Photo documentation',
              ops: 'Photos attached to jobs and phases',
              comp1: 'Photo management available',
              comp2: 'Photo capture on paid plans',
            },
            {
              feature: 'Crew app simplicity',
              ops: 'Open and see your day, no training',
              comp1: 'Enterprise complexity, training required',
              comp2: 'Clean but not demo-specific',
            },
            {
              feature: 'Time to start',
              ops: 'Download and go, same day',
              comp1: 'Multi-month implementation',
              comp2: 'Setup + plan selection',
            },
          ],
        },
        faq: [
          {
            question: 'Can OPS handle multi-phase demolition projects?',
            answer:
              'Yes. Map out every phase — utility disconnect, abatement, selective demo, structural demo, debris removal, grading — with crews and timelines assigned to each. When one phase shifts, downstream phases adjust.',
          },
          {
            question: 'Does OPS track equipment across multiple job sites?',
            answer:
              'Yes. Track what equipment is at which site and when it needs to move. Your dispatcher sees the full picture across all active jobs. No more lost rental days or crews standing idle waiting for equipment.',
          },
          {
            question: 'Does OPS work offline on active demo sites?',
            answer:
              'Yes. Demo sites often have no connectivity — especially during utility disconnect phases or in areas with damaged infrastructure. OPS works fully offline and syncs when signal returns.',
          },
          {
            question: 'Can my crew capture safety documentation in the field?',
            answer:
              'Yes. Permit records, safety photos, site condition documentation, and hazmat clearances are captured in OPS and attached to the job. Searchable and permanent for OSHA compliance and permit audits.',
          },
          {
            question: 'Is OPS overkill for a small demo crew?',
            answer:
              'The opposite. Procore is overkill for a small demo crew — enterprise pricing, months of implementation, features you will never use. OPS is the scheduling and documentation tool that fits between "yellow legal pad" and "enterprise project management." Download it today and start scheduling jobs.',
          },
        ],
        cta: {
          headline: 'DEMOLITION IS COMPLEX ENOUGH.\nYOUR SCHEDULING SHOULD NOT ADD TO IT.',
          subtext: 'Multi-phase scheduling. Equipment tracking. Safety documentation. One app for every crew on every job site. Free to start — no demo, no contract.',
        },
      },
    },
  },
  // ─── RESTORATION & WATER DAMAGE ─────────────────────────────────
  {
    slug: 'restoration',
    name: 'Restoration & Water Damage',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Restoration & Water Damage Software for Crews | OPS',
          description:
            'OPS is built for restoration crews running emergency water damage, fire damage, and storm response. Dispatch crews fast, document everything for insurance, and manage multi-day drying jobs. Free to start.',
          keywords: [
            'restoration company software',
            'water damage restoration software',
            'restoration crew management',
            'water damage dispatch software',
            'restoration business management',
            'fire damage restoration software',
            'storm damage restoration app',
            'restoration scheduling software',
            'water mitigation crew app',
            'restoration field service software',
          ],
        },
        hero: {
          sectionLabel: 'Restoration & Water Damage',
          headline: 'WATER DOES NOT WAIT.\nYOUR DISPATCH SHOULD NOT EITHER.',
          subtext:
            'A burst pipe at midnight. Storm damage across three zip codes. A fire-damaged kitchen that needs mitigation before the insurance adjuster arrives tomorrow. Restoration is the most time-sensitive trade in the building — and most restoration companies dispatch by calling drivers one by one. OPS puts every crew, every job, and every piece of documentation in one app that works when the power is out.',
        },
        painPoints: [
          {
            title: 'EMERGENCY DISPATCH\nTHAT RUNS ON PHONE CALLS.',
            bullets: [
              'Restoration is a 24/7 emergency business. Water damage, fire damage, storm response — calls come in at 2 AM, 6 PM on Saturday, holidays. Your dispatch process is calling techs one by one until someone picks up.',
              'When a storm hits, you get 20 calls in two hours. Every call is urgent. Every customer is watching water spread across their floor. Your ability to triage, dispatch, and respond determines whether you win or lose those jobs.',
              'You have no idea which crews are available, which ones are already on a multi-day drying job, or which one is closest to the new emergency. You are dispatching by memory and gut feeling.',
              'First responder advantage is everything in restoration. The company that arrives first usually gets the job. A 30-minute faster response can be the difference between a $15,000 job and losing it to the competitor who answered their phone.',
            ],
            forLine: 'For restoration company owners and dispatchers',
          },
          {
            title: 'INSURANCE DOCUMENTATION\nTHAT MAKES OR BREAKS PAYMENT.',
            bullets: [
              'Insurance adjusters demand detailed documentation — moisture readings, affected area measurements, equipment placement records, drying logs, progress photos from every visit. Miss any of it and your claim gets reduced or denied.',
              'Moisture mapping requires readings at specific locations documented with photos and timestamps. Your techs take these readings but log them on paper forms that arrive at the office days later — if they arrive at all.',
              'Multi-day drying jobs require daily monitoring logs — temperature, humidity, moisture readings, equipment status. This documentation must be tied to the original loss date and scope. Paper logs from a 5-day dry-out are a stack of forms nobody can decode.',
              'When the adjuster disputes your scope, your documentation is your only defense. If it is on a water-damaged clipboard in a tech\'s truck, you have no defense.',
            ],
            forLine: 'For restoration project managers and estimators',
          },
          {
            title: 'MULTI-DAY JOBS\nNOBODY IS TRACKING.',
            bullets: [
              'A water damage job is not a one-visit fix. It is extraction day one, equipment setup day one, monitoring days two through five, equipment pickup day six, and reconstruction scheduling after that. Most restoration companies track this in their heads.',
              'Equipment — dehumidifiers, air movers, air scrubbers — is scattered across active job sites. You need to know what is where, what needs pickup, and what is available for the next emergency. That information is in nobody\'s system.',
              'Crew scheduling across multi-day jobs means your morning monitoring route needs to fit around new emergencies, equipment pickups, and reconstruction work. Without a visual schedule, someone gets forgotten.',
              'Reconstruction after mitigation is a separate phase that often gets lost in the handoff. The dry-out is done but nobody scheduled the rebuild. The customer waits. The insurance company gets impatient.',
            ],
            forLine: 'For restoration technicians and field crews',
          },
        ],
        solutions: [
          {
            title: 'DISPATCH IN SECONDS.\nNOT PHONE CALLS.',
            copy: 'Emergency call comes in. OPS shows every crew, every active job, every location. Tap the closest available tech and they see the emergency on their phone instantly — address, loss type, access instructions, customer contact. No calling around. No guessing availability. Your crew rolls in minutes. In restoration, minutes are money.',
            painPointRef: 'emergency-dispatch',
          },
          {
            title: 'DOCUMENTATION THAT\nGETS YOU PAID.',
            copy: 'Your tech captures moisture readings, affected area photos, equipment placement records, and drying logs directly in OPS — attached to the job, timestamped, organized by visit. When the adjuster wants documentation, every reading, every photo, every log is in one place. Not on a clipboard. Not in a phone gallery. In a record the adjuster can actually review.',
            painPointRef: 'insurance-documentation',
          },
          {
            title: 'EVERY ACTIVE JOB.\nEVERY PIECE OF EQUIPMENT.\nONE VIEW.',
            copy: 'Track every multi-day job — which day of the dry-out, when monitoring is due, when equipment needs pickup. Track every piece of equipment — which dehumidifiers are at which site, which air movers are available. Your dispatcher sees the full picture. Your crew sees their route for the day. No more "I thought someone was checking on the Elm Street job today."',
            painPointRef: 'multi-day-tracking',
          },
          {
            title: 'FROM EMERGENCY CALL\nTO RECONSTRUCTION.',
            copy: 'Water extraction, equipment setup, daily monitoring, dry-out verification, equipment pickup, reconstruction scheduling — the full restoration lifecycle in one app. Every phase documented. Every handoff tracked. Your crew knows what phase every job is in without calling the office. The customer gets updates. The insurance company gets documentation. You get paid.',
            painPointRef: 'operational-complexity',
          },
        ],
        comparison: {
          competitors: ['DASH (by Next Gear)', 'Jobber'],
          rows: [
            {
              feature: 'Pricing',
              ops: 'Free to start, $79/mo flat',
              comp1: 'Custom pricing, enterprise-level',
              comp2: '$49-$199/mo, feature-gated',
            },
            {
              feature: 'Emergency dispatch',
              ops: 'Real-time crew view, instant assignment',
              comp1: 'Dispatch available, complex setup',
              comp2: 'Basic scheduling, not emergency-focused',
            },
            {
              feature: 'Photo documentation',
              ops: 'Timestamped photos attached to jobs',
              comp1: 'Photo management with Xactimate integration',
              comp2: 'Photo capture on paid plans',
            },
            {
              feature: 'Offline mode',
              ops: 'Full offline, syncs on reconnect',
              comp1: 'Requires connectivity',
              comp2: 'Limited offline',
            },
            {
              feature: 'Crew app simplicity',
              ops: 'Open and see your jobs, no training',
              comp1: 'Restoration-specific but complex',
              comp2: 'Clean but not restoration-specific',
            },
            {
              feature: 'Time to start',
              ops: 'Download and go, same day',
              comp1: 'Implementation + training required',
              comp2: 'Setup + plan selection',
            },
          ],
        },
        faq: [
          {
            question: 'Can OPS handle 24/7 emergency restoration dispatch?',
            answer:
              'Yes. See every crew and their current jobs on one screen. Assign the closest available tech to an emergency and they see it on their phone instantly — address, loss type, and customer contact. Dispatch in seconds, not phone calls.',
          },
          {
            question: 'Does OPS help with insurance documentation?',
            answer:
              'Yes. Moisture readings, photos, equipment logs, and drying records are captured in OPS and attached to the job with timestamps. When the adjuster needs documentation, every record is organized and accessible.',
          },
          {
            question: 'Can I track equipment across multiple active job sites?',
            answer:
              'Yes. Track what equipment is at which site, when monitoring is due, and when equipment needs pickup. Your dispatcher sees the full picture across all active restoration jobs.',
          },
          {
            question: 'Does OPS work when the power is out at a job site?',
            answer:
              'Yes. Restoration work often happens in damaged buildings with no power or connectivity. OPS works fully offline on your crew\'s phones and syncs when they get back to signal.',
          },
          {
            question: 'We are a small restoration crew, not a franchise. Is OPS right for us?',
            answer:
              'Especially. Enterprise restoration software like DASH is built for franchise operations with dedicated admin staff. OPS is built for the 3-8 person crew where the owner is also the dispatcher, the estimator, and sometimes the tech pulling water out of a basement at midnight.',
          },
        ],
        cta: {
          headline: 'WATER DOES NOT WAIT.\nNEITHER SHOULD YOUR CREW.',
          subtext: 'Emergency dispatch. Insurance documentation. Multi-day job tracking. One app for every emergency, every dry-out, every crew. Free to start — no demo, no contract.',
        },
      },
    },
  },

  // ─── MOLD REMEDIATION ─────────────────────────────────────────
  {
    slug: 'mold-remediation',
    name: 'Mold Remediation',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Mold Remediation Software for Crews | OPS',
          description:
            'OPS is built for mold remediation crews managing containment, removal, and clearance testing. Document every step, schedule crews, and maintain the chain of documentation that protects your license. Free to start.',
          keywords: [
            'mold remediation software',
            'mold removal company scheduling',
            'mold remediation crew management',
            'mold remediation business software',
            'mold remediation scheduling app',
            'mold removal dispatch software',
            'mold remediation documentation',
            'mold inspection software',
            'mold remediation project management',
            'mold remediation field service app',
          ],
        },
        hero: {
          sectionLabel: 'Mold Remediation',
          headline: 'MOLD REMEDIATION IS\nDOCUMENTATION-CRITICAL.\nEVERY STEP ON RECORD.',
          subtext:
            'Containment setup. Air sampling. Removal. Post-remediation verification. Every phase of mold work requires documentation that can withstand legal scrutiny, insurance review, and health department inspection. OPS keeps every photo, every reading, every protocol step attached to the job — captured in the field, stored permanently.',
        },
        painPoints: [
          {
            title: 'DOCUMENTATION GAPS\nTHAT KILL YOUR CREDIBILITY.',
            bullets: [
              'Mold remediation follows strict protocols — IICRC S520, EPA guidelines, state-specific licensing requirements. Every step must be documented: assessment findings, containment verification, removal methods, air sampling results, clearance testing. Miss one and your work is legally questionable.',
              'Before, during, and after photos are not optional in mold work — they are the evidence chain that proves you did what you said you did. Photos on personal phones that never get organized are photos that do not exist when you need them.',
              'Air sampling results and moisture readings must be tied to specific locations, specific dates, and specific conditions. Paper logs with "kitchen wall — dry" do not hold up when a lawyer asks for specifics.',
              'Post-remediation verification requires proof that containment was maintained, that removal was complete, and that air quality returned to acceptable levels. Without organized documentation, clearance testing becomes your word against the lab results.',
            ],
            forLine: 'For mold remediation company owners and project managers',
          },
          {
            title: 'MULTI-PHASE JOBS\nWITH NO ROOM FOR ERROR.',
            bullets: [
              'Mold remediation is a sequence: assessment, containment, air filtration, removal, disposal, cleaning, drying, post-testing, clearance. Each phase depends on the previous one. You cannot start removal before containment is verified. You cannot test for clearance before the area is dry.',
              'Different phases require different crews and different timelines. Your containment team finishes Tuesday. Your removal crew starts Wednesday. Your testing company comes Friday. If any phase slips, the whole project cascades.',
              'Insurance approval often gates the next phase. The adjuster needs photos from assessment before approving removal. The removal must be documented before reconstruction is approved. Paper-based communication with adjusters adds days to every phase.',
              'When jobs overlap — and in mold season they always overlap — your dispatcher is managing 4-6 active remediation projects at different phases simultaneously. Without a system showing which job is in which phase, something gets missed.',
            ],
            forLine: 'For remediation crew leaders and dispatchers',
          },
          {
            title: 'CONTAINMENT ZONES WHERE\nNOTHING DIGITAL SURVIVES.',
            bullets: [
              'Mold remediation happens inside sealed containment areas — negative air pressure, polyethylene barriers, HEPA filtration. Your tech inside the containment cannot easily communicate with the crew outside. Signal quality is already poor in basements and crawlspaces; add containment barriers and it drops to zero.',
              'Your tech needs job details, protocols, material specifications, and photo documentation requirements while inside the containment zone. If that information is in an email at the office, they do not have it when they need it.',
              'PPE requirements in mold work — full Tyvek suits, respirators, gloves — make using a phone difficult. Touch targets need to be large enough to tap with gloved hands. Small buttons and complex menus are not usable in a respirator.',
              'When your tech finishes a phase inside containment, the documentation needs to be captured before they strip off PPE and forget details. If the system does not work offline, the documentation window closes.',
            ],
            forLine: 'For mold remediation technicians and field crews',
          },
        ],
        solutions: [
          {
            title: 'EVERY PHOTO. EVERY READING.\nEVERY STEP. ON RECORD.',
            copy: 'Your tech captures assessment photos, containment verification, removal progress, moisture readings, and air sampling locations directly in OPS — timestamped and attached to the job. When the insurance adjuster, the health department, or a lawyer asks for documentation, every record is organized by phase, by date, by location. Not in a phone gallery. Not on paper. In a system built for the field.',
            painPointRef: 'documentation-gaps',
          },
          {
            title: 'PHASE-BY-PHASE TRACKING\nACROSS EVERY ACTIVE JOB.',
            copy: 'Assessment, containment, removal, drying, clearance — OPS tracks which phase every job is in and which crew is assigned to each. When one phase completes, the next crew sees their assignment on their phone. When insurance approval gates the next phase, the hold is visible to everyone. No more "I thought the containment was done" confusion.',
            painPointRef: 'multi-phase-jobs',
          },
          {
            title: 'WORKS INSIDE THE\nCONTAINMENT ZONE.',
            copy: 'OPS works fully offline — inside sealed containment areas, in basements, in crawlspaces, anywhere signal dies. 56dp touch targets for gloved hands. Dark theme readable behind a respirator visor. Your tech captures documentation inside the containment and it syncs when they step out. No lost data. No "I\'ll log it later" that never happens.',
            painPointRef: 'containment-zones',
          },
          {
            title: 'FROM ASSESSMENT\nTO CLEARANCE. ONE APP.',
            copy: 'Initial assessment, insurance communication, containment, removal, post-testing, clearance — the full mold remediation lifecycle tracked in one app. Every phase documented. Every handoff visible. Your office, your crew, and your testing partners all work from the same record. The job is not done until clearance passes — and OPS tracks every step to get there.',
            painPointRef: 'operational-complexity',
          },
        ],
        comparison: {
          competitors: ['DASH (by Next Gear)', 'Encircle'],
          rows: [
            {
              feature: 'Pricing',
              ops: 'Free to start, $79/mo flat',
              comp1: 'Custom pricing, enterprise-level',
              comp2: 'Custom pricing per user',
            },
            {
              feature: 'Field documentation',
              ops: 'Photos, notes, readings attached to jobs',
              comp1: 'Documentation with Xactimate integration',
              comp2: 'Field documentation specialist',
            },
            {
              feature: 'Offline mode',
              ops: 'Full offline — works inside containment',
              comp1: 'Requires connectivity',
              comp2: 'Limited offline capability',
            },
            {
              feature: 'Multi-phase tracking',
              ops: 'Phase sequencing with crew assignments',
              comp1: 'Project workflow management',
              comp2: 'Documentation-focused, not scheduling',
            },
            {
              feature: 'Crew app simplicity',
              ops: 'Glove-ready, dark theme, no training',
              comp1: 'Restoration-specific but complex',
              comp2: 'Documentation-focused interface',
            },
            {
              feature: 'Time to start',
              ops: 'Download and go, same day',
              comp1: 'Implementation + training required',
              comp2: 'Onboarding + setup required',
            },
          ],
        },
        faq: [
          {
            question: 'Can OPS handle the documentation requirements for mold remediation?',
            answer:
              'Yes. Photos, moisture readings, air sampling locations, containment verification, and removal progress are captured in OPS and attached to the job with timestamps. Every phase documented, organized, and searchable for insurance adjusters, health departments, and legal review.',
          },
          {
            question: 'Does OPS work inside sealed containment areas?',
            answer:
              'Yes. OPS works fully offline with 56dp touch targets built for gloved hands and a dark theme readable behind a respirator visor. Your tech captures everything inside containment and it syncs when they step outside the barrier.',
          },
          {
            question: 'Can I track multiple remediation jobs at different phases?',
            answer:
              'Yes. See every active job, which phase it is in, which crew is assigned, and what is blocking the next phase — all in one view. When you are managing 4-6 simultaneous remediations, nothing gets missed.',
          },
          {
            question: 'Does OPS integrate with insurance workflows?',
            answer:
              'OPS organizes documentation by phase and date in a format adjusters can review. Photos, readings, and progress records are always accessible when the adjuster needs to approve the next phase or verify completed work.',
          },
          {
            question: 'We are a small mold remediation crew. Is OPS too complex?',
            answer:
              'OPS is simpler than the enterprise restoration platforms — no multi-month implementation, no per-user pricing that punishes growth. Your crew downloads the app, sees their jobs, and starts documenting. If you are currently using paper forms and your phone\'s photo gallery, OPS is the immediate upgrade.',
          },
        ],
        cta: {
          headline: 'MOLD WORK DEMANDS PROOF.\nOPS MAKES SURE YOU HAVE IT.',
          subtext: 'Phase-by-phase documentation. Offline in containment. Glove-ready touch targets. One app for assessment, removal, and clearance. Free to start — no demo, no contract.',
        },
      },
    },
  },
  // ─── WATERPROOFING & FOUNDATION REPAIR ──────────────────────────
  {
    slug: 'waterproofing',
    name: 'Waterproofing & Foundation Repair',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Waterproofing & Foundation Repair Software for Crews | OPS',
          description:
            'OPS is built for waterproofing and foundation repair crews managing high-ticket jobs, multi-day projects, and before/after documentation. Schedule crews, track progress, and keep every job on record. Free to start.',
          keywords: [
            'waterproofing contractor software',
            'foundation repair scheduling app',
            'waterproofing company management',
            'basement waterproofing software',
            'foundation repair crew management',
            'waterproofing business software',
            'foundation contractor scheduling',
            'waterproofing crew scheduling app',
            'foundation repair dispatch software',
            'waterproofing project management',
          ],
        },
        hero: {
          sectionLabel: 'Waterproofing & Foundation Repair',
          headline: 'HIGH-TICKET JOBS\nDESERVE MORE THAN A\nLEGAL PAD AND A HANDSHAKE.',
          subtext:
            'Foundation repair jobs run $5,000-$30,000+. Waterproofing projects span multiple days with multiple crews. One miscommunication — wrong pier count, missed drain tile section, incomplete membrane coverage — costs thousands to fix. OPS keeps every detail documented, every crew informed, and every phase tracked from excavation to backfill.',
        },
        painPoints: [
          {
            title: 'HIGH-TICKET JOBS WITH\nZERO DOCUMENTATION TRAIL.',
            bullets: [
              'A $15,000 foundation repair job deserves more than a verbal scope description and a handwritten invoice. But most waterproofing companies document jobs the same way they document a $200 service call — barely.',
              'Before and after photos are essential when the homeowner\'s biggest investment is at stake. Foundation cracks documented, pier placement photographed, membrane coverage captured. Without a system, these photos live on personal phones and vanish when the tech leaves.',
              'Customer disputes on high-ticket jobs are expensive. When the homeowner claims the crack was not addressed or the drain tile was not installed where agreed, your documentation is your only defense. If it is on a clipboard that got wet in the trench, you have no defense.',
              'Warranty tracking on foundation repair is critical — lifetime transferable warranties are a selling point. But if you cannot pull up the original job record when the warranty claim comes in 8 years later, the warranty is worthless.',
            ],
            forLine: 'For waterproofing company owners and estimators',
          },
          {
            title: 'MULTI-DAY PROJECTS WITH\nMULTIPLE CREWS.',
            bullets: [
              'A full basement waterproofing is not a one-day job. Day one: excavation. Day two: membrane application. Day three: drain tile installation. Day four: backfill and grading. Each day requires different crews and different equipment.',
              'Foundation pier installation requires precise sequencing — soil testing, pier placement, hydraulic driving, load testing, final adjustment. If your crew shows up without the soil report results or the engineered pier plan, the day is wasted.',
              'Weather affects waterproofing work directly. You cannot apply membrane in rain. You cannot excavate in frozen ground. A weather delay on day two cascades into every subsequent day. Without a digital schedule, rescheduling is a phone tree.',
              'Equipment logistics — excavators, hydraulic presses, concrete pumps — must align with crew schedules. Equipment arriving a day early sits idle. Equipment arriving a day late means a crew with nothing to do.',
            ],
            forLine: 'For project managers and crew supervisors',
          },
          {
            title: 'UNDERGROUND WORK WHERE\nSIGNAL DOES NOT REACH.',
            bullets: [
              'Waterproofing work happens below grade — in excavated trenches, basement interiors, crawlspaces, and foundation pits. Cell signal in these environments ranges from poor to nonexistent.',
              'Your crew needs access to job details, customer notes, engineered specs, and photo requirements while standing in a trench 6 feet below grade. If the app requires connectivity, they have nothing.',
              'Gloves are mandatory in foundation work — concrete contact, waterproofing chemicals, soil handling. Small touch targets and complicated menus are not usable in PPE.',
              'Documentation captured below grade must survive the trip back to the surface. If the app crashes without signal or the photos do not save, the documentation window is gone — you are not excavating again just to take a photo.',
            ],
            forLine: 'For waterproofing technicians and field crews',
          },
        ],
        solutions: [
          {
            title: 'EVERY HIGH-TICKET JOB\nDOCUMENTED FROM TRENCH TO BACKFILL.',
            copy: 'Foundation cracks measured and photographed. Pier placements documented. Membrane coverage captured before backfill buries it forever. OPS stores every photo, every note, every measurement attached to the job and the customer — searchable years later for warranty claims, customer inquiries, or dispute resolution. Your $15,000 job gets $15,000 worth of documentation.',
            painPointRef: 'documentation-trail',
          },
          {
            title: 'MULTI-DAY PHASES.\nMULTIPLE CREWS.\nONE SCHEDULE.',
            copy: 'Excavation Monday. Membrane Tuesday. Drain tile Wednesday. Backfill Thursday. Each phase with the right crew, the right equipment, and the right specs on their phone. When weather pushes day two, the rest of the week adjusts. Your office sees the full project timeline. Your crew sees their day. No phone trees. No guessing.',
            painPointRef: 'multi-day-projects',
          },
          {
            title: 'WORKS IN THE TRENCH.\nSYNCS AT THE SURFACE.',
            copy: 'OPS works fully offline — in excavated trenches, basement interiors, crawlspaces, below-grade pits. 56dp touch targets for gloved hands. Dark theme readable in low-light basement conditions. Your crew captures photos and job data below grade, and everything syncs when they climb out. No lost data. No second trips.',
            painPointRef: 'underground-work',
          },
          {
            title: 'FROM INSPECTION\nTO WARRANTY. ONE APP.',
            copy: 'Initial inspection, scope documentation, multi-day execution, final photos, warranty registration — the full waterproofing lifecycle in one system. When the homeowner calls 8 years later about their transferable warranty, you pull up the original job in seconds. That is professionalism that wins referrals.',
            painPointRef: 'operational-complexity',
          },
        ],
        comparison: {
          competitors: ['Jobber', 'FieldPulse'],
          rows: [
            {
              feature: 'Pricing',
              ops: 'Free to start, $79/mo flat',
              comp1: '$49-$199/mo, feature-gated',
              comp2: 'Hidden pricing, demo required',
            },
            {
              feature: 'Multi-day project scheduling',
              ops: 'Phase sequencing with crew assignments',
              comp1: 'Basic multi-day scheduling',
              comp2: 'Project scheduling available',
            },
            {
              feature: 'Offline mode',
              ops: 'Full offline — works in trenches and basements',
              comp1: 'Limited offline',
              comp2: 'Limited offline',
            },
            {
              feature: 'Photo documentation',
              ops: 'Photos attached to jobs, timestamped',
              comp1: 'Photo capture on paid plans',
              comp2: 'Photo capture available',
            },
            {
              feature: 'Crew app simplicity',
              ops: 'Glove-ready, dark theme, no training',
              comp1: 'Clean but feature-gated',
              comp2: 'Full-featured but complex setup',
            },
            {
              feature: 'Time to start',
              ops: 'Download and go, same day',
              comp1: 'Setup + plan selection',
              comp2: 'Demo + onboarding required',
            },
          ],
        },
        faq: [
          {
            question: 'Can OPS handle multi-day waterproofing projects?',
            answer:
              'Yes. Map out every phase — excavation, membrane, drain tile, backfill — with crews and dates assigned. When weather or delays shift one phase, downstream phases adjust. Your crew sees their specific day and scope on their phone.',
          },
          {
            question: 'Does OPS work in trenches and below-grade environments?',
            answer:
              'Yes. OPS works fully offline with glove-ready touch targets and a dark theme for low-light basements. Your crew captures documentation below grade and it syncs when they surface.',
          },
          {
            question: 'Can I use OPS for warranty tracking?',
            answer:
              'Every job creates a permanent record — photos, notes, scope details, completion dates. When a warranty claim comes in years later, you pull up the original job in seconds.',
          },
          {
            question: 'Does OPS work for both waterproofing and foundation repair?',
            answer:
              'Yes. Basement waterproofing, foundation pier installation, crawlspace encapsulation, exterior drainage — all job types in one schedule, one app, one crew view.',
          },
          {
            question: 'We are a small waterproofing crew. Is OPS worth it for high-ticket jobs?',
            answer:
              'Especially for high-ticket jobs. A $15,000 foundation repair deserves proper documentation, professional scheduling, and a warranty record that survives for years. OPS provides all of that for $79/month — less than the cost of one missed detail on one job.',
          },
        ],
        cta: {
          headline: 'YOUR HIGH-TICKET WORK\nDESERVES HIGH-STANDARD DOCUMENTATION.',
          subtext: 'Multi-day scheduling. Below-grade offline mode. Warranty-grade documentation. One app from inspection to backfill. Free to start — no demo, no contract.',
        },
      },
    },
  },

  // ─── SIDING & EXTERIOR ────────────────────────────────────────
  {
    slug: 'siding',
    name: 'Siding & Exterior',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Siding & Exterior Contractor Software for Crews | OPS',
          description:
            'OPS is built for siding and exterior crews managing installations, storm damage repairs, and multi-day projects. Schedule crews, document work, and keep every job tracked. Free to start.',
          keywords: [
            'siding contractor software',
            'siding company scheduling app',
            'exterior contractor management',
            'siding installation scheduling',
            'siding crew management app',
            'siding business software',
            'exterior renovation scheduling',
            'siding contractor crew scheduling',
            'siding company management software',
            'siding installation dispatch',
          ],
        },
        hero: {
          sectionLabel: 'Siding & Exterior',
          headline: 'SIDING CREWS WORK\nOUTSIDE ALL DAY.\nYOUR SOFTWARE SHOULD TOO.',
          subtext:
            'Multi-day installations. Storm damage surges. Material deliveries that have to match the schedule. Siding and exterior work is weather-dependent, material-dependent, and crew-dependent — and most siding contractors run it all on phone calls and a whiteboard. OPS keeps your crew, your materials, and your schedule in sync.',
        },
        painPoints: [
          {
            title: 'WEATHER CONTROLS YOUR\nSCHEDULE. NOT THE OTHER WAY AROUND.',
            bullets: [
              'You cannot install siding in rain, high winds, or extreme cold. A weather day does not just cancel today — it cascades into every job this week. Rescheduling five homeowners by text message is a half-day of work.',
              'Storm seasons bring a surge of damage repair calls that overwhelm your normal schedule. Hail damage, wind damage, insurance work — all at once, all urgent. Your 3-week backlog becomes a 3-month backlog overnight.',
              'Homeowners expect firm dates. When weather pushes their project for the third time, their patience runs out. Without a system that updates automatically and communicates changes, your reputation takes the hit for something you cannot control.',
              'Seasonal demand compression means your busiest months are also your most chaotic. May through October is everything. If your scheduling cannot handle the volume, you lose revenue you will not get back until next spring.',
            ],
            forLine: 'For siding company owners and schedulers',
          },
          {
            title: 'MATERIAL DELIVERIES THAT\nDON\'T MATCH THE SCHEDULE.',
            bullets: [
              'Siding material — vinyl, fiber cement, engineered wood — has lead times. Special orders take weeks. If the material is not on site when the crew arrives, the crew stands idle and you are paying them to wait.',
              'Color matching across production runs is critical. If you order more material mid-job and the lot number changes, the color does not match. Getting the material order right the first time requires accurate measurements your crew captured on the estimate visit — measurements that might be on a sticky note in someone\'s truck.',
              'Storm damage insurance work adds material complexity. The adjuster approves a specific material and quantity. If your order does not match the approval, the claim gets delayed.',
              'Multiple jobs running simultaneously means multiple material deliveries to coordinate. Material for Job A delivered to Job B\'s address wastes a day and a truck.',
            ],
            forLine: 'For project managers and material coordinators',
          },
          {
            title: 'DOCUMENTATION THAT\nINSURANCE ADJUSTERS DEMAND.',
            bullets: [
              'Storm damage siding work lives and dies on documentation. Before photos of the damage. Progress photos during removal. After photos of the completed installation. The adjuster wants all of it, organized by section.',
              'Scope documentation needs to be specific — which elevations, which sections, what material, what quantity. Vague scopes lead to supplement denials. Your crew needs to document exactly what they find behind the old siding.',
              'Homeowner expectations on insurance work are high. They want to know what is happening, when, and what their responsibility is. Without a system that tracks progress, your crew becomes the communication channel — pulling them off productive work to answer questions.',
              'Warranty documentation on manufacturer materials requires installation photos, lot numbers, and compliance with manufacturer specifications. Missing this documentation voids the warranty — and that liability falls on you.',
            ],
            forLine: 'For siding crews and field supervisors',
          },
        ],
        solutions: [
          {
            title: 'WEATHER CANCELS A DAY.\nOPS RESCHEDULES THE WEEK.',
            copy: 'Rain on Wednesday. Drag the job to Friday and every downstream job adjusts. Your affected customers get notified. Your crew sees the updated schedule on their phone. No calling five homeowners. No rewriting the whiteboard. One drag, one drop, the week rebuilds itself.',
            painPointRef: 'weather-schedule',
          },
          {
            title: 'YOUR CREW KNOWS\nWHAT IS ON SITE BEFORE THEY ARRIVE.',
            copy: 'Job details, material specifications, measurement notes, delivery status, and customer preferences — on your crew\'s phone before they leave the shop. No showing up to a job without the right material. No calling the office from the ladder asking "was it Desert Tan or Sand?"  The answer is on their screen.',
            painPointRef: 'material-deliveries',
          },
          {
            title: 'DOCUMENTATION THAT\nGETS INSURANCE CLAIMS PAID.',
            copy: 'Before, during, and after photos captured in OPS and attached to the job — by elevation, by section, by date. Scope notes, material specs, and installation details organized for the adjuster. When the supplement request goes in, every supporting photo is already there. Not in someone\'s phone gallery. In the job record.',
            painPointRef: 'insurance-documentation',
          },
          {
            title: 'EVERY JOB FROM ESTIMATE\nTO FINAL WALKTHROUGH.',
            copy: 'Insurance work, retail installations, storm damage, warranty repairs — every siding job in one schedule, one app, one crew view. Your office sees the full pipeline. Your crew sees their day. What gets booked is what gets built. No miscommunication between the estimate and the installation.',
            painPointRef: 'operational-complexity',
          },
        ],
        comparison: {
          competitors: ['JobNimbus', 'Jobber'],
          rows: [
            {
              feature: 'Pricing',
              ops: 'Free to start, $79/mo flat',
              comp1: '$100+/mo per user',
              comp2: '$49-$199/mo, feature-gated',
            },
            {
              feature: 'Weather-responsive scheduling',
              ops: 'Drag-drop reschedule, cascade updates',
              comp1: 'Calendar-based, manual updates',
              comp2: 'Basic rescheduling',
            },
            {
              feature: 'Photo documentation',
              ops: 'Photos organized by job and phase',
              comp1: 'Photo management with insurance focus',
              comp2: 'Photo capture on paid plans',
            },
            {
              feature: 'Offline mode',
              ops: 'Full offline, syncs on reconnect',
              comp1: 'Requires connectivity',
              comp2: 'Limited offline',
            },
            {
              feature: 'Crew app simplicity',
              ops: 'Open and see your jobs, no training',
              comp1: 'CRM-heavy, learning curve',
              comp2: 'Clean but feature-gated',
            },
            {
              feature: 'Time to start',
              ops: 'Download and go, same day',
              comp1: 'Setup + onboarding',
              comp2: 'Setup + plan selection',
            },
          ],
        },
        faq: [
          {
            question: 'Can OPS handle weather-dependent siding schedules?',
            answer:
              'Yes. When weather cancels a day, drag the job and every downstream appointment adjusts. Your crew sees the updated schedule on their phone. No calling homeowners individually.',
          },
          {
            question: 'Does OPS help with insurance documentation for storm damage siding work?',
            answer:
              'Yes. Before, during, and after photos attached to jobs by elevation and section. Scope notes, material specs, and progress records organized for adjuster review. Every photo timestamped and searchable.',
          },
          {
            question: 'Can my crew see material and job details before arriving on site?',
            answer:
              'Yes. Material type, color, measurements, delivery status, and customer notes are visible on your crew\'s phone before they leave the shop. No wrong materials. No wasted trips.',
          },
          {
            question: 'Does OPS work outdoors with intermittent signal?',
            answer:
              'Yes. Siding work happens on rooftops, at heights, and in rural areas where signal is unreliable. OPS works fully offline and syncs when connectivity returns.',
          },
          {
            question: 'We do siding and roofing. Can OPS handle both?',
            answer:
              'Yes. OPS is not trade-locked. Siding, roofing, gutters, exterior trim — all job types in one schedule, one app, one crew view. No separate software for each trade.',
          },
        ],
        cta: {
          headline: 'YOUR SIDING CREW WORKS OUTSIDE ALL DAY.\nGIVE THEM SOFTWARE THAT DOES TOO.',
          subtext: 'Weather-responsive scheduling. Insurance documentation. Material tracking. One app for every exterior job. Free to start — no demo, no contract.',
        },
      },
    },
  },
  // ─── GUTTER INSTALLATION & CLEANING ─────────────────────────────
  {
    slug: 'gutters',
    name: 'Gutter Installation & Cleaning',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Gutter Installation & Cleaning Software for Crews | OPS',
          description:
            'OPS is built for gutter crews running installations, cleanings, and guard installs on tight daily routes. Schedule more stops per day, track recurring cleanings, and keep your seasonal crew moving. Free to start.',
          keywords: [
            'gutter company software',
            'gutter cleaning scheduling app',
            'gutter installation scheduling',
            'gutter business management',
            'gutter crew scheduling software',
            'gutter cleaning route software',
            'gutter company management app',
            'gutter cleaning business software',
            'gutter installation crew app',
            'gutter service dispatch software',
          ],
        },
        hero: {
          sectionLabel: 'Gutter Installation & Cleaning',
          headline: 'MORE STOPS PER DAY.\nLESS TIME ON THE ROAD.\nTHAT IS THE ENTIRE GAME.',
          subtext:
            'Gutter work is a volume game — 6-12 stops per day, tight routes, fast turnarounds. The crews that run the tightest routes and lose the fewest customers between seasons win. OPS keeps your routes optimized, your recurring customers on schedule, and your crew moving from stop to stop without calling the office.',
        },
        painPoints: [
          {
            title: 'ROUTES THAT WASTE HOURS\nYOU CANNOT BILL FOR.',
            bullets: [
              'Gutter cleaning is route-based. Your crew hits 8-12 homes per day in a sequence. A poorly planned route wastes 90 minutes of drive time between stops. Over a 5-day work week, that is 7.5 hours — an entire day of lost productivity.',
              'Mid-day disruptions — customer not home, gate locked, dog in the yard — mean your crew skips a stop and the route has a gap. Without a digital schedule, they call the office, wait for a new address, and lose another 15 minutes.',
              'Seasonal crew members do not know the routes. Your veteran tech knows every shortcut and every customer quirk. Your summer hire has a list of addresses and Google Maps. The difference is 3 fewer stops per day.',
              'Gutter installation jobs take 2-4 hours — longer than cleanings. Mixing installations and cleanings on the same day requires careful scheduling. Get the sequence wrong and your cleaning crew is idle while the install runs long.',
            ],
            forLine: 'For gutter company owners and dispatchers',
          },
          {
            title: 'RECURRING CUSTOMERS\nYOU LOSE EVERY SEASON.',
            bullets: [
              'Gutter cleaning is seasonal and recurring — spring and fall for most markets. But most gutter companies lose 20-30% of recurring customers annually because nobody called them back when the season started.',
              'Customer callback schedules tracked in spreadsheets rely on someone remembering to check the spreadsheet. If that person is busy scheduling crews, the callbacks do not happen.',
              'When a recurring customer calls their "regular gutter guy" and gets voicemail, they call the next company on Google. Your retention problem is not price. It is follow-up.',
              'Upselling gutter guards to cleaning customers is the highest-margin move in the business. But if your crew does not know which customers have guards and which do not, the upsell conversation never happens.',
            ],
            forLine: 'For gutter company owners and office managers',
          },
          {
            title: 'JOBS AT HEIGHT WITH\nNO ROOM FOR CONFUSION.',
            bullets: [
              'Your crew works on ladders and rooftops. They cannot be scrolling through emails or calling the office while balanced at 25 feet. Job details need to be accessible with one glance at their phone — address, scope, access notes, and any hazards.',
              'Before and after photos are the proof that the job was done. Customers who are not home during cleaning want to see that their gutters were actually cleaned. Without photos, you get "how do I know you were here?" calls.',
              'Safety documentation is increasingly required — especially for commercial gutter work. Ladder placement, roof condition, fall protection. Paper checklists in a truck pocket do not protect you when someone asks.',
              'Customer-specific notes matter in gutter work. Which side of the house has the wasp nest. Where the downspout directs to the neighbor\'s property. Which gutter section leaks. If that information is in your senior tech\'s head, it dies when he takes a sick day.',
            ],
            forLine: 'For gutter crews and field technicians',
          },
        ],
        solutions: [
          {
            title: 'TIGHTER ROUTES.\nMORE STOPS. LESS ROAD.',
            copy: 'OPS shows your crew their full daily route with every stop in sequence. Mid-day changes — customer not home, gate locked, emergency add — update the route on their phone instantly. Your veteran tech\'s route knowledge is in the system now, not just in their head. New crew members run tight routes from day one.',
            painPointRef: 'route-waste',
          },
          {
            title: 'RECURRING CLEANINGS\nTHAT ACTUALLY RECUR.',
            copy: 'Set each customer\'s cleaning interval — spring and fall, quarterly, annual — and OPS generates the jobs when the season comes around. No spreadsheet reviews. No forgotten callbacks. Your recurring revenue stays recurring because the system never forgets a customer.',
            painPointRef: 'recurring-customers',
          },
          {
            title: 'JOB DETAILS YOUR CREW\nCAN SEE FROM THE LADDER.',
            copy: 'Address, scope, access notes, customer-specific warnings, and before/after photo requirements — all on your crew\'s phone in large, tappable controls. 56dp touch targets for gloved hands. Dark theme readable in direct sunlight. One glance and they know the job. Before and after photos attached to the customer record so the homeowner sees proof without calling you.',
            painPointRef: 'jobs-at-height',
          },
          {
            title: 'CLEANINGS AND INSTALLS.\nONE SCHEDULE.',
            copy: 'Gutter cleanings, gutter guard installs, new gutter installations, repair jobs — all in one schedule your crew can see on their phone. Your office books the work. Your crew does it. What gets scheduled is what gets done. No mix-ups between the cleaning route and the installation crew.',
            painPointRef: 'operational-complexity',
          },
        ],
        comparison: {
          competitors: ['Jobber', 'Housecall Pro'],
          rows: [
            {
              feature: 'Pricing',
              ops: 'Free to start, $79/mo flat',
              comp1: '$49-$199/mo, feature-gated',
              comp2: '$49-$199/mo, feature-gated',
            },
            {
              feature: 'Route-based scheduling',
              ops: 'Visual daily routes with real-time updates',
              comp1: 'Route optimization on higher tiers',
              comp2: 'Basic route view',
            },
            {
              feature: 'Recurring job scheduling',
              ops: 'Custom intervals per customer',
              comp1: 'Recurring on higher tiers',
              comp2: 'Recurring available',
            },
            {
              feature: 'Offline mode',
              ops: 'Full offline, syncs on reconnect',
              comp1: 'Limited offline',
              comp2: 'Limited offline',
            },
            {
              feature: 'Crew app simplicity',
              ops: 'Glove-ready, dark theme, one glance',
              comp1: 'Clean but feature-gated',
              comp2: 'Feature-rich, learning curve',
            },
            {
              feature: 'Time to start',
              ops: 'Download and go, same day',
              comp1: 'Setup + plan selection',
              comp2: 'Setup + plan selection',
            },
          ],
        },
        faq: [
          {
            question: 'Can OPS handle route-based gutter cleaning schedules?',
            answer:
              'Yes. Your crew sees their daily route with every stop in order. Mid-day changes update instantly on their phone. Tighter routes mean more stops per day and less time on the road.',
          },
          {
            question: 'Does OPS support recurring seasonal gutter cleaning?',
            answer:
              'Yes. Set each customer\'s cleaning interval and OPS auto-generates the jobs when the season comes around. No forgotten customers. No lost recurring revenue.',
          },
          {
            question: 'Can my crew take before and after photos through OPS?',
            answer:
              'Yes. Before and after photos are captured in OPS and attached to the job and customer record. Proof of work for customers who were not home during the cleaning.',
          },
          {
            question: 'Does OPS work for both gutter cleaning and installation crews?',
            answer:
              'Yes. Cleanings, guard installs, new installations, and repair jobs — all in one schedule. No separate systems for different service types.',
          },
          {
            question: 'We are a 2-person gutter crew. Is OPS right for that size?',
            answer:
              'OPS is built for small crews. No implementation, no consultants, no enterprise pricing. Download it, add your route, and start running tighter days. If you are losing 20% of recurring customers because nobody followed up, OPS pays for itself in the first week.',
          },
        ],
        cta: {
          headline: 'TIGHTER ROUTES. MORE STOPS.\nZERO LOST CUSTOMERS.',
          subtext: 'Route-based scheduling. Recurring customer tracking. Before/after photo proof. One app for cleanings and installations. Free to start — no demo, no contract.',
        },
      },
    },
  },

  // ─── PAVING & SEAL COATING ────────────────────────────────────
  {
    slug: 'paving',
    name: 'Paving & Seal Coating',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Paving & Seal Coating Software for Crews | OPS',
          description:
            'OPS is built for paving and seal coating crews managing multi-crew jobs, equipment logistics, and weather-dependent schedules. Track every job, coordinate materials, and keep crews moving. Free to start.',
          keywords: [
            'paving contractor software',
            'seal coating business software',
            'paving company scheduling app',
            'asphalt paving crew management',
            'seal coating scheduling software',
            'paving dispatch software',
            'paving crew scheduling app',
            'seal coating company management',
            'paving business management software',
            'asphalt contractor scheduling',
          ],
        },
        hero: {
          sectionLabel: 'Paving & Seal Coating',
          headline: 'PAVING IS A CREW SPORT.\nEVERYONE NEEDS TO KNOW THE PLAY.',
          subtext:
            'Big crews, heavy equipment, tight weather windows, and material that stops for nobody once it is mixed. Paving and seal coating demand coordination that phone calls and whiteboards cannot deliver. OPS keeps every crew member, every piece of equipment, and every material delivery synced on one schedule.',
        },
        painPoints: [
          {
            title: 'BIG CREWS WITH\nNO SINGLE SOURCE OF TRUTH.',
            bullets: [
              'A paving crew can be 6-15 people plus equipment operators. Everyone needs to know where the job is, what time to be there, what equipment is coming, and what the scope looks like. Right now that information lives in a foreman\'s head and a morning huddle.',
              'When the foreman calls in sick, the morning huddle does not happen. Nobody knows the plan. Six guys standing in a parking lot waiting for instructions costs $600/hour in labor.',
              'Split crews running separate jobs need separate coordination. Your seal coating team is at the strip mall. Your paving crew is on the residential street. Your office is trying to manage both by phone.',
              'Subcontractors — stripers, curb setters, traffic control — have their own schedules. If they show up before your crew is done, they wait and bill you for it. If they show up too late, your crew waits.',
            ],
            forLine: 'For paving company owners and project managers',
          },
          {
            title: 'WEATHER AND MATERIAL\nWAIT FOR NOBODY.',
            bullets: [
              'Asphalt cools at a fixed rate. Once the truck leaves the plant, you have a limited window to lay and compact it. A delay at the job site — wrong area prepped, equipment not ready, crew not in position — means cold asphalt and a bad result.',
              'Seal coating requires specific temperature and weather conditions. Below 50 degrees and it does not cure. Rain within 24 hours and it washes away. Your schedule is at the mercy of the forecast, and your customer list needs to hear about cancellations fast.',
              'Material ordering on paving jobs requires precision. Order too much asphalt and you waste thousands. Order too little and the plant might not have another batch ready today. Getting the tonnage right starts with accurate measurements — measurements that might be on a scrap of paper.',
              'Weather days cascade. Cancel Monday, push to Tuesday, but Tuesday was already booked. Now two jobs need the same crew on the same day. Without a digital schedule, this is a phone tree nightmare.',
            ],
            forLine: 'For foremen and material coordinators',
          },
          {
            title: 'EQUIPMENT LOGISTICS\nTHAT MAKE OR BREAK THE DAY.',
            bullets: [
              'Pavers, rollers, skid steers, dump trucks, crack routers, seal coating tanks — your equipment fleet moves between job sites daily. One piece in the wrong place means a crew standing idle.',
              'Equipment breakdowns on paving jobs are emergencies. The roller goes down and the asphalt is cooling. You need a replacement unit moved from another job site in the next 30 minutes. Where is the backup roller? Who is using it?',
              'Rental equipment on a daily rate means every unused day is pure cost. If the job gets pushed by weather but the rental was not cancelled, you just burned $500-$1,500.',
              'Loading and transport time for heavy equipment must factor into the schedule. If the paver needs to be moved from Site A to Site B and the transport takes 2 hours, your afternoon crew cannot start until 2 PM. Is anyone accounting for that?',
            ],
            forLine: 'For dispatchers and equipment managers',
          },
        ],
        solutions: [
          {
            title: 'ONE SCHEDULE EVERY\nCREW MEMBER CAN SEE.',
            copy: 'Your 12-person paving crew, your 4-person seal coating team, your subcontractors — all on one schedule visible on everyone\'s phone. Job location, start time, scope, equipment list, and crew assignments. When the foreman calls in sick, the plan does not die with them. It is on every phone in the crew.',
            painPointRef: 'crew-coordination',
          },
          {
            title: 'WEATHER CANCELS? THE\nSCHEDULE REBUILDS.',
            copy: 'Rain pushes Monday\'s paving to Wednesday. Drag the job. Every downstream job adjusts. Affected customers know. Your crew sees the new plan on their phone. When the asphalt plant confirms your tonnage for Wednesday, you are ready. No phone trees. No mass texts. One change, everyone knows.',
            painPointRef: 'weather-material',
          },
          {
            title: 'KNOW WHERE YOUR IRON IS.\nALWAYS.',
            copy: 'Track every piece of equipment by job site. Paver at Main Street until noon. Roller moving to Elm at 1 PM. Seal coating tank at the commercial lot all day. When the roller breaks down on site, you know where the backup is and who is using it. No more calling three foremen to find a piece of equipment.',
            painPointRef: 'equipment-logistics',
          },
          {
            title: 'FROM ESTIMATE TO STRIPE.\nONE APP.',
            copy: 'Demolition, grading, paving, seal coating, striping — every phase of a parking lot or road job in one schedule. Your office books the work. Your foreman sees the phases. Your crew sees their day. Material quantities, equipment assignments, and subcontractor schedules all visible in one place.',
            painPointRef: 'operational-complexity',
          },
        ],
        comparison: {
          competitors: ['Jobber', 'FieldPulse'],
          rows: [
            {
              feature: 'Pricing',
              ops: 'Free to start, $79/mo flat',
              comp1: '$49-$199/mo, feature-gated',
              comp2: 'Hidden pricing, demo required',
            },
            {
              feature: 'Multi-crew scheduling',
              ops: 'All crews visible, drag-drop reassign',
              comp1: 'Team scheduling on higher tiers',
              comp2: 'Crew scheduling available',
            },
            {
              feature: 'Equipment tracking',
              ops: 'Equipment by job site, real-time view',
              comp1: 'No equipment tracking',
              comp2: 'Basic asset tracking',
            },
            {
              feature: 'Offline mode',
              ops: 'Full offline, syncs on reconnect',
              comp1: 'Limited offline',
              comp2: 'Limited offline',
            },
            {
              feature: 'Crew app simplicity',
              ops: 'Open and see the plan, no training',
              comp1: 'Clean but not crew-focused',
              comp2: 'Full-featured but complex setup',
            },
            {
              feature: 'Time to start',
              ops: 'Download and go, same day',
              comp1: 'Setup + plan selection',
              comp2: 'Demo + onboarding required',
            },
          ],
        },
        faq: [
          {
            question: 'Can OPS handle large paving crews with 10+ people?',
            answer:
              'Yes. Every crew member sees the same schedule on their phone — job location, start time, scope, equipment, and crew assignments. The plan does not live in the foreman\'s head anymore. It lives on every phone.',
          },
          {
            question: 'Does OPS handle weather-dependent scheduling?',
            answer:
              'Yes. When weather cancels a paving or seal coating day, drag the job and every downstream appointment adjusts. Your crew sees the new schedule instantly. No phone trees.',
          },
          {
            question: 'Can I track equipment across multiple paving job sites?',
            answer:
              'Yes. Track every piece of equipment by site. When you need to move a roller or find the backup paver, you know exactly where it is and who is using it.',
          },
          {
            question: 'Does OPS work for both paving and seal coating operations?',
            answer:
              'Yes. Paving, seal coating, crack filling, striping — all job types in one schedule. Run separate crews for each or mix them on the same day.',
          },
          {
            question: 'We are a seal coating company that runs 2 crews. Is OPS right for us?',
            answer:
              'Built for you. Two crews, multiple stops per day, weather-dependent schedule, recurring commercial accounts. OPS keeps both routes tight and both crews informed. Free to start.',
          },
        ],
        cta: {
          headline: 'YOUR CREW IS BIG.\nYOUR SCHEDULE SHOULD BE BIGGER.',
          subtext: 'Multi-crew coordination. Equipment tracking. Weather-responsive scheduling. One app for every paving and seal coating job. Free to start — no demo, no contract.',
        },
      },
    },
  },
  // ─── WELDING & METAL FABRICATION ────────────────────────────────
  {
    slug: 'welding',
    name: 'Welding & Metal Fabrication',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Welding & Metal Fabrication Software for Field Crews | OPS',
          description:
            'OPS is built for field welding crews and mobile fabrication teams. Schedule jobs, track certifications, document welds, and dispatch crews to job sites. Free to start.',
          keywords: [
            'welding company software',
            'field welding crew scheduling',
            'welding business management app',
            'mobile welding dispatch software',
            'welding contractor scheduling',
            'metal fabrication crew management',
            'welding service scheduling app',
            'field welding dispatch software',
            'welding company management',
            'welding crew scheduling app',
          ],
        },
        hero: {
          sectionLabel: 'Welding & Metal Fabrication',
          headline: 'FIELD WELDING CREWS\nDESERVE A REAL SYSTEM.\nNOT A GROUP TEXT.',
          subtext:
            'Your welders are on a construction site, a farm, a pipeline, a manufacturing plant — scattered across the county doing work that requires precision, certification, and documentation. And you are dispatching them by text message. OPS gives your welding crew a schedule they can see, job details they can reference, and documentation that survives the job site.',
        },
        painPoints: [
          {
            title: 'DISPATCHING WELDERS\nACROSS A COUNTY BY TEXT.',
            bullets: [
              'Field welding is not a shop job. Your welders travel to the work — construction sites, farms, industrial plants, pipeline right-of-ways. Dispatching the right welder to the right job with the right certifications requires more than a group text.',
              'Not every welder holds every certification. Structural steel, pipe welding, underwater, AWS D1.1, ASME — the wrong welder on the wrong job means failed inspections and rework. But your certification tracking is a spreadsheet that was last updated three months ago.',
              'Emergency repair calls — a broken handrail at a school, a cracked structural beam, a leaking pipe in a plant — require immediate dispatch of a qualified welder. Your current process is calling welders one by one until someone qualifies and answers.',
              'When your welders finish early on a job, they sit idle because the office does not know they are available. No real-time visibility means no real-time reassignment.',
            ],
            forLine: 'For welding company owners and dispatchers',
          },
          {
            title: 'WELD DOCUMENTATION THAT\nINSPECTORS WILL ACTUALLY ACCEPT.',
            bullets: [
              'Certified welding requires documentation — weld procedure specifications (WPS), procedure qualification records (PQR), welder certification numbers, joint details, and inspection results. Paper weld logs get lost, get wet, and get illegible.',
              'Before and after photos of welds are increasingly required for structural work. Inspectors want to see joint preparation, fit-up, and final weld quality. Photos on personal phones do not get filed properly.',
              'Code compliance on structural and pressure welding requires traceability — which welder, which procedure, which date, on which joint. When the inspector asks three months later, you need the answer in seconds, not hours.',
              'Non-destructive testing (NDT) results need to be tied to specific welds on specific jobs. If the UT results are in one file and the job record is in another, traceability is broken.',
            ],
            forLine: 'For welding supervisors and quality managers',
          },
          {
            title: 'JOB SITES WHERE YOUR\nPHONE IS YOUR ONLY TOOL.',
            bullets: [
              'Field welding happens on construction sites, in crawlspaces, on elevated structures, and inside tanks where signal is poor or nonexistent. If your scheduling app requires connectivity, your welder has nothing.',
              'Welding gloves are heavy. Scrolling through menus with fire-resistant leather gloves is not happening. Your welder needs to see their job details with one tap and large controls.',
              'Environmental conditions on welding sites — heat, sparks, dust, confined spaces — make delicate phone handling impractical. The app needs to be usable with quick, imprecise taps.',
              'Your mobile welding rig is their office. Everything they need to know about the next job should be on their phone before they drive to the site. Not in a voicemail. Not in an email they have to squint at.',
            ],
            forLine: 'For field welders and mobile fabrication crews',
          },
        ],
        solutions: [
          {
            title: 'DISPATCH THE RIGHT WELDER.\nEVERY TIME.',
            copy: 'OPS shows every welder, their current job, their location, and their certifications. Emergency call for structural welding? Filter by AWS D1.1 certified and dispatch the closest available. No calling around. No guessing certifications. The right welder rolls to the right job in minutes.',
            painPointRef: 'dispatch-welders',
          },
          {
            title: 'WELD DOCUMENTATION\nTHAT SURVIVES THE JOB SITE.',
            copy: 'Your welder captures photos, joint details, procedure references, and inspection notes directly in OPS — attached to the job, timestamped, searchable. When the inspector asks for documentation on the third-floor beam weld from three months ago, the record takes two taps to find. Not a filing cabinet search. Not a phone gallery scroll.',
            painPointRef: 'weld-documentation',
          },
          {
            title: 'WORKS ON THE BEAM.\nSYNCS AT THE TRUCK.',
            copy: 'OPS works fully offline — on elevated structures, inside tanks, in crawlspaces, on pipeline right-of-ways. 56dp touch targets for heavy welding gloves. Dark theme readable in bright outdoor conditions. Your welder sees their job details, captures documentation, and everything syncs when they get back to signal.',
            painPointRef: 'field-conditions',
          },
          {
            title: 'STRUCTURAL. PIPE. REPAIR.\nONE APP.',
            copy: 'Structural steel, pipe welding, handrail fabrication, emergency repairs, maintenance welding — every job type in one schedule. Your office dispatches. Your welders see it. Certifications, job specs, and customer details travel with the welder. Not in an email chain.',
            painPointRef: 'operational-complexity',
          },
        ],
        comparison: {
          competitors: ['Jobber', 'FieldPulse'],
          rows: [
            {
              feature: 'Pricing',
              ops: 'Free to start, $79/mo flat',
              comp1: '$49-$199/mo, feature-gated',
              comp2: 'Hidden pricing, demo required',
            },
            {
              feature: 'Crew dispatch',
              ops: 'Real-time view with certification filtering',
              comp1: 'Basic scheduling and dispatch',
              comp2: 'Dispatch available',
            },
            {
              feature: 'Offline mode',
              ops: 'Full offline — works on elevated structures and in tanks',
              comp1: 'Limited offline',
              comp2: 'Limited offline',
            },
            {
              feature: 'Photo documentation',
              ops: 'Photos attached to jobs, timestamped',
              comp1: 'Photo capture on paid plans',
              comp2: 'Photo capture available',
            },
            {
              feature: 'Crew app usability',
              ops: 'Heavy-glove touch targets, dark theme',
              comp1: 'Standard mobile interface',
              comp2: 'Standard mobile interface',
            },
            {
              feature: 'Time to start',
              ops: 'Download and go, same day',
              comp1: 'Setup + plan selection',
              comp2: 'Demo + onboarding required',
            },
          ],
        },
        faq: [
          {
            question: 'Can OPS track welder certifications for dispatch?',
            answer:
              'OPS stores crew details so you can dispatch the right welder for the job. Structural, pipe, specialty — assign based on qualifications, not just availability.',
          },
          {
            question: 'Does OPS work offline on construction sites and in confined spaces?',
            answer:
              'Yes. OPS works fully offline with touch targets built for welding gloves. Your welder sees their jobs, captures photos, and logs details. Everything syncs when they get back to signal.',
          },
          {
            question: 'Can my welders document joints and welds in the field?',
            answer:
              'Yes. Photos, joint details, procedure references, and notes are captured in OPS and attached to the job. Searchable and permanent for inspectors, quality audits, and traceability.',
          },
          {
            question: 'Does OPS work for both shop and field welding?',
            answer:
              'Yes. Shop fabrication, field welding, mobile repair, emergency dispatch — all job types in one schedule. Whether the work is in your shop or on a job site 50 miles away.',
          },
          {
            question: 'We are a 3-person mobile welding crew. Is OPS right for us?',
            answer:
              'Built for you. Three welders, scattered across the county, dispatched by text message. OPS replaces the text messages with a real schedule, real job details, and real documentation. Free to start.',
          },
        ],
        cta: {
          headline: 'YOUR WELDERS DESERVE\nBETTER THAN A GROUP TEXT.',
          subtext: 'Certification-aware dispatch. Field documentation. Offline on every job site. One app for structural, pipe, and repair welding. Free to start — no demo, no contract.',
        },
      },
    },
  },

  // ─── EXCAVATION & EARTHWORK ───────────────────────────────────
  {
    slug: 'excavation',
    name: 'Excavation & Earthwork',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Excavation & Earthwork Software for Crews | OPS',
          description:
            'OPS is built for excavation crews managing heavy equipment, multi-site operations, and tight project timelines. Schedule operators, track equipment, and coordinate with GCs. Free to start.',
          keywords: [
            'excavation contractor software',
            'earthwork company scheduling',
            'excavation crew management app',
            'excavation business software',
            'excavation dispatch software',
            'earthwork crew scheduling',
            'excavation project scheduling',
            'excavation company management',
            'heavy equipment scheduling app',
            'excavation contractor scheduling',
          ],
        },
        hero: {
          sectionLabel: 'Excavation & Earthwork',
          headline: 'IRON AND OPERATORS\nIN THE RIGHT PLACE.\nAT THE RIGHT TIME.',
          subtext:
            'Your excavation business runs on two things: where the equipment is and where the operators are. Get both wrong and you burn a day of machine time and labor. OPS keeps every piece of iron, every operator, and every job site synced on one schedule your whole operation can see.',
        },
        painPoints: [
          {
            title: 'EQUIPMENT AND OPERATORS\nON SEPARATE PLANETS.',
            bullets: [
              'You have 6 pieces of equipment across 4 job sites and 8 operators. Which operator is qualified on which machine? Which machine is at which site? Which site needs what equipment tomorrow? Right now, this information lives in your head.',
              'When the head is wrong — and it will be — an operator shows up to a site without the machine, or the machine shows up without a qualified operator. That is a burned day of labor and machine costs.',
              'Equipment moves between sites take planning. You cannot teleport a trackhoe. Transport time, trailer availability, and road permits for oversized loads all factor into the schedule. None of this fits on a whiteboard.',
              'Subcontractor coordination — concrete crews, utility crews, survey teams — depends on your equipment being ready when they need it. If your excavation falls behind, their schedule breaks and they bill you for the standby time.',
            ],
            forLine: 'For excavation company owners and project managers',
          },
          {
            title: 'GC TIMELINES THAT\nCHANGE EVERY MORNING.',
            bullets: [
              'General contractors change the schedule constantly. The foundation pour moved up a week. The utility relocation got delayed. The site access road needs to be graded by Thursday instead of next Monday. Your excavation schedule absorbs every change.',
              'When the GC changes the timeline, you need to move equipment, reassign operators, and adjust every downstream job. Without a digital schedule that every operator can see, this is a morning of phone calls.',
              'Multiple GCs with overlapping timelines mean your equipment is pulled in three directions. Prioritizing which site gets the excavator today requires a view of every active job — a view that phone calls and memory cannot provide.',
              'Weather delays on excavation compound faster than any other trade. You cannot dig in frozen ground or mud. A week of rain means every GC timeline shifts, and your schedule is the first to feel it.',
            ],
            forLine: 'For foremen and site supervisors',
          },
          {
            title: 'OPERATOR HOURS AND\nEQUIPMENT TIME NOBODY TRACKS.',
            bullets: [
              'Billing on excavation work often goes by machine hours or operator hours. If your operators are not tracking time accurately by job, you are billing by estimate — which means you are usually underbilling.',
              'Equipment maintenance intervals are based on hours of operation. Without tracking machine hours by job, you do not know when the next service is due until something breaks.',
              'Fuel consumption across job sites is a significant cost. Without tracking which sites are burning the most fuel, you cannot identify inefficiencies or bill fuel surcharges accurately.',
              'When the GC disputes your hours, your documentation is your defense. If operator hours are on paper timesheets that may or may not be accurate, the dispute goes to the GC\'s estimate — not yours.',
            ],
            forLine: 'For office managers and billing staff',
          },
        ],
        solutions: [
          {
            title: 'EVERY MACHINE. EVERY OPERATOR.\nONE BOARD.',
            copy: 'OPS shows you where every piece of equipment is, which operator is on it, and which job site it is assigned to — today, tomorrow, and next week. When you need to move the mini-ex from Elm to Oak, you see the transport time, the operator availability, and every downstream impact before you make the call.',
            painPointRef: 'equipment-operators',
          },
          {
            title: 'GC CHANGES THE PLAN.\nOPS REBUILDS THE SCHEDULE.',
            copy: 'Foundation pour moved up. Drag the job, reassign the equipment, and every operator sees the new plan on their phone. No morning phone calls. No confusion about which site gets priority. The GC changed the timeline — your operation absorbed it in two minutes.',
            painPointRef: 'gc-timelines',
          },
          {
            title: 'TRACK HOURS BY JOB.\nBILL WHAT YOU EARNED.',
            copy: 'Your operators log time by job directly in OPS. Machine hours, operator hours, start and stop times — all captured in the field and attached to the job record. When the GC questions the invoice, you have timestamped documentation, not an estimate. Bill for what you actually ran.',
            painPointRef: 'hours-tracking',
          },
          {
            title: 'TRENCHING TO GRADING.\nONE APP.',
            copy: 'Site clearing, trenching, foundation excavation, utility installation, backfill, grading — every type of excavation work in one schedule. Your office sees the full operation. Your operators see their daily assignment. Equipment, job details, and site plans travel with them. Not in a voicemail.',
            painPointRef: 'operational-complexity',
          },
        ],
        comparison: {
          competitors: ['Procore', 'Jobber'],
          rows: [
            {
              feature: 'Pricing',
              ops: 'Free to start, $79/mo flat',
              comp1: 'Custom pricing, $$$',
              comp2: '$49-$199/mo, feature-gated',
            },
            {
              feature: 'Equipment tracking',
              ops: 'Equipment by site with operator assignments',
              comp1: 'Equipment management for enterprise',
              comp2: 'No equipment tracking',
            },
            {
              feature: 'Operator scheduling',
              ops: 'Operators matched to equipment and sites',
              comp1: 'Resource management, complex setup',
              comp2: 'Basic team scheduling',
            },
            {
              feature: 'Offline mode',
              ops: 'Full offline, syncs on reconnect',
              comp1: 'Requires connectivity',
              comp2: 'Limited offline',
            },
            {
              feature: 'Time tracking',
              ops: 'Hours by job, in-app logging',
              comp1: 'Time tracking available',
              comp2: 'Time tracking on higher tiers',
            },
            {
              feature: 'Time to start',
              ops: 'Download and go, same day',
              comp1: 'Multi-month implementation',
              comp2: 'Setup + plan selection',
            },
          ],
        },
        faq: [
          {
            question: 'Can OPS track heavy equipment across multiple excavation sites?',
            answer:
              'Yes. See where every machine is, which operator is on it, and which site it is assigned to. When you need to move equipment between sites, you see the full impact before making the decision.',
          },
          {
            question: 'Does OPS handle schedule changes from GCs?',
            answer:
              'Yes. When the GC changes the timeline, drag the job and reassign equipment. Every operator sees the new plan on their phone instantly. No phone trees.',
          },
          {
            question: 'Can my operators track hours by job in OPS?',
            answer:
              'Yes. Machine hours and operator hours logged by job, in the field, on their phone. Timestamped and attached to the job record for accurate billing and dispute resolution.',
          },
          {
            question: 'Does OPS work on remote job sites with no signal?',
            answer:
              'Yes. Excavation sites — especially new developments and rural locations — often have no cell coverage. OPS works fully offline and syncs when your operator gets back to signal.',
          },
          {
            question: 'We run 3 machines and 5 operators. Is OPS right for that size?',
            answer:
              'Built for it. Three machines across two sites with five operators to coordinate. OPS replaces the whiteboard and the morning phone calls. Your operators see their assignment before they start the engine.',
          },
        ],
        cta: {
          headline: 'IRON IN THE RIGHT PLACE.\nOPERATORS ON THE RIGHT MACHINE.\nEVERY DAY.',
          subtext: 'Equipment tracking. Operator scheduling. Job-level time tracking. One app for every excavation job. Free to start — no demo, no contract.',
        },
      },
    },
  },
  // ─── TILE INSTALLATION ─────────────────────────────────────────
  {
    slug: 'tile',
    name: 'Tile Installation',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Tile Installation Software for Crews | OPS',
          description:
            'OPS is built for tile installation crews managing multi-day projects, material coordination, and GC schedules. Track every job, every crew, every material delivery. Free to start.',
          keywords: [
            'tile installer software',
            'tile installation scheduling app',
            'tile contractor management',
            'tile installation crew scheduling',
            'tile business management software',
            'tile installer dispatch app',
            'tile company scheduling',
            'tile installation project management',
            'tile contractor scheduling app',
            'tile crew management software',
          ],
        },
        hero: {
          sectionLabel: 'Tile Installation',
          headline: 'TILE IS PRECISION WORK.\nYOUR SCHEDULING\nSHOULD BE TOO.',
          subtext:
            'Multi-day installations. Material that has to be on site before the crew arrives. GC timelines that shift without warning. Tile work demands precision in the layout and precision in the logistics — but most tile contractors still run on phone calls and handwritten schedules. OPS keeps your crews, your materials, and your GC coordination tight.',
        },
        painPoints: [
          {
            title: 'GC SCHEDULES THAT\nPUT YOUR CREW IN LIMBO.',
            bullets: [
              'As a subcontractor, you do not control the timeline. The GC says "tile crew starts Wednesday" — then moves it to Friday at 5 PM on Tuesday. Your crew is booked. Your material was delivered for Wednesday. Now everything shifts.',
              'Multiple GC projects with overlapping timelines mean your crew is pulled between jobs. One GC pushes, another pulls, and your 3-person crew cannot be in two places at once.',
              'Waiting on other trades — painters need to finish, plumbing rough-in needs inspection, floor prep is not done — means your tile crew shows up and cannot start. A wasted day of labor for a crew standing in an unready room.',
              'Communication with GCs is fragmented. Updates come by text, email, phone call, and sometimes a sticky note on the site board. Missing one update means showing up on the wrong day.',
            ],
            forLine: 'For tile contractors and business owners',
          },
          {
            title: 'MATERIAL ON SITE IS\nTHE JOB\'S SINGLE POINT OF FAILURE.',
            bullets: [
              'You cannot lay tile that is not there. Special-order tile takes 2-6 weeks. If the material delivery does not align with the crew schedule, the crew sits idle and you eat the labor cost.',
              'Material quantities require precise calculations from room measurements. Over-order and you waste money on returns or leftover boxes. Under-order and the production lot may have changed — meaning the new tile does not match.',
              'Multiple jobs running simultaneously mean multiple material orders in transit. Material for the bathroom remodel delivered to the commercial lobby project wastes a day and a truck.',
              'Grout, thin-set, backer board, waterproofing membrane, trim pieces — tile jobs have more material SKUs than most trades. If one item is missing, the job stalls.',
            ],
            forLine: 'For tile crew leaders and project coordinators',
          },
          {
            title: 'MULTI-DAY INSTALLS WITH\nNO VISIBLE PROGRESS TRACKING.',
            bullets: [
              'A bathroom tile job is 2-3 days. A commercial floor is 1-2 weeks. A custom shower is 4-5 days with waterproofing cure times built in. Nobody outside the crew knows what phase the job is in without calling the foreman.',
              'Homeowners and GCs want progress updates. Your foreman is on their knees cutting tile and also fielding phone calls about "when will it be done?" That is not productive for anyone.',
              'Photo documentation of progress — substrate preparation, waterproofing membrane application, layout, grouting — protects you when someone claims the work was not done to spec. But those photos are on personal phones.',
              'Cure times between phases — waterproofing before tile, tile before grout, grout before sealing — mean your crew leaves and comes back. If nobody tracks which jobs need return visits and when, a job falls through the cracks.',
            ],
            forLine: 'For tile installers and field crews',
          },
        ],
        solutions: [
          {
            title: 'GC SHIFTS THE DATE.\nOPS SHIFTS THE CREW.',
            copy: 'Wednesday becomes Friday. Drag the job, and your crew sees the new schedule on their phone. Material delivery updates. Downstream jobs adjust. No calling three people. No scrambling at 6 AM. The GC changed the plan — your operation absorbed it in one minute.',
            painPointRef: 'gc-schedules',
          },
          {
            title: 'YOUR CREW KNOWS WHAT IS\nON SITE BEFORE THEY ARRIVE.',
            copy: 'Job details, material list, delivery status, room measurements, customer tile selections, and access instructions — on your crew\'s phone before they load the van. No showing up to a job missing the bullnose trim. No calling the office from the site asking which grout color the customer picked. The answer is on their screen.',
            painPointRef: 'material-coordination',
          },
          {
            title: 'PROGRESS VISIBLE.\nPHOTOS ATTACHED.\nPHASES TRACKED.',
            copy: 'Substrate prep done. Waterproofing membrane curing. Layout started. First section grouted. OPS tracks which phase every job is in, and your crew captures progress photos attached to each phase. Homeowners and GCs get proof of progress without calling your foreman. Return visits for grout and sealing never get forgotten.',
            painPointRef: 'progress-tracking',
          },
          {
            title: 'RESIDENTIAL. COMMERCIAL.\nCUSTOM. ONE SCHEDULE.',
            copy: 'Bathroom remodels, commercial floors, custom showers, backsplash installs — every tile job in one schedule. Your office sees the pipeline. Your crew sees their day. What gets booked is what gets built, with the right material, at the right site, on the right date.',
            painPointRef: 'operational-complexity',
          },
        ],
        comparison: {
          competitors: ['Jobber', 'Buildertrend'],
          rows: [
            {
              feature: 'Pricing',
              ops: 'Free to start, $79/mo flat',
              comp1: '$49-$199/mo, feature-gated',
              comp2: '$99-$499/mo',
            },
            {
              feature: 'Sub-contractor scheduling',
              ops: 'Flexible scheduling with GC coordination',
              comp1: 'Basic job scheduling',
              comp2: 'Full project management, complex',
            },
            {
              feature: 'Offline mode',
              ops: 'Full offline, syncs on reconnect',
              comp1: 'Limited offline',
              comp2: 'Requires connectivity',
            },
            {
              feature: 'Photo documentation',
              ops: 'Photos by phase, attached to jobs',
              comp1: 'Photo capture on paid plans',
              comp2: 'Photo management available',
            },
            {
              feature: 'Crew app simplicity',
              ops: 'Open and see your day, no training',
              comp1: 'Clean but feature-gated',
              comp2: 'Feature-heavy, GC-oriented',
            },
            {
              feature: 'Time to start',
              ops: 'Download and go, same day',
              comp1: 'Setup + plan selection',
              comp2: 'Onboarding + setup required',
            },
          ],
        },
        faq: [
          {
            question: 'Can OPS handle GC schedule changes for tile subcontractors?',
            answer:
              'Yes. When the GC pushes your start date, drag the job and your crew sees the updated schedule on their phone. Downstream jobs adjust automatically.',
          },
          {
            question: 'Can my tile crew see material details before arriving on site?',
            answer:
              'Yes. Tile type, color, grout selection, trim pieces, room measurements, and delivery status — all on your crew\'s phone before they leave the shop.',
          },
          {
            question: 'Does OPS track multi-day tile installation phases?',
            answer:
              'Yes. Substrate prep, waterproofing, layout, tile, grout, sealing — each phase tracked with progress photos. Return visits for cure-dependent phases never get missed.',
          },
          {
            question: 'Does OPS work on job sites with poor connectivity?',
            answer:
              'Yes. Tile work happens inside buildings under construction where signal is unreliable. OPS works fully offline and syncs when your crew gets back to connectivity.',
          },
          {
            question: 'We are a 2-person tile crew. Is OPS right for us?',
            answer:
              'Built for you. Two installers managing 3-4 active jobs with different GC timelines, different material orders, and different phases. OPS keeps it all in one place instead of your head.',
          },
        ],
        cta: {
          headline: 'TILE IS PRECISION.\nYOUR SCHEDULING SHOULD MATCH.',
          subtext: 'GC-responsive scheduling. Material coordination. Phase tracking with photos. One app for every tile job. Free to start — no demo, no contract.',
        },
      },
    },
  },

  // ─── STUCCO & PLASTERING ──────────────────────────────────────
  {
    slug: 'stucco',
    name: 'Stucco & Plastering',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Stucco & Plastering Software for Crews | OPS',
          description:
            'OPS is built for stucco and plastering crews managing multi-coat applications, cure times, and weather-dependent schedules. Schedule crews, track phases, and coordinate across job sites. Free to start.',
          keywords: [
            'stucco contractor software',
            'plastering company scheduling',
            'stucco crew management app',
            'stucco business software',
            'plastering crew scheduling',
            'stucco contractor scheduling app',
            'plaster company management',
            'stucco installation scheduling',
            'EIFS contractor software',
            'stucco company management software',
          ],
        },
        hero: {
          sectionLabel: 'Stucco & Plastering',
          headline: 'STUCCO CURES ON ITS OWN TIME.\nYOUR SCHEDULE SHOULD\nACCOUNT FOR IT.',
          subtext:
            'Multi-coat applications. Cure times between coats. Weather windows that shrink overnight. Stucco and plastering crews juggle more timing dependencies than most trades — and most run on phone calls and the foreman\'s memory. OPS keeps every coat, every cure time, and every crew assignment on a schedule everyone can see.',
        },
        painPoints: [
          {
            title: 'MULTI-COAT TIMING THAT\nLIVES IN THE FOREMAN\'S HEAD.',
            bullets: [
              'Traditional stucco is three coats — scratch, brown, finish — each requiring cure time before the next can be applied. Your crew applies scratch coat Monday, brown coat Wednesday, finish coat Friday. Three visits to the same job, interleaved with other work. The timing lives in one person\'s head.',
              'If the scratch coat was applied in hot weather, the cure time shortens. If it rained, the cure time extends. Your schedule needs to flex with conditions, not follow a rigid paper calendar.',
              'Multiple jobs at different coat stages simultaneously — Job A needs brown coat today, Job B needs finish coat, Job C needs scratch — means your crew is bouncing between sites. One wrong sequencing decision and a coat gets applied too early or too late.',
              'EIFS and synthetic stucco have different application requirements, different cure times, and different weather tolerances than traditional stucco. If your crew is running both types, the scheduling complexity doubles.',
            ],
            forLine: 'For stucco company owners and project managers',
          },
          {
            title: 'WEATHER THAT CONTROLS\nEVERY DECISION YOU MAKE.',
            bullets: [
              'Stucco cannot be applied below 40°F, in direct rain, or in extreme heat without special precautions. A weather change cancels the day and cascades into every cure time and downstream coat application.',
              'Morning dew, afternoon wind, and overnight freeze risk all factor into when your crew can start and when they must stop. These are not theoretical concerns — they are the difference between a quality finish and a callback.',
              'When weather pushes a finish coat, the customer sees bare brown coat for an extra week. Managing expectations when you cannot control the timeline requires communication your crew should not have to handle while plastering.',
              'Seasonal compression in stucco is brutal. You have 6-8 months of weather window in most markets. Every weather day lost is revenue you cannot recover until next spring.',
            ],
            forLine: 'For stucco foremen and crew leaders',
          },
          {
            title: 'A BILINGUAL WORKFORCE\nWITH ENGLISH-ONLY SOFTWARE.',
            bullets: [
              'The stucco and plastering trade has one of the highest concentrations of Spanish-speaking workers in construction. If your crew cannot read the job details on the scheduling app, the app is useless.',
              'Job instructions communicated in English to a Spanish-speaking crew get lost in translation. Color names, material specifications, and customer preferences need to be accessible in the language your crew reads.',
              'Most field service software offers zero Spanish-language support. Your bilingual foreman becomes the translator between the app and the crew — adding another burden to the person who is already managing the work.',
              'When new crew members cannot self-onboard because the software is English-only, you lose the first week of productivity to language barriers on an app that should not have language barriers.',
            ],
            forLine: 'For stucco crews and field workers',
          },
        ],
        solutions: [
          {
            title: 'EVERY COAT. EVERY CURE TIME.\nON THE SCHEDULE.',
            copy: 'Scratch coat Monday. Brown coat Wednesday. Finish coat Friday. OPS tracks which job is in which coat stage, when the next coat is due, and which crew is assigned. When weather extends a cure time, adjust the schedule and every downstream coat adjusts. Your foreman\'s head is freed up for the work, not the logistics.',
            painPointRef: 'multi-coat-timing',
          },
          {
            title: 'WEATHER CANCELS A COAT.\nOPS RESCHEDULES THE JOB.',
            copy: 'Rain pushes the brown coat from Wednesday to Friday. Drag the job. The finish coat moves to the following Tuesday. Your crew sees the update on their phone. The customer sees an updated timeline. No phone calls. No whiteboard erasing. One change and the cascade resolves itself.',
            painPointRef: 'weather-dependence',
          },
          {
            title: 'SPANISH-LANGUAGE SUPPORT\nYOUR CREW CAN ACTUALLY USE.',
            copy: 'OPS supports Spanish natively — not a bolted-on translation, but a crew interface your Spanish-speaking workers can read and use from day one. Job details, schedules, notes, and instructions in the language they work in. No bilingual foreman required as translator. Your crew opens the app and knows what to do.',
            painPointRef: 'bilingual-workforce',
          },
          {
            title: 'TRADITIONAL. SYNTHETIC. EIFS.\nONE APP.',
            copy: 'Three-coat stucco, one-coat stucco, EIFS, venetian plaster, repair work — every application type in one schedule. Different cure times, different weather requirements, different crew assignments — all visible in one view. Your office books. Your crew builds. The right material arrives at the right site for the right coat.',
            painPointRef: 'operational-complexity',
          },
        ],
        comparison: {
          competitors: ['Jobber', 'Housecall Pro'],
          rows: [
            {
              feature: 'Pricing',
              ops: 'Free to start, $79/mo flat',
              comp1: '$49-$199/mo, feature-gated',
              comp2: '$49-$199/mo, feature-gated',
            },
            {
              feature: 'Multi-phase scheduling',
              ops: 'Coat stages with cure time tracking',
              comp1: 'Basic multi-day scheduling',
              comp2: 'Basic scheduling',
            },
            {
              feature: 'Spanish-language support',
              ops: 'Native Spanish crew interface',
              comp1: 'English only',
              comp2: 'English only',
            },
            {
              feature: 'Offline mode',
              ops: 'Full offline, syncs on reconnect',
              comp1: 'Limited offline',
              comp2: 'Limited offline',
            },
            {
              feature: 'Crew app simplicity',
              ops: 'Glove-ready, dark theme, no training',
              comp1: 'Clean but feature-gated',
              comp2: 'Feature-rich, learning curve',
            },
            {
              feature: 'Time to start',
              ops: 'Download and go, same day',
              comp1: 'Setup + plan selection',
              comp2: 'Setup + plan selection',
            },
          ],
        },
        faq: [
          {
            question: 'Can OPS track multi-coat stucco application schedules?',
            answer:
              'Yes. Track which jobs are in which coat stage, when the next coat is due based on cure times, and which crew is assigned to each phase. When weather extends a cure, the schedule adjusts.',
          },
          {
            question: 'Does OPS offer a Spanish-language interface for crews?',
            answer:
              'Yes. Native Spanish support so your crew can read job details, schedules, and instructions in the language they work in. No translator needed.',
          },
          {
            question: 'Does OPS handle weather-dependent stucco scheduling?',
            answer:
              'Yes. When weather cancels a coat application, drag the job and every downstream coat adjusts. Your crew sees the updated schedule on their phone.',
          },
          {
            question: 'Can OPS handle both traditional stucco and EIFS?',
            answer:
              'Yes. Traditional three-coat, one-coat, EIFS, plaster — all job types with their different cure requirements in one schedule.',
          },
          {
            question: 'We are a small stucco crew of 4-5 guys. Is OPS right for us?',
            answer:
              'Built for crews your size. No enterprise pricing, no implementation consultants, no English-only interface that half your crew cannot use. Download it, add your team, start scheduling coats. Free to start.',
          },
        ],
        cta: {
          headline: 'YOUR STUCCO CREW\nSPEAKS THE LANGUAGE OF WORK.\nSO DOES OPS.',
          subtext: 'Multi-coat scheduling. Weather-responsive adjustments. Native Spanish support. One app for every stucco and plastering job. Free to start — no demo, no contract.',
        },
      },
    },
  },
  // ─── CARPENTRY & FINISH WORK ────────────────────────────────────
  {
    slug: 'carpentry',
    name: 'Carpentry & Finish Work',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Carpentry & Finish Work Software for Crews | OPS',
          description:
            'OPS is built for carpentry and finish crews managing trim, framing, custom builds, and punch lists across multiple job sites. Schedule crews, track details, and keep every job documented. Free to start.',
          keywords: [
            'carpentry contractor software',
            'finish carpentry scheduling app',
            'carpentry crew management',
            'carpentry business software',
            'finish work scheduling',
            'framing crew scheduling app',
            'carpentry company management',
            'trim carpenter scheduling software',
            'carpentry dispatch software',
            'carpentry contractor scheduling',
          ],
        },
        hero: {
          sectionLabel: 'Carpentry & Finish Work',
          headline: 'CARPENTRY IS THE BIGGEST\nTRADE NOBODY BUILDS\nSOFTWARE FOR.',
          subtext:
            'Framing crews. Trim carpenters. Custom build-outs. Punch list specialists. Carpentry is everywhere in construction — and yet no software company builds for it. Your crew bounces between job sites, juggles GC timelines, and tracks custom details on scraps of paper. OPS changes that.',
        },
        painPoints: [
          {
            title: 'BOUNCING BETWEEN\nJOB SITES ALL WEEK.',
            bullets: [
              'A finish carpenter might hit 3-4 different job sites in a week — trim at the new build Monday, built-ins at the remodel Tuesday, punch list at the closing-day house Wednesday. Each site has different details, different GCs, and different expectations.',
              'As a subcontractor, you are at the mercy of the GC\'s schedule. "We need you Thursday" becomes "actually, Friday" becomes "actually, Monday, the paint is not dry." Your crew\'s week is constantly shifting.',
              'Multiple active jobs mean multiple sets of measurements, material lists, and customer preferences to track. When the details for Job A get mixed up with Job B, the wrong crown molding gets installed.',
              'Punch lists arrive as handwritten notes, text messages, and photo markup. Every GC sends them differently. Your crew needs a single list, not a treasure hunt across three communication channels.',
            ],
            forLine: 'For carpentry contractors and business owners',
          },
          {
            title: 'CUSTOM DETAILS THAT\nCANNOT SURVIVE A TEXT MESSAGE.',
            bullets: [
              'Finish carpentry is detail work. Specific miter angles on crown molding. Exact reveal dimensions on door casing. Custom stain matches from a sample the homeowner chose six weeks ago. These details need to travel with the carpenter, not live in an email thread.',
              'Customer preferences change mid-project. The homeowner wanted shaker-style but switched to flat panel. If that change is communicated by text to the foreman but never reaches the carpenter cutting the material, the wrong panels get built.',
              'Reference photos from the designer, the architect, or the homeowner\'s Pinterest board are critical for finish work. Your carpenter needs to see these on site, not remember them from a conversation three days ago.',
              'Material specifications — species, grade, profile, finish — must be exact. "Quarter-round" does not specify shoe mold versus quarter-round, and the difference matters. These specs need to be attached to the job, not in a voicemail.',
            ],
            forLine: 'For finish carpenters and crew leaders',
          },
          {
            title: 'A MASSIVE TRADE\nWITH ZERO DEDICATED SOFTWARE.',
            bullets: [
              'Carpentry is the largest skilled trade in the United States — over a million employed carpenters. And yet there is not a single FSM platform that markets specifically to carpentry contractors.',
              'Generic tools like Jobber and Housecall Pro are built for service calls — show up, fix something, send an invoice. Carpentry work is project-based, multi-day, detail-intensive, and subcontractor-driven. The generic tools do not fit the workflow.',
              'Construction project management tools like Procore and Buildertrend are built for GCs, not subs. A 3-person trim crew does not need enterprise project management. They need a schedule, job details, and photo documentation.',
              'The result is that most carpentry crews use nothing — paper, texts, and memory. Not because they do not want software, but because nothing was built for how they work.',
            ],
            forLine: 'For carpentry company owners',
          },
        ],
        solutions: [
          {
            title: 'EVERY JOB SITE. EVERY DETAIL.\nON YOUR CREW\'S PHONE.',
            copy: 'Measurements, material specs, reference photos, customer preferences, access instructions, GC contact — everything your carpenter needs for every job site, on their phone before they arrive. When they move from the new build to the remodel to the punch list, the details travel with them. No mix-ups between Job A and Job B.',
            painPointRef: 'multi-site-juggling',
          },
          {
            title: 'CUSTOM DETAILS THAT\nSURVIVE THE JOB SITE.',
            copy: 'Reference photos attached to the job. Material specs in the job notes. Customer change orders logged with dates. When the homeowner switches from shaker to flat panel, the change is documented and your carpenter sees it before cutting material. No lost details. No wrong profiles. No expensive rework.',
            painPointRef: 'custom-details',
          },
          {
            title: 'FINALLY. SOFTWARE THAT\nFITS CARPENTRY WORK.',
            copy: 'Not a service call tool shoehorned into project work. Not an enterprise platform designed for GCs. OPS is scheduling, job details, photo documentation, and crew coordination — exactly what a carpentry crew needs and nothing they do not. Download it today and see every active job on one screen.',
            painPointRef: 'no-dedicated-software',
          },
          {
            title: 'FRAMING. TRIM. CUSTOM. PUNCH LIST.\nONE APP.',
            copy: 'Rough framing, finish trim, custom built-ins, punch list work, repair callbacks — every carpentry job type in one schedule. Your office sees the pipeline. Your crew sees their week. Job details, reference photos, and material lists travel with the carpenter. Not in a text thread.',
            painPointRef: 'operational-complexity',
          },
        ],
        comparison: {
          competitors: ['Jobber', 'Buildertrend'],
          rows: [
            {
              feature: 'Pricing',
              ops: 'Free to start, $79/mo flat',
              comp1: '$49-$199/mo, feature-gated',
              comp2: '$99-$499/mo',
            },
            {
              feature: 'Project-based scheduling',
              ops: 'Multi-day jobs with detail tracking',
              comp1: 'Service call focused',
              comp2: 'Full project management, GC-oriented',
            },
            {
              feature: 'Photo & reference sharing',
              ops: 'Photos and specs attached to every job',
              comp1: 'Photo capture on paid plans',
              comp2: 'Photo management available',
            },
            {
              feature: 'Offline mode',
              ops: 'Full offline, syncs on reconnect',
              comp1: 'Limited offline',
              comp2: 'Requires connectivity',
            },
            {
              feature: 'Crew app simplicity',
              ops: 'Open and see your jobs, no training',
              comp1: 'Clean but service-call oriented',
              comp2: 'Feature-heavy, GC-oriented',
            },
            {
              feature: 'Time to start',
              ops: 'Download and go, same day',
              comp1: 'Setup + plan selection',
              comp2: 'Onboarding + setup required',
            },
          ],
        },
        faq: [
          {
            question: 'Is OPS built for project-based carpentry work, not just service calls?',
            answer:
              'Yes. Multi-day installations, custom builds, GC-coordinated finish work — OPS handles project-based scheduling with job details, reference photos, and material specs. Not a service call tool forced into project work.',
          },
          {
            question: 'Can my carpenters see reference photos and specs on site?',
            answer:
              'Yes. Designer references, customer selections, material specifications, and measurements are attached to the job and visible on your crew\'s phone. Details travel with the carpenter.',
          },
          {
            question: 'Does OPS handle subcontractor scheduling with GC timelines?',
            answer:
              'Yes. When the GC shifts your start date, drag the job and your crew sees the update. Multiple GC projects with overlapping timelines all visible in one schedule.',
          },
          {
            question: 'Does OPS work on construction sites with poor signal?',
            answer:
              'Yes. New construction, renovation sites, and rural properties often have no connectivity. OPS works fully offline and syncs when signal returns.',
          },
          {
            question: 'We are a 2-person finish crew. Is OPS right for us?',
            answer:
              'Built for you. Two carpenters bouncing between 3-4 job sites with different GC timelines, different material specs, and different customer preferences. OPS keeps it all in one place.',
          },
        ],
        cta: {
          headline: 'CARPENTRY FINALLY HAS\nSOFTWARE BUILT FOR IT.',
          subtext: 'Multi-site scheduling. Custom detail tracking. Reference photos on every job. One app for framing, trim, and finish work. Free to start — no demo, no contract.',
        },
      },
    },
  },

  // ─── CABINET & COUNTERTOP INSTALLATION ────────────────────────
  {
    slug: 'cabinets',
    name: 'Cabinet & Countertop Installation',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Cabinet & Countertop Installation Software for Crews | OPS',
          description:
            'OPS is built for cabinet and countertop installation crews managing template-to-install timelines, material deliveries, and multi-trade coordination. Schedule crews, track jobs, and document installs. Free to start.',
          keywords: [
            'cabinet installation software',
            'countertop installer scheduling',
            'cabinet installer crew management',
            'countertop company scheduling app',
            'cabinet installation scheduling',
            'countertop fabrication scheduling',
            'cabinet company management software',
            'countertop installer dispatch',
            'cabinet and countertop business software',
            'countertop installation crew app',
          ],
        },
        hero: {
          sectionLabel: 'Cabinet & Countertop Installation',
          headline: 'TEMPLATE. FABRICATE. INSTALL.\nNOTHING CAN BE OUT OF ORDER.',
          subtext:
            'Cabinet and countertop work is a sequence that cannot skip steps. Template before fabrication. Fabrication before install. Cabinets before countertops. One step out of order and your crew shows up to a kitchen that is not ready. OPS keeps the sequence tight and every crew informed.',
        },
        painPoints: [
          {
            title: 'A PIPELINE WITH ZERO\nMARGIN FOR SEQUENCE ERRORS.',
            bullets: [
              'Countertop work follows a strict pipeline: template measurement, fabrication (1-3 weeks), installation. If the template dimensions are wrong, the slab is wrong. If the slab is not ready, the install crew sits idle. Every step depends on the last.',
              'Cabinet installations depend on other trades being done — plumbing rough-in, electrical, flooring. If the plumber has not finished, your cabinet crew cannot start. But nobody told your crew until they arrived on site.',
              'Multiple kitchens in various pipeline stages — one in template, one in fabrication, one ready for install — require tracking that spreadsheets cannot handle. When you lose track of which kitchen is in which stage, someone gets forgotten.',
              'Coordinating between the template team, the fabrication shop, and the install crew is three separate communication channels. Miss one handoff and the whole job stalls.',
            ],
            forLine: 'For cabinet and countertop company owners',
          },
          {
            title: 'MEASUREMENTS THAT\nCOST THOUSANDS IF WRONG.',
            bullets: [
              'A granite or quartz countertop slab costs $2,000-$8,000. A template error means scrapping the slab and starting over — new material, new fabrication time, new delivery. One wrong measurement is a $5,000 mistake.',
              'Template measurements collected on paper or in a basic app get transposed, misread, or lost between the template tech and the fabrication shop. The digital game of telephone introduces errors at every handoff.',
              'Edge profiles, sink cutouts, cooktop openings, backsplash heights — every countertop has 10-20 critical dimensions. Missing one means the slab does not fit on install day.',
              'Customer change orders between template and fabrication — different edge profile, added bar top, different sink — must be communicated to the fab shop before they cut. Paper change orders arrive too late.',
            ],
            forLine: 'For template technicians and fabrication managers',
          },
          {
            title: 'INSTALLS THAT DEPEND\nON EVERYONE ELSE BEING DONE.',
            bullets: [
              'Your install crew arrives and the cabinets are not level. The backsplash tile is not done. The plumbing stubs are in the wrong place. None of this was communicated before your crew loaded a 400-pound slab onto the truck.',
              'Countertop slabs are heavy, fragile, and expensive to transport. Every wasted trip — crew arrives but cannot install — costs fuel, labor, and risk of damage to the slab.',
              'Install scheduling must account for the slab being fabricated, the job site being ready, and the crew being available. Three dependencies that must align. If any one is off, the install does not happen.',
              'Customers rescheduling or GCs delaying site readiness need to be communicated to the install crew before they leave the shop. A phone call at 6 AM is not a system.',
            ],
            forLine: 'For install crews and dispatchers',
          },
        ],
        solutions: [
          {
            title: 'TEMPLATE → FABRICATION → INSTALL.\nEVERY STAGE TRACKED.',
            copy: 'OPS shows every kitchen in your pipeline — which ones are waiting on template, which are in fabrication, which are ready for install. When a template is completed, the fabrication clock starts. When fabrication is done, the install gets scheduled. No kitchens fall through the cracks between stages.',
            painPointRef: 'pipeline-sequencing',
          },
          {
            title: 'MEASUREMENTS AND SPECS\nTHAT TRAVEL WITH THE JOB.',
            copy: 'Template dimensions, edge profiles, sink cutout specs, customer selections, and reference photos — all attached to the job in OPS. When the fab shop pulls up the job, every dimension is there. When the install crew loads the slab, they see the layout before they leave. No paper handoffs. No transposition errors.',
            painPointRef: 'measurement-accuracy',
          },
          {
            title: 'INSTALL ONLY WHEN\nEVERYTHING IS READY.',
            copy: 'OPS tracks site readiness alongside fabrication status. Your dispatcher sees which jobs have completed slabs AND ready job sites before scheduling the install crew. No more loading a 400-pound slab onto the truck only to find the cabinets are not level. Install when everything aligns.',
            painPointRef: 'install-dependencies',
          },
          {
            title: 'CABINETS AND COUNTERTOPS.\nONE SCHEDULE.',
            copy: 'Cabinet installations, countertop templates, fabrication tracking, and install scheduling — the full kitchen pipeline in one app. Your office sees every job at every stage. Your template tech, your fab shop, and your install crew all work from the same record. No missed handoffs.',
            painPointRef: 'operational-complexity',
          },
        ],
        comparison: {
          competitors: ['Jobber', 'Moraware'],
          rows: [
            {
              feature: 'Pricing',
              ops: 'Free to start, $79/mo flat',
              comp1: '$49-$199/mo, feature-gated',
              comp2: 'Custom pricing, demo required',
            },
            {
              feature: 'Pipeline stage tracking',
              ops: 'Template → Fabrication → Install tracking',
              comp1: 'Basic job status tracking',
              comp2: 'Countertop-specific pipeline',
            },
            {
              feature: 'Photo & spec documentation',
              ops: 'Photos, measurements, specs per job',
              comp1: 'Photo capture on paid plans',
              comp2: 'Template/drawing management',
            },
            {
              feature: 'Offline mode',
              ops: 'Full offline, syncs on reconnect',
              comp1: 'Limited offline',
              comp2: 'Requires connectivity',
            },
            {
              feature: 'Crew app simplicity',
              ops: 'Open and see your jobs, no training',
              comp1: 'Clean but service-call oriented',
              comp2: 'Countertop-specific, learning curve',
            },
            {
              feature: 'Time to start',
              ops: 'Download and go, same day',
              comp1: 'Setup + plan selection',
              comp2: 'Demo + implementation required',
            },
          ],
        },
        faq: [
          {
            question: 'Can OPS track the template-to-install pipeline?',
            answer:
              'Yes. Every job tracks its stage — template scheduled, template complete, in fabrication, fabrication complete, install scheduled. Your office sees the full pipeline and nothing gets lost between stages.',
          },
          {
            question: 'Can my template tech attach measurements and photos to jobs?',
            answer:
              'Yes. Dimensions, edge selections, sink cutout specs, and reference photos are attached to the job record. The fab shop and install crew see exactly what the template tech captured.',
          },
          {
            question: 'Does OPS prevent scheduling installs before sites are ready?',
            answer:
              'OPS tracks job status so your dispatcher can verify both fabrication completion and site readiness before scheduling the install crew. No more wasted trips with uninstallable slabs.',
          },
          {
            question: 'Does OPS work on construction sites without signal?',
            answer:
              'Yes. Template visits and cabinet installs happen in houses under construction where signal is unreliable. OPS works fully offline and syncs when your crew gets connectivity.',
          },
          {
            question: 'We do cabinets and countertops. Do we need separate software for each?',
            answer:
              'No. OPS handles both in one schedule. Cabinet installations, countertop templates, fabrication tracking, and install scheduling — the full kitchen pipeline in one app.',
          },
        ],
        cta: {
          headline: 'TEMPLATE. FABRICATE. INSTALL.\nNOTHING OUT OF ORDER.',
          subtext: 'Pipeline tracking. Measurement documentation. Install-when-ready scheduling. One app for cabinets and countertops. Free to start — no demo, no contract.',
        },
      },
    },
  },
  // ─── OVERHEAD & COMMERCIAL DOOR ─────────────────────────────────
  {
    slug: 'commercial-door',
    name: 'Overhead & Commercial Door',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Overhead & Commercial Door Service Software for Crews | OPS',
          description:
            'OPS is built for commercial door service crews managing installations, maintenance contracts, and emergency repair calls. Schedule techs, track service contracts, and dispatch emergencies. Free to start.',
          keywords: [
            'commercial door service software',
            'overhead door company scheduling',
            'commercial door crew management',
            'overhead door service dispatch',
            'commercial door business software',
            'overhead door scheduling app',
            'dock door service software',
            'commercial door contractor scheduling',
            'overhead door company management',
            'loading dock door service app',
          ],
        },
        hero: {
          sectionLabel: 'Overhead & Commercial Door',
          headline: 'A STUCK DOCK DOOR\nSTOPS A WAREHOUSE.\nYOUR DISPATCH SHOULD NOT.',
          subtext:
            'Loading dock doors, rollup gates, fire-rated doors, automatic entries — when a commercial door stops working, a business stops operating. Your service crew handles emergency calls, recurring maintenance contracts, and new installations simultaneously. OPS keeps all three running on one schedule your whole team can see.',
        },
        painPoints: [
          {
            title: 'EMERGENCY CALLS THAT\nOVERRIDE EVERYTHING.',
            bullets: [
              'A stuck loading dock door at a distribution center does not wait until Monday. A jammed security gate at a retail store needs a tech within hours. Commercial door emergencies are revenue-stopping events for your customers and margin-making events for you.',
              'Dispatching the right tech to an emergency requires knowing who is available, who is certified on that door type, and who has the parts. Right now that requires multiple phone calls and a mental inventory of every tech\'s truck stock.',
              'Emergency calls displace scheduled maintenance and installation work. Without a system that lets you reassign and reschedule the displaced jobs, your maintenance customers get pushed and your service contracts suffer.',
              'After-hours emergency calls are the highest-margin work in commercial door service. But if your dispatch process is "owner answers their personal phone," you are one missed call away from losing a $2,000 emergency job.',
            ],
            forLine: 'For commercial door company owners and dispatchers',
          },
          {
            title: 'SERVICE CONTRACTS\nNOBODY IS TRACKING.',
            bullets: [
              'Recurring maintenance contracts are the backbone of commercial door revenue — quarterly inspections, annual safety tests, seasonal lubrication. But most companies track contract schedules in spreadsheets that nobody checks until the customer complains.',
              'Each door type has different maintenance requirements. Fire-rated doors need annual inspections per NFPA 80. Loading dock doors need quarterly maintenance. Automatic entries need monthly safety checks. Overlapping schedules across hundreds of doors is impossible to manage manually.',
              'When a service contract comes up for renewal, the customer asks "how many visits did you make this year?" If your records are paper-based, you are guessing. If you are guessing, they are questioning the value.',
              'Missed contract visits do not just lose a single service fee — they risk losing the entire contract. Commercial clients track vendor performance. One missed quarterly visit and you are on the replacement shortlist.',
            ],
            forLine: 'For service managers and account coordinators',
          },
          {
            title: 'PARTS AND DOOR SPECS\nYOUR TECH NEEDS ON SITE.',
            bullets: [
              'Commercial doors vary wildly — rollup, sectional, fire-rated, high-speed, dock levelers, dock seals, automatic sliding, revolving. Your tech needs to know the door type, the opener model, and the common failure points before they arrive.',
              'Parts for commercial doors are not universal. A spring for a Wayne Dalton is not the same as one for a Raynor. If your tech arrives without the right parts, they leave and return — two trips for one job.',
              'Door specifications, service history, and previous repair notes attached to each door location save diagnostic time. Without this data on their phone, your tech is troubleshooting blind.',
              'Safety is paramount in commercial door service. Torsion springs under thousands of pounds of tension, electrical systems, automatic sensors. Your tech needs to know what they are walking into before they open the access panel.',
            ],
            forLine: 'For door service technicians and field crews',
          },
        ],
        solutions: [
          {
            title: 'EMERGENCY DISPATCH IN\nSECONDS. NOT PHONE CALLS.',
            copy: 'Stuck dock door at a warehouse. OPS shows every tech, their current job, and their location. Assign the closest available tech with the right parts and they see the emergency on their phone immediately — building address, door type, opener model, and service history. The displaced maintenance job reschedules with a drag and drop.',
            painPointRef: 'emergency-calls',
          },
          {
            title: 'SERVICE CONTRACTS\nTHAT NEVER GET MISSED.',
            copy: 'Set maintenance intervals per door, per building, per contract — quarterly inspections, annual fire door testing, monthly safety checks. OPS generates the service visits automatically. When the customer asks how many visits you made this year, the answer is two taps away. Not a guess.',
            painPointRef: 'service-contracts',
          },
          {
            title: 'DOOR SPECS AND HISTORY\nON YOUR TECH\'S PHONE.',
            copy: 'Door type, opener model, spring specs, service history, previous repair notes, and photos — all attached to the location in OPS. Your tech knows what they are walking into before they arrive. No blind troubleshooting. No wrong parts. No second trips.',
            painPointRef: 'parts-and-specs',
          },
          {
            title: 'INSTALLS. MAINTENANCE.\nEMERGENCIES. ONE APP.',
            copy: 'New door installations, recurring maintenance contracts, emergency dispatch, and warranty callbacks — every service type in one schedule. Your office sees the full operation. Your techs see their day. Contract compliance, emergency response, and installation project management all in one place.',
            painPointRef: 'operational-complexity',
          },
        ],
        comparison: {
          competitors: ['ServiceTitan', 'Jobber'],
          rows: [
            {
              feature: 'Pricing',
              ops: 'Free to start, $79/mo flat',
              comp1: '$298+/mo, annual contract',
              comp2: '$49-$199/mo, feature-gated',
            },
            {
              feature: 'Service contract tracking',
              ops: 'Per-door intervals, auto-generates visits',
              comp1: 'Recurring jobs available',
              comp2: 'Recurring on higher tiers',
            },
            {
              feature: 'Emergency dispatch',
              ops: 'Real-time tech view, instant assignment',
              comp1: 'Dispatch available, complex setup',
              comp2: 'Basic scheduling',
            },
            {
              feature: 'Equipment/door records',
              ops: 'Door specs, history, photos per location',
              comp1: 'Equipment tracking available',
              comp2: 'Customer notes available',
            },
            {
              feature: 'Offline mode',
              ops: 'Full offline, syncs on reconnect',
              comp1: 'Limited offline',
              comp2: 'Limited offline',
            },
            {
              feature: 'Time to start',
              ops: 'Download and go, same day',
              comp1: 'Demo + multi-month implementation',
              comp2: 'Setup + plan selection',
            },
          ],
        },
        faq: [
          {
            question: 'Can OPS handle recurring commercial door maintenance contracts?',
            answer:
              'Yes. Set maintenance intervals per door and per building. OPS auto-generates service visits — quarterly inspections, annual fire door testing, monthly safety checks. Contract compliance tracked automatically.',
          },
          {
            question: 'Does OPS support emergency commercial door dispatch?',
            answer:
              'Yes. See every tech on one screen, assign the closest available, and they get the emergency details on their phone instantly — door type, location, and full service history.',
          },
          {
            question: 'Can my techs see door specs and service history in the field?',
            answer:
              'Yes. Door type, opener model, spring specs, previous repairs, and photos are attached to each location. Your tech knows what they are working on before they arrive.',
          },
          {
            question: 'Does OPS work in warehouses and loading docks with poor signal?',
            answer:
              'Yes. Commercial buildings, warehouses, and loading docks often have poor cell signal. OPS works fully offline and syncs when your tech gets back to connectivity.',
          },
          {
            question: 'We are a small commercial door crew. Do we need ServiceTitan?',
            answer:
              'No. ServiceTitan requires a demo, months of implementation, annual contracts, and $298+/month. OPS gives you scheduling, dispatch, service contract tracking, and door records for $79/month flat. Free to start.',
          },
        ],
        cta: {
          headline: 'COMMERCIAL DOORS DO NOT WAIT.\nNEITHER SHOULD YOUR DISPATCH.',
          subtext: 'Emergency dispatch. Service contract tracking. Door specs on every tech\'s phone. One app for installs, maintenance, and emergencies. Free to start — no demo, no contract.',
        },
      },
    },
  },

  // ─── ELEVATOR & ESCALATOR SERVICE ─────────────────────────────
  {
    slug: 'elevator',
    name: 'Elevator & Escalator Service',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Elevator & Escalator Service Software for Crews | OPS',
          description:
            'OPS is built for elevator and escalator service crews managing compliance inspections, maintenance contracts, and emergency entrapment calls. Schedule techs, track unit history, and document every visit. Free to start.',
          keywords: [
            'elevator service software',
            'elevator maintenance scheduling',
            'escalator service management',
            'elevator company scheduling app',
            'elevator inspection tracking software',
            'elevator service dispatch',
            'elevator maintenance crew management',
            'elevator contractor software',
            'elevator service business management',
            'vertical transportation service app',
          ],
        },
        hero: {
          sectionLabel: 'Elevator & Escalator Service',
          headline: 'ELEVATOR SERVICE IS\nCOMPLIANCE, CONTRACTS,\nAND EMERGENCIES.\nMANAGE ALL THREE.',
          subtext:
            'Monthly maintenance. Annual inspections. Five-year load tests. Emergency entrapment calls at midnight. Elevator and escalator service combines the strictest compliance requirements in the building with the most time-sensitive emergency dispatch. OPS keeps every unit tracked, every inspection documented, and every tech dispatched from one system.',
        },
        painPoints: [
          {
            title: 'COMPLIANCE REQUIREMENTS\nTHAT NEVER STOP.',
            bullets: [
              'ASME A17.1 requires monthly maintenance visits, annual inspections, and periodic testing on every elevator. State and local codes add additional requirements. Miss a scheduled visit and the building fails inspection, the elevator gets shut down, and your customer is furious.',
              'Every elevator unit in your portfolio has different maintenance intervals, different inspection dates, and different code requirements based on type (traction, hydraulic, MRL), age, and jurisdiction. Managing this across hundreds of units in a spreadsheet is begging for violations.',
              'Inspection documentation must be precise — test results, measurements, deficiency findings, corrective actions, technician qualifications. State inspectors review these records. Paper logs do not convey professionalism or compliance.',
              'Callback rates are a metric building owners track. Too many emergency calls between maintenance visits means your preventive maintenance is not working. Without data on callback frequency per unit, you cannot identify problem elevators.',
            ],
            forLine: 'For elevator company owners and compliance managers',
          },
          {
            title: 'ENTRAPMENT CALLS\nTHAT CANNOT WAIT.',
            bullets: [
              'Someone is stuck in an elevator. The building manager is panicking. The fire department is on the way. You need a qualified tech on site within the response time your contract guarantees — often 30-60 minutes.',
              'Dispatching an entrapment response requires knowing which tech is closest, which tech is qualified on that elevator type, and which tech can arrive within the guaranteed response time. Phone calls waste minutes you do not have.',
              'After-hours entrapment calls are the most stressful events in elevator service. Your on-call tech is asleep. The building has no maintenance staff at 2 AM. The response time clock started when the phone rang.',
              'Emergency calls displace scheduled maintenance. Without a system to track the displacement, tomorrow\'s maintenance visits get missed and next month\'s compliance is at risk.',
            ],
            forLine: 'For dispatchers and service managers',
          },
          {
            title: 'UNIT HISTORY LOCKED IN\nPAPER MAINTENANCE LOGS.',
            bullets: [
              'Every elevator has a 20-40 year service life with decades of maintenance history. When a unit starts faulting, your tech needs the repair history to diagnose efficiently. If that history is in paper logs in a filing cabinet, diagnosis takes hours instead of minutes.',
              'Building ownership changes, management company changes, and your company taking over service from a competitor all create documentation gaps. The new building manager asks "what was done last year?" and you cannot answer.',
              'Parts installed on each unit — door operators, controllers, motors, governors — need to be tracked for warranty, recall, and replacement scheduling. Paper tracking means parts disappear into the unit and nobody remembers the install date.',
              'Maintenance visits inside elevator machine rooms and pits happen in environments with no cell signal. If your app cannot work offline, your tech logs nothing while in the machine room — the one place where documentation matters most.',
            ],
            forLine: 'For elevator technicians and field crews',
          },
        ],
        solutions: [
          {
            title: 'EVERY UNIT. EVERY VISIT.\nEVERY COMPLIANCE DEADLINE.',
            copy: 'Set monthly maintenance, annual inspections, and periodic testing per unit — OPS generates the visits automatically. Every elevator in your portfolio tracked by type, age, jurisdiction, and service schedule. When the state inspector pulls records, every visit is documented with dates, findings, and technician details. Not in a binder. In a system.',
            painPointRef: 'compliance-requirements',
          },
          {
            title: 'ENTRAPMENT DISPATCH\nIN UNDER A MINUTE.',
            copy: 'Entrapment call comes in. OPS shows every tech, their location, and their current job. Assign the closest qualified tech and they see the emergency on their phone immediately — building address, elevator type, machine room location, and access codes. Response time clock running. Your tech is rolling. Not calling back for details.',
            painPointRef: 'entrapment-calls',
          },
          {
            title: 'UNIT HISTORY THAT\nOUTLASTS EVERY TECH WHO WORKED ON IT.',
            copy: 'Every maintenance visit, every repair, every part replacement, every inspection finding — attached to the unit, searchable across decades. When an elevator starts faulting, your tech pulls up the full history on their phone. When the building changes management, the service record transfers seamlessly. Institutional knowledge lives in the system, not in retired technicians.',
            painPointRef: 'unit-history',
          },
          {
            title: 'MAINTENANCE. INSPECTIONS.\nMODERNIZATION. ONE APP.',
            copy: 'Monthly maintenance routes, annual inspections, entrapment dispatch, modernization projects — every type of elevator and escalator work in one schedule. Your office sees the full operation across every building and every unit. Your techs see their day. Compliance, emergency response, and project work all managed from one system.',
            painPointRef: 'operational-complexity',
          },
        ],
        comparison: {
          competitors: ['ServiceTitan', 'BuildOps'],
          rows: [
            {
              feature: 'Pricing',
              ops: 'Free to start, $79/mo flat',
              comp1: '$298+/mo, annual contract',
              comp2: '$299/user/mo',
            },
            {
              feature: 'Unit-level tracking',
              ops: 'Per-unit maintenance history and scheduling',
              comp1: 'Equipment tracking available',
              comp2: 'Asset management for commercial',
            },
            {
              feature: 'Emergency dispatch',
              ops: 'Real-time tech view, instant assignment',
              comp1: 'Dispatch available, complex setup',
              comp2: 'Commercial dispatch available',
            },
            {
              feature: 'Offline mode',
              ops: 'Full offline — works in machine rooms and pits',
              comp1: 'Limited offline',
              comp2: 'Limited offline',
            },
            {
              feature: 'Compliance documentation',
              ops: 'Findings, tests, and photos per unit per visit',
              comp1: 'Form/report capabilities',
              comp2: 'Documentation tools available',
            },
            {
              feature: 'Time to start',
              ops: 'Download and go, same day',
              comp1: 'Demo + multi-month implementation',
              comp2: 'Demo + implementation required',
            },
          ],
        },
        faq: [
          {
            question: 'Can OPS track maintenance schedules per elevator unit?',
            answer:
              'Yes. Monthly maintenance, annual inspections, and periodic testing — set per unit based on type, age, and jurisdiction. OPS auto-generates visits and tracks compliance across your entire portfolio.',
          },
          {
            question: 'Does OPS handle entrapment emergency dispatch?',
            answer:
              'Yes. See every tech on one screen, assign the closest qualified tech, and they get the emergency details instantly — building, elevator type, machine room access, and full service history.',
          },
          {
            question: 'Does OPS work offline in elevator machine rooms and pits?',
            answer:
              'Yes. Machine rooms and elevator pits are the worst connectivity environments in any building. OPS works fully offline — your tech logs findings, photos, and repair notes, and everything syncs when they exit.',
          },
          {
            question: 'Can I track service history across decades per unit?',
            answer:
              'Yes. Every visit, every repair, every part replacement attached to the unit — searchable and permanent. When a unit faults 5 years from now, the full history is available.',
          },
          {
            question: 'We are an independent elevator company competing with Otis and Schindler. Is OPS right for us?',
            answer:
              'Built for independents. The major OEMs have proprietary systems. Independent elevator companies need scheduling, dispatch, compliance tracking, and unit history without enterprise pricing. OPS gives you that at $79/month. Free to start.',
          },
        ],
        cta: {
          headline: 'ELEVATOR SERVICE IS\nCOMPLIANCE-CRITICAL.\nYOUR SYSTEM SHOULD BE TOO.',
          subtext: 'Unit-level compliance tracking. Entrapment dispatch. Machine room offline mode. One app for maintenance, inspections, and emergencies. Free to start — no demo, no contract.',
        },
      },
    },
  },
  // ─── AUDIO VISUAL & HOME THEATER ────────────────────────────────
  {
    slug: 'audio-visual',
    name: 'Audio Visual & Home Theater',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Audio Visual & Home Theater Installation Software for Crews | OPS',
          description:
            'OPS is built for AV installation crews managing home theater, commercial AV, and smart home projects. Schedule techs, track system configs, and document every installation. Free to start.',
          keywords: [
            'audio visual installation software',
            'home theater installer scheduling',
            'AV company management software',
            'AV installation crew scheduling',
            'home theater business software',
            'AV installer dispatch app',
            'commercial AV scheduling software',
            'AV integration company management',
            'home automation installer app',
            'AV technician scheduling',
          ],
        },
        hero: {
          sectionLabel: 'Audio Visual & Home Theater',
          headline: 'AV INSTALLS ARE\nTOO TECHNICAL TO RUN\nON STICKY NOTES.',
          subtext:
            'Home theaters, commercial conference rooms, distributed audio, smart home automation — every AV installation is a custom project with unique equipment, unique wiring, and a customer who expects it to work perfectly on day one. OPS keeps your install schedule tight, your system configurations documented, and your techs informed before they walk through the door.',
        },
        painPoints: [
          {
            title: 'EVERY INSTALL IS CUSTOM.\nEVERY DETAIL IS CRITICAL.',
            bullets: [
              'No two AV installations are the same. Screen size, speaker placement, wire runs, control system programming, network configuration, source component selection — each job is a custom engineering project. Details that do not travel with the tech get lost.',
              'Customer expectations on AV are sky-high. They have seen the showroom demo. They have watched the YouTube setup. They expect their home theater to look and sound exactly like that — and they are paying $10,000-$50,000 for it.',
              'Pre-wire during construction and finish installation after drywall are two separate visits weeks or months apart. The pre-wire specs must be documented precisely so the finish installer knows exactly where every wire terminates.',
              'Equipment lists for AV jobs are long and model-specific. The wrong HDMI cable version, the wrong speaker impedance, the wrong control system module — any single wrong component can require a return visit.',
            ],
            forLine: 'For AV company owners and project managers',
          },
          {
            title: 'SERVICE CALLS ON\nSYSTEMS NOBODY DOCUMENTED.',
            bullets: [
              'A customer calls with a problem three years after installation. Your current tech did not do the original install. Without documentation of the system configuration, equipment models, IP addresses, and control system programming, troubleshooting starts from scratch.',
              'Smart home and AV systems are interconnected. A network change affects the control system. A firmware update bricks the processor. A new streaming service needs a new input configured. Without the system map, your tech is debugging blind.',
              'Service calls on competitor installations are common — and profitable. But walking into a system someone else installed with zero documentation means hours of diagnostic time just to understand what is in the rack.',
              'Equipment rack photos, network diagrams, and control system configurations should be attached to the client record. Instead, they are on a former employee\'s laptop or in an email thread from 2023.',
            ],
            forLine: 'For AV technicians and service managers',
          },
          {
            title: 'SCHEDULING ACROSS\nRESIDENTIAL AND COMMERCIAL.',
            bullets: [
              'AV companies serve two very different markets — residential home theater and commercial conference room/venue installations. The scheduling requirements, the project timelines, and the customer communication styles are completely different.',
              'Residential clients want evening and weekend availability. Commercial clients need work done outside business hours. Your crew ends up working split schedules across both markets with no single view of availability.',
              'Commercial AV projects span weeks with multiple phases — infrastructure, rack build, system installation, programming, commissioning. Residential installs are 1-3 days. Managing both project types in the same system requires flexibility most tools do not offer.',
              'Seasonal demand for AV is real. Commercial clients want conference rooms done before the new fiscal year. Residential clients want home theaters done before football season or the holidays. Two surges that overlap.',
            ],
            forLine: 'For AV dispatchers and office managers',
          },
        ],
        solutions: [
          {
            title: 'EVERY SYSTEM DETAIL.\nON YOUR TECH\'S PHONE.',
            copy: 'Equipment lists, wire run specs, IP addresses, control system models, rack layout photos, customer preferences — all attached to the job in OPS. Your tech walks into every installation with the full picture on their phone. Pre-wire specs documented on visit one are available on visit two, three months later. No lost details. No wrong components.',
            painPointRef: 'custom-installs',
          },
          {
            title: 'SYSTEM RECORDS THAT\nOUTLAST EVERY TECH.',
            copy: 'Rack photos, network diagrams, equipment models, firmware versions, and control system configurations — attached to the client record in OPS, searchable years later. When a service call comes in on a 3-year-old installation, your tech sees the entire system before leaving the shop. Troubleshooting starts at the problem, not at "what\'s in the rack?"',
            painPointRef: 'service-documentation',
          },
          {
            title: 'RESIDENTIAL AND COMMERCIAL.\nONE SCHEDULE.',
            copy: 'Home theater installs, conference room build-outs, distributed audio, smart home commissioning, service calls — all in one schedule. Multi-day commercial projects tracked by phase. Single-day residential installs slotted by crew. Your office sees every active project across both markets. Your techs see their day.',
            painPointRef: 'mixed-scheduling',
          },
          {
            title: 'FROM PRE-WIRE\nTO COMMISSIONING. ONE APP.',
            copy: 'Pre-wire documentation, equipment procurement tracking, installation scheduling, programming notes, commissioning checklists, and service records — the full AV project lifecycle in one system. What gets documented on the pre-wire visit informs the finish install months later. No paper handoffs. No lost configurations.',
            painPointRef: 'operational-complexity',
          },
        ],
        comparison: {
          competitors: ['ServiceTitan', 'Jobber'],
          rows: [
            {
              feature: 'Pricing',
              ops: 'Free to start, $79/mo flat',
              comp1: '$298+/mo, annual contract',
              comp2: '$49-$199/mo, feature-gated',
            },
            {
              feature: 'System documentation',
              ops: 'Equipment, configs, rack photos per client',
              comp1: 'Equipment tracking available',
              comp2: 'Basic customer notes',
            },
            {
              feature: 'Multi-phase project scheduling',
              ops: 'Phase tracking for commercial projects',
              comp1: 'Available on higher tiers',
              comp2: 'Basic multi-day scheduling',
            },
            {
              feature: 'Offline mode',
              ops: 'Full offline, syncs on reconnect',
              comp1: 'Limited offline',
              comp2: 'Limited offline',
            },
            {
              feature: 'Photo documentation',
              ops: 'Photos attached to jobs and client records',
              comp1: 'Photo capture available',
              comp2: 'Photo capture on paid plans',
            },
            {
              feature: 'Time to start',
              ops: 'Download and go, same day',
              comp1: 'Demo + multi-month implementation',
              comp2: 'Setup + plan selection',
            },
          ],
        },
        faq: [
          {
            question: 'Can OPS store system configurations and equipment details per client?',
            answer:
              'Yes. Equipment models, IP addresses, control system configs, rack layout photos, and network diagrams are attached to the client record. Available to any tech on any future visit or service call.',
          },
          {
            question: 'Does OPS handle both residential and commercial AV scheduling?',
            answer:
              'Yes. Single-day residential installs and multi-phase commercial build-outs in one schedule. Each project type tracked appropriately — residential by day, commercial by phase.',
          },
          {
            question: 'Can my techs access pre-wire documentation months later during finish install?',
            answer:
              'Yes. Everything documented on the pre-wire visit — wire run locations, specifications, photos — is attached to the job and available on your tech\'s phone during the finish installation.',
          },
          {
            question: 'Does OPS work in homes and buildings with poor signal?',
            answer:
              'Yes. AV installations happen in media rooms, basements, server closets, and behind walls where signal drops. OPS works fully offline and syncs when your tech reconnects.',
          },
          {
            question: 'We are a small AV shop with 3 installers. Is OPS right for us?',
            answer:
              'Built for you. Three techs managing residential installs, commercial projects, and service calls. OPS keeps every system documented and every day scheduled without enterprise pricing or complexity.',
          },
        ],
        cta: {
          headline: 'AV INSTALLS ARE TOO CUSTOM\nFOR PAPER AND MEMORY.',
          subtext: 'System documentation. Multi-phase scheduling. Client records that outlast every tech. One app for installs, service, and commissioning. Free to start — no demo, no contract.',
        },
      },
    },
  },

  // ─── SCAFFOLDING ──────────────────────────────────────────────
  {
    slug: 'scaffolding',
    name: 'Scaffolding',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'dashboard' },
      { variant: 'apps' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
      { deviceType: 'phone', flowDirection: 'left' },
      { deviceType: 'tablet', flowDirection: 'right' },
    ],
    content: {
      en: {
        meta: {
          title: 'Scaffolding Company Software for Crews | OPS',
          description:
            'OPS is built for scaffolding crews managing erection, inspection, modification, and dismantling across multiple job sites. Track equipment, schedule crews, and document safety compliance. Free to start.',
          keywords: [
            'scaffolding company software',
            'scaffolding crew scheduling',
            'scaffolding business management',
            'scaffold erection scheduling app',
            'scaffolding dispatch software',
            'scaffolding company management',
            'scaffold rental tracking software',
            'scaffolding contractor scheduling',
            'scaffolding safety documentation',
            'scaffolding crew management app',
          ],
        },
        hero: {
          sectionLabel: 'Scaffolding',
          headline: 'SCAFFOLDING IS\nEQUIPMENT, CREWS, AND\nCOMPLIANCE. TRACK ALL THREE.',
          subtext:
            'Erection. Inspection. Modification. Dismantling. Your scaffolding operation moves tons of equipment between job sites, dispatches crews who work at dangerous heights, and must document safety compliance on every structure. OPS keeps your equipment tracked, your crews scheduled, and your safety records where they belong.',
        },
        painPoints: [
          {
            title: 'EQUIPMENT SCATTERED\nACROSS A DOZEN SITES.',
            bullets: [
              'Scaffolding components — frames, braces, planks, base plates, casters, guardrails — are distributed across 5-15 active job sites at any given time. Knowing what is where, what is available, and what needs to move is a full-time inventory problem.',
              'Equipment goes out on rental and needs to come back. But tracking rental duration, billing, and pickup scheduling across dozens of rentals in a spreadsheet means equipment sits on sites longer than it should — costing you and frustrating the customer.',
              'Loss and damage on scaffolding components is an accepted cost of business — but only because nobody tracks it. Without component-level tracking, you do not know where the loss is happening until the annual inventory count reveals the gap.',
              'Equipment transport — flatbed trucks, loading, unloading — is a significant cost. Moving equipment between sites efficiently requires knowing what is at each site and what the next site needs. Without that data, you move equipment twice.',
            ],
            forLine: 'For scaffolding company owners and inventory managers',
          },
          {
            title: 'SAFETY COMPLIANCE\nTHAT PROTECTS YOUR PEOPLE AND YOUR LICENSE.',
            bullets: [
              'OSHA 1926.451 requires competent person inspections before every shift for occupied scaffolds. That is a daily inspection on every active scaffold. Paper inspection forms from 15 job sites create a paper mountain nobody can manage.',
              'Scaffold tagging — green tag (safe), yellow tag (caution), red tag (unsafe) — must be documented and communicated to every trade working on or around the scaffold. If the tag status changes and the crew on the third level does not know, you have a life-safety incident.',
              'Modification and dismantling require specific documentation — engineered drawings, competent person approval, notification to affected trades. Paper documentation for modifications gets lost between the office and the field.',
              'When OSHA shows up for a site inspection, your scaffold safety records need to be produced immediately. "Let me check the filing cabinet at the office" is not an acceptable answer.',
            ],
            forLine: 'For safety officers and site supervisors',
          },
          {
            title: 'CREWS AT HEIGHT WITH\nDANGEROUS WORK AND NO SYSTEM.',
            bullets: [
              'Scaffolding erection and dismantling are among the most dangerous activities in construction. Your crew needs to know the scope, the engineered plan, the safety requirements, and the site conditions before they start — not while they are 40 feet up.',
              'Different job sites have different scaffolding configurations — supported, suspended, mobile, cantilever. Your crew needs the specifications for each site on their phone, not in a binder at the office.',
              'Weather conditions directly affect scaffold safety. High winds, ice, and lightning shut down scaffold work. When conditions change mid-day, every crew on every scaffold needs to know. Phone calls to 15 sites are not fast enough.',
              'New crew members need to understand the scaffold plan before climbing. Without digital access to the plan, the foreman is the only source of truth — and the foreman is also setting up the next section.',
            ],
            forLine: 'For scaffolding crews and erection foremen',
          },
        ],
        solutions: [
          {
            title: 'EVERY COMPONENT.\nEVERY SITE. TRACKED.',
            copy: 'OPS tracks your scaffolding inventory by job site — frames, braces, planks, guardrails, everything. When a new job needs 200 frames and you have 150 at Site A finishing this week, you know where the equipment is coming from before booking the transport. Rental durations tracked. Pickups scheduled. No more equipment sitting on sites you forgot about.',
            painPointRef: 'equipment-tracking',
          },
          {
            title: 'SAFETY INSPECTIONS\nDOCUMENTED FROM THE SCAFFOLD.',
            copy: 'Daily competent person inspections captured in OPS from the job site — findings, tag status, photos, deficiencies. Every scaffold on every site has a documented safety record. When OSHA arrives, pull up the inspection history in seconds. Not in a filing cabinet search. On your phone.',
            painPointRef: 'safety-compliance',
          },
          {
            title: 'SCAFFOLD PLANS ON YOUR\nCREW\'S PHONE. NOT IN THE OFFICE.',
            copy: 'Engineered drawings, scope specifications, safety requirements, and site access details — on every crew member\'s phone before they start climbing. 56dp touch targets for gloved hands. Dark theme visible in direct sunlight. Offline mode for sites where signal does not reach the upper levels. Your crew knows the plan. Not just the foreman.',
            painPointRef: 'crew-safety',
          },
          {
            title: 'ERECTION. INSPECTION.\nMODIFICATION. DISMANTLING.\nONE APP.',
            copy: 'New scaffold erection, daily inspections, mid-project modifications, and final dismantling — every phase of scaffold work in one schedule. Your office tracks the equipment. Your safety officer tracks inspections. Your foreman sees the daily plan. All from one system.',
            painPointRef: 'operational-complexity',
          },
        ],
        comparison: {
          competitors: ['Procore', 'Jobber'],
          rows: [
            {
              feature: 'Pricing',
              ops: 'Free to start, $79/mo flat',
              comp1: 'Custom pricing, $$$',
              comp2: '$49-$199/mo, feature-gated',
            },
            {
              feature: 'Equipment/inventory tracking',
              ops: 'Components tracked by site',
              comp1: 'Equipment management for enterprise',
              comp2: 'No equipment tracking',
            },
            {
              feature: 'Safety documentation',
              ops: 'Daily inspections, tag status, photos',
              comp1: 'Safety forms available',
              comp2: 'No safety-specific features',
            },
            {
              feature: 'Offline mode',
              ops: 'Full offline — works on upper scaffold levels',
              comp1: 'Requires connectivity',
              comp2: 'Limited offline',
            },
            {
              feature: 'Crew app simplicity',
              ops: 'Glove-ready, dark theme, scaffold plans on phone',
              comp1: 'Enterprise complexity',
              comp2: 'Service-call oriented',
            },
            {
              feature: 'Time to start',
              ops: 'Download and go, same day',
              comp1: 'Multi-month implementation',
              comp2: 'Setup + plan selection',
            },
          ],
        },
        faq: [
          {
            question: 'Can OPS track scaffolding equipment across multiple job sites?',
            answer:
              'Yes. Track frames, braces, planks, and all components by site. Know what is where, what is available, and what needs to move. Rental durations and pickup scheduling all visible.',
          },
          {
            question: 'Does OPS support daily scaffold safety inspections?',
            answer:
              'Yes. Competent person inspections captured on site — findings, tag status, deficiencies, and photos. Every scaffold on every site has a documented safety record accessible in seconds.',
          },
          {
            question: 'Can my crew access scaffold plans on their phones?',
            answer:
              'Yes. Engineered drawings, scope specs, and safety requirements visible on every crew member\'s phone with 56dp touch targets for gloved hands. Offline mode for upper-level work where signal drops.',
          },
          {
            question: 'Does OPS work at height where cell signal is weak?',
            answer:
              'Yes. Scaffold work happens at heights where signal quality degrades. OPS works fully offline — your crew captures inspection data and updates, and everything syncs when they return to ground level.',
          },
          {
            question: 'We are a scaffolding rental and erection company. Does OPS handle both?',
            answer:
              'Yes. Equipment rental tracking and crew scheduling in one app. Know where your inventory is, when it needs pickup, and which crew is erecting or dismantling at which site.',
          },
        ],
        cta: {
          headline: 'SCAFFOLDING IS EQUIPMENT, CREWS,\nAND COMPLIANCE.\nMANAGE ALL THREE FROM ONE APP.',
          subtext: 'Equipment tracking. Safety documentation. Scaffold plans on every phone. One app for erection, inspection, and dismantling. Free to start — no demo, no contract.',
        },
      },
    },
  },
];

// --- Helpers ---

export function getIndustryBySlug(slug: string): IndustryData | undefined {
  return industries.find((i) => i.slug === slug);
}

export function getAllIndustrySlugs(): string[] {
  return industries.map((i) => i.slug);
}

export function getAllIndustries(): IndustryData[] {
  return industries;
}
