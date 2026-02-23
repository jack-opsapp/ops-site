/**
 * Legal Documents — Structured content for Terms, Privacy, and EULA
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
  sections: LegalSection[];
}

export const legalDocuments: Record<string, LegalDocument> = {
  terms: {
    title: 'Terms of Service',
    lastUpdated: '2026-02-22',
    sections: [
      {
        id: 'acceptance',
        title: 'Acceptance of Terms',
        content:
          'By accessing or using OPS, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using the platform. These terms constitute a legally binding agreement between you and OPS Technologies, Inc.',
      },
      {
        id: 'accounts',
        title: 'Account Registration',
        content:
          'You must provide accurate, current, and complete information during the registration process. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify OPS immediately of any unauthorized use of your account.',
      },
      {
        id: 'services',
        title: 'Service Description',
        content:
          'OPS provides project management, scheduling, invoicing, and crew coordination tools designed specifically for trades and field service businesses. The platform includes mobile and web applications that enable teams to manage operations in real time. Feature availability may vary by subscription plan.',
      },
      {
        id: 'payment',
        title: 'Payment Terms',
        content:
          'Subscription fees are billed monthly or annually based on your selected plan. All fees are non-refundable except as required by applicable law. OPS reserves the right to modify pricing with 30 days advance notice. Failure to pay may result in suspension or termination of your account.',
      },
      {
        id: 'data',
        title: 'Your Data',
        content:
          'You retain full ownership of all data you input into OPS. We do not claim any intellectual property rights over your content, projects, or business information. You grant OPS a limited license to process your data solely for the purpose of providing the service. Upon account deletion, your data will be removed in accordance with our data retention policy.',
      },
      {
        id: 'conduct',
        title: 'Acceptable Use',
        content:
          'You agree not to misuse the platform, including but not limited to: attempting to gain unauthorized access to other accounts, transmitting malicious code, or using OPS for any unlawful purpose. You may not use automated systems to access the platform without prior written consent. Violation of these terms may result in immediate account termination.',
      },
      {
        id: 'liability',
        title: 'Limitation of Liability',
        content:
          'OPS is provided on an "as-is" and "as-available" basis without warranties of any kind, either express or implied. In no event shall OPS Technologies, Inc. be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the platform. Our total liability shall not exceed the amount paid by you in the twelve months preceding the claim.',
      },
      {
        id: 'changes',
        title: 'Changes to Terms',
        content:
          'We may update these Terms of Service from time to time to reflect changes in our practices or for legal, regulatory, or operational reasons. We will notify you of material changes via email or through the platform. Your continued use of OPS after changes take effect constitutes acceptance of the revised terms.',
      },
    ],
  },

  privacy: {
    title: 'Privacy Policy',
    lastUpdated: '2026-02-22',
    sections: [
      {
        id: 'collection',
        title: 'Information We Collect',
        content:
          'We collect information you provide directly, including your name, email address, company name, and payment details during account registration. We also automatically collect usage data such as feature interactions, session duration, and device information including browser type, operating system, and IP address. This data helps us understand how you use OPS and improve the platform.',
      },
      {
        id: 'usage',
        title: 'How We Use Your Information',
        content:
          'We use your information to provide, maintain, and improve the OPS platform. This includes processing transactions, sending service-related communications, and personalizing your experience. We may also use aggregated, anonymized data for analytics and product development. We do not use your personal information for third-party advertising.',
      },
      {
        id: 'sharing',
        title: 'Information Sharing',
        content:
          'We do not sell, rent, or trade your personal information to third parties. We may share data with trusted service providers who assist in operating the platform, such as payment processors and hosting providers, under strict confidentiality agreements. We may also disclose information when required by law or to protect the rights and safety of OPS and its users.',
      },
      {
        id: 'security',
        title: 'Data Security',
        content:
          'We use industry-standard encryption, including TLS 1.3 for data in transit and AES-256 for data at rest. Access to personal data is restricted to authorized personnel on a need-to-know basis. We conduct regular security audits and maintain incident response procedures. While no system is completely secure, we are committed to protecting your information.',
      },
      {
        id: 'retention',
        title: 'Data Retention',
        content:
          'We retain your personal data for as long as your account is active or as needed to provide services. After account deletion, we may retain certain data for up to 90 days to comply with legal obligations, resolve disputes, and enforce agreements. Anonymized and aggregated data may be retained indefinitely for analytical purposes.',
      },
      {
        id: 'rights',
        title: 'Your Rights',
        content:
          'You have the right to access, update, correct, or delete your personal data at any time through your account settings. You may request a copy of all data we hold about you in a portable format. If you are located in the European Economic Area, you have additional rights under GDPR including the right to data portability and the right to restrict processing.',
      },
      {
        id: 'contact',
        title: 'Contact Us',
        content:
          'For privacy-related inquiries, data requests, or concerns about how your information is handled, please contact us at privacy@opsapp.co. You may also write to OPS Technologies, Inc., Attn: Privacy Team. We aim to respond to all privacy requests within 30 days.',
      },
    ],
  },

  eula: {
    title: 'End User License Agreement',
    lastUpdated: '2026-02-22',
    sections: [
      {
        id: 'license',
        title: 'License Grant',
        content:
          'OPS Technologies, Inc. grants you a limited, non-exclusive, non-transferable, revocable license to use the OPS application for your internal business purposes. This license is contingent upon your compliance with these terms and the payment of applicable subscription fees. The license is personal to you and may not be sublicensed or assigned without prior written consent.',
      },
      {
        id: 'restrictions',
        title: 'Restrictions',
        content:
          'You may not reverse engineer, decompile, disassemble, or otherwise attempt to derive the source code of the OPS application. You may not modify, adapt, translate, or create derivative works based on the software. You may not rent, lease, lend, sell, or redistribute the application, or use it to provide services to third parties without authorization.',
      },
      {
        id: 'ip',
        title: 'Intellectual Property',
        content:
          'OPS and all related content, features, and functionality, including but not limited to the software, design, text, graphics, logos, and trademarks, are owned by OPS Technologies, Inc. and are protected by United States and international intellectual property laws. Nothing in this agreement transfers any intellectual property rights to you beyond the limited license granted herein.',
      },
      {
        id: 'termination',
        title: 'Termination',
        content:
          'We may terminate or suspend your license immediately, without prior notice, if you breach any provision of this agreement. Upon termination, your right to use the application ceases immediately and you must destroy all copies of the software in your possession. Termination does not relieve you of any payment obligations incurred prior to termination.',
      },
      {
        id: 'warranty',
        title: 'Warranty Disclaimer',
        content:
          'The software is provided "as-is" without warranty of any kind. OPS Technologies, Inc. disclaims all warranties, whether express, implied, statutory, or otherwise, including warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the software will be uninterrupted, error-free, or free of harmful components.',
      },
      {
        id: 'governing',
        title: 'Governing Law',
        content:
          'This agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law provisions. Any disputes arising under this agreement shall be resolved exclusively in the state or federal courts located in Delaware. You consent to the personal jurisdiction of such courts.',
      },
    ],
  },
};
