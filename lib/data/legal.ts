import { site } from '../site';

export const legalPages: Record<string, { title: string; updated: string; sections: { h: string; p: string[] }[] }> = {
  'privacy-policy': {
    title: 'Privacy Policy',
    updated: '2026-10-27',
    sections: [
      { h: 'Information we collect', p: ['When you submit an enquiry, post a property or contact us, we collect your name, mobile number, email address and any details you choose to share about your requirement. We also collect basic technical data such as pages visited, device type and approximate location through cookies and analytics.'] },
      { h: 'How we use your information', p: ['We use your information to respond to enquiries, share property details, arrange site visits, improve the website and, where you have agreed, send updates about relevant properties. We may share your enquiry with the developer or partner associated with the property you enquired about.'] },
      { h: 'Data security & retention', p: ['We use reasonable technical and organisational measures to protect your data. Enquiry data is retained only as long as needed for the purposes above or as required by law.'] },
      { h: 'Your choices', p: [`You can ask us to access, correct or delete your personal data, or opt out of communication, by writing to ${site.email}.`] },
    ],
  },
  'terms-and-conditions': {
    title: 'Terms & Conditions',
    updated: '2026-10-27',
    sections: [
      { h: 'Use of the website', p: ['By using RealtechX you agree to use the website lawfully and not to misuse its content, forms or services. Content on this website is for general information only.'] },
      { h: 'Listings', p: ['Listings, prices, images and specifications are provided for information and may change without notice. RealtechX does not guarantee the accuracy or availability of any listing. Buyers must independently verify all details before making any decision.'] },
      { h: 'Intellectual property', p: ['The RealtechX name, logo, design and original content are owned by RealtechX. Images used are either licensed stock photography or provided by partners.'] },
      { h: 'Limitation of liability', p: ['RealtechX shall not be liable for any loss arising from reliance on information on this website or from transactions between users and third parties.'] },
      { h: 'Governing law', p: ['These terms are governed by the laws of India, with jurisdiction in the courts of Surat, Gujarat.'] },
    ],
  },
  disclaimer: {
    title: 'Disclaimer',
    updated: '2026-10-27',
    sections: [
      { h: 'Preview portal', p: ['RealtechX is currently a preview portal. The projects, developers and prices shown are sample listings published for demonstration of the platform and do not represent offers for sale.'] },
      { h: 'No professional advice', p: ['Nothing on this website constitutes legal, financial or investment advice. Please consult qualified professionals and verify every detail before investing in real estate.'] },
      { h: 'Third-party links', p: ['External links and embedded maps are provided for convenience. RealtechX is not responsible for the content of third-party websites.'] },
    ],
  },
  'rera-disclaimer': {
    title: 'RERA Disclaimer',
    updated: '2026-10-27',
    sections: [
      { h: 'Registration status', p: ['RealtechX is not a RERA-registered real estate agent at present. Projects shown on this preview portal have not been verified on MahaRERA, K-RERA, TS-RERA, GujRERA or any other state RERA portal.'] },
      { h: 'Verify before you buy', p: ['Before booking any property, verify the project registration number, promoter details, approvals and completion timeline on the official RERA website of the respective state.'] },
    ],
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    updated: '2026-10-27',
    sections: [
      { h: 'What are cookies', p: ['Cookies are small files stored on your device that help websites remember preferences and understand usage.'] },
      { h: 'How we use them', p: ['We use essential cookies and local storage for features like your property shortlist, and analytics cookies to understand how visitors use the website. You can clear or block cookies in your browser settings.'] },
    ],
  },
};
