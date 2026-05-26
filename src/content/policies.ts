export type PolicyKind = 'legal' | 'privacy' | 'terms' | 'refund';

export type PolicyBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; rows: { label: string; value: string }[] };

export type PolicyDocument = {
  kind: PolicyKind;
  title: string;
  subtitle?: string;
  showLastUpdated?: boolean;
  blocks: PolicyBlock[];
};

export const POLICY_DOCUMENTS: Record<PolicyKind, PolicyDocument> = {
  legal: {
    kind: 'legal',
    title: 'Legal Information',
    subtitle: 'This page is published for payment and compliance verification.',
    blocks: [
      {
        type: 'table',
        rows: [
          { label: 'Platform / Brand Name', value: 'Thane Flats' },
          { label: 'Business Legal Name', value: 'Thane Flats' },
          { label: 'Business Type', value: 'Online property listing and discovery platform' },
          { label: 'Support Email', value: 'support@thaneflats.com' },
          {
            label: 'Support Hours',
            value: 'Monday to Saturday, 10:00 AM to 7:00 PM IST',
          },
        ],
      },
      { type: 'paragraph', text: 'Thane Flats' },
    ],
  },
  privacy: {
    kind: 'privacy',
    title: 'Privacy Policy',
    showLastUpdated: true,
    blocks: [
      {
        type: 'paragraph',
        text: 'Thane Property Search collects only the information required to provide property discovery, account access, payment processing, support, and service improvements.',
      },
      { type: 'heading', text: 'What we collect' },
      {
        type: 'list',
        items: [
          'Basic profile details such as name, email, and phone number.',
          'Property listing details and uploaded media from owners.',
          'Usage and device metadata required for security and analytics.',
          'Transaction identifiers for plan purchases and service payments.',
        ],
      },
      { type: 'heading', text: 'How we use data' },
      {
        type: 'list',
        items: [
          'To authenticate users and manage role-based access.',
          'To publish and moderate listings and enable user-owner communication.',
          'To process payments through approved payment partners.',
          'To detect fraud, abuse, and unauthorized activity.',
        ],
      },
      { type: 'heading', text: 'Sharing and security' },
      {
        type: 'paragraph',
        text: 'We do not sell personal information. Data is shared only with service providers required for core operations such as cloud hosting, authentication, communication, and payment processing. Reasonable technical controls are applied to protect user information.',
      },
      { type: 'heading', text: 'Contact' },
      {
        type: 'paragraph',
        text: 'For privacy concerns, please raise a support ticket from the app or write to the support contact published on the Legal page.',
      },
    ],
  },
  terms: {
    kind: 'terms',
    title: 'Terms and Conditions',
    showLastUpdated: true,
    blocks: [
      { type: 'heading', text: '1. Service scope' },
      {
        type: 'paragraph',
        text: 'Thane Property Search provides a digital platform for property listing, discovery, and communication between seekers and owners. We do not guarantee transaction completion between users.',
      },
      { type: 'heading', text: '2. Account responsibility' },
      {
        type: 'paragraph',
        text: 'Users are responsible for maintaining correct account details and securing login credentials. Any activity done through an account is considered authorized by that account holder.',
      },
      { type: 'heading', text: '3. Listing and content rules' },
      {
        type: 'list',
        items: [
          'Listings must be accurate, lawful, and not misleading.',
          'Fake, duplicate, or fraudulent content may be removed without notice.',
          'The platform may moderate, reject, or suspend listings that violate policies.',
        ],
      },
      { type: 'heading', text: '4. Payments and plans' },
      {
        type: 'paragraph',
        text: 'Paid plans and add-on services are billed as displayed at checkout. Taxes and gateway charges, if applicable, are shown during payment flow.',
      },
      { type: 'heading', text: '5. Limitation of liability' },
      {
        type: 'paragraph',
        text: 'The platform is not liable for direct agreements made between users, including payment disputes, documentation issues, or property condition differences.',
      },
      { type: 'heading', text: '6. Contact for legal/support matters' },
      {
        type: 'paragraph',
        text: 'Please use the in-app support ticket system for all support, compliance, and policy-related requests.',
      },
    ],
  },
  refund: {
    kind: 'refund',
    title: 'Refund, Cancellation and Replacement Policy',
    showLastUpdated: true,
    blocks: [
      { type: 'heading', text: 'Refund policy' },
      {
        type: 'list',
        items: [
          'Plan and service payments are generally non-refundable once activated.',
          'If a payment is deducted but service is not delivered due to a verified technical issue, users can request a review within 7 days of payment.',
          'Approved refunds are processed to the original payment source within 7-10 business days, subject to bank/payment partner timelines.',
        ],
      },
      { type: 'heading', text: 'Cancellation policy' },
      {
        type: 'list',
        items: [
          'Users may choose not to renew paid plans for subsequent periods.',
          'Current plan benefits continue until the active validity period ends.',
          'Cancellation requests do not automatically imply refund eligibility.',
        ],
      },
      { type: 'heading', text: 'Replacement / service correction policy' },
      {
        type: 'list',
        items: [
          'If a purchased digital service (for example listing visibility or contact credits) is not correctly applied, users can raise a support ticket for correction.',
          'After verification, equivalent service entitlement may be restored/replaced instead of monetary refund.',
        ],
      },
      { type: 'heading', text: 'How to request help' },
      {
        type: 'paragraph',
        text: 'Raise a support ticket from the app with transaction ID, date/time, and issue details for faster resolution.',
      },
    ],
  },
};

export const POLICY_FOOTER_LINKS: { kind: PolicyKind; label: string }[] = [
  { kind: 'legal', label: 'Legal' },
  { kind: 'privacy', label: 'Privacy' },
  { kind: 'terms', label: 'Terms' },
  { kind: 'refund', label: 'Refund Policy' },
];
