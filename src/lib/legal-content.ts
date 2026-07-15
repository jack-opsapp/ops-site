/**
 * Legal Documents — Structured content for Terms, Privacy, EULA, and DPA
 *
 * Each document has a title, lastUpdated date, and sections array.
 * Sections are used for both table of contents and rendered content.
 */

export interface LegalSection {
  id: string;
  title: string;
  content: string;
}

export interface LegalDocument {
  title: string;
  lastUpdated: string;
  effectiveDate: string;
  version?: string;
  sections: LegalSection[];
}

export const legalDocuments: Record<string, LegalDocument> = {
  terms: {
    title: 'Terms of Service',
    lastUpdated: '2026-02-18',
    effectiveDate: '2025-01-17',
    version: 'v1.0',
    sections: [
      {
        id: 'agreement',
        title: '1. Agreement',
        content:
          'These Terms of Service ("Terms") form a binding agreement between 1361513 BC LTD. ("OPS," "we," "us") and the company or individual ("Customer," "you") accessing OPS at opsapp.co or through our iOS or Android applications (collectively, the "Service").\n\nBy creating an account, accepting a free trial, or submitting payment, you agree to these Terms. If you are accepting on behalf of a company, you represent that you have authority to bind that company.',
      },
      {
        id: 'the-service',
        title: '2. The Service',
        content:
          'OPS is job management software for specialized trade businesses — including but not limited to window cleaning, landscaping, electrical contractors, plumbing, mobile detailing, and cleaning services. The Service includes:\n\n- iOS and Android apps — Field-optimized job scheduling, task tracking, crew assignment, GPS navigation to job sites, and offline-first photo documentation\n- Web application — Dashboard, pipeline/CRM, estimates, invoices, client portal, project management\n- Client Portal — A branded, client-facing portal for estimate approval, invoice payment, and project visibility\n\nThe Service is intended for use by businesses and their employees, not individual consumers.',
      },
      {
        id: 'accounts-and-users',
        title: '3. Accounts and Users',
        content:
          '3.1 Account types. Each subscription is registered to one company. Within that company, accounts are assigned one of three roles: Admin (full access, manages subscription and billing), Office Crew (scheduling and coordination), or Field Crew (view assigned work, update status, capture photos).\n\n3.2 Admin responsibility. The Admin is responsible for all activity under the account, including actions by Office Crew and Field Crew users. Ensure your credentials are kept secure and shared only with authorized team members.\n\n3.3 Accurate information. You must provide accurate company and billing information when registering and keep it current.',
      },
      {
        id: 'free-trial',
        title: '4. Free Trial',
        content:
          'New accounts receive a 30-day free trial with up to 10 seats included. No payment information is required to start a trial. At the end of the trial, the account will be suspended unless a paid subscription is activated. We do not automatically convert trials to paid subscriptions.',
      },
      {
        id: 'subscriptions-and-billing',
        title: '5. Subscriptions and Billing',
        content:
          '5.1 Plans. Paid subscriptions are available at the following rates:\n\n| Plan | Seats | Monthly | Annual (20% off) |\n| Starter | 3 | CAD $90/month | CAD $864/year |\n| Team | 5 | CAD $140/month | CAD $1,344/year |\n| Business | 10 | CAD $190/month | CAD $1,824/year |\n\nPrices are in Canadian dollars and exclusive of applicable taxes.\n\n5.2 Billing cycle. Subscriptions are billed monthly or annually in advance on the date you activate your paid plan.\n\n5.3 Auto-renewal. Subscriptions renew automatically at the end of each billing period. We will notify you by email at least 14 days before an annual renewal. To cancel auto-renewal, downgrade, or change your plan, log into Account Settings before the renewal date.\n\n5.4 Payment. Payments are processed by Stripe, Inc. By submitting payment, you also agree to Stripe\'s Terms of Service. We do not store your credit card details — all payment data is handled by Stripe.\n\n5.5 Payment failure. If a payment fails, we will retry over the following 7 days and notify you by email. Access to the Service will be suspended if payment is not received within 7 days of the initial failure and restored immediately upon successful payment.\n\n5.6 Price changes. We reserve the right to change subscription pricing with 30 days\' written notice by email. Price changes take effect at the next renewal date after the notice period.',
      },
      {
        id: 'refunds-and-cancellation',
        title: '6. Refunds and Cancellation',
        content:
          '6.1 No refunds. Subscription fees are non-refundable. We do not provide refunds or credits for partial billing periods, unused seats, or unused features.\n\n6.2 Cancellation. You may cancel your subscription at any time through Account Settings. Cancellation takes effect at the end of your current billing period. Your data will remain accessible for 30 days after cancellation, after which it will be deleted.\n\n6.3 Exception. If OPS is unable to provide the Service due to our error for a material portion of a billing period, we will provide a pro-rated credit at our discretion.',
      },
      {
        id: 'acceptable-use',
        title: '7. Acceptable Use',
        content:
          'You may not use the Service to:\n\n- Violate any applicable law or regulation\n- Process data on behalf of a business that is not your own (white-labelling or resale is prohibited)\n- Scrape, reverse-engineer, or attempt to extract source code or data from the Service\n- Submit false, fraudulent, or misleading company or client information\n- Introduce malware, spam, or harmful code\n- Exceed usage in a way that degrades the Service for other customers\n- Use the Service for any purpose other than legitimate field service business management',
      },
      {
        id: 'intellectual-property',
        title: '8. Intellectual Property',
        content:
          '8.1 OPS IP. We own all intellectual property in the Service, including software, design, trademarks, and documentation. These Terms do not transfer any ownership to you.\n\n8.2 Your content. You own all content you upload (photos, client data, project records, notes). By uploading content, you grant us a limited, non-exclusive licence to store and process that content solely to provide the Service to you. We do not claim ownership of your data.\n\n8.3 Feedback. If you submit feature requests or feedback, we may use that feedback without compensation or obligation to you.',
      },
      {
        id: 'third-party-services',
        title: '9. Third-Party Services',
        content:
          'The Service integrates with third-party platforms. Your use of those integrations is subject to their respective terms:\n\n| Service | Purpose |\n| Stripe, Inc. | Subscription billing and client invoice payments |\n| Bubble.io | Backend data storage for operational records |\n| Supabase | Database for financial and CRM records |\n| Amazon Web Services (AWS) | Photo and file storage (S3) |\n| Google (Firebase) | Authentication and analytics |\n| Apple | Sign-In with Apple authentication |\n| QuickBooks / Sage | Accounting integrations (optional, if connected) |\n\nWe are not liable for outages, changes, or data practices of these third-party services.',
      },
      {
        id: 'location-and-gps',
        title: '10. Location and GPS',
        content:
          'Certain features of the Service (turn-by-turn navigation, job site routing) use device location services, including background location when the app is in use for navigation. You are responsible for ensuring that your employees are informed of and have consented to location use through the app, in compliance with applicable employment laws.',
      },
      {
        id: 'limitation-of-liability',
        title: '11. Limitation of Liability',
        content:
          '11.1 Disclaimer. THE SERVICE IS PROVIDED "AS IS." WE MAKE NO WARRANTY THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF SECURITY VULNERABILITIES. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED.\n\n11.2 Cap on liability. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, OPS\'S TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE IS LIMITED TO THE FEES YOU PAID TO OPS IN THE 12 MONTHS PRECEDING THE CLAIM.\n\n11.3 Exclusion of consequential damages. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, NEITHER PARTY SHALL BE LIABLE FOR LOST PROFITS, LOST DATA, BUSINESS INTERRUPTION, OR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF OR RELATED TO THESE TERMS, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.\n\nNote: Some provinces do not permit certain exclusions of implied warranties or limitations on consequential damages. The above limitations apply only to the extent permitted in your jurisdiction.',
      },
      {
        id: 'indemnification',
        title: '12. Indemnification',
        content:
          'You agree to indemnify and hold harmless 1361513 BC LTD., its officers, employees, and contractors from any claim, loss, or damage (including reasonable legal fees) arising from: (a) your use of the Service in violation of these Terms; (b) your violation of any applicable law; or (c) any content you submit through the Service.',
      },
      {
        id: 'termination',
        title: '13. Termination',
        content:
          '13.1 By you. You may cancel your subscription at any time as described in Section 6.2.\n\n13.2 By us. We may suspend or terminate your account immediately if: (a) you materially breach these Terms and fail to cure within 10 days of written notice; (b) you engage in conduct that poses a risk to the Service or other customers; or (c) we are required to do so by law.\n\n13.3 Effect of termination. Upon termination, your access to the Service ends. We will retain your data for 30 days to allow export, after which it is deleted. Sections 8 (IP), 11 (Liability), 12 (Indemnification), and 14 (Governing Law) survive termination.',
      },
      {
        id: 'governing-law',
        title: '14. Governing Law and Disputes',
        content:
          'These Terms are governed by the laws of the Province of British Columbia and the federal laws of Canada applicable therein, without regard to conflict of law principles. Any dispute arising under these Terms will be subject to the exclusive jurisdiction of the courts of British Columbia.',
      },
      {
        id: 'general',
        title: '15. General',
        content:
          '15.1 Entire agreement. These Terms, together with our Privacy Policy, constitute the entire agreement between you and OPS regarding the Service.\n\n15.2 Amendments. We may update these Terms from time to time. We will provide 30 days\' notice by email for material changes. Continued use of the Service after the effective date constitutes acceptance.\n\n15.3 Severability. If any provision of these Terms is found unenforceable, the remaining provisions remain in effect.\n\n15.4 No waiver. Failure to enforce any provision does not constitute a waiver.\n\n15.5 Assignment. You may not assign these Terms without our prior written consent. We may assign them in connection with a merger, acquisition, or sale of assets.',
      },
      {
        id: 'contact',
        title: 'Contact',
        content:
          'Questions about these Terms:\n\n1361513 BC LTD.\n303-1121 Oscar Street, Victoria BC V8V2X3\ninfo@opsapp.co',
      },
    ],
  },

  privacy: {
    title: 'Privacy Policy',
    lastUpdated: '2026-05-25',
    effectiveDate: '2025-01-17',
    version: 'v1.1',
    sections: [
      {
        id: 'who-we-are',
        title: '1. Who We Are',
        content:
          '1361513 BC LTD. ("OPS," "we," "us") provides job management software for specialized trade businesses. This Privacy Policy describes how we collect, use, and protect personal information through opsapp.co and our iOS and Android applications (the "Service").\n\nWe comply with the Personal Information Protection and Electronic Documents Act (PIPEDA) and, where applicable, Quebec Law 25 (Act Respecting the Protection of Personal Information in the Private Sector) and Canada\'s Anti-Spam Legislation (CASL).\n\nPrivacy Officer: Jack S. — info@opsapp.co',
      },
      {
        id: 'what-we-collect',
        title: '2. What Information We Collect',
        content:
          '2.1 Account and Company Information\n\nWhen you register an account or set up your company in OPS, we collect:\n- First name, last name, email address, phone number\n- Company name, industry type, crew size\n- Company code (6-character unique identifier)\n- Your role (Admin, Office Crew, or Field Crew)\n\n2.2 Professional Contacts (Your Clients)\n\nWhen you enter your business clients into OPS, we store on your behalf:\n- Client company names, contact names, phone numbers, email addresses\n- Job site addresses and GPS coordinates\n- Project and task notes and descriptions\n- Estimates, invoices, and payment records related to your clients\n\nImportant: This data belongs to you. We process it as a service provider under your direction. Your clients are not our customers and have no account with OPS.\n\n2.3 Job and Operational Data\n\nData generated through the normal use of the Service:\n- Projects, tasks, task status updates, calendar events\n- Job site photos (stored on AWS S3)\n- Turn-by-turn navigation routes and GPS data used during active navigation sessions\n- Crew assignments and scheduling data\n\n2.4 Financial Data\n\nFor customers using the OPS web application financial features:\n- Pipeline/CRM opportunity records\n- Estimate and invoice records (line items, amounts, dates)\n- Payment records (date, amount, method, reference number — not card data)\n- Products and services catalog\n\nWe do not store credit card or bank account numbers. All payment card data is handled exclusively by Stripe, Inc. We only receive confirmation of payment and a Stripe payment reference ID.\n\n2.5 Authentication Data\n\nWhen you sign in via Google or Apple, we receive a unique identifier and your name and email address from that provider. We do not receive your Google or Apple password. Email/password accounts are managed through Firebase Authentication.\n\nA 4-digit PIN is stored locally on your device in the device Keychain and is never transmitted to our servers.\n\n2.6 Usage and Analytics Data\n\nWe collect usage data through Firebase Analytics, including:\n- App screens visited and features used\n- Session duration and frequency\n- Device type, operating system version, and language\n- Crash reports and performance data\n\nThis data is used to improve the Service and is associated with an anonymous device identifier, not your name or email.\n\n2.7 Client Portal Access\n\nIf your business clients access the Client Portal (to view estimates, approve quotes, or pay invoices), we collect their email address and issue a time-limited magic link session token. No password is created. Portal sessions expire after 30 days.\n\n2.8 QuickBooks Integration (Optional)\n\nIf you choose to connect your QuickBooks Online account to OPS, we access your QuickBooks account via Intuit\'s OAuth 2.0 API solely to provide the accounting sync feature you have authorized. Specifically:\n\nData OPS sends to QuickBooks on your behalf:\n- Invoice records (invoice number, line items, amounts, due dates, client name)\n- Payment records (amount, date, payment method, reference number)\n\nData OPS receives from QuickBooks:\n- OAuth access token and refresh token (to maintain the authorized connection)\n- Your QuickBooks company ID (Realm ID), used to route sync requests to the correct account\n\nWhat we do not do:\n- We do not access QuickBooks data beyond what is necessary to perform the sync you authorize\n- We do not share QuickBooks data with any third party other than as required to provide the Service\n- We do not use your QuickBooks data for advertising, profiling, or any purpose unrelated to the sync\n\nRevoking access: You may disconnect your QuickBooks account at any time from OPS Account Settings. You may also revoke OPS\'s access directly from your Intuit account at myapps.intuit.com. Disconnecting removes OPS\'s OAuth tokens and stops all future sync activity. It does not delete data already synced into QuickBooks.\n\n2.9 SPEC Engagement Data\n\nIf you purchase a SPEC engagement, we collect additional categories of data necessary to design, build, and deliver Custom Modules inside your OPS instance.\n\n**Intake responses.** When you complete the SPEC intake form at /spec/intake/[token], we store your answers as structured form data in our database. The intake covers business basics (company name, legal entity type, years operating, primary trade, secondary trades, service area), team composition (size, roles, seasonal vs year-round), revenue band (optional), average job size, current tools you use, your workflow narrative from lead to invoice, top pain points, your 90-day success picture, and regulated-workflow attestations. The intake form is the foundation of the discovery work and the Scope Document.\n\n**File uploads.** The intake form allows you to upload existing process documents — screenshots, PDFs, sample invoices, photos of your current paper workflows, or anything else that helps OPS understand how your business operates today. Files are stored in a Supabase Storage bucket named `spec-intake` under a folder keyed to your engagement record. Maximum size 25 MB per file. Accepted file types are limited by an allow-list (common document, image, and spreadsheet formats). Files are scoped to your engagement and are not shared with other customers.\n\n**Scope Document content.** The Scope Document drafted during discovery and counter-signed at scope sign-off is stored as structured content tied to your engagement record, with a content hash for integrity verification. Each revision is preserved as a versioned record so prior versions remain available to you on request.\n\n**Satisfaction survey responses.** After the midpoint demo and the delivery walkthrough, we may invite you to rate each feature on a 1-to-5 scale and to add free-text comments. The ratings and comments are stored against your engagement and identified to you. They are non-binding feedback under the SPEC Engagement Terms of Service.\n\n**Communications log.** OPS logs the substantive communications associated with each engagement — outbound emails, inbound replies, scheduled and held call summaries, and links to walkthrough recordings. This log forms part of the evidence chain in any Stripe dispute and is retained alongside the engagement record.\n\n**Stripe billing data.** When you complete the SPEC checkout flow, Stripe collects your name, email, phone, billing address (line 1, line 2, city, province, postal code, country), and any GST/HST number you choose to provide. Stripe stores your payment card data; we do not. We receive from Stripe a customer identifier, a payment intent identifier, the billing address recorded at checkout, your consent state for our terms of service, and (where applicable) the GST/HST number you entered. We use the billing address to enforce our Canadian (excluding Quebec) eligibility rules; see the SPEC Engagement Terms of Service for details.\n\n**Attribution data.** When you arrive on the SPEC marketing page from an advertising source, we store first-touch attribution data on a 30-day cookie set on your browser. The cookie holds the campaign parameters in the URL (utm_source, utm_medium, utm_campaign, utm_content, utm_term, Google Click ID `gclid`, Meta Click ID `fbclid`), the landing URL, and the time of first touch. The cookie is `SameSite=Lax` and is not shared with third parties from the browser. At deposit time, the cookie values are written into your engagement record as the attribution context for that engagement.\n\n**Owner-approval and acceptance events.** For SPEC engagements where the buyer is not the OPS account holder, we record the account holder\'s electronic approval — including the IP address, user agent, signature method, and a content hash of the version of the SPEC Engagement Terms of Service they reviewed — as a binding acceptance event. Each substantive acceptance step in the engagement lifecycle (terms of service acceptance, scope sign-off, midpoint acceptance, delivery acceptance, change order acceptance) is recorded as a separate acceptance event with the same fields.\n\nWe collect the SPEC engagement data above to perform the SPEC engagement under contract with you (PIPEDA lawful basis: necessary for performance of a contract). We use the data for the limited purposes described in § 3 below.',
      },
      {
        id: 'how-we-use',
        title: '3. How We Use Your Information',
        content:
          '| Purpose | Legal basis (PIPEDA) |\n| Providing the Service (account management, job scheduling, billing) | Contract performance |\n| Processing subscription payments via Stripe | Contract performance |\n| Sending transactional emails (receipts, payment confirmations, service alerts) | Contract performance |\n| Improving the Service (analytics, crash reports, product development) | Legitimate interest |\n| Sending product update emails and feature announcements | Implied consent (existing customers within 2 years — CASL) |\n| Sending marketing or promotional emails | Express consent only |\n| Syncing invoice and payment data to your connected QuickBooks account | Consent (you explicitly connect the integration) |\n| Responding to support requests | Legitimate interest |\n| Complying with legal obligations | Legal obligation |\n| Delivering a SPEC engagement: discovery, scope drafting, build, midpoint demo, walkthrough, support window, care-plan service | Contract performance |\n| Processing SPEC milestone payments and refunds via Stripe | Contract performance |\n| Sending operational SPEC emails (deposit confirmations, owner approvals, intake reminders, invoices, refund confirmations, dispute notices, support-window notices) | Contract performance |\n| Sending commercial SPEC emails (Care Plan offers, referral program promotions, SPEC marketing follow-ups) | Express or implied CASL consent, as applicable |\n| Enforcing eligibility rules — including the Canada-excluding-Quebec geographic restriction and the regulated-workflow exclusions | Legitimate interest; legal obligation |\n| Measuring SPEC ad-campaign performance through conversion tracking to Meta and Google | Legitimate interest; consent where required by applicable law |\n| Detecting fraud and misuse of the SPEC pipeline — including chargeback fraud, self-referral attempts, and Quebec-misrepresentation cases | Legitimate interest |\n| Preserving an evidence chain for Stripe disputes and refund decisions | Legitimate interest |\n\nWe do not sell your personal information to third parties. We do not use your business client data for any purpose other than providing the Service to you.\n\nWe do not sell SPEC engagement data, and we do not use intake content, scope content, communications, or satisfaction ratings for advertising targeting. Conversion tracking sends only hashed identifiers (email, phone) and aggregate event signals (deposit click, deposit completed, intake submitted, discovery booked) to Meta and Google; the raw intake content, scope content, and communications never leave OPS infrastructure or its DPA-covered subprocessors.',
      },
      {
        id: 'third-party-processors',
        title: '4. Third-Party Processors',
        content:
          'We share data with the following service providers to operate the Service. Each is bound by contractual data protection obligations.\n\n| Processor | Purpose | Data shared | Location |\n| Stripe, Inc. | Subscription billing and client invoice payments; for SPEC engagements: milestone payments and invoices, Stripe Tax for GST/HST/PST, Stripe Connect for referral payouts (Phase 2), Stripe Tax IDs for customer-supplied GST/HST numbers | Customer name, email, phone, billing address, GST/HST number, transaction history, terms-of-service consent state | USA |\n| Bubble Group, Inc. (Bubble.io) | Backend database — operational data | Employee data, client contacts, projects, tasks, calendar | USA |\n| Supabase, Inc. | Database — financial and CRM data; for SPEC: SPEC engagement records, intake responses, scope documents, satisfaction ratings, communications log, acceptance events, and the `spec-intake` Storage bucket for file uploads | Pipeline, estimates, invoices, payment records, all SPEC engagement data described in § 2.9 | USA |\n| Amazon Web Services (AWS S3) | Photo and file storage | Job photos you upload | USA |\n| Google LLC (Firebase) | Authentication and usage analytics | Email, auth tokens, anonymous usage data | USA |\n| Apple Inc. | Sign-In with Apple authentication | Name, email (first sign-in only) | USA |\n| Intuit Inc. (QuickBooks) | Accounting sync (if enabled by you) — OPS sends invoice and payment data to your QuickBooks account; Intuit provides OAuth tokens to authenticate the connection | Invoice records, payment records, OAuth credentials | USA |\n| Sage Group plc | Accounting sync (if enabled by you) | Invoice and payment data you authorize | UK/USA |\n| Twilio, Inc. (SendGrid) | Transactional and commercial SPEC emails (deposit confirmations, owner approvals, intake reminders, milestone invoices, refund confirmations, retainer offers, referral promotions) | Customer email address, name, engagement reference, message content | USA |\n| Vercel, Inc. | Hosting of the SPEC marketing page (/spec), the OPS-Web product surface, and the SPEC server routes that handle checkout creation, owner-approval, refund-request submission, and cron-driven nudges. Edge cache for the OPS Board public read | Request metadata, IP addresses, customer-provided form data in transit | USA, with global edge cache |\n| Meta Platforms, Inc. (Meta Conversions API) | Server-side conversion tracking for SPEC ad campaigns on Facebook and Instagram | Hashed email address, hashed phone number, event metadata (event name, value, currency, deduplication ID), browser cookies `fbp` and `fbc` | USA |\n| Google LLC (Google Ads Enhanced Conversions) | Server-side conversion tracking for SPEC ad campaigns on Google Search and YouTube | Hashed email address, hashed phone number, Google Click ID (`gclid`), event metadata | USA |\n| Cal.com, Inc. | Scheduling discovery sessions and delivery walkthroughs for SPEC engagements | Customer name, email, optional phone, scheduled session metadata, time-zone preference | USA/EU depending on Cal.com instance |\n\nNote on QuickBooks: When you connect your QuickBooks account, Intuit acts as both a data recipient (receiving invoice/payment records from OPS) and an authentication provider (issuing OAuth tokens). OPS\'s use of QuickBooks API data is governed by the Intuit Developer Terms of Service. You can review and revoke OPS\'s access at any time at myapps.intuit.com.\n\nFor Meta and Google conversion tracking, we hash email and phone with SHA-256 before sending. Raw identifiers are not transmitted to the advertising platforms. We use this data solely to optimize SPEC ad campaigns; we do not allow Meta or Google to use the data for retargeting beyond the campaigns we run.\n\nWe will update this list when we add or replace SPEC-specific subprocessors. Notice is given 30 days in advance to active engagements by email and through the in-app notification rail, except where the change is non-material (for example, a sub-subprocessor change within an existing processor\'s stack that does not change the data-handling category).\n\nCross-border transfers: Your data may be processed in the United States. We rely on contractual safeguards with each processor. For Quebec residents, we conduct Privacy Impact Assessments before transferring personal data to US-based processors as required by Quebec Law 25.',
      },
      {
        id: 'location-data',
        title: '5. Location Data',
        content:
          'Certain features require device location:\n\n- Job site navigation: GPS is used during active navigation to provide turn-by-turn directions. This is initiated by the user and does not persist after the navigation session ends.\n- Background location: The app may use background location while navigation is actively running and the app is backgrounded. This stops when navigation is ended.\n- Job site coordinates: Addresses and coordinates you enter for projects are stored as part of your project records.\n\nWe do not track employee location continuously or outside of navigation sessions. If you use OPS to manage field crew, you are responsible for informing your employees about location use in compliance with applicable employment and privacy laws in your jurisdiction.',
      },
      {
        id: 'your-rights',
        title: '6. Your Rights',
        content:
          'Under PIPEDA and applicable provincial privacy laws, you have the right to:\n\n- Access — Request a copy of the personal information we hold about you\n- Correction — Request correction of inaccurate or incomplete information\n- Withdrawal of consent — Withdraw consent for uses based on consent (note: this may affect your ability to use the Service)\n- Deletion — Request deletion of your personal information (see Section 8)\n- Complaint — File a complaint with the Office of the Privacy Commissioner of Canada (OPC) at priv.gc.ca\n\nQuebec residents additionally have the right to:\n- Data portability — Receive your data in a structured, commonly used format\n- De-indexing — Request removal from automated indexes where applicable\n- Disclosure of automated decisions — Learn when automated processing affects you\n\nTo exercise any of these rights, contact us at info@opsapp.co. We will respond within 30 days.',
      },
      {
        id: 'data-security',
        title: '7. Data Security',
        content:
          'We implement appropriate technical and organizational measures to protect your personal information, including:\n\n- Encrypted data transmission (TLS/HTTPS)\n- Encryption at rest for database records\n- Row-Level Security (RLS) policies ensuring each company\'s data is isolated\n- Access controls limiting staff access to customer data\n- Stripe handles all payment card data under PCI-DSS compliance — we never receive raw card numbers\n\nIn the event of a data breach that poses a real risk of significant harm, we will notify the Office of the Privacy Commissioner of Canada and affected individuals as required by PIPEDA. Where required by Quebec Law 25, the Commission d\'acces a l\'information (CAI) will be notified within 72 hours.',
      },
      {
        id: 'data-retention',
        title: '8. Data Retention',
        content:
          '| Data type | Retention |\n| Active account data | Retained for the life of your subscription |\n| Deleted projects/clients (soft delete) | Retained 90 days then purged |\n| Account data after cancellation | Retained 30 days after cancellation, then deleted |\n| Firebase Analytics data | Up to 14 months (per Google\'s retention settings) |\n| Stripe payment records | Retained as required by Stripe and financial record-keeping law |\n| Portal session tokens | Expire after 7 days (unused) or 30 days (active) |\n| QuickBooks OAuth tokens | Retained while integration is connected; deleted within 24 hours of disconnection |\n| SPEC engagement record (project, scope versions, milestone payments, acceptance events, refund records) | 7 years from the date of engagement close, then deleted. Retention is anchored on the Canada Revenue Agency 6-year minimum for tax and accounting records, with a one-year buffer for dispute resolution. |\n| SPEC intake responses and file uploads in the `spec-intake` Storage bucket | Retained for the active life of the engagement plus 7 years from engagement close. Intake responses are part of the evidence chain for any chargeback or refund dispute, and are treated as engagement records for retention purposes. |\n| Scope Document content (all versions, including superseded versions) | 7 years from engagement close, same as engagement records. |\n| SPEC communications log (emails sent, replies received, call summaries, walkthrough recording URLs) | 7 years from engagement close, same as engagement records. |\n| Satisfaction survey ratings and comments | Identifiable form for 2 years, then anonymized into aggregate metrics. Anonymized aggregates may be retained indefinitely. |\n| Attribution data (UTM, gclid, fbclid, landing URL, first-touch timestamp) | Stored on the engagement record for 7 years; deleted on engagement-record deletion. |\n| SPEC ad-campaign conversion-tracking outbox (retried sends to Meta and Google) | 30 days after the event was successfully transmitted or permanently failed. |\n| SPEC blocked-buyer records (for Quebec-misrepresentation and other ToS-breach cases) | 7 years from the date of blocking, then deleted. Used solely to prevent re-purchase under a different account by the same individual or entity. |\n\nYou may request deletion of your account data at any time by contacting info@opsapp.co. After deletion, we may retain anonymized, aggregated data that cannot identify you.\n\nWhere retention is required by law (Canadian tax and accounting record-retention rules, in particular), we are obligated to retain the records for the legally required period regardless of your deletion request; we will tell you when this applies to a specific category of data.\n\nAfter deletion, we may retain anonymized aggregate metrics that cannot be re-identified to you — for example, conversion rates by ad source, average time from deposit to walkthrough, refund rates by package tier — for the indefinite purpose of improving the SPEC service.',
      },
      {
        id: 'cookies',
        title: '9. Cookies',
        content:
          'The OPS web application uses cookies and similar technologies for:\n- Essential cookies: Session management, authentication state\n- Analytics cookies: Firebase/Google Analytics (anonymous usage data)\n\nWe do not use advertising or tracking cookies for third-party ad targeting.',
      },
      {
        id: 'children',
        title: '10. Children',
        content:
          'The Service is not directed at individuals under the age of 16. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child under 16, we will delete it promptly.',
      },
      {
        id: 'communications',
        title: '11. Communications',
        content:
          'Transactional emails (subscription receipts, payment confirmations, service alerts, password resets) are sent as part of your contract with us and do not require separate consent.\n\nProduct update emails (new features, release notes) are sent to existing customers under implied CASL consent and include an unsubscribe link.\n\nMarketing emails (promotions, referral offers) will only be sent with your express consent (an opt-in box you actively check — never pre-ticked). You may withdraw consent at any time using the unsubscribe link in any email.\n\nAll commercial emails include:\n- Our company name and physical address (1361513 BC LTD., 303-1121 Oscar Street, Victoria BC V8V2X3)\n- A functional unsubscribe link (processed within 10 business days)\n\nFor SPEC engagements specifically, you receive two categories of email:\n\n- Operational/transactional messages — deposit receipts, owner-approval requests and decisions, intake reminders, scope-sign-off confirmations, milestone invoices, refund confirmations, Stripe dispute notices, support-window notices, and Custom Module status alerts. These messages are required to complete the SPEC contract and are not subject to CASL consent requirements. You receive them regardless of marketing preferences.\n- Commercial messages — Care Plan offers around the close of the support window, SPEC referral-program promotions, and SPEC marketing follow-ups. Each commercial message identifies OPS as sender, includes our mailing address (303-1121 Oscar Street, Victoria BC V8V2X3), provides a functional unsubscribe link processed within 10 business days, and states the consent basis (express or implied under the existing-business-relationship two-year window).\n\nThe SPEC referral program is link-based. We do not send commercial messages on your behalf to your referrals. Messages to referred prospects start only after the referred party submits a form, starts checkout, or otherwise expressly opts in to OPS communications.',
      },
      {
        id: 'changes',
        title: '12. Changes to This Policy',
        content:
          'We may update this Privacy Policy from time to time. We will notify you of material changes by email at least 30 days before the new policy takes effect. Continued use of the Service after the effective date constitutes acceptance.\n\nThe current version of this policy is always available at opsapp.co/privacy.',
      },
      {
        id: 'contact',
        title: '13. Contact',
        content:
          'Privacy Officer: Jack S.\nEmail: info@opsapp.co\nMail: 1361513 BC LTD., 303-1121 Oscar Street, Victoria BC V8V2X3\n\nTo make a privacy request, file a complaint, or ask questions about this policy, contact us at info@opsapp.co. If you are not satisfied with our response, you may contact:\n\n- Office of the Privacy Commissioner of Canada: 1-800-282-1376 | priv.gc.ca\n- Commission d\'acces a l\'information (Quebec): 1-888-528-7741 | cai.quebec.ca',
      },
    ],
  },

  'spec-terms': {
    title: 'SPEC Engagement Terms of Service',
    lastUpdated: '2026-07-14',
    effectiveDate: '2026-07-14',
    version: 'v2.0',
    sections: [
      {
        id: 'agreement',
        title: '1. Agreement',
        content: `These SPEC Engagement Terms of Service (the "SPEC Terms") form a binding agreement between 1361513 BC LTD. ("OPS," "we," "us"), a British Columbia company at 303-1121 Oscar Street, Victoria BC V8V2X3, and the business or individual purchasing a SPEC engagement ("Customer," "you").

The SPEC Terms apply only to your purchase and use of one or more SPEC engagements. They sit alongside the base OPS Terms of Service at /legal?page=terms (which governs your underlying OPS subscription), the OPS Privacy Policy at /legal?page=privacy, and the OPS Data Processing Agreement at /legal?page=dpa. Each is incorporated by reference. Where the SPEC Terms conflict with the base OPS Terms of Service with respect to a SPEC engagement, the SPEC Terms govern that engagement.

By clicking "I agree to the SPEC Terms of Service" in the SPEC checkout flow and completing payment, you accept the SPEC Terms in the version published at the time of acceptance. The accepted version is captured as a build-time commit hash and stored alongside your engagement record. Future changes to the SPEC Terms do not apply retroactively to engagements with a counter-signed Scope Document — see Section 27 (Amendments) and Section 23 (Version Pinning).

If you are accepting on behalf of a company, you represent that you have authority to bind that company. For SPEC engagements where the buyer is not the account holder of the OPS company, the account holder's electronic approval at the Owner Approval Step is recorded as a separate binding acceptance event before any payment session is created — see Section 6 (Payment Terms).`,
      },
      {
        id: 'definitions',
        title: '2. Definitions',
        content: `The following terms have the meanings given below when capitalized in the SPEC Terms.

- "Acceptance Event" — an electronic acceptance action recorded by OPS in its acceptance log, including the accepting user's identifier, IP address, user agent, signature method, and a content hash of the accepted document. Acceptance Events include ToS acceptance, owner purchase approval, scope sign-off, midpoint acceptance, delivery acceptance, and change order acceptance.

- "Change Order" — a written addition or modification to the Scope Document, accepted as an Acceptance Event under Section 7.

- "Care Plan" — the monthly service subscription described in Section 11, covering monitoring, fixes, hosting for Hosted Deliverables, store compliance for published applications, and the included Change-Hours for the tier.

- "Change-Hours" — the hours of change work included in a Care Plan each month: 2 hours per month on SPEC-02, 3 hours per month on SPEC-03. Work beyond the included Change-Hours is billed at the Overage Rate, always quoted and approved before the work starts.

- "Deliverables" — everything OPS builds for you under an Engagement. Depending on the Package Tier, Deliverables take one of three forms: (a) production automations configured in your own third-party accounts (SPEC-01); (b) a structured data backbone with dashboards, running either inside your OPS instance or as a Hosted Deliverable (SPEC-02); or (c) a standalone software application on its own database, designed, built, published, and operated by OPS (SPEC-03). Where these SPEC Terms refer to "Custom Modules," the reference means Deliverables deployed inside your OPS instance and gated by entitlements OPS controls.

- "Floor Price" — the published minimum total for a SPEC-03 Engagement (currently $25,000 CAD), against which the P1 deposit is fixed. The final total for a SPEC-03 Engagement is the Locked Total.

- "Hosted Deliverables" — Deliverables that OPS operates on infrastructure OPS controls: a SPEC-02 standalone backbone, or a SPEC-03 application. Hosted Deliverables require an active Care Plan under Section 11.

- "Locked Total" — the fixed total price for a SPEC-03 Engagement, set in the Scope Document and counter-signed at scope sign-off. The Locked Total is never less than the Floor Price and does not change after sign-off except through Change Orders.

- "Overage Rate" — $200 CAD per hour, the rate for change work beyond the included Change-Hours. Overage work is always estimated and approved by you in writing before it starts.

- "Engagement" — a single SPEC purchase, identified by one engagement record. Each Engagement is governed independently by its own Scope Document and its own copy of the SPEC Terms (the version accepted at the Engagement's deposit).

- "Excluded Claims" — fraud, willful misconduct, gross negligence, breach of confidentiality, breach of privacy or security obligations, and OPS's express IP indemnity obligations.

- "Guarantee Period" — the 30-day period beginning on the Walkthrough Date.

- "Guarantee Refund" — the customer-initiated refund described in Section 9 (Delivery and 30-Day Guarantee Refund).

- "Milestones" or "Checkpoints" — the payment checkpoints for an Engagement, described in Section 6. The checkpoint schedule differs by Package Tier: SPEC-01 pays at two checkpoints (P1 Deposit and P4 Delivery); SPEC-02 pays at four (P1 Deposit, P2 Scope Sign-Off, P3 Midpoint Review, P4 Delivery); SPEC-03 pays a fixed P1 Deposit against the Floor Price, with P2, P3, and P4 splitting the remainder of the Locked Total.

- "Owner Approval Step" — the workflow described in Section 6 for engagements where the buyer is not the OPS account holder. The account holder's approval is recorded as a binding "owner_purchase_approved" Acceptance Event.

- "Package Tier" — the SPEC tier you purchase (SPEC-01 · WORKFLOWS, SPEC-02 · SYSTEMS, or SPEC-03 · PROPRIETARY), as published on the SPEC marketing page at /spec.

- "White-Label Rider" — the SPEC-03 add-on described in Section 12, under which the SPEC-03 application is published under your brand.

- "Scope Document" — the versioned written statement of work for an Engagement, including the feature list, per-feature acceptance criteria, midpoint deliverable definition, delivery deliverable definition, explicit exclusions, estimated delivery window, locked SPEC subscription multiplier, locked module surcharge (if any), and a reference to the active version of the SPEC Terms. Each Scope Document is identified by a content hash. Counter-signature is recorded as a "scope_signoff" Acceptance Event.

- "Support Window" — the post-delivery support period described in Section 10. SPEC-01: 30 days. SPEC-02: 60 days. SPEC-03: 90 days. The Support Window anchors on the Walkthrough Date.

- "Walkthrough Date" — the calendar date on which OPS holds the live delivery walkthrough call with you, recorded as \`walkthrough_completed_at\` on your engagement record. The Walkthrough Date is the single anchor for the Guarantee Period, the Support Window, the Care Plan offer window, and the Care Plan billing-start date.

Capitalized terms not defined here have the meanings given to them in the body of these SPEC Terms or in the Scope Document.`,
      },
      {
        id: 'the-spec-engagement',
        title: '3. The SPEC Engagement',
        content: `SPEC is OPS's custom build service for trade businesses. The three Package Tiers deliver three different classes of work:

- **SPEC-01 · WORKFLOWS** — up to three production automations configured in your own third-party accounts (for example: supplier invoices from your inbox logged into your ledger; email attachments filed into job folders; a lead form feeding a call list). SPEC-01 Deliverables run in accounts you own and control. An OPS subscription is not required; you create a free OPS account so approvals and notices under these SPEC Terms have a home.

- **SPEC-02 · SYSTEMS** — a structured data backbone (jobs, clients, and money in one system) with dashboards, import and cleanup of your existing records, and training. The backbone's location is decided in discovery and recorded in the Scope Document: inside your OPS instance when you run OPS, or as a Hosted Deliverable on OPS-operated infrastructure when you do not.

- **SPEC-03 · PROPRIETARY** — a standalone software application on its own database, designed, built, published, and operated by OPS as a Hosted Deliverable. A SPEC-03 application may connect to your OPS account or run fully independent. SPEC-03 is scoped to a trade tool — an application that does a specific job for your trade. Anything approaching a full operations platform is out of tier and separately quoted.

Each SPEC purchase is a single Engagement. You may run multiple Engagements simultaneously or sequentially. Each Engagement has its own Scope Document, its own Checkpoints, its own Guarantee Period, and its own Deliverables.

The published Package Tiers and the deliverables expected for each tier are described on the SPEC marketing page at /spec. The Scope Document is the binding statement of what is included for your specific Engagement — if the Scope Document and the marketing page disagree, the Scope Document governs that Engagement.

OPS may update Package Tier pricing, feature lists, and tier definitions on /spec for future Engagements. Pricing and scope for an Engagement that has already opened are locked at deposit time and at scope sign-off respectively (see Sections 6 and 7).`,
      },
      {
        id: 'eligibility',
        title: '4. Eligibility and Geographic Scope',
        content: `SPEC is available to businesses operating in Canada, excluding the province of Quebec.

You are not eligible to purchase a SPEC Engagement if any of the following apply to you or to the business entity on whose behalf you are purchasing:

- Your billing address is in Quebec.
- Your head office is in Quebec.
- Your primary operating address is in Quebec.
- You maintain a Quebec establishment.
- You expect material use of the Custom Modules to occur in Quebec.

OPS enforces this exclusion in three places: a pre-payment billing-province check on the OPS-collected address form, the billing address recorded by Stripe at checkout, and the attestations you complete at intake. If you misrepresent your Quebec status to evade the exclusion, the misrepresentation is a material breach of these SPEC Terms, the Guarantee Refund becomes unavailable for that Engagement, and OPS may immediately cancel the Engagement, refund the captured deposit, and add you to the SPEC blocked-buyers list.

The reason for the exclusion is the additional legal and operational complexity created by Quebec's Consumer Protection Act, French-language commercial-relations requirements, and Quebec privacy and data-localization rules under Law 25 and An Act respecting the protection of personal information in the private sector. OPS may revisit this exclusion as the business matures. Customers outside Canada are not eligible at launch; CAD is the only supported currency.

You warrant that you have authority to enter into the SPEC Terms on behalf of any business entity you represent. If you are purchasing as an individual sole proprietor, the business entity is you and your representations apply to you personally.`,
      },
      {
        id: 'acceptable-and-prohibited-use',
        title: '5. Acceptable and Prohibited Use',
        content: `You may use SPEC and the resulting Custom Modules only to operate your own trade business in the ordinary course. SPEC is designed for owner-operated trade businesses such as residential and light-commercial construction, HVAC, plumbing, electrical, landscaping, deck and rail, painting, cleaning services, and adjacent trades.

You may not use SPEC to design, configure, or operate workflows that require any of the following:

- Processing of health information subject to HIPAA, PHIPA, or any comparable provincial or federal health-privacy regime — including any workflow that handles protected health information (PHI), patient medical records, treatment records, diagnostic data, or insurance claims involving health data.
- Raw payment card capture (PAN). Payment card data flows through Stripe; Custom Modules do not receive, store, or transit raw card numbers.
- Regulated credit decisions, including credit scoring, adverse-action notices, processing covered by FCRA-equivalent regimes, or any workflow that determines whether to extend credit to a natural person based on their personal financial data.
- Unlawful surveillance of employees or third parties, including tracking that exceeds labour-law-compliant timesheet and on-the-job location features under applicable Canadian employment and privacy law.
- Bulk messaging that violates CASL, the TCPA, or any analogous statute — including automated SMS or email sends to recipients without lawful consent, without sender identification, or without a functional unsubscribe mechanism.

You warrant that the workflow you describe at intake and during discovery does not require any of the categories above. If a prohibited workflow surfaces at any point during discovery or build, OPS may decline or terminate the Engagement; refund consequences are governed by Section 22 (Refund Mechanics). Misrepresenting the nature of your workflow is a material breach that disqualifies the Engagement from the Guarantee Refund.

OPS may decline any prospective Engagement, or terminate an active Engagement, that it determines materially conflicts with the SPEC Terms or with applicable law. Termination for prohibited workflow is governed by Section 20.`,
      },
      {
        id: 'payment-terms',
        title: '6. Payment Terms',
        content: `Each Package Tier is billed on its own fixed checkpoint schedule. The schedule for your tier is locked at deposit; no Engagement is billed on any other cadence.

**SPEC-01 · WORKFLOWS — $2,000 CAD fixed, paid 50/50:**

| Checkpoint | Trigger | Amount |
|---|---|---|
| P1 — Deposit | Click-to-book in the SPEC checkout flow | $1,000 (50% of total) |
| P4 — Delivery | Deliverables are live in your accounts, the live walkthrough is held, and \`walkthrough_completed_at\` is recorded | $1,000 (50% of total) |

SPEC-01 scope sign-off carries no payment, but it is not skipped: your intake responses distill into a written work order that you counter-sign as a "scope_signoff" Acceptance Event before build starts. The payment schedule changes when money moves — the evidence chain does not.

**SPEC-02 · SYSTEMS — $7,500 CAD fixed, paid in four equal checkpoints:**

| Checkpoint | Trigger | Amount |
|---|---|---|
| P1 — Deposit | Click-to-book in the SPEC checkout flow | $1,875 (25% of total) |
| P2 — Scope Sign-Off | Customer counter-signs the Scope Document; recorded as a "scope_signoff" Acceptance Event | $1,875 |
| P3 — Midpoint Review | Customer accepts the midpoint deliverable; recorded as a "midpoint_accepted" Acceptance Event | $1,875 |
| P4 — Delivery | The backbone is live, the walkthrough is held, and \`walkthrough_completed_at\` is recorded | $1,875 |

**SPEC-03 · PROPRIETARY — from $25,000 CAD; total locked at scope sign-off:**

| Checkpoint | Trigger | Amount |
|---|---|---|
| P1 — Deposit | Click-to-book in the SPEC checkout flow | $6,250, fixed against the Floor Price |
| P2 — Scope Sign-Off | Customer counter-signs the Scope Document, which sets the Locked Total; recorded as a "scope_signoff" Acceptance Event | (Locked Total − $6,250) ÷ 3 |
| P3 — Midpoint Review | Customer accepts the midpoint deliverable | (Locked Total − $6,250) ÷ 3 |
| P4 — Delivery | The application is live, the walkthrough is held, and \`walkthrough_completed_at\` is recorded | (Locked Total − $6,250) ÷ 3, plus any residual cents |

The SPEC-03 Locked Total is set in the Scope Document at scope sign-off and is never less than the Floor Price. If you decline the proposed Locked Total at sign-off, you may cancel the Engagement and the refund matrix in Section 22 applies to the deposit. Until the Locked Total is set, all published SPEC-03 figures are quoted against the Floor Price.

P1 is paid through Stripe Checkout at deposit time. All later checkpoints are issued as Stripe Invoices with net-15 payment terms.

For Engagements where the buyer is not the OPS account holder, the Owner Approval Step gates the payment session. The account holder must approve the purchase electronically before any Stripe Checkout Session is created. The approval is recorded as an "owner_purchase_approved" Acceptance Event capturing the account holder's identifier, IP, user agent, signature method, and a hash of the version of these SPEC Terms they reviewed. The buyer's later ToS acceptance at Stripe Checkout is a separate "tos_accepted" Acceptance Event. Both events are part of the Engagement's evidence chain in any dispute.

Currency is Canadian dollars (CAD) only. Stripe Tax calculates and collects GST, HST, and PST based on the billing address recorded at Stripe Checkout. QST does not apply because Quebec is excluded (Section 4). You may optionally provide a GST/HST number at checkout, which OPS attaches to your Stripe customer record so input-tax-credit-eligible invoices reflect it.

If a checkpoint invoice is unpaid more than 7 calendar days past its net-15 due date, OPS may disable the affected Deliverables until the invoice is paid in full — Custom Modules inside your OPS instance are entitlement-disabled, and Hosted Deliverables are suspended. Disablement is recorded with the reason "non_payment" and is reversed immediately on payment. The Guarantee Period clock is tolled while Deliverables are disabled for non-payment (Section 9). SPEC-01 Deliverables live in your own accounts and cannot be disabled by OPS; an unpaid SPEC-01 delivery balance remains a debt owing, OPS may suspend Support Window service until it is paid, and OPS may pursue ordinary collection.

OPS may decline to begin work on a subsequent checkpoint while a prior checkpoint invoice is overdue. Repeated non-payment is a material breach and may result in termination under Section 20.`,
      },
      {
        id: 'scope-and-change-orders',
        title: '7. Scope, Change Orders, and Pricing',
        content: `The signed Scope Document is the binding statement of what OPS will build for your Engagement. The Engagement is fixed-price at the checkpoint amounts shown in Section 6 (for SPEC-03, at the Locked Total once set); there is no hours-tracking, hourly-overage billing, or "demonstrate your time" reconciliation on the core engagement. If OPS completes the Scope Document faster than estimated, the checkpoint amounts do not change. If OPS takes longer than estimated (subject to Section 8 delivery-date language), OPS absorbs the additional time.

For SPEC-03 Engagements, the Scope Document sets the Locked Total at scope sign-off. The Locked Total is built from the counter-signed feature list and is never less than the Floor Price. After sign-off the Locked Total changes only through accepted Change Orders.

After scope sign-off you may request changes. OPS classifies each requested change into one of two categories:

- A minor change is one OPS estimates at less than approximately 4 hours of work. Minor changes are billed at the Overage Rate ($200 CAD per hour), in 30-minute increments. You pre-approve the estimate; the pre-approval is recorded as a "change_order_accepted" Acceptance Event. Minor changes are invoiced at the end of the current checkpoint or at the end of the Engagement, net-15.
- A major change is one OPS estimates at 4 hours or more. Major changes are quoted as a fixed price for a defined scope. OPS provides the scope, the price, and the impact on the delivery window; you accept in writing as a "change_order_accepted" Acceptance Event. Major changes are tracked as separate Change Order records and invoiced on completion, net-15.

OPS determines the estimate and the minor-versus-major classification using the signed Scope Document and the per-feature acceptance criteria. Your option is to accept or decline the estimate; estimates are not negotiable. No change work is billed that you did not approve in writing first.

Tier upgrades requested before scope sign-off are full pro-rated upgrades: you pay the difference between the new tier total (for SPEC-03, the Floor Price pending the Locked Total) and the amounts already paid, and discovery work counts toward the new tier. Tier upgrades requested after scope sign-off are case-by-case fixed-price quotes tracked as Change Orders.`,
      },
      {
        id: 'acceptance-and-quality',
        title: '8. Acceptance and Quality',
        content: `Each feature in the Scope Document carries a written acceptance criterion. A feature is "accepted" when it meets the written criterion. Acceptance of all features required for a checkpoint triggers the checkpoint invoice.

The midpoint deliverable differs by tier and is defined in the Scope Document: for SPEC-02, the backbone staged for your review with your records loaded; for SPEC-03, a working prototype covering approximately half of the locked scope. SPEC-01 Engagements have no midpoint checkpoint — the schedule runs deposit to delivery.

After the midpoint review (where the tier has one) and after the delivery walkthrough, OPS may invite you to rate each feature on a 1-to-5 satisfaction scale. The rating is non-binding feedback. A passing acceptance criterion triggers the checkpoint invoice regardless of rating. OPS reviews 1-star and 2-star ratings against the acceptance criterion and repairs or rebuilds the feature at no charge if the criterion objectively fails. Subjective preferences with passing acceptance criteria are handled through the polish budget (described below) or through the Change Order process in Section 7.

OPS may include a discretionary post-scope polish budget on each Engagement — typically 2 hours for SPEC-01, 4 hours for SPEC-02, and 8 hours for SPEC-03. Polish hours are at OPS's sole discretion, are not billed, and may be exhausted before all subjective preferences are addressed. Once polish is exhausted, additional changes flow through the Change Order process.

Delivery dates in the Scope Document are good-faith estimates, not firm deadlines. OPS will notify you of any anticipated delay greater than 7 days within 48 hours of identifying the delay, and will provide a revised estimate. No automatic credits, refunds, or penalties apply to delivery-window slips. If a delay is unacceptable to you, you may invoke the cancellation and refund process in Section 22.`,
      },
      {
        id: 'delivery-and-guarantee',
        title: '9. Delivery and 30-Day Guarantee Refund',
        content: `Delivery of an Engagement consists of all of the following:

- The Deliverables are live: SPEC-01 automations running in your accounts; a SPEC-02 backbone live in your OPS instance or on OPS-operated infrastructure; a SPEC-03 application live and, where applicable, published.
- OPS holds a 30 to 60 minute live delivery walkthrough on a video call. The walkthrough is recorded and the recording link is stored on your engagement record.
- The \`walkthrough_completed_at\` timestamp is recorded on your engagement record.

P4 fires immediately on delivery. The Walkthrough Date is the calendar date on which the live walkthrough was held.

**Guarantee Refund.** Customer may request the Guarantee Refund within 30 days after the Walkthrough Date by written notice stating dissatisfaction. OPS will not require Customer to prove a defect or allow OPS a cure period. The guarantee is unavailable after a chargeback, fraud, material misrepresentation, prohibited workflow, material breach, or continued use after refund. The guarantee clock is tolled while modules are disabled for non-payment. Valid guarantee requests are processed within 7 business days.

You may submit a Guarantee Refund request through the in-app refund route at /account/spec/[id]/request-refund or by emailing jackson@opsapp.co. The request must come from the buyer or the OPS account holder.

The refund lever on issuance depends on where your Deliverables live:

- **SPEC-01 (your own accounts):** your money back. The automations run in accounts you own — OPS cannot and does not disable them. OPS refunds the SPEC-01 build fees per Section 22 and stops supporting the automations. OPS's maximum exposure on a SPEC-01 guarantee is the $2,000 engagement total; this is an accepted term of the tier.
- **SPEC-02 backbone inside your OPS instance:** the Custom Module entitlements are set to disabled with reason "refunded." You agree to stop using the disabled Modules immediately. Continued workaround use of refunded Modules — including exporting Module-built data and reinserting it elsewhere in OPS — is a material breach.
- **Hosted Deliverables (a standalone SPEC-02 backbone, or a SPEC-03 application):** access is disabled and any published application listing is removed. Your data is exported and delivered to you per the off-boarding terms in Section 11.

In every case:

- Your underlying base OPS subscription is unaffected. Only the SPEC Deliverables (and any Care Plan for them) are removed.
- Each checkpoint is settled according to the per-state mechanics in Section 22 so that you owe nothing further for the refunded Engagement.

The Guarantee Refund may be invoked once per Engagement. If you have multiple Engagements, each Engagement carries its own Guarantee Refund right. The Guarantee Refund does not extend to the base OPS subscription, to Care Plan fees that have already accrued for service rendered, or to Change Order fees already billed for work delivered.

The Guarantee Refund is your sole and exclusive remedy for dissatisfaction with the SPEC Engagement during the Guarantee Period, except as provided in Sections 15, 17, 18, and 19 with respect to Excluded Claims.`,
      },
      {
        id: 'support-window',
        title: '10. Support Window',
        content: `OPS provides a Support Window beginning on the Walkthrough Date.

| Package Tier | Support Window length |
|---|---|
| SPEC-01 · WORKFLOWS | 30 days |
| SPEC-02 · SYSTEMS | 60 days |
| SPEC-03 · PROPRIETARY | 90 days |

During the Support Window:

- Critical defects (defects that break a core workflow or block daily operation) are repaired at no charge regardless of cause. OPS targets same-business-day response and 48-hour resolution.
- High-severity defects (defects that degrade but do not block) are repaired at no charge if the defect violates an acceptance criterion in the Scope Document. OPS targets 3-business-day resolution.
- Cosmetic and enhancement requests are billable Change Orders under Section 7.

After the Support Window closes, ordinary bugs and enhancement requests are billable unless covered by an active Care Plan or by a still-active accepted support obligation. OPS does not disclaim its duties for security obligations, privacy obligations, confidentiality obligations, willful misconduct, gross negligence, or defects covered by a still-active express warranty or an accepted support obligation.

OPS targets but does not guarantee specific response or resolution times for tickets filed during the Support Window. Targets are good-faith service levels, not contractual commitments backed by credits.`,
      },
      {
        id: 'care-plans',
        title: '11. Care Plans',
        content: `A Care Plan is the monthly service subscription that keeps OPS-operated work running after delivery. When OPS operates your system, someone is contractually on the hook for it — that is the Care Plan.

| Package Tier | Care Plan | Required? | Coverage |
|---|---|---|---|
| SPEC-01 · WORKFLOWS | None | — | SPEC-01 carries no monthly fee. The automations run in your own accounts; you are responsible for those accounts and any third-party fees they carry. |
| SPEC-02 · SYSTEMS | $395 CAD per month | **Required while OPS operates a standalone backbone.** Optional after the Support Window when the backbone lives in your own OPS instance. | Monitoring, defect fixes, hosting of the standalone backbone, and up to 2 Change-Hours per month. |
| SPEC-03 · PROPRIETARY | From $750 CAD per month (base; the White-Label Rider adds $200 per month) | **Required while OPS hosts and operates the application.** | Infrastructure, updates, support, application-store compliance, and up to 3 Change-Hours per month. |

**Billing start.** Care Plan billing begins when your Support Window ends — 30, 60, or 90 days after the Walkthrough Date by tier. The Support Window itself carries no Care Plan charge. Care Plans are billed monthly through a Stripe subscription; enrollment is confirmed in writing before the first charge, never silent.

**Change-Hours and overage.** Included Change-Hours cover ongoing change work — adjustments, small enhancements, evolution of the delivered scope. Unused Change-Hours do not bank into future months. Work beyond the included hours is billed at the Overage Rate ($200 CAD per hour) and is always estimated and approved by you in writing before it starts. New features, scope expansions, and rewrites beyond Change-Hour scale flow through the Change Order process in Section 7.

**Service posture — stated plainly.** OPS operates Hosted Deliverables on commercially reasonable efforts. OPS does not offer a contractual uptime service-level agreement, uptime percentage commitment, or service credits at these price points, and you should not purchase a SPEC Engagement expecting one. OPS targets prompt response and repair consistent with Section 10's support posture, monitors Hosted Deliverables, and carries the same operational care for your system as for OPS's own platform — but targets are good-faith service levels, not credit-backed commitments.

**Cancellation and off-boarding.** You may cancel a Care Plan effective at the end of the current billing period; there is no proration. Because a Care Plan is required while OPS operates Hosted Deliverables, cancelling it triggers off-boarding: OPS will wind down operation on 30 days' notice, export your data to you in CSV or JSON (and any other format reasonably available), and — for white-labelled SPEC-03 applications — offer the App Transfer path described in Section 12. If you stop paying a required Care Plan without cancelling, OPS may suspend the Hosted Deliverables after notice, and Section 21's data-export obligations still apply. OPS does not hold your business data hostage: data export under this paragraph is included, not billable.

**In-OPS backbones and subscription lapse.** Where a SPEC-02 backbone lives in your own OPS instance, the backbone depends on your base OPS subscription. If the base subscription lapses, the SPEC-built modules are disabled automatically (reason "subscription_lapse"); the module code is retained on OPS infrastructure, and resuming your subscription re-enables them at no charge.

Care Plan offer emails sent at or near the close of the Support Window are commercial electronic messages under CASL and comply with the requirements in Section 24.`,
      },
      {
        id: 'white-label-rider',
        title: '12. White-Label Rider (SPEC-03)',
        content: `The White-Label Rider is an optional SPEC-03 add-on: the application OPS builds for you is published under your brand — your name, your icon, your application-store listing, your screenshots, your description. The Rider is $4,000 CAD one-time, added to the Locked Total at scope sign-off, plus $200 CAD per month added to the SPEC-03 Care Plan.

**Publisher of record — disclosed plainly.** White-labelled applications are published under OPS's Apple Developer organization account (and equivalent accounts on other stores where applicable). This is turnkey by design: you set up no developer account, renew nothing, and manage no store relationship. One consequence is fixed by Apple, not by OPS: the App Store "Seller" line displays OPS's legal entity name, because Apple binds that field to the developer account. Everything above the fold — name, icon, listing content — is your brand. You accept this seller-line presentation by purchasing the Rider.

**Brand warranty and publishing license.** You warrant that you own or control the brand assets you supply — names, logos, icons, marks, screenshots content — and that OPS's use of them for the white-labelled application infringes no third party's rights. You grant OPS a non-exclusive license to use those brand assets solely to build, publish, operate, and maintain the white-labelled application for you. This license ends at off-boarding, subject to store-imposed wind-down timelines. Your brand assets remain yours; nothing in the Rider transfers brand ownership to OPS.

**Store compliance.** OPS administers the listing end to end: store review submissions, compliance updates, certificate and account renewals, and store-policy responses are OPS's responsibility while the Care Plan is active. If a store policy change makes continued publication impracticable in OPS's reasonable judgment, OPS will notify you and propose the best available path (re-publication in altered form, transfer under the paragraph below, or wind-down with data export).

**App Transfer — the off-boarding escape hatch.** Turnkey today is not lock-in forever. If you want full publisher-of-record ownership, Apple's App Transfer mechanism moves the application to your own Apple Developer account with reviews and install history preserved. OPS administers the transfer at your request, billed at the Overage Rate as time-and-materials work, quoted first. After transfer you own the store relationship; continued OPS operation of the backend, if desired, is negotiated as a fresh services arrangement.`,
      },
      {
        id: 'confidentiality',
        title: '13. Confidentiality',
        content: `OPS and Customer each agree to keep the other's Confidential Information confidential. "Confidential Information" means non-public information disclosed by one party to the other in connection with an Engagement, marked or reasonably understood as confidential — including business operations, customer lists, financial data, source code, configurations, internal documents, and the contents of the Scope Document.

Each party will (a) use the other's Confidential Information only to perform under these SPEC Terms; (b) protect it with at least the same degree of care it uses for its own confidential information of similar sensitivity, but in no event less than a reasonable degree of care; and (c) not disclose it to any third party except to its personnel, advisors, and subprocessors who have a need to know and who are bound by confidentiality obligations at least as protective as those in this section.

The confidentiality obligation does not apply to information that (i) is or becomes publicly available through no breach by the receiving party, (ii) the receiving party already lawfully possessed without confidentiality obligations, (iii) the receiving party independently developed without reference to the disclosing party's Confidential Information, or (iv) is rightfully received from a third party without confidentiality obligations.

Disclosure compelled by law is permitted, provided the disclosing party gives prior notice to the other party where lawful and cooperates in any reasonable effort to limit the disclosure.

Confidentiality obligations survive termination of an Engagement for three years, except that obligations regarding trade secrets continue for as long as the information remains a trade secret under applicable law.`,
      },
      {
        id: 'privacy-and-data-protection',
        title: '14. Privacy and Data Protection',
        content: `OPS processes personal information about you, your team, and your end-clients in connection with each SPEC Engagement. The OPS Privacy Policy at /legal?page=privacy describes the data collected, the purposes of processing, the subprocessors used, the retention periods, and your rights under the Personal Information Protection and Electronic Documents Act (PIPEDA) and applicable provincial law. The Privacy Policy is incorporated into the SPEC Terms by reference.

Customer-to-OPS data processing is governed by the Data Processing Agreement at /legal?page=dpa, also incorporated by reference. The DPA covers OPS's obligations as a processor of personal data on your behalf, including the use of subprocessors, breach notification, and assistance with data-subject requests.

SPEC-specific personal data — including intake form responses, file uploads to the SPEC intake storage bucket, scope document content, satisfaction survey responses, the communications log, and attribution data — is described in the Privacy Policy and processed in accordance with the DPA. You consent to these processing activities by accepting the SPEC Terms and by authorizing your team and end-clients' data to flow through OPS for the SPEC Engagement.

Your data may be processed outside the province of British Columbia and outside Canada by OPS's subprocessors. OPS relies on contractual safeguards with each subprocessor to protect the data. The Privacy Policy lists the subprocessors and their processing locations.

If OPS becomes aware of a breach of security safeguards involving your personal information that creates a real risk of significant harm, OPS will notify you and the Office of the Privacy Commissioner of Canada as required by PIPEDA and any applicable provincial law.`,
      },
      {
        id: 'intellectual-property-and-license',
        title: '15. Intellectual Property and License',
        content: `**IP and license.** OPS owns all code, configurations, designs, templates, and reusable know-how created for SPEC. Customer owns its business data. While Customer maintains an active OPS subscription and is not in breach, OPS grants Customer a limited, non-exclusive, non-transferable license to use the delivered modules inside OPS. The license ends when the OPS subscription ends or the engagement is refunded.

The license surface differs by where your Deliverables live:

- **Custom Modules inside your OPS instance** (a SPEC-02 in-OPS backbone): the paragraph above applies as written — the license is exercisable only inside the OPS platform and ends when your base OPS subscription ends or the Engagement is refunded.
- **Hosted Deliverables** (a standalone SPEC-02 backbone, or a SPEC-03 application): OPS grants you a limited, non-exclusive, non-transferable license to use the Hosted Deliverable for your own internal business operations while the Engagement is in good standing and the required Care Plan is active. The license does not depend on a base OPS subscription. It ends on refund, on termination, or on off-boarding under Section 11 — except that data exported to you at off-boarding is yours without restriction.
- **SPEC-01 automations delivered into your own accounts:** the delivered configurations run in accounts you own, and you may run, modify, and retire them freely after delivery. OPS retains ownership of the underlying patterns, templates, and know-how, and post-delivery support for modified automations is limited to the Support Window terms in Section 10.

In every case the license is non-sublicensable, non-assignable, and restricted to your own internal business operations. You may not extract, decompile, reverse-engineer, copy, or re-host Custom Modules or Hosted Deliverables, and you may not white-label or resell access to any Deliverable to third parties (the Section 12 White-Label Rider is the sole white-label path, and it covers presentation of your own application to your own clients, not resale). You may use the operational outputs of the Deliverables — your invoices, your customer records, your project data, your photos, your reports — freely; the license restriction applies to code and configuration, not to the data the Deliverables produce.

**Exclusivity — scoped precisely (SPEC-03).** OPS will not sell, license, or transfer *your application* — the SPEC-03 application built for you, meaning your instance, your brand, your configuration, and your data — to any other company, including a competitor. That is the exclusivity you buy. It is equally important to state what is *not* exclusive: OPS retains unrestricted rights to reuse the code, components, patterns, and know-how underneath your application, up to and including building a functionally equivalent tool for another customer or folding components into OPS's own products. Exclusive to you: your instance, your brand, your configuration, your data, and your license. Not exclusive: the code, the patterns, and the concept.

OPS may reuse anonymized patterns, generic configurations, and reusable know-how learned across SPEC Engagements in future SPEC work. OPS will never reuse your business data — customer names, employee names, financials, project records, photos, or any other identifying information — in any other customer's Engagement.

OPS provides the following express IP indemnity. If a third party claims that the OPS-developed Deliverables, as delivered, infringe the third party's intellectual property rights, OPS will defend you against the claim and indemnify you against damages awarded against you, provided that you (a) promptly notify OPS of the claim, (b) give OPS sole control of the defence and settlement, and (c) reasonably cooperate at OPS's expense. OPS's obligations under this paragraph do not apply to claims arising from (i) your modification of the Deliverables, (ii) your combination of the Deliverables with third-party software or data not provided or approved by OPS, or (iii) your use of the Deliverables other than as described in the Scope Document and the SPEC Terms. This IP indemnity is the express IP indemnity obligation referenced in the Excluded Claims definition and sits outside the liability cap in Section 19.

OPS may use de-identified, aggregated information about platform usage patterns derived from the Custom Modules to improve the OPS platform. Any feedback, suggestions, or ideas you provide regarding the Modules or the OPS platform may be used by OPS without restriction or compensation, subject to the confidentiality obligations in Section 13.`,
      },
      {
        id: 'customer-warranties',
        title: '16. Customer Warranties',
        content: `You warrant to OPS that:

- You have full authority to enter into the SPEC Terms and to commit your business to the obligations they create.
- The business information you provide at intake and during discovery — including your trade, your team size, your tools, your workflow, your revenue band, your billing address, and your regulated-workflow attestations — is accurate and complete in all material respects.
- The data you provide to OPS for use in the Custom Modules was collected lawfully and may be processed by OPS on your behalf for the purposes described in the OPS Privacy Policy and the DPA.
- You have the right and consent to provide personal data about your employees and end-clients that flows into OPS, including consent required by applicable privacy and employment law regarding workplace location data, time tracking, and similar information.
- Your business and the Custom Modules will be operated in compliance with applicable law, including CASL, applicable provincial privacy law, applicable employment law, and applicable tax law.
- You are not located in Quebec, do not have a Quebec head office, do not have a Quebec primary operating address, do not maintain a Quebec establishment, and do not expect material use of the Custom Modules to occur in Quebec.
- You are not subject to a Canadian or U.S. government economic sanctions list and are not located in a jurisdiction subject to comprehensive economic sanctions.`,
      },
      {
        id: 'ops-warranties',
        title: '17. OPS Warranties and Disclaimer',
        content: `OPS warrants that the Custom Modules will substantially conform to the acceptance criteria in the Scope Document at the time of delivery. Your exclusive remedy for breach of this warranty during the Guarantee Period is the Guarantee Refund described in Section 9. Your exclusive remedy for breach during the Support Window is repair as described in Section 10.

EXCEPT AS EXPRESSLY STATED IN THESE SPEC TERMS, THE SPEC ENGAGEMENT AND THE CUSTOM MODULES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, OPS DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND UNINTERRUPTED OR ERROR-FREE OPERATION.

Some provinces do not allow the exclusion of certain implied warranties. The above disclaimer applies only to the extent permitted by applicable law in your jurisdiction.`,
      },
      {
        id: 'indemnification',
        title: '18. Indemnification',
        content: `You will defend, indemnify, and hold harmless OPS, its directors, officers, employees, and contractors against any third-party claim, damage, loss, liability, or expense (including reasonable legal fees) arising from or relating to:

- Your use of the OPS platform or the Custom Modules in violation of the SPEC Terms or applicable law.
- Your business data, including any claim that the data was collected, stored, or processed in violation of privacy law, intellectual property law, employment law, or contract.
- The acts or omissions of your employees, contractors, or end-clients in connection with the Custom Modules.
- Your operation of, or attempt to operate, a workflow prohibited by Section 5.
- Your misrepresentation of Quebec eligibility or any other warranty under Section 16.

OPS provides the express IP indemnity described in Section 15 against third-party claims that the Module code, as delivered, infringes a third party's intellectual property rights. That express IP indemnity is an Excluded Claim and sits outside the liability cap in Section 19.`,
      },
      {
        id: 'limitation-of-liability',
        title: '19. Limitation of Liability',
        content: `**Limitation of liability.** Except for Excluded Claims, during the Guarantee Period Customer's sole and exclusive remedy for dissatisfaction with the SPEC engagement is the Guarantee Refund. Excluded Claims means fraud, willful misconduct, gross negligence, breach of confidentiality, breach of privacy or security obligations, and OPS's express IP indemnity obligations. After the Guarantee Period, OPS's aggregate liability for non-Excluded Claims is capped at SPEC fees paid in the 12 months before the claim, less refunds.

Excluded Claims sit outside the cap during and after the Guarantee Period. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, NEITHER PARTY IS LIABLE TO THE OTHER FOR CONSEQUENTIAL, INCIDENTAL, INDIRECT, SPECIAL, PUNITIVE, OR EXEMPLARY DAMAGES — INCLUDING LOST PROFITS, LOST REVENUE, LOST DATA, LOST OPPORTUNITY, OR BUSINESS INTERRUPTION — EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

Some provinces do not allow the exclusion or limitation of certain damages. The above limitations apply only to the extent permitted by applicable law in your jurisdiction.`,
      },
      {
        id: 'term-and-termination',
        title: '20. Term and Termination',
        content: `The SPEC Terms apply to each Engagement from the date you accept them through the close of the Engagement (delivery, refund, cancellation, or termination, whichever occurs first), plus the survival periods in Section 30.

You may cancel an Engagement at any time by written notice to jackson@opsapp.co. The refund consequences of cancellation are governed by Section 22 (Refund Mechanics).

OPS may terminate an Engagement immediately on written notice if:

- You materially breach the SPEC Terms and fail to cure the breach within 10 days of written notice, where the breach is curable.
- You miss three scheduled discovery sessions without 24 hours' advance notice (the "third no-show" cancellation; the deposit is forfeited per Section 22).
- You misrepresent your Quebec eligibility (Section 4) or your regulated-workflow status (Section 5).
- A Stripe chargeback is filed in connection with the Engagement and OPS elects to terminate.
- You become insolvent, file for bankruptcy, become subject to receivership, or take comparable steps under applicable insolvency law.

OPS may also terminate an Engagement for convenience on 30 days' written notice; in that case OPS will refund unearned Milestone amounts as if you had invoked the pre-delivery refund matrix in Section 22.

Termination under this Section does not relieve either party of obligations that, by their nature, survive termination — see Section 30 (Survival).`,
      },
      {
        id: 'effect-of-termination',
        title: '21. Effect of Termination',
        content: `On termination of an Engagement:

- All entitlements for the Custom Modules under that Engagement are disabled in your OPS instance.
- The Module code is retained by OPS per Section 15.
- Your business data flowing through the disabled Modules remains in your OPS instance and is exportable on request as CSV or JSON within 30 days of the termination.
- Your base OPS subscription continues unchanged unless you separately cancel it.
- The sections listed in Section 30 (Survival) remain in effect.

OPS may retain operational logs, communications, and metadata associated with the Engagement on its standard retention schedule (see the Privacy Policy), and may retain financial records as required by Canadian tax and accounting law.`,
      },
      {
        id: 'refund-mechanics',
        title: '22. Refund Mechanics',
        content: `All SPEC refunds are manually initiated by you. OPS does not issue automated refunds. OPS does not proactively refund stalled or abandoned Engagements; until you submit a refund request, your captured deposit and Milestone payments stay on file.

Refund eligibility depends on where the Engagement is in its lifecycle:

| Refund stage | Eligibility |
|---|---|
| Pre-discovery — before the first discovery session is held | Typically a full deposit refund at OPS's discretion, since no work has been done. |
| Post-discovery, pre-scope sign-off | Pro-rated. OPS retains the portion of the deposit corresponding to discovery work performed; the remainder is refunded. |
| Post-scope sign-off, pre-delivery | Pro-rated. Completed checkpoints are non-refundable; unstarted checkpoints are refundable. |
| Within the Guarantee Period (30 days after the Walkthrough Date) | Guarantee Refund per Section 9 on your written request stating dissatisfaction. No defect proof and no cure period. One invocation per Engagement, subject to the Section 9 exclusions. |
| After the Guarantee Period | Engagement build fees are non-refundable. You may request a goodwill refund; OPS may grant or deny at its sole discretion. Granted goodwill refunds are flagged accordingly in the refund record. |

Because Milestones are issued on net-15 invoicing, some Milestones may be unpaid at the time a refund is granted. OPS's refund obligation is fulfilled by, for each Milestone, taking the action below that matches the Milestone's payment state at refund time:

| Milestone payment state | OPS action |
|---|---|
| Paid via Stripe Payment Intent | Stripe refund reversing the captured charge to the original payment method. |
| Invoice issued and fully paid | Stripe refund on the underlying Payment Intent. |
| Invoice issued and partially paid | Stripe credit note for the unpaid portion plus Stripe refund for the paid portion. |
| Invoice issued and unpaid | Stripe void on the open invoice. |
| Invoice issued, unpaid, and non-cancellable | Stripe "mark uncollectible" — the invoice is closed and OPS pursues no further collection. |

The aggregate effect of these actions is that you owe nothing further for the refunded Engagement and OPS has no further collection rights for that Engagement. Each per-Milestone action is recorded in the Engagement's refund breakdown for evidentiary purposes.

Refunds are processed within 7 business days of the date OPS confirms the request is valid. Funds typically settle into your account 5 to 7 business days after the refund is issued, depending on your card issuer or bank.

If you have paid no-show fees, Change Order fees, or Care Plan fees for service that was rendered, those amounts are not refunded under the Guarantee Refund. The Guarantee Refund covers the SPEC build fees for the refunded Engagement only.

If your Engagement is cancelled under Section 20 for three discovery no-shows, the deposit is forfeited and no refund is issued.`,
      },
      {
        id: 'version-pinning',
        title: '23. Version Pinning',
        content: `Each Engagement is governed by the version of the SPEC Terms in effect at the moment you accepted them at deposit. The accepted version is captured as a build-time commit hash and stored alongside the Engagement record. The full text of the accepted version is preserved in OPS's source-controlled legal-content registry and is available to you on request.

Future amendments to the SPEC Terms do not apply retroactively to Engagements with a counter-signed Scope Document dated before the amendment's effective date, except where you affirmatively accept the amendment in writing or where the amendment is non-material under Section 27 (Amendments).

If you run multiple Engagements over time, each Engagement may carry a different accepted version, depending on when each was opened. The version applicable to a dispute is the version associated with the Engagement that the dispute concerns. Where a dispute spans multiple Engagements, the version associated with each Engagement governs the corresponding portion of the dispute.`,
      },
      {
        id: 'casl-and-commercial-messages',
        title: '24. CASL and Commercial Electronic Messages',
        content: `OPS sends two categories of email in connection with SPEC Engagements: operational/transactional messages and commercial electronic messages.

Operational/transactional messages include deposit receipts, owner-approval requests and decisions, intake reminders, scope-sign-off confirmations, Milestone invoices, refund confirmations, Stripe dispute notices, Support Window notices, service-disruption notices, and Custom Module status alerts. Operational messages are required to complete the contractual relationship under the SPEC Terms and are not subject to CASL consent requirements. You receive these messages regardless of your marketing preferences.

Commercial electronic messages include Care Plan offers, referral-program promotions, SPEC marketing follow-ups, and any future cross-sell offers. Each commercial message complies with CASL by identifying OPS as sender, including OPS's mailing address (303-1121 Oscar Street, Victoria BC V8V2X3), providing a functional unsubscribe mechanism processed within 10 business days, and stating the consent basis on which OPS sent the message (express consent, implied consent under the existing-business-relationship two-year window, or otherwise).

You give your consent to receive operational messages by accepting the SPEC Terms, and that consent applies for as long as the Engagement is active. You may give or withdraw consent for commercial messages independently of operational messages. Operational messages will continue even if you have unsubscribed from commercial messages.

The SPEC referral program (when active) is link-based. OPS does not send commercial messages on your behalf to your referrals. Messages to referred prospects start only after the referred party submits a form, starts checkout, or otherwise expressly opts in.`,
      },
      {
        id: 'governing-law-and-disputes',
        title: '25. Governing Law and Disputes',
        content: `The SPEC Terms are governed by the laws of the Province of British Columbia and the federal laws of Canada applicable in British Columbia, without regard to conflict-of-law principles.

Any dispute arising out of or relating to the SPEC Terms or a SPEC Engagement is subject to the exclusive jurisdiction of the courts located in Vancouver, British Columbia. Specifically:

- Disputes for claims of $35,000 CAD or less are resolved in the British Columbia Provincial Court (Small Claims), Vancouver Registry.
- Disputes for claims greater than $35,000 CAD are resolved in the Supreme Court of British Columbia, Vancouver Registry.

The parties expressly waive any right to a jury trial to the extent any such right would otherwise apply. The SPEC Terms do not contain a mandatory arbitration provision; either party may bring suit in the courts identified above. Each party bears its own costs in any dispute, except as otherwise ordered by the court.

The SPEC Terms are written in English. If a translation is provided for convenience, the English version governs.`,
      },
      {
        id: 'force-majeure',
        title: '26. Force Majeure',
        content: `Neither party is liable for a failure or delay in performance caused by an event beyond its reasonable control, including acts of God, natural disasters, wildfires, floods, earthquakes, pandemics, war, terrorism, civil unrest, government action, embargoes, major internet outages, failures of upstream cloud providers, labour disputes, and similar events ("Force Majeure"). The affected party will notify the other promptly and will resume performance as soon as reasonably practicable.

Force Majeure does not excuse payment obligations for work already delivered or for refunds already due. If a Force Majeure event prevents performance for more than 60 consecutive days, either party may terminate the affected Engagement on written notice; refunds for terminated Engagements are governed by Section 22.`,
      },
      {
        id: 'amendments',
        title: '27. Amendments',
        content: `OPS may amend the SPEC Terms from time to time. OPS will notify customers with active Engagements of any amendment at least 30 days before the amendment's effective date, by email to the address on file and via the OPS in-app notification rail.

For Engagements with a counter-signed Scope Document dated before the amendment's effective date, the amendment applies only with your affirmative written acceptance, except for non-material amendments — which include clarifications, formatting changes, subprocessor list additions that do not change a data-handling category, and corrections of typographical errors — which apply automatically 30 days after notice. Material amendments — including changes to pricing structure, the scope of the SPEC Engagement, intellectual property ownership, refund mechanics, or limitation of liability — never apply retroactively without your affirmative written acceptance.

New Engagements that open after an amendment's effective date are governed by the amended SPEC Terms in effect at the time of the new Engagement's deposit.`,
      },
      {
        id: 'notices',
        title: '28. Notices',
        content: `Notices under the SPEC Terms are valid when sent by email:

- To OPS: jackson@opsapp.co for SPEC engagement notices, or info@opsapp.co for general legal notices.
- To Customer: the email address on file for the buyer and (for Engagements with an Owner Approval Step) the OPS account holder, as captured in the SPEC checkout flow.

A notice is deemed received on the next business day after it is sent, provided the sending party does not receive a delivery-failure bounce. You are responsible for keeping your email address current in your OPS account. Notices addressed to a stale email do not relieve you of the underlying obligation.

OPS may also serve notices through the in-app notification rail in OPS-Web; such in-app notifications are valid notice in addition to (not instead of) email. Court process and other notices required by law to be served in writing in physical form may be sent to OPS at 303-1121 Oscar Street, Victoria BC V8V2X3.`,
      },
      {
        id: 'assignment-and-general',
        title: '29. Assignment, Severability, and Entire Agreement',
        content: `You may not assign the SPEC Terms or any rights or obligations under them, in whole or in part, without OPS's prior written consent. OPS may assign the SPEC Terms, in whole or in part, in connection with a merger, acquisition, reorganization, or sale of all or substantially all of its assets, on written notice to you.

If any provision of the SPEC Terms is held unenforceable by a court of competent jurisdiction, the unenforceable provision is severed and the remaining provisions remain in full force and effect. The court is authorized to modify the unenforceable provision to the minimum extent necessary to make it enforceable while preserving the parties' original intent.

The SPEC Terms, together with the Scope Document for the Engagement, any accepted Change Orders, the OPS Terms of Service, the OPS Privacy Policy, and the OPS Data Processing Agreement, constitute the entire agreement between OPS and Customer regarding the Engagement. They supersede any prior or contemporaneous communications, proposals, or representations on the same subject. In the event of conflict, the order of precedence is:

1. The SPEC Terms.
2. The signed Scope Document (current version on file).
3. Accepted Change Orders.
4. Other written communications between the parties.

A Change Order amends only the scope it explicitly modifies; the SPEC Terms continue to govern all other matters of the Engagement.

OPS's failure to enforce any provision of the SPEC Terms is not a waiver of that provision or of OPS's right to enforce it later. No course of dealing or course of performance between the parties modifies the SPEC Terms unless reduced to a written amendment under Section 27.

You agree that for 12 months following the termination of an Engagement you will not directly solicit any OPS employee or contractor for employment. This non-solicitation restriction does not apply to general public advertising or to unsolicited applications submitted by OPS personnel without inducement from you.`,
      },
      {
        id: 'survival',
        title: '30. Survival',
        content: `The following provisions survive termination of an Engagement: Section 13 (Confidentiality), Section 14 (Privacy and Data Protection), Section 15 (Intellectual Property and License), Section 16 (Customer Warranties, to the extent applicable to pre-termination conduct), Section 17 (OPS Warranties and Disclaimer, with respect to delivered Modules), Section 18 (Indemnification), Section 19 (Limitation of Liability), Section 22 (Refund Mechanics, to the extent refunds remain pending or outstanding), Section 23 (Version Pinning), Section 24 (CASL and Commercial Electronic Messages, with respect to messages relating to surviving rights and obligations), Section 25 (Governing Law and Disputes), Section 28 (Notices), Section 29 (Assignment, Severability, and Entire Agreement), and this Section 30.`,
      },
      {
        id: 'contact',
        title: '31. Contact',
        content: `For SPEC Engagement notices, refund requests, and operational questions:

jackson@opsapp.co

1361513 BC LTD.
303-1121 Oscar Street
Victoria BC V8V2X3
Canada

For general OPS legal, privacy, and account questions:

info@opsapp.co`,
      },
    ],
  },
  eula: {
    title: 'End User License Agreement',
    lastUpdated: '2026-02-18',
    effectiveDate: '2025-01-17',
    version: 'v1.0',
    sections: [
      {
        id: 'agreement',
        title: '1. Agreement',
        content:
          'This End User License Agreement ("EULA") is a legal agreement between you, the individual installing or using the OPS application ("you," "End User"), and 1361513 BC LTD. ("OPS," "we," "us"), located at 303-1121 Oscar Street, Victoria BC V8V2X3, Canada.\n\nBy downloading, installing, or using the OPS application on any device — including through the Apple App Store or Google Play Store — you agree to be bound by this EULA. If you do not agree, do not install or use the application.\n\nNote for field crew and employees: Your employer (the OPS account holder) has accepted OPS\'s Terms of Service on behalf of your company. This EULA governs your personal use of the application on your device.',
      },
      {
        id: 'license-grant',
        title: '2. License Grant',
        content:
          'Subject to your compliance with this EULA, OPS grants you a limited, non-exclusive, non-transferable, revocable licence to:\n\n- Download, install, and use the OPS application on devices you own or control\n- Use the application solely for your employer\'s or your own legitimate trade business operations, as authorized by the OPS account holder\n\nThis licence does not include any right to sublicense, sell, resell, transfer, assign, or otherwise commercially exploit the application.',
      },
      {
        id: 'restrictions',
        title: '3. Restrictions',
        content:
          'You may not:\n\n- Copy, modify, or create derivative works of the application\n- Reverse engineer, decompile, disassemble, or attempt to derive the source code of the application\n- Remove, alter, or obscure any proprietary notices in the application\n- Use the application to develop a competing product or service\n- Transfer your licence to another person\n- Use the application in any way that violates applicable law or these terms\n- Share your login credentials with anyone outside your company',
      },
      {
        id: 'ownership',
        title: '4. Ownership',
        content:
          'The application, including all intellectual property rights in it, is and remains the exclusive property of 1361513 BC LTD. This EULA does not transfer any ownership rights to you. OPS reserves all rights not expressly granted in this EULA.',
      },
      {
        id: 'your-account',
        title: '5. Your Account',
        content:
          'Access to the OPS application requires an account created by your company\'s OPS administrator. You are responsible for keeping your login credentials confidential. Notify your administrator immediately if you suspect unauthorized use of your account. OPS is not liable for any loss caused by unauthorized use of your credentials.',
      },
      {
        id: 'location-services',
        title: '6. Location Services',
        content:
          'The OPS application uses device GPS for turn-by-turn navigation to job sites and background location during active navigation sessions. By enabling location permissions, you consent to this use. You may revoke location permissions through your device settings, which will disable navigation features.',
      },
      {
        id: 'updates',
        title: '7. Updates',
        content:
          'OPS may release updates, patches, or new versions of the application from time to time. Updates may be delivered automatically through the App Store or Google Play. Continued use of the application after an update constitutes acceptance of any revised terms accompanying that update.',
      },
      {
        id: 'termination',
        title: '8. Termination',
        content:
          'This licence is effective until terminated. It terminates automatically if:\n\n- Your company\'s OPS subscription ends or is cancelled\n- Your employer removes your access to the OPS account\n- You violate any term of this EULA\n\nUpon termination, you must delete the application from all your devices. Sections 4, 9, 10, and 11 survive termination.',
      },
      {
        id: 'disclaimer-of-warranties',
        title: '9. Disclaimer of Warranties',
        content:
          'THE APPLICATION IS PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTY OF ANY KIND. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, OPS DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.\n\nOPS DOES NOT WARRANT THAT THE APPLICATION WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE, OR THAT DEFECTS WILL BE CORRECTED.',
      },
      {
        id: 'limitation-of-liability',
        title: '10. Limitation of Liability',
        content:
          'TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, OPS SHALL NOT BE LIABLE TO YOU FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF DATA, ARISING OUT OF OR RELATED TO YOUR USE OF OR INABILITY TO USE THE APPLICATION.\n\nOPS\'S TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING UNDER THIS EULA SHALL NOT EXCEED CAD $100.\n\nNote: Some jurisdictions do not allow limitations on implied warranties or exclusion of certain damages. The above limitations apply only to the extent permitted in your jurisdiction.',
      },
      {
        id: 'governing-law',
        title: '11. Governing Law',
        content:
          'This EULA is governed by the laws of the Province of British Columbia and the federal laws of Canada, without regard to conflict of law principles.',
      },
      {
        id: 'apple-app-store',
        title: '12. Apple App Store — Additional Terms',
        content:
          'If you downloaded the OPS application from the Apple App Store, the following additional terms apply:\n\na. Acknowledgement. This EULA is between you and OPS, not Apple. Apple is not responsible for the application or its content.\n\nb. Scope of licence. The licence granted to you is limited to a non-transferable licence to use the application on Apple-branded products you own or control, as permitted by the App Store Terms of Service.\n\nc. Maintenance and support. OPS, not Apple, is solely responsible for providing maintenance and support for the application. Apple has no obligation whatsoever to provide any support with respect to the application. Contact OPS at info@opsapp.co for support.\n\nd. Warranty. In the event the application fails to conform to any applicable warranty, you may notify Apple and Apple will refund the purchase price (if any) to you. To the maximum extent permitted by law, Apple has no other warranty obligation with respect to the application.\n\ne. Product claims. OPS, not Apple, is responsible for addressing any claims by you or any third party relating to the application or your use of it, including: (i) product liability claims; (ii) claims that the application fails to meet any applicable legal or regulatory requirement; and (iii) claims arising under consumer protection or similar legislation.\n\nf. Intellectual property. In the event of any third-party claim that the application infringes that party\'s intellectual property rights, OPS (not Apple) will be solely responsible for the investigation, defence, settlement, and discharge of any such claim.\n\ng. Legal compliance. You represent and warrant that: (i) you are not located in a country subject to a U.S. government embargo or designated as a "terrorist supporting" country; and (ii) you are not listed on any U.S. government list of prohibited or restricted parties.\n\nh. Third-party beneficiary. Apple and Apple\'s subsidiaries are third-party beneficiaries of this EULA, and upon your acceptance, Apple will have the right to enforce this EULA against you as a third-party beneficiary.',
      },
      {
        id: 'google-play',
        title: '13. Google Play — Additional Terms',
        content:
          'If you downloaded the OPS application from Google Play, your use is also subject to Google Play\'s Terms of Service. In the event of a conflict between this EULA and Google Play\'s terms, this EULA governs to the extent not prohibited by Google Play\'s terms.',
      },
      {
        id: 'contact',
        title: '14. Contact',
        content:
          '1361513 BC LTD.\n303-1121 Oscar Street, Victoria BC V8V2X3\ninfo@opsapp.co',
      },
    ],
  },

  dpa: {
    title: 'Data Processing Agreement',
    lastUpdated: '2026-05-25',
    effectiveDate: '2026-06-01',
    version: 'v1.1',
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        content:
          'This Data Processing Agreement (DPA) template is provided for enterprise or GDPR-subject customers. To request a signed DPA, contact info@opsapp.co.\n\nBetween:\n1361513 BC LTD. ("Service Provider," "OPS")\n303-1121 Oscar Street, Victoria BC V8V2X3\n\nAnd:\nThe Customer ("Controller")',
      },
      {
        id: 'background',
        title: 'Background',
        content:
          'The Customer uses the OPS Service (job management software) under the Terms of Service effective January 17, 2025. In providing the Service, OPS processes personal data on behalf of the Customer. This DPA governs that processing and forms part of the Terms of Service.',
      },
      {
        id: 'definitions',
        title: '1. Definitions',
        content:
          '- "Personal Data" means any information relating to an identified or identifiable natural person, as defined in applicable data protection law (including GDPR Article 4(1)).\n- "Processing" has the meaning given in applicable data protection law.\n- "GDPR" means the EU General Data Protection Regulation 2016/679.\n- "Data Subject" means the individual to whom Personal Data relates.',
      },
      {
        id: 'subject-matter',
        title: '2. Subject Matter and Duration',
        content:
          'OPS processes Personal Data to provide the OPS Service as described in the Terms of Service. Processing continues for the duration of the subscription and for 30 days post-termination (for data export), after which data is deleted per Section 9.',
      },
      {
        id: 'nature-and-purpose',
        title: '3. Nature and Purpose of Processing',
        content:
          '| Element | Detail |\n| Nature | Storage, retrieval, display, transmission, and synchronization of operational data; transactional and commercial email delivery; ad-campaign conversion tracking via server-side hashed identifiers; scheduling assistance |\n| Purpose | Providing job management, scheduling, CRM, billing, and SPEC engagement design-build-deliver services to the Customer |\n| Types of Personal Data — base subscription | Employee names and contact information; end-client names, addresses, phone numbers, email addresses; job site GPS coordinates; job photos; financial records (estimates, invoices) |\n| Types of Personal Data — SPEC engagement | Customer business profile data and self-reported workflow data collected at SPEC intake; files uploaded to the SPEC intake Storage bucket; Scope Document content and revisions; satisfaction survey ratings and comments; SPEC communications log (outbound emails, inbound replies, call summaries, walkthrough recording URLs); SPEC milestone payment records and refund records; SPEC acceptance event metadata (IP address, user agent, content hash, signature method); SPEC attribution data (UTM parameters, Google Click ID, Meta Click ID, landing URL, first-touch timestamp) |\n| Categories of Data Subjects — base subscription | Customer\'s employees (Admin, Office Crew, Field Crew); Customer\'s end-clients |\n| Categories of Data Subjects — SPEC engagement | The SPEC buyer; the OPS account holder of the Customer company (where different from the buyer); the Customer\'s employees and end-clients whose data flows through the Custom Modules built by SPEC; referrers participating in the SPEC referral program; visitors to the SPEC marketing page whose attribution cookies persist into a SPEC purchase |',
      },
      {
        id: 'processor-obligations',
        title: '4. GDPR Article 28 — Processor Obligations',
        content:
          '4.1 Instruction Only\nOPS will process Personal Data only on documented instructions from the Customer (as expressed in the Terms of Service and this DPA), unless required to do so by applicable law. If required by law to process beyond these instructions, OPS will notify the Customer before processing, unless prohibited from doing so.\n\n4.2 Confidentiality\nOPS ensures that all staff authorized to process Customer Personal Data are bound by appropriate confidentiality obligations (whether contractual or statutory).\n\n4.3 Security\nOPS implements appropriate technical and organizational measures to protect Personal Data against unauthorized access, disclosure, alteration, or destruction, including:\n- TLS encryption for data in transit\n- Encryption at rest for database records\n- Row-Level Security (RLS) policies isolating each customer\'s data\n- Access controls limiting staff access to production data\n- Stripe PCI-DSS compliance for payment card data\n\n4.4 Subprocessors\nThe Customer grants OPS general authorization to engage the subprocessors listed in Annex A. OPS will notify the Customer at least 30 days before adding or replacing a subprocessor. The Customer may object to a new subprocessor in writing within 14 days; if OPS cannot accommodate the objection, the Customer may terminate the affected portion of the Service.\n\nOPS is liable to the Customer for the acts and omissions of its subprocessors to the same extent as if OPS performed them directly.\n\nFor SPEC engagements with an active counter-signed Scope Document, OPS will not add a new SPEC-specific subprocessor that introduces a new category of data processing (for example, a new advertising-platform subprocessor or a new scheduling subprocessor) without 30 days\' notice and the Customer\'s right to object as described above. Non-material subprocessor changes — including replacement of an existing subprocessor with a substantially equivalent provider in the same processing category, or addition of a sub-subprocessor within an existing processor\'s stack — may proceed with notice but without an objection right.\n\n4.5 Data Subject Requests\nOPS will assist the Customer in fulfilling data subject requests (access, correction, deletion, portability, objection) to the extent technically feasible. OPS will forward any data subject request received directly from a data subject to the Customer within 5 business days.\n\n4.6 Security Assistance\nOPS will assist the Customer with its obligations under GDPR Articles 32-36, including:\n- Providing relevant security information on request\n- Notifying the Customer without undue delay (and within 72 hours where possible) of any confirmed Personal Data breach affecting Customer data\n- Providing information necessary for the Customer to conduct Data Protection Impact Assessments (DPIAs) where required\n\n4.7 Deletion or Return at End of Service\nUpon termination of the Service, OPS will:\n- Make Customer data available for export for 30 days\n- Delete all Customer Personal Data from production systems within 30 days of the end of the export period\n- Provide written confirmation of deletion on request\n\nOPS may retain anonymized aggregated data that cannot identify the Customer or any individual.\n\nNotwithstanding the deletion timeline above, OPS retains SPEC engagement records — including SPEC engagement metadata, intake responses, file uploads to the SPEC intake Storage bucket, Scope Document content (all versions), milestone payment records, refund records, acceptance events, and the SPEC communications log — for 7 years from the date the engagement closes (delivery, refund, cancellation, or termination, whichever is earlier), as required by the Income Tax Act (Canada), the Excise Tax Act (Canada), and applicable provincial accounting record-retention rules. After the 7-year retention period elapses, OPS deletes the SPEC engagement records on its standard purge schedule. OPS may retain anonymized aggregate metrics derived from SPEC engagements indefinitely; aggregated metrics that cannot identify a Data Subject are not Personal Data under this DPA.\n\n4.8 Compliance Information\nOPS will make available to the Customer all information reasonably necessary to demonstrate compliance with this DPA and GDPR Article 28, and will respond to compliance questionnaires within a reasonable timeframe.\n\n4.9 Audit Rights\nOPS will allow for and contribute to audits and inspections conducted by the Customer or a mandated auditor, subject to:\n- Minimum 30 days written notice\n- Audit conducted during business hours with minimal disruption\n- Costs borne by the Customer\n- Non-disclosure agreement protecting OPS\'s confidential information\n- Frequency limited to once per calendar year (absent a confirmed breach)',
      },
      {
        id: 'international-transfers',
        title: '5. International Transfers',
        content:
          'OPS\'s subprocessors (listed in Annex A) process data in the United States. For transfers of EU/EEA Personal Data to the US, OPS relies on:\n- The EU-US Data Privacy Framework (where the subprocessor is certified), or\n- Standard Contractual Clauses (SCCs) (2021 EU Commission decision) incorporated by reference\n\nFor UK data, OPS relies on the UK International Data Transfer Agreement (IDTA) or UK Addendum to the EU SCCs where applicable.',
      },
      {
        id: 'governing-law',
        title: '6. Governing Law',
        content:
          'This DPA is governed by the laws of the Province of British Columbia and the federal laws of Canada. For purposes of GDPR compliance, the Parties agree that EU law governs the interpretation of GDPR-specific provisions in this DPA.',
      },
      {
        id: 'order-of-precedence',
        title: '7. Order of Precedence',
        content:
          'In the event of conflict between this DPA and the Terms of Service, this DPA prevails with respect to the processing of Personal Data.',
      },
      {
        id: 'subprocessors',
        title: 'Annex A — Subprocessors',
        content:
          '| Subprocessor | Purpose | Data types | Location |\n| Stripe, Inc. | Subscription billing and client invoice payments; for SPEC engagements: milestone payments and invoices, Stripe Tax for GST/HST/PST calculation, Stripe Connect for referral payouts (Phase 2), and Stripe customer Tax IDs for customer-supplied GST/HST numbers | Name, email, billing address, transaction history, GST/HST number, terms-of-service consent state | USA (DPF certified) |\n| Bubble Group, Inc. (Bubble.io) | Backend database — operational data | Employee data, client contacts, projects, tasks, calendar | USA |\n| Supabase, Inc. | Database — financial and CRM data; for SPEC engagements: SPEC engagement records, intake responses, scope documents, satisfaction ratings, communications log, acceptance events, and the `spec-intake` Storage bucket for file uploads | Pipeline, estimates, invoices, payment records, all SPEC engagement data | USA |\n| Amazon Web Services (AWS) | File and photo storage (S3) | Job photos uploaded by Customer | USA (DPF certified) |\n| Google LLC (Firebase) | Authentication and analytics | Email, auth tokens, anonymous usage data | USA (DPF certified) |\n| Apple Inc. | Sign-In with Apple | Name, email (first sign-in only) | USA |\n| Intuit Inc. (QuickBooks) | Accounting sync (if enabled by Customer) | Invoice and payment data authorized by Customer | USA |\n| Sage Group plc | Accounting sync (if enabled by Customer) | Invoice and payment data authorized by Customer | UK/USA |\n| Twilio, Inc. (SendGrid) | Transactional and commercial email for SPEC engagements (deposit confirmations, owner approvals, intake reminders, milestone invoices, refund confirmations, retainer offers, referral promotions) | Customer email address, name, engagement reference, message content | USA (DPF certified — confirm at port time) |\n| Vercel, Inc. | Hosting and edge caching for the SPEC marketing page, the OPS-Web product surface, and the SPEC server routes that handle checkout creation, owner-approval, refund-request submission, and cron-driven nudges | Request metadata, IP addresses, customer-provided form data in transit, edge-cached public SPEC board data | USA, with global edge cache |\n| Meta Platforms, Inc. (Meta Conversions API) | Server-side conversion tracking for SPEC ad campaigns on Facebook and Instagram | Hashed email, hashed phone, event metadata, browser cookies `fbp` and `fbc` | USA |\n| Google LLC (Google Ads Enhanced Conversions) | Server-side conversion tracking for SPEC ad campaigns on Google Search and YouTube | Hashed email, hashed phone, Google Click ID, event metadata | USA (DPF certified) |\n| Cal.com, Inc. | Scheduling discovery sessions and delivery walkthroughs for SPEC engagements | Customer name, email, optional phone, scheduled session metadata, time-zone preference | USA/EU depending on Cal.com instance |\n\nOPS will update this list with 30 days\' notice prior to adding new subprocessors.',
      },
      {
        id: 'annex-b-spec-schedule',
        title: 'Annex B — SPEC Schedule',
        content:
          'This Annex B applies in addition to the rest of this DPA when the Customer purchases one or more SPEC engagements. The terms used here have the meanings given in the SPEC Engagement Terms of Service at /legal?page=spec-terms.\n\n**B.1 Scope.** Each SPEC engagement is processed under this DPA. The SPEC engagement data categories and subprocessors are listed in Section 3 and Annex A respectively, as amended in v1.1.\n\n**B.2 Lawful basis under PIPEDA and Canadian provincial law.** OPS processes SPEC engagement data primarily under the lawful basis of contract performance — the data is necessary to perform the SPEC engagement Customer has purchased. OPS additionally relies on legitimate interest for fraud detection, eligibility enforcement (Canada excluding Quebec, regulated-workflow exclusions), and evidence preservation for Stripe dispute defence; and on consent (express or implied under CASL\'s existing-business-relationship two-year window) for commercial electronic messages such as Care Plan offers, referral promotions, and SPEC marketing follow-ups.\n\n**B.3 Ad conversion tracking.** OPS sends server-side conversion events to Meta Conversions API and Google Ads Enhanced Conversions for the purpose of optimizing SPEC ad campaigns. Personal data sent to these platforms is limited to SHA-256 hashed email and hashed phone identifiers plus event metadata (event name, value, currency, deduplication ID). Raw identifiers are never transmitted. OPS does not authorize the advertising platforms to retarget the SPEC engagement audience beyond the campaigns OPS itself runs.\n\n**B.4 Hashed identifiers as Personal Data.** OPS treats hashed identifiers as Personal Data under this DPA. Hashing reduces re-identification risk but does not eliminate it. Customer rights described in the OPS Privacy Policy apply to hashed identifiers to the same extent they apply to the underlying raw identifiers, subject to the practical limits of identifying the corresponding records given only a hash.\n\n**B.5 Cross-border processing.** SPEC engagement data is stored primarily in Canada and the United States by OPS\'s Supabase, Vercel, Stripe, SendGrid, Meta, Google, and Cal.com subprocessors. By accepting the SPEC Engagement Terms of Service and this DPA, Customer consents to cross-border processing of SPEC engagement data. OPS relies on Standard Contractual Clauses, the EU-US Data Privacy Framework where applicable, and equivalent UK and Canadian transfer mechanisms.\n\n**B.6 Retention.** Retention periods specific to SPEC engagement data are set out in Section 4.7 as amended in v1.1. SPEC engagement records and supporting documentation are retained for 7 years from engagement close, after which they are deleted.\n\n**B.7 Data Subject requests for SPEC data.** Where a Data Subject request relates to SPEC engagement data — for example, a request for access to an intake response, a correction of a Scope Document detail, or a deletion request — OPS will assist Customer in fulfilling the request to the extent technically feasible. Deletion requests against SPEC engagement records held under the 7-year retention rule will be honoured by anonymizing the records where possible or by securely retaining them with no further processing until the retention period elapses.\n\n**B.8 Breach notification — SPEC scope.** A breach of security safeguards involving SPEC engagement data triggers the existing breach-notification obligations under Section 4.6, with the additional requirement that OPS notify Customer of any breach affecting the SPEC intake Storage bucket or the SPEC communications log within 72 hours of becoming aware, given the typically sensitive nature of intake content.\n\n**B.9 Order of precedence.** This Annex B supplements the body of this DPA and does not replace any obligation. Where this Annex B and the body of the DPA conflict with respect to SPEC engagement data, this Annex B governs. The order of precedence remains: SPEC Engagement Terms of Service, then this DPA (with Annex B prevailing for SPEC scope), then the Scope Document, then any other written agreement.',
      },
      {
        id: 'contact',
        title: 'Contact',
        content:
          'To request a signed copy of this DPA, contact:\n\nPrivacy Officer: Jack S.\nEmail: info@opsapp.co\nMail: 1361513 BC LTD., 303-1121 Oscar Street, Victoria BC V8V2X3',
      },
    ],
  },
};
