// src/lib/industries.ts

// --- Types ---

export type FlowDirection = 'left-to-right' | 'top-to-bottom' | 'right-to-left';
export type WireframeVariant = 'messages' | 'dashboard' | 'apps';

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
      { variant: 'messages', flowDirection: 'left-to-right' },
      { variant: 'dashboard', flowDirection: 'top-to-bottom' },
      { variant: 'apps', flowDirection: 'right-to-left' },
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
      { variant: 'dashboard', flowDirection: 'top-to-bottom' },
      { variant: 'messages', flowDirection: 'right-to-left' },
      { variant: 'apps', flowDirection: 'left-to-right' },
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
      { variant: 'apps', flowDirection: 'right-to-left' },
      { variant: 'messages', flowDirection: 'left-to-right' },
      { variant: 'dashboard', flowDirection: 'top-to-bottom' },
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
];

// --- Helpers ---

export function getIndustryBySlug(slug: string): IndustryData | undefined {
  return industries.find((i) => i.slug === slug);
}

export function getAllIndustrySlugs(): string[] {
  return industries.map((i) => i.slug);
}
