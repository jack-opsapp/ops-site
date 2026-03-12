// src/lib/comparisons.ts

import type { WireframeVariant, DeviceType, FlowDirection } from './industries';

// --- Types ---

export interface ComparisonContent {
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
  /** AI-SEO optimized verdict block — definitive summary for LLM extraction and featured snippets */
  verdict: {
    /** 2-3 sentence definitive statement. LLMs extract this as "the answer." */
    summary: string;
    /** Top reasons to switch — renders as bullet list, optimized for featured snippets */
    switchReasons: string[];
    /** Honest competitor strengths — builds E-E-A-T credibility with search engines and LLMs */
    competitorStrengths: string[];
    /** Clear "who should use what" recommendation */
    bestFor: {
      ops: string;
      competitor: string;
    };
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
    secondCompetitor: string;
    rows: Array<{
      feature: string;
      ops: boolean | string;
      competitor: boolean | string;
      secondComp: boolean | string;
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

export interface ComparisonData {
  slug: string;
  competitorName: string;
  painPointConfig: Array<{
    variant: WireframeVariant;
  }>;
  solutionConfig: Array<{
    deviceType: DeviceType;
    flowDirection: FlowDirection;
  }>;
  content: {
    en: ComparisonContent;
  };
}

// --- Comparison Data ---

export const comparisons: ComparisonData[] = [
  // ─── ServiceTitan Alternative ────────────────────────────────────────
  {
    slug: 'servicetitan',
    competitorName: 'ServiceTitan',
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
          title: 'ServiceTitan Alternative for Trade Crews | OPS',
          description: 'Tired of $250/tech/month, 6-month setup, and contract traps? OPS is free to start, works in minutes, and your crew will actually use it.',
          keywords: [
            'servicetitan alternative',
            'servicetitan alternatives 2026',
            'servicetitan pricing',
            'how much does servicetitan cost',
            'servicetitan too expensive',
            'cheaper than servicetitan',
            'switch from servicetitan',
            'servicetitan for small business',
            'field service management app no contract',
            'servicetitan cancel contract',
          ],
        },
        hero: {
          sectionLabel: 'ServiceTitan Alternative',
          headline: 'YOUR CREW DESERVES SOFTWARE\nTHAT WORKS AS HARD AS THEY DO',
          subtext: "You're paying $250+/tech/month for software your field workers are afraid to open. Six months to implement. A contract you can't escape without a lawyer. There's a better way to run your operation.",
        },
        verdict: {
          summary: 'OPS is a free-to-start, mobile-first field service app built for trade crews of any size. Unlike ServiceTitan, it requires no sales call, no implementation period, and no long-term contract. Your crew downloads the app and starts managing jobs the same day.',
          switchReasons: [
            'Free to start vs. $245\u2013$500/tech/month',
            'Set up in minutes vs. 3\u201312 month implementation',
            'No contract vs. 12-month minimum with early termination fees up to $39,000+',
            'Mobile-first with offline mode vs. desktop-first with mobile bolted on',
            'Published pricing vs. mandatory 60-minute sales call',
            'Your data is yours vs. 60-day limited access window after cancellation',
          ],
          competitorStrengths: [
            'Powerful dispatch board with drag-and-drop scheduling and route optimization',
            'Deep reporting and analytics for owners and managers',
            'Integrated marketing ROI tracking and membership management',
            'Large ecosystem with 12+ years of development and ~$1B revenue',
          ],
          bestFor: {
            ops: 'Trade crews of 2\u201330 people who need a fast, intuitive field app with no contracts, no implementation timeline, and no per-tech pricing that punishes growth.',
            competitor: 'Large residential service companies with 20+ technicians, dedicated office staff, and high call volume who need deep analytics, pricebook management, and integrated financing.',
          },
        },
        painPoints: [
          {
            title: 'The price tag that keeps climbing',
            bullets: [
              '$245\u2013$500 per technician per month \u2014 a 10-person crew costs $30K\u2013$48K/year before add-ons',
              'Implementation fees of $5,000\u2013$50,000 billed upfront before your team touches the software',
              'Marketing Pro, Phones Pro, and Pricebook Pro add $500\u2013$2,000/month on top of your base subscription',
              'No free trial, no month-to-month option \u2014 must commit to a 12-month minimum before testing',
            ],
            forLine: 'For: Small and mid-size contractors (2\u201320 techs) who can\u2019t justify $30K\u2013$100K/year for scheduling software',
          },
          {
            title: '6 months before your team can use it',
            bullets: [
              'Official onboarding is 12\u201316 weeks \u2014 real-world reports range from 2 to 12 months',
              'You pay monthly subscription during implementation while nobody uses the software',
              'One BBB complaint: paid for a full year without ever being onboarded',
              'Third-party implementation consultants charge thousands more just to help you get running',
            ],
            forLine: 'For: Busy contractors who need software working this week, not this quarter',
          },
          {
            title: 'Built for the back office, not the job site',
            bullets: [
              'Desktop-first design with mobile capabilities bolted on afterward',
              'Interface so complex that an entire industry of consultants exists to help companies use it',
              'Crews describe it as \u201Ctoo big to where my people are scared to dive in\u201D',
              'Companies end up adapting their processes to the software instead of the other way around',
            ],
            forLine: 'For: Field crews who need a fast, intuitive app they can use with gloves on',
          },
        ],
        solutions: [
          {
            title: 'Free to start. No hidden math.',
            copy: "OPS is free to download and start using today. No $50,000 implementation fee. No $250/tech/month. No sales call required. Published pricing \u2014 what you see is what you pay. ServiceTitan's cheapest option for 5 techs costs $14,700/year before add-ons. OPS costs $0 to start. No minimum user counts, no 12-month lock-in, no auto-renewal that catches you off guard.",
            painPointRef: 0,
          },
          {
            title: 'Download today. Dispatching tomorrow.',
            copy: "OPS takes minutes to set up, not months. No 12-week onboarding timeline. No 14-person support relay. No endless Zoom meetings. Download the app, create your account, add your crew, and start managing jobs the same day. There is no implementation fee because there is no implementation. Your crew picks it up because it works like they think \u2014 not like an ERP system thinks.",
            painPointRef: 1,
          },
          {
            title: 'Built for the crew, not the corner office.',
            copy: "OPS is designed from pixel one for the person in the field. 56dp touch targets for gloved hands. Dark theme readable in direct sunlight. Full offline mode for basements, attics, and dead zones. Your tech opens the app, sees today's jobs, taps to navigate, updates status \u2014 done. No training program required because the app was designed to not need one.",
            painPointRef: 2,
          },
          {
            title: 'No contracts. No exit fees. No data hostage.',
            copy: "ServiceTitan's BBB file documents early termination fees of $15,000, $23,000, $39,000, and $46,000. Contractors report needing lawyers to retrieve their own customer records after cancellation. OPS does not lock you in. No 12-month minimum. No auto-renewal traps. Your data is yours \u2014 always. A company confident in its product does not need a contract to keep you.",
            painPointRef: 0,
          },
        ],
        comparison: {
          secondCompetitor: 'Jobber',
          rows: [
            { feature: 'Starting price', ops: 'Free', competitor: '~$245/tech/month', secondComp: '$39/month (1 user)' },
            { feature: 'Setup time', ops: 'Minutes', competitor: '3\u201312 months', secondComp: '1\u20132 days' },
            { feature: 'Contract required', ops: 'No', competitor: '12-month minimum', secondComp: 'No' },
            { feature: 'Free trial available', ops: 'Yes (free tier)', competitor: false, secondComp: '14-day trial' },
            { feature: 'Built for field crews', ops: 'Mobile-first, offline, dark theme', competitor: 'Desktop-first, mobile add-on', secondComp: 'Mobile app, not field-optimized' },
            { feature: 'Published pricing', ops: true, competitor: false, secondComp: true },
          ],
        },
        faq: [
          {
            question: 'How much does ServiceTitan actually cost?',
            answer: "ServiceTitan does not publish pricing \u2014 you must complete a 60-minute sales qualification call to get a quote. Based on verified user reports across Capterra, G2, Software Advice, and the BBB, pricing ranges from $245 to $500+ per technician per month across three tiers (Starter, Essentials, The Works). Implementation fees run $5,000 to $50,000+. Add-on modules like Marketing Pro, Phones Pro, and Pricebook Pro can increase your monthly bill by 30\u201350%. Real-world total cost for a 10-technician team is $50,000\u2013$70,000+ in year one. OPS is free to start with published pricing \u2014 no sales call, no surprises.",
          },
          {
            question: 'Is ServiceTitan worth it for a small company?',
            answer: 'ServiceTitan itself acknowledges the platform is "not optimized for companies with 3 or fewer technicians." Multiple user reviews state it is not a good fit for companies under 20 people. Small teams consistently report paying for features they never use, struggling through months-long implementation, and finding the interface overwhelming for field workers. If you have fewer than 20 technicians and no dedicated office staff to manage the software, ServiceTitan\'s complexity and cost are likely overkill. OPS is built for teams of any size \u2014 including the 2-person crew that just needs to know where to go and what to do.',
          },
          {
            question: 'Can I cancel ServiceTitan? What are the early termination fees?',
            answer: 'ServiceTitan requires a minimum 12-month contract with auto-renewal. To cancel, you must provide written notice 30\u201360 days before your renewal date \u2014 miss that window and you are locked in for another full year. Early termination fees have been documented as high as $39,375, with additional documented cases of $15,000, $23,842, and $46,170. After cancellation, you get 60 days of limited access to export data, and multiple contractors report needing legal assistance to retrieve their own business records. OPS has no long-term contracts. Cancel anytime. Your data is always yours.',
          },
          {
            question: 'How long does it take to set up ServiceTitan?',
            answer: "ServiceTitan's official implementation timeline is 12\u201316 weeks. User-reported timelines range from 2 to 12+ months. You pay monthly subscription fees during the entire implementation period. One BBB complaint documents a company that paid for a full year without ever being fully onboarded. Third-party implementation consultants charge additional thousands to help you actually get running. OPS requires no implementation \u2014 download the app, create your account, and start managing jobs the same day.",
          },
          {
            question: 'What is the best ServiceTitan alternative for trade contractors?',
            answer: "The best alternative depends on your team size and needs. For large operations wanting similar depth with more transparent pricing, Jobber or Housecall Pro are options. For small-to-mid-size crews of 2\u201320 people who need something their field workers will actually use, OPS is purpose-built: free to start, no contracts, mobile-first design with offline capability, and instant setup. The most common complaint about ServiceTitan is that teams pay enterprise prices for a tool their field workers are afraid to use. OPS solves this by making the field experience the product, not an afterthought.",
          },
        ],
        cta: {
          headline: 'STOP PAYING FOR SOFTWARE\nYOUR CREW WON\u2019T USE',
          subtext: 'Download OPS free. See your first job on screen in under 5 minutes. No credit card. No sales call. No contract.',
        },
      },
    },
  },

