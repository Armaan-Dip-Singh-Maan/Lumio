import React from 'react';
import { LegalScreen } from '@/components/legal/LegalScreen';

const SECTIONS = [
  {
    heading: 'Agreement',
    paragraphs: [
      'By using Lumio, you agree to these Terms of Service and our Privacy Policy. If you do not agree, please do not use the app.',
    ],
  },
  {
    heading: 'The service',
    paragraphs: [
      'Lumio offers tools for journaling, reflection, and related features we may add or change over time. We may update, suspend, or discontinue parts of the service with reasonable notice when practicable.',
    ],
  },
  {
    heading: 'Not medical advice',
    paragraphs: [
      'Lumio is a wellness and self-reflection tool. It is not a substitute for professional medical, psychological, or emergency care. If you are in crisis, contact local emergency services or a crisis line immediately.',
    ],
  },
  {
    heading: 'Your account',
    paragraphs: [
      'You are responsible for activity under your account and for keeping your sign-in credentials secure. Notify us promptly if you suspect unauthorized access.',
    ],
  },
  {
    heading: 'Acceptable use',
    paragraphs: [
      'Do not misuse Lumio—for example, by attempting to disrupt the service, access others’ data without permission, or use the app in violation of law. We may suspend or terminate accounts that violate these terms.',
    ],
  },
  {
    heading: 'Content',
    paragraphs: [
      'You retain rights to content you create. To operate Lumio, you grant us a limited license to host, process, and display your content solely to provide the service to you.',
    ],
  },
  {
    heading: 'Disclaimer',
    paragraphs: [
      'Lumio is provided “as is” to the fullest extent permitted by law. We disclaim warranties where allowed, including implied warranties of merchantability or fitness for a particular purpose.',
    ],
  },
  {
    heading: 'Limitation of liability',
    paragraphs: [
      'To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages, or for any loss beyond what you paid us in the prior twelve months for paid features (if any). Some jurisdictions do not allow certain limitations; in those cases, our liability is limited to the fullest extent allowed.',
    ],
  },
  {
    heading: 'Changes',
    paragraphs: [
      'We may revise these terms. Continued use after changes become effective constitutes acceptance. Material changes will be communicated in the app or by other reasonable means when appropriate.',
    ],
  },
];

export default function TermsOfServiceScreen() {
  return (
    <LegalScreen
      title="Terms of Service"
      updatedLabel="Last updated: April 2026"
      sections={SECTIONS}
    />
  );
}
