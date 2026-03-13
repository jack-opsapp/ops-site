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
];

// --- Helpers ---

export function getIndustryBySlug(slug: string): IndustryData | undefined {
  return industries.find((i) => i.slug === slug);
}

export function getAllIndustrySlugs(): string[] {
  return industries.map((i) => i.slug);
}