  // ─── Jobber Alternative ──────────────────────────────────────────────
  {
    slug: 'jobber',
    competitorName: 'Jobber',
    painPointConfig: [
      { variant: 'dashboard' },
      { variant: 'apps' },
      { variant: 'messages' },
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
          title: 'Jobber Alternative for Field Crews | OPS',
          description: 'The $39/mo plan that actually costs $400. OPS is free to start, works offline, syncs in real time, and doesn\u2019t punish you for growing.',
          keywords: [
            'jobber alternative',
            'jobber alternative free',
            'jobber pricing',
            'jobber too expensive',
            'switch from jobber',
            'jobber offline mode',
            'jobber calendar sync problems',
            'best field service app for small crews',
            'cheaper than jobber',
            'jobber double booking',
          ],
        },
        hero: {
          sectionLabel: 'Jobber Alternative',
          headline: 'THE $39/MONTH PLAN\nTHAT ACTUALLY COSTS $400',
          subtext: "You signed up for the Core plan and hit a wall on day one \u2014 no GPS, no texting, no QuickBooks sync. Every feature you actually need is locked behind a higher tier. And when your crew hits a dead zone, the app stops working entirely.",
        },
        verdict: {
          summary: 'OPS is a free-to-start field service app that works offline, syncs in real time, and gives every user the full feature set. Unlike Jobber, there are no per-user surcharges, no feature-gated tiers, and no 12-hour calendar sync delays.',
          switchReasons: [
            'Free to start with full features vs. $39\u2013$599/mo with aggressive feature gating',
            'Full offline mode vs. no offline capability at all',
            'Real-time calendar sync vs. one-way sync every 12 hours',
            'Built-in double-booking prevention vs. no conflict alerts',
            'Every user gets full access vs. \u201Climited worker\u201D default permissions',
            'No per-user surcharges vs. $29/month per additional user',
          ],
          competitorStrengths: [
            'Clean, modern desktop interface with intuitive onboarding for first-time software users',
            'Strong brand recognition and large user community (250,000+ claimed users)',
            'Solid quoting and invoicing workflow for simple, one-time service jobs',
            'Route optimization feature that some competitors lack',
          ],
          bestFor: {
            ops: 'Field crews of any size who need offline capability, real-time sync, and full mobile functionality without per-user pricing that scales against them.',
            competitor: 'Solo operators and very small teams (1\u20133 people) doing simple residential service jobs who want a clean desktop interface and don\u2019t need offline or real-time sync.',
          },
        },
        painPoints: [
          {
            title: '$39/month is a bait price',
            bullets: [
              'Core plan is missing GPS tracking, QuickBooks sync, two-way texting, and automated reminders \u2014 features you need from day one',
              'To text your own crew, you need the Grow plan at $199/month \u2014 5x the advertised price',
              'Every user beyond your tier limit costs $29/month \u2014 a 12-person team runs $407/month minimum',
              'Add-ons pile up: Marketing Suite ($79/mo), AI Receptionist ($99/mo), plus payment processing fees on top of everything',
            ],
            forLine: 'For: Growing contractors with 5\u201315 crew members who keep hitting upgrade walls',
          },
          {
            title: 'Your crew can\u2019t use it in the field',
            bullets: [
              'No true offline mode \u2014 the app stops working without internet. Jobber\u2019s own docs confirm it.',
              'Default \u201Climited worker\u201D permission strips field crews of meaningful functionality',
              'Mobile app lacks reporting, offline editing, and offline signature capture',
              'No geofencing for automatic clock-in/out \u2014 your crew tracks time manually or not at all',
            ],
            forLine: 'For: Trade crews working in basements, crawlspaces, new construction, and rural areas with no signal',
          },
          {
            title: 'A calendar that syncs every 12 hours',
            bullets: [
              'Google Calendar sync updates once every 12 hours \u2014 a job scheduled at 9am might not appear until 9pm',
              'Sync is one-way only: Jobber pushes to Google Calendar, but your personal appointments are invisible to Jobber',
              'No double-booking prevention \u2014 schedule two crews for the same slot with zero warnings',
              'No blackout dates \u2014 create a fake job to block time and customers can still book right through it online',
            ],
            forLine: 'For: Contractors who\u2019ve double-booked a crew or showed up at the wrong job because the calendar was behind',
          },
        ],
        solutions: [
          {
            title: 'Transparent pricing. No tier traps.',
            copy: "OPS publishes pricing with no demo wall, no sales call, and no credit card required to start. Every user gets the full feature set \u2014 no per-user surcharges that penalize you for adding crew members. No feature gating where the basics cost $39 but the things you actually need cost $199. What you see is what you pay.",
            painPointRef: 0,
          },
          {
            title: 'Built for the crew. Not the corner office.',
            copy: "OPS is mobile-first, not mobile-also. 56dp touch targets designed for gloved hands. Full offline capability \u2014 access schedules, update job status, log materials, and capture data without a cell signal. Dark theme for outdoor visibility. Your field workers get the full app, not a stripped-down \u2018limited worker\u2019 view where they can see their schedule and nothing else.",
            painPointRef: 1,
          },
          {
            title: 'Real-time sync. Not 12-hour delays.',
            copy: 'When a job is scheduled in OPS, every crew member sees it instantly. No one-way sync that takes half a day to propagate. No double-booking because the system shows true availability in real time. No fake jobs to block out personal time. No workarounds. Schedule changes push to your crew\u2019s phones the moment you make them.',
            painPointRef: 2,
          },
          {
            title: 'Download today. Working tomorrow.',
            copy: 'No 14-day trial with a credit card wall. No tiered onboarding where the useful features are locked behind the expensive plan. No sales call. Download OPS from the App Store, set up your crew, and start scheduling jobs. Built to be intuitive for people who build things for a living \u2014 not people who manage software for a living.',
            painPointRef: 1,
          },
        ],
        comparison: {
          secondCompetitor: 'Housecall Pro',
          rows: [
            { feature: 'Starting price', ops: 'Free to start', competitor: '$39/mo (Core, 1 user)', secondComp: '$79/mo (Basic, 1 user)' },
            { feature: 'Offline mode', ops: 'Full offline capability', competitor: 'No offline (requires internet)', secondComp: 'View-only (cached jobs)' },
            { feature: 'Crew mobile app', ops: 'Full-featured, designed for field', competitor: '\u201CLimited worker\u201D default, no mobile reports', secondComp: 'Desktop features missing on mobile' },
            { feature: 'Calendar sync', ops: 'Real-time', competitor: 'One-way, every 12 hours', secondComp: 'Real-time' },
            { feature: 'Double-booking prevention', ops: true, competitor: false, secondComp: false },
            { feature: 'Setup time', ops: 'Download and go', competitor: '14-day trial, tiered onboarding', secondComp: '14-day trial, onboarding required' },
          ],
        },
        faq: [
          {
            question: 'Is there a free Jobber alternative?',
            answer: "OPS is free to start with no credit card required. Unlike Jobber's 14-day trial that requires payment info, OPS lets you download and start using the app immediately. Jobber's cheapest plan is $39/month but it is missing GPS tracking, QuickBooks sync, two-way texting, and automated reminders \u2014 features most contractors need from day one. You will likely need the $199/month Grow plan for real field operations. OPS gives every user the full feature set from day one.",
          },
          {
            question: 'Why is Jobber so expensive for my team size?',
            answer: "Jobber charges $29/month per additional user beyond your tier limit. A 10-person crew on Grow Teams pays $349/month. Add two more workers and it jumps to $407/month. Stack on marketing tools ($79/month) and you are approaching $500/month before transaction fees. Per-user pricing is the primary reason contractors switch away from Jobber. OPS does not penalize you for growing your team \u2014 the trades have thin margins, and your software should not eat them.",
          },
          {
            question: 'Does Jobber work offline?',
            answer: 'No. Jobber\u2019s own documentation states you need an internet connection to use the app and the website. The app displays an offline notification but cannot edit records, capture signatures, or sync data without connectivity. If your crews work in basements, crawlspaces, new construction, or rural areas with poor signal, Jobber will not work for them. OPS works fully offline \u2014 view schedules, update jobs, log materials, capture data \u2014 and syncs automatically when you reconnect.',
          },
          {
            question: 'Why doesn\u2019t my Jobber calendar sync with Google Calendar?',
            answer: 'Jobber syncs to Google Calendar approximately every 12 hours, one-way only. A job you schedule at 8am may not appear in Google Calendar until 8pm. Your personal Google Calendar events are never visible inside Jobber, which means personal appointments and job schedules exist in two different worlds with no awareness of each other. There is no manual refresh option. OPS provides real-time sync so your crew always sees the current schedule, and changes push instantly to every phone.',
          },
          {
            question: 'Can I switch from Jobber to OPS?',
            answer: "Yes. OPS is designed for contractors migrating from other platforms. Import your clients, set up your crew, and start scheduling. One reviewer who switched away from Jobber after 5 years said their only complaint about switching was that they didn\u2019t do it sooner. The transition is straightforward because OPS was built to be intuitive from the first job you schedule \u2014 no training period, no onboarding calls.",
          },
        ],
        cta: {
          headline: 'STOP PAYING FOR SOFTWARE\nYOUR CREW CAN\u2019T USE OFFLINE',
          subtext: 'OPS is free to start. No credit card. No sales call. No per-user pricing that punishes you for growing. Download it and get to work.',
        },
      },
    },
  },

  // ─── Housecall Pro Alternative ───────────────────────────────────────
  {
    slug: 'housecall-pro',
    competitorName: 'Housecall Pro',
    painPointConfig: [
      { variant: 'apps' },
      { variant: 'messages' },
      { variant: 'dashboard' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'right-to-left' },
      { deviceType: 'laptop', flowDirection: 'left-to-right' },
      { deviceType: 'tablet', flowDirection: 'top-to-bottom' },
      { deviceType: 'desktop', flowDirection: 'right-to-left' },
    ],
    content: {
      en: {
        meta: {
          title: 'Housecall Pro Alternative for Contractors | OPS',
          description: 'AI chatbots instead of support. $59/mo that becomes $300+. An app that crashes in the field. OPS is the alternative your crew has been waiting for.',
          keywords: [
            'housecall pro alternative',
            'housecall pro competitor',
            'housecall pro pricing',
            'housecall pro support',
            'housecall pro customer service',
            'switch from housecall pro',
            'housecall pro problems',
            'housecall pro cancellation',
            'housecall pro AI support only',
            'field service management app free',
          ],
        },
        hero: {
          sectionLabel: 'Housecall Pro Alternative',
          headline: 'WHEN YOUR SOFTWARE BREAKS,\nYOU NEED A HUMAN. NOT A CHATBOT.',
          subtext: "Housecall Pro gutted its support in 2025. The phone number is buried. The chatbot can\u2019t fix your payment processing at 2pm on a Tuesday. Your crew\u2019s app crashes in the field and no one picks up. There\u2019s a better way.",
        },
        verdict: {
          summary: 'OPS is a free-to-start, mobile-first field service app with human support for every user, full offline capability, and transparent pricing with no add-on maze. Unlike Housecall Pro, OPS does not gate support behind plan tiers, does not require a phone call to cancel, and does not charge extra for features most contractors consider essential.',
          switchReasons: [
            'Human support for every user vs. AI chatbot gatekeeping with buried phone number',
            'Full offline mode vs. view-only cached jobs',
            'Free to start vs. $59\u2013$329/mo with $40\u2013$149/mo add-ons on top',
            'No sales calls after signup vs. 5+ calls per day from different numbers',
            'Cancel anytime online vs. must call and fight a retention agent',
            'Android app built natively vs. 3.3/5 Google Play rating',
          ],
          competitorStrengths: [
            'Intuitive color-coded scheduling interface with drag-and-drop',
            'Strong customer communication automation (texts, reminders)',
            'Same-day payment via Instapay for cash-flow-sensitive businesses',
            'Large installed base with community of 30,000+ pros',
          ],
          bestFor: {
            ops: 'Trade crews who need reliable offline capability, human support when things break, and transparent pricing that doesn\u2019t triple after signup.',
            competitor: 'Solo operators on iOS who primarily need scheduling and automated customer communication, don\u2019t work in dead zones, and are comfortable with AI-first support.',
          },
        },
        painPoints: [
          {
            title: 'You can\u2019t reach a human when it matters',
            bullets: [
              'Support shifted to AI-only in early 2025 \u2014 the phone number exists but it\u2019s intentionally buried',
              'The \u201CBlue Bubble\u201D chat forces you through AI screening before you can request a human',
              'A Denver electrician lost a $2,100 job waiting 3 hours for a payment processing callback',
              'One user spent 8 hours across multiple chats and calls trying to cancel \u2014 eventually reported their card as stolen to escape',
            ],
            forLine: 'For: Contractors whose revenue depends on their software working during business hours',
          },
          {
            title: 'The $59/month plan that actually costs $300+',
            bullets: [
              'Basic plan excludes QuickBooks integration \u2014 upgrade to $149/month Essentials just to sync your books',
              'GPS tracking is $20 per vehicle per month on top of subscription. Sales proposals: $40/month. Price book: $149/month.',
              'Payment processing fees run 2.59%\u20134.49% per transaction \u2014 Instapay adds another 1% on top',
              'Jump from Basic ($79/mo) to Essentials ($189/mo) costs $1,320/year more just to add a second user',
            ],
            forLine: 'For: Contractors who signed up for $59/month and are now paying $200\u2013$400+ with add-ons and forced upgrades',
          },
          {
            title: 'Your crew\u2019s app crashes in front of customers',
            bullets: [
              'Android app rated 3.3/5 on Google Play \u2014 one of the worst Android gaps in FSM software',
              'Offline mode is read-only: view cached jobs but cannot edit, invoice, or track time without internet',
              'Photo uploads described as \u201Chit or miss\u201D \u2014 technicians can\u2019t reliably document work on site',
              'Features break without warning and the support team often isn\u2019t trained on the changes they deployed',
            ],
            forLine: 'For: Field crews who need their app to work reliably on every job site, every time',
          },
        ],
        solutions: [
          {
            title: 'Real humans. Real answers. Right now.',
            copy: "When something breaks at 2pm on a Tuesday and your crew is standing at a job site, you need a human who understands your problem. Not an AI chatbot. Not a scheduled callback in 2\u20134 hours. Not a support rep who wasn\u2019t trained on the update that broke your workflow. OPS is built by people who understand the trades, and support reflects that. No tiered support quality \u2014 every user gets the same level of help. No AI gatekeeping before you reach a person.",
            painPointRef: 0,
          },
          {
            title: 'One price. Everything included.',
            copy: "With Housecall Pro, the $59 plan is designed to force an upgrade \u2014 you\u2019ll be at $200+ within 90 days once you add QuickBooks sync, GPS tracking, proposals, and a price book. OPS publishes real pricing with no add-on maze. No $40/month for proposals. No $20/vehicle for GPS. No $149/month for a price book. You get the whole platform. Free to start \u2014 no credit card, no sales call, no demo wall.",
            painPointRef: 1,
          },
          {
            title: 'Built for the field. Not the front office.',
            copy: "Housecall Pro\u2019s mobile app crashes in the field, can\u2019t work offline, and updates break established workflows without warning. OPS was built mobile-first \u2014 56dp touch targets for gloved hands, dark theme readable in direct sunlight, full offline capability, and an Android experience that matches iOS. Edit jobs, log time, take photos \u2014 all without signal. Everything syncs when connectivity returns.",
            painPointRef: 2,
          },
          {
            title: 'Download today. Working tomorrow.',
            copy: "With Housecall Pro, you sign up for a trial, get 5 sales calls a day from different numbers, navigate a complex setup, and still need the Essentials plan to do anything useful. OPS is instant: download the app, create your account, and your crew is scheduling jobs the same day. No aggressive sales calls. No demo required. No retention agents when you want to leave. Simple enough that your crew uses it without training.",
            painPointRef: 1,
          },
        ],
        comparison: {
          secondCompetitor: 'Jobber',
          rows: [
            { feature: 'Starting price', ops: 'Free to start', competitor: '$59/mo (annual) / $79/mo (monthly)', secondComp: '$39/mo (1 user)' },
            { feature: 'Offline capability', ops: 'Full \u2014 edit, create, log', competitor: 'View-only (cached jobs)', secondComp: 'No offline mode' },
            { feature: 'Customer support', ops: 'Human support, every user', competitor: 'AI chatbot first, buried phone number', secondComp: 'Phone support, all tiers' },
            { feature: 'Android app quality', ops: 'Native, built from scratch', competitor: '3.3/5 Google Play', secondComp: '4.2/5 Google Play' },
            { feature: 'QuickBooks integration', ops: 'Included', competitor: 'Essentials+ ($149/mo)', secondComp: 'Connect+ ($119/mo)' },
            { feature: 'Sales calls after signup', ops: 'Never', competitor: 'Expect 5+ per day', secondComp: 'No' },
          ],
        },
        faq: [
          {
            question: 'Is Housecall Pro\u2019s customer support really that bad?',
            answer: "Starting in early 2025, Housecall Pro shifted to an AI-first support model. The phone number (1-877-944-9010) exists but is intentionally buried \u2014 not on the homepage, not in the app help section, not in most help articles. You go through an AI chatbot screening before you can request a human. Response times for callback can stretch to 2\u20134 hours. On lower-tier plans, support quality is explicitly degraded \u2014 reliable human support effectively requires the Essentials plan or higher. One contractor lost a $2,100 job waiting 3 hours for a payment processing fix. OPS gives every user the same support \u2014 no chatbot gatekeeping, no tiered access.",
          },
          {
            question: 'How much does Housecall Pro actually cost?',
            answer: "The advertised $59/month Basic plan is designed to force an upgrade. It has no QuickBooks integration, no GPS tracking, and only allows 1 user. Most businesses end up on Essentials at $149\u2013$189/month plus add-ons: GPS tracking ($20/vehicle/month), sales proposals ($40/month), flat-rate price book ($149/month), and marketing tools ($99/month). Real-world costs for a 3-truck business run $650+/month. Add payment processing fees of 2.59\u20134.49% per transaction and the true annual cost climbs well past $10,000. OPS starts free with transparent pricing and no add-on maze.",
          },
          {
            question: 'Can Housecall Pro work offline in the field?',
            answer: "Housecall Pro's offline mode only lets you view previously cached job data. You cannot edit jobs, create invoices, track time, or manage customers without internet. You also have to have opened the specific job while connected for it to be available offline at all \u2014 it does not pre-cache your schedule. For crews working in basements, new construction, or rural areas with poor signal, this is a dealbreaker. OPS works fully offline \u2014 your crew can update jobs, log time, and take photos without signal, and everything syncs automatically when connectivity returns.",
          },
          {
            question: 'How do I cancel Housecall Pro?',
            answer: "You cannot cancel Housecall Pro online or through the app. You must contact support through the Blue Bubble chat widget, then wait 1\u20133 business days for the billing team to call you. The company explicitly states they \u201Ccannot fully process your cancellation until a team member has spoken with the account owner over the phone.\u201D Multiple BBB complaints describe agents who fought to prevent cancellation. Continued billing after cancellation has been reported repeatedly. One user spent 8 hours trying to cancel and eventually reported their debit card as stolen to stop charges. OPS has no contracts and no cancellation process \u2014 stop paying and you\u2019re done.",
          },
          {
            question: 'Why are contractors leaving Housecall Pro in 2025 and 2026?',
            answer: "Three converging issues drove the exodus. First, customer support was gutted \u2014 AI chatbot-only for most users starting early 2025, with human help gated behind higher-tier plans. Second, costs keep climbing \u2014 add-ons, processing fees, and forced tier upgrades mean the real price is 3\u20135x the advertised rate. Third, reliability degraded \u2014 features break without warning, the Android app is rated 3.3/5 on Google Play, and offline capability is effectively nonexistent. Contractors whose businesses depend on this software discovered they can\u2019t reach anyone when things go wrong.",
          },
        ],
        cta: {
          headline: "YOUR BUSINESS SHOULDN\u2019T DEPEND\nON SOFTWARE YOU CAN\u2019T GET HELP WITH",
          subtext: 'Download OPS free. No credit card. No sales call. No chatbot between you and help when you need it.',
        },
      },
    },
  },

  // ─── BuildOps Alternative ────────────────────────────────────────────
  {
    slug: 'buildops',
    competitorName: 'BuildOps',
    painPointConfig: [
      { variant: 'messages' },
      { variant: 'apps' },
      { variant: 'dashboard' },
    ],
    solutionConfig: [
      { deviceType: 'phone', flowDirection: 'left-to-right' },
      { deviceType: 'laptop', flowDirection: 'right-to-left' },
      { deviceType: 'tablet', flowDirection: 'top-to-bottom' },
      { deviceType: 'desktop', flowDirection: 'left-to-right' },
    ],
    content: {
      en: {
        meta: {
          title: 'BuildOps Alternative for Small Crews | OPS',
          description: '$299/user/month. No free trial. Commercial only. 8-week setup. OPS is free to start, works for any trade, and your crew uses it on day one.',
          keywords: [
            'buildops alternative',
            'buildops pricing',
            'buildops too expensive',
            'buildops for small business',
            'buildops competitor',
            'buildops implementation',
            'buildops free trial',
            'commercial contractor software affordable',
            'cheaper alternative to buildops',
            'best buildops alternative 2026',
          ],
        },
        hero: {
          sectionLabel: 'BuildOps Alternative',
          headline: '$299 PER USER PER MONTH.\nYOUR CREW DESERVES BETTER MATH.',
          subtext: "You got the BuildOps quote and your stomach dropped. $36,000/year for a 10-person crew. No free trial. Commercial only. Eight weeks before anyone touches it. There\u2019s field service software that doesn\u2019t require a second mortgage.",
        },
        verdict: {
          summary: 'OPS is a free-to-start field service app that works for commercial and residential contractors of any size. Unlike BuildOps, it requires no sales call, no implementation period, and no annual contract. Your crew downloads the app and manages jobs the same day \u2014 at a fraction of the cost.',
          switchReasons: [
            'Free to start vs. ~$299/user/month billed annually',
            'Set up in minutes vs. 8-week target (reported up to 12+ months)',
            'Works for commercial and residential vs. commercial only',
            'Free trial available vs. no trial, must book sales demo',
            'Published pricing vs. hidden pricing behind a sales call',
            'Built for the field crew vs. built for enterprise project managers',
          ],
          competitorStrengths: [
            'Purpose-built for large commercial contractor workflows with multi-phase project management',
            'Strong calendar management and reporting capabilities',
            'Real-time field-to-office data flow with photo, video, and audio capture',
            'Service agreement and submittal management for enterprise operations',
          ],
          bestFor: {
            ops: 'Small-to-mid-size contractors (2\u201330 people) doing commercial, residential, or mixed work who need an affordable, intuitive field app they can start using today.',
            competitor: 'Large commercial-only operations with 50+ employees, dedicated office staff, and the budget and bandwidth for months of implementation and $97K+/year in software costs.',
          },
        },
        painPoints: [
          {
            title: '$299 per user per month. Per. User.',
            bullets: [
              'A 10-person crew costs $35,880/year. A 20-person operation: $71,760/year. Before implementation fees.',
              'No published pricing anywhere \u2014 must book a sales call and demo just to learn what it costs',
              'Implementation fees add $1,000\u2013$5,000 for small businesses, tens of thousands for enterprise',
              'No free trial, no free plan \u2014 46% of FSM competitors offer free trials, BuildOps does not',
            ],
            forLine: 'For: Small and mid-size commercial contractors who got a BuildOps quote and can\u2019t justify $36K\u2013$72K/year',
          },
          {
            title: 'Implementation that takes months',
            bullets: [
              'BuildOps targets 8-week setup \u2014 one user has been trying for a year and it\u2019s still not working',
              'G2 ease-of-setup score: 6.7/10 \u2014 the lowest among major FSM platforms',
              'Requires weeks or months of training sessions before your crew can use it productively',
              'QuickBooks sync exports items multiple times, creating duplicate records in your accounting',
            ],
            forLine: 'For: Contractors who need software working this week, not after 8 weeks of training',
          },
          {
            title: 'Built for enterprise. You are not enterprise.',
            bullets: [
              'Designed for 50\u2013500+ employee operations with multi-phase project tracking and service agreement automation',
              'Commercial only \u2014 if your company does any residential work, BuildOps cannot support half your business',
              'Average BuildOps customer pays ~$97,000 per year \u2014 that is not small-business money',
              'Features like submittal management and engineer-stamp tracking are pure overhead for a crew of 8',
            ],
            forLine: 'For: Small commercial contractors and mixed residential/commercial crews told BuildOps was \u201Cthe answer\u201D',
          },
        ],
        solutions: [
          {
            title: 'Free to start. Not free to talk to sales.',
            copy: "OPS is free to download with no credit card required. No sales call. No demo booking. No 8-week implementation. Download the app and start using it today. BuildOps makes you go through a sales gauntlet before you even see the product \u2014 and charges ~$299/user/month when you finally do. OPS puts the product in your hands immediately.",
            painPointRef: 0,
          },
          {
            title: 'Built for the crew. Not the corner office.',
            copy: "BuildOps is built for dispatchers, project managers, and back-office admins managing multi-million dollar commercial projects. OPS is built for the person actually doing the work \u2014 the electrician on the ladder, the plumber under the sink, the foreman coordinating three crews across town. 56dp touch targets for gloved hands. Dark theme for outdoor visibility. Offline mode that works in basements and dead zones.",
            painPointRef: 2,
          },
          {
            title: 'Works for your whole business.',
            copy: "BuildOps serves commercial contractors only. If your company does any residential work \u2014 even 10% of your jobs \u2014 BuildOps cannot help you with that portion of your business. You need a separate system for the other half. OPS works for any trade, any job type: commercial, residential, new construction, service calls. One platform for your whole operation, not a commercial-only silo that leaves gaps.",
            painPointRef: 2,
          },
          {
            title: 'Simple enough to use tomorrow.',
            copy: "BuildOps has a G2 ease-of-setup score of 6.7/10 and implementation timelines stretching from weeks to over a year. OPS is designed so your crew is productive on day one. No weeks of training sessions. No adjusting your workflows to fit the software. No consultants required to get you running. The app adapts to how you work \u2014 not the other way around.",
            painPointRef: 1,
          },
        ],
        comparison: {
          secondCompetitor: 'Jobber',
          rows: [
            { feature: 'Starting price', ops: 'Free (no credit card)', competitor: '~$299/user/month', secondComp: '$39/month (1 user)' },
            { feature: 'Annual cost \u2014 10-person crew', ops: 'Free tier available', competitor: '~$35,880/year', secondComp: '~$4,188\u2013$8,988/year' },
            { feature: 'Free trial', ops: 'Yes \u2014 download and use immediately', competitor: false, secondComp: '14-day trial' },
            { feature: 'Time to get started', ops: 'Minutes', competitor: '8+ weeks (reported up to 12 months)', secondComp: 'Hours to days' },
            { feature: 'Commercial + residential', ops: 'Both', competitor: 'Commercial only', secondComp: 'Both (residential-focused)' },
            { feature: 'Pricing transparency', ops: 'Published on website', competitor: 'Hidden \u2014 requires sales call', secondComp: 'Published on website' },
          ],
        },
        faq: [
          {
            question: 'Is BuildOps worth it for a small contractor?',
            answer: "BuildOps is designed for medium-to-large commercial contractors with dedicated office staff and complex multi-phase projects. Their average customer pays approximately $97,000 per year. At ~$299/user/month, a 10-person crew would spend $35,880/year before implementation fees. For small contractors under 20 employees, the enterprise features are overhead \u2014 you\u2019re paying for submittal management, service agreement automation, and multi-phase project tracking when you need scheduling, dispatching, and job tracking. OPS is free to start and built specifically for field crews of any size.",
          },
          {
            question: 'Does BuildOps have a free trial?',
            answer: "No. BuildOps does not offer a free trial or a free plan. You must contact their sales team, book a demo, and go through an onboarding process before accessing the software. 46% of FSM platforms offer free trials \u2014 BuildOps is in the minority that requires a financial commitment sight unseen. OPS is free to download with no credit card, no sales call, and no demo required. You can have your crew scheduling jobs before a BuildOps sales rep returns your email.",
          },
          {
            question: 'How long does BuildOps implementation take?',
            answer: "BuildOps targets 8 weeks for implementation, which includes data migration, configuration, and training sessions. User reviews tell a different story \u2014 timelines range from 3 months to over a year. One Capterra reviewer wrote: \u201CBeen trying to implement for a year and still not working.\u201D The platform earned a G2 ease-of-setup score of 6.7/10, the lowest among major FSM competitors. OPS requires no implementation \u2014 download the app, set up your crew, and start scheduling the same day.",
          },
          {
            question: 'Can I use BuildOps for residential work?',
            answer: "No. BuildOps is built exclusively for commercial contractors and does not support residential service workflows. Their own materials direct residential contractors to look elsewhere. If your company handles any residential jobs \u2014 or does both commercial and residential work \u2014 you will need a separate system for that portion of your business. OPS supports commercial, residential, new construction, and service calls in a single platform with no restrictions on job type.",
          },
          {
            question: 'What does BuildOps actually cost?',
            answer: "BuildOps does not publish pricing. All quotes require a sales call and product demo. Third-party sources consistently report pricing around $299/user/month billed annually. For a 10-person team, that works out to approximately $35,880/year, plus implementation fees of $1,000\u2013$5,000 for small businesses (potentially tens of thousands for enterprise). BuildOps received a pricing score of 4 out of 10 from ITQlick. Their average customer pays roughly $97,000 per year. OPS is free to start with published pricing \u2014 no hidden costs, no sales gauntlet.",
          },
        ],
        cta: {
          headline: 'STOP PAYING ENTERPRISE PRICES\nFOR A CREW OF 10',
          subtext: 'Your crew is in the field right now. Give them OPS in 5 minutes. Free to start \u2014 no sales call, no credit card, no 8-week implementation.',
        },
      },
    },
  },
];

// --- Helpers ---

export function getComparisonBySlug(slug: string): ComparisonData | undefined {
  return comparisons.find((c) => c.slug === slug);
}

export function getAllComparisonSlugs(): string[] {
  return comparisons.map((c) => c.slug);
}
