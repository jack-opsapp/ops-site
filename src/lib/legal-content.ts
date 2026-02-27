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
  sections: LegalSection[];
}

export const legalDocuments: Record<string, LegalDocument> = {
  terms: {
    title: 'Terms of Service',
    lastUpdated: '2026-02-18',
    effectiveDate: '2025-01-17',
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
    lastUpdated: '2026-02-19',
    effectiveDate: '2025-01-17',
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
          '2.1 Account and Company Information\n\nWhen you register an account or set up your company in OPS, we collect:\n- First name, last name, email address, phone number\n- Company name, industry type, crew size\n- Company code (6-character unique identifier)\n- Your role (Admin, Office Crew, or Field Crew)\n\n2.2 Professional Contacts (Your Clients)\n\nWhen you enter your business clients into OPS, we store on your behalf:\n- Client company names, contact names, phone numbers, email addresses\n- Job site addresses and GPS coordinates\n- Project and task notes and descriptions\n- Estimates, invoices, and payment records related to your clients\n\nImportant: This data belongs to you. We process it as a service provider under your direction. Your clients are not our customers and have no account with OPS.\n\n2.3 Job and Operational Data\n\nData generated through the normal use of the Service:\n- Projects, tasks, task status updates, calendar events\n- Job site photos (stored on AWS S3)\n- Turn-by-turn navigation routes and GPS data used during active navigation sessions\n- Crew assignments and scheduling data\n\n2.4 Financial Data\n\nFor customers using the OPS web application financial features:\n- Pipeline/CRM opportunity records\n- Estimate and invoice records (line items, amounts, dates)\n- Payment records (date, amount, method, reference number — not card data)\n- Products and services catalog\n\nWe do not store credit card or bank account numbers. All payment card data is handled exclusively by Stripe, Inc. We only receive confirmation of payment and a Stripe payment reference ID.\n\n2.5 Authentication Data\n\nWhen you sign in via Google or Apple, we receive a unique identifier and your name and email address from that provider. We do not receive your Google or Apple password. Email/password accounts are managed through Firebase Authentication.\n\nA 4-digit PIN is stored locally on your device in the device Keychain and is never transmitted to our servers.\n\n2.6 Usage and Analytics Data\n\nWe collect usage data through Firebase Analytics, including:\n- App screens visited and features used\n- Session duration and frequency\n- Device type, operating system version, and language\n- Crash reports and performance data\n\nThis data is used to improve the Service and is associated with an anonymous device identifier, not your name or email.\n\n2.7 Client Portal Access\n\nIf your business clients access the Client Portal (to view estimates, approve quotes, or pay invoices), we collect their email address and issue a time-limited magic link session token. No password is created. Portal sessions expire after 30 days.\n\n2.8 QuickBooks Integration (Optional)\n\nIf you choose to connect your QuickBooks Online account to OPS, we access your QuickBooks account via Intuit\'s OAuth 2.0 API solely to provide the accounting sync feature you have authorized. Specifically:\n\nData OPS sends to QuickBooks on your behalf:\n- Invoice records (invoice number, line items, amounts, due dates, client name)\n- Payment records (amount, date, payment method, reference number)\n\nData OPS receives from QuickBooks:\n- OAuth access token and refresh token (to maintain the authorized connection)\n- Your QuickBooks company ID (Realm ID), used to route sync requests to the correct account\n\nWhat we do not do:\n- We do not access QuickBooks data beyond what is necessary to perform the sync you authorize\n- We do not share QuickBooks data with any third party other than as required to provide the Service\n- We do not use your QuickBooks data for advertising, profiling, or any purpose unrelated to the sync\n\nRevoking access: You may disconnect your QuickBooks account at any time from OPS Account Settings. You may also revoke OPS\'s access directly from your Intuit account at myapps.intuit.com. Disconnecting removes OPS\'s OAuth tokens and stops all future sync activity. It does not delete data already synced into QuickBooks.',
      },
      {
        id: 'how-we-use',
        title: '3. How We Use Your Information',
        content:
          '| Purpose | Legal basis (PIPEDA) |\n| Providing the Service (account management, job scheduling, billing) | Contract performance |\n| Processing subscription payments via Stripe | Contract performance |\n| Sending transactional emails (receipts, payment confirmations, service alerts) | Contract performance |\n| Improving the Service (analytics, crash reports, product development) | Legitimate interest |\n| Sending product update emails and feature announcements | Implied consent (existing customers within 2 years — CASL) |\n| Sending marketing or promotional emails | Express consent only |\n| Syncing invoice and payment data to your connected QuickBooks account | Consent (you explicitly connect the integration) |\n| Responding to support requests | Legitimate interest |\n| Complying with legal obligations | Legal obligation |\n\nWe do not sell your personal information to third parties. We do not use your business client data for any purpose other than providing the Service to you.',
      },
      {
        id: 'third-party-processors',
        title: '4. Third-Party Processors',
        content:
          'We share data with the following service providers to operate the Service. Each is bound by contractual data protection obligations.\n\n| Processor | Purpose | Data shared | Location |\n| Stripe, Inc. | Subscription billing and client invoice payments | Name, email, billing address, transaction history | USA |\n| Bubble Group, Inc. (Bubble.io) | Backend database — operational data | Employee data, client contacts, projects, tasks, calendar | USA |\n| Supabase, Inc. | Database — financial and CRM data | Pipeline, estimates, invoices, payment records | USA |\n| Amazon Web Services (AWS S3) | Photo and file storage | Job photos you upload | USA |\n| Google LLC (Firebase) | Authentication and usage analytics | Email, auth tokens, anonymous usage data | USA |\n| Apple Inc. | Sign-In with Apple authentication | Name, email (first sign-in only) | USA |\n| Intuit Inc. (QuickBooks) | Accounting sync (if enabled by you) — OPS sends invoice and payment data to your QuickBooks account; Intuit provides OAuth tokens to authenticate the connection | Invoice records, payment records, OAuth credentials | USA |\n| Sage Group plc | Accounting sync (if enabled by you) | Invoice and payment data you authorize | UK/USA |\n\nNote on QuickBooks: When you connect your QuickBooks account, Intuit acts as both a data recipient (receiving invoice/payment records from OPS) and an authentication provider (issuing OAuth tokens). OPS\'s use of QuickBooks API data is governed by the Intuit Developer Terms of Service. You can review and revoke OPS\'s access at any time at myapps.intuit.com.\n\nCross-border transfers: Your data may be processed in the United States. We rely on contractual safeguards with each processor. For Quebec residents, we conduct Privacy Impact Assessments before transferring personal data to US-based processors as required by Quebec Law 25.',
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
          '| Data type | Retention |\n| Active account data | Retained for the life of your subscription |\n| Deleted projects/clients (soft delete) | Retained 90 days then purged |\n| Account data after cancellation | Retained 30 days after cancellation, then deleted |\n| Firebase Analytics data | Up to 14 months (per Google\'s retention settings) |\n| Stripe payment records | Retained as required by Stripe and financial record-keeping law |\n| Portal session tokens | Expire after 7 days (unused) or 30 days (active) |\n| QuickBooks OAuth tokens | Retained while integration is connected; deleted within 24 hours of disconnection |\n\nYou may request deletion of your account data at any time by contacting info@opsapp.co. After deletion, we may retain anonymized, aggregated data that cannot identify you.',
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
          'Transactional emails (subscription receipts, payment confirmations, service alerts, password resets) are sent as part of your contract with us and do not require separate consent.\n\nProduct update emails (new features, release notes) are sent to existing customers under implied CASL consent and include an unsubscribe link.\n\nMarketing emails (promotions, referral offers) will only be sent with your express consent (an opt-in box you actively check — never pre-ticked). You may withdraw consent at any time using the unsubscribe link in any email.\n\nAll commercial emails include:\n- Our company name and physical address (1361513 BC LTD., 303-1121 Oscar Street, Victoria BC V8V2X3)\n- A functional unsubscribe link (processed within 10 business days)',
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

  eula: {
    title: 'End User License Agreement',
    lastUpdated: '2026-02-18',
    effectiveDate: '2025-01-17',
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
    lastUpdated: '2026-02-01',
    effectiveDate: '2026-02-01',
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
          '| Element | Detail |\n| Nature | Storage, retrieval, display, and synchronization of operational data |\n| Purpose | Providing job management, scheduling, CRM, and billing features to the Customer |\n| Types of Personal Data | Employee names and contact information; end-client names, addresses, phone numbers, email addresses; job site GPS coordinates; job photos; financial records (estimates, invoices) |\n| Categories of Data Subjects | Customer\'s employees (Admin, Office Crew, Field Crew); Customer\'s end-clients |',
      },
      {
        id: 'processor-obligations',
        title: '4. GDPR Article 28 — Processor Obligations',
        content:
          '4.1 Instruction Only\nOPS will process Personal Data only on documented instructions from the Customer (as expressed in the Terms of Service and this DPA), unless required to do so by applicable law. If required by law to process beyond these instructions, OPS will notify the Customer before processing, unless prohibited from doing so.\n\n4.2 Confidentiality\nOPS ensures that all staff authorized to process Customer Personal Data are bound by appropriate confidentiality obligations (whether contractual or statutory).\n\n4.3 Security\nOPS implements appropriate technical and organizational measures to protect Personal Data against unauthorized access, disclosure, alteration, or destruction, including:\n- TLS encryption for data in transit\n- Encryption at rest for database records\n- Row-Level Security (RLS) policies isolating each customer\'s data\n- Access controls limiting staff access to production data\n- Stripe PCI-DSS compliance for payment card data\n\n4.4 Subprocessors\nThe Customer grants OPS general authorization to engage the subprocessors listed in Annex A. OPS will notify the Customer at least 30 days before adding or replacing a subprocessor. The Customer may object to a new subprocessor in writing within 14 days; if OPS cannot accommodate the objection, the Customer may terminate the affected portion of the Service.\n\nOPS is liable to the Customer for the acts and omissions of its subprocessors to the same extent as if OPS performed them directly.\n\n4.5 Data Subject Requests\nOPS will assist the Customer in fulfilling data subject requests (access, correction, deletion, portability, objection) to the extent technically feasible. OPS will forward any data subject request received directly from a data subject to the Customer within 5 business days.\n\n4.6 Security Assistance\nOPS will assist the Customer with its obligations under GDPR Articles 32-36, including:\n- Providing relevant security information on request\n- Notifying the Customer without undue delay (and within 72 hours where possible) of any confirmed Personal Data breach affecting Customer data\n- Providing information necessary for the Customer to conduct Data Protection Impact Assessments (DPIAs) where required\n\n4.7 Deletion or Return at End of Service\nUpon termination of the Service, OPS will:\n- Make Customer data available for export for 30 days\n- Delete all Customer Personal Data from production systems within 30 days of the end of the export period\n- Provide written confirmation of deletion on request\n\nOPS may retain anonymized aggregated data that cannot identify the Customer or any individual.\n\n4.8 Compliance Information\nOPS will make available to the Customer all information reasonably necessary to demonstrate compliance with this DPA and GDPR Article 28, and will respond to compliance questionnaires within a reasonable timeframe.\n\n4.9 Audit Rights\nOPS will allow for and contribute to audits and inspections conducted by the Customer or a mandated auditor, subject to:\n- Minimum 30 days written notice\n- Audit conducted during business hours with minimal disruption\n- Costs borne by the Customer\n- Non-disclosure agreement protecting OPS\'s confidential information\n- Frequency limited to once per calendar year (absent a confirmed breach)',
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
          '| Subprocessor | Purpose | Data types | Location |\n| Stripe, Inc. | Subscription billing and client invoice payments | Name, email, billing address, transaction history | USA (DPF certified) |\n| Bubble Group, Inc. (Bubble.io) | Backend database — operational data | Employee data, client contacts, projects, tasks, calendar | USA |\n| Supabase, Inc. | Database — financial and CRM data | Pipeline, estimates, invoices, payment records | USA |\n| Amazon Web Services (AWS) | File and photo storage (S3) | Job photos uploaded by Customer | USA (DPF certified) |\n| Google LLC (Firebase) | Authentication and analytics | Email, auth tokens, anonymous usage data | USA (DPF certified) |\n| Apple Inc. | Sign-In with Apple | Name, email (first sign-in only) | USA |\n| Intuit Inc. (QuickBooks) | Accounting sync (if enabled by Customer) | Invoice and payment data authorized by Customer | USA |\n| Sage Group plc | Accounting sync (if enabled by Customer) | Invoice and payment data authorized by Customer | UK/USA |\n\nOPS will update this list with 30 days\' notice prior to adding new subprocessors.',
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
