import React from 'react';
import { LegalScreen } from '@/components/legal/LegalScreen';

const SECTIONS = [
  {
    heading: 'Overview',
    paragraphs: [
      'Lumio (“we”, “our”, or “us”) respects your privacy. This policy explains what we collect, why we collect it, and the choices you have. If you use Lumio, you agree to this policy along with our Terms of Service.',
    ],
  },
  {
    heading: 'Information we collect',
    paragraphs: [
      'Account details you provide when you sign in (for example, email address and authentication information from providers such as Google or Apple, when you use them).',
      'Content you create in the app, such as journal entries, chat messages, and preferences you save on your device or through our services.',
      'Technical data needed to run the app safely, such as device type, app version, and basic diagnostics—typically in aggregated or minimal form.',
    ],
  },
  {
    heading: 'How we use information',
    paragraphs: [
      'To provide and improve Lumio, including syncing your account, personalizing your experience, and keeping the service secure.',
      'To respond to support requests and send important notices about the service.',
      'We do not sell your personal information. We use data only as described here or as otherwise disclosed when we collect it.',
    ],
  },
  {
    heading: 'Storage & security',
    paragraphs: [
      'We use industry-standard safeguards designed to protect your information. No method of transmission over the internet is 100% secure; we work to reduce risk and review our practices over time.',
      'Some data may be processed by trusted infrastructure or service providers who are bound to appropriate confidentiality and security obligations.',
    ],
  },
  {
    heading: 'Your choices',
    paragraphs: [
      'You can access or update certain account information through your account settings or your sign-in provider.',
      'You may delete your account or stop using Lumio at any time, subject to our Terms of Service and any legal retention requirements.',
    ],
  },
  {
    heading: 'Children',
    paragraphs: [
      'Lumio is not directed at children under 13 (or the minimum age in your region). We do not knowingly collect personal information from children.',
    ],
  },
  {
    heading: 'Changes',
    paragraphs: [
      'We may update this Privacy Policy from time to time. We will post the new date at the top of this page and, when appropriate, provide additional notice in the app.',
    ],
  },
  {
    heading: 'Contact',
    paragraphs: [
      'For privacy questions, contact us through the support or feedback options in the app, or at the contact details we provide on our website when available.',
    ],
  },
];

export default function PrivacyPolicyScreen() {
  return (
    <LegalScreen
      title="Privacy Policy"
      updatedLabel="Last updated: April 2026"
      sections={SECTIONS}
    />
  );
}
