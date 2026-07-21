export type LegalSection = {
  heading: string
  body: string[]
}

export type LegalDocument = {
  title: string
  description: string
  effectiveDate: string
  intro: string
  sections: LegalSection[]
  closingNote?: string
}

export const PRIVACY_POLICY: LegalDocument = {
  title: 'Privacy Policy',
  description: 'How fuxem.xyz collects, uses, and protects account, content, and technical data.',
  effectiveDate: 'July 12, 2026',
  intro:
    'fuxem.xyz is committed to protecting your privacy. This policy explains what information we collect, how we use it, and your rights regarding your data.',
  sections: [
    {
      heading: '1. Information We Collect',
      body: [
        'Account Data: Email address and username (required for registration).',
        'Content Data: Media and text you upload or post.',
        'Technical Data: IP address (for security and anti-abuse), browser type, and device information (not linked to your identity).',
        'Advertising Data: When advertising is displayed, third-party ad networks (such as TrafficJunky or ExoClick) may set their own cookies or collect anonymised data such as your general location, browser type, and ad interactions. We do not share your personal account data with these networks.',
        'We do not collect real names, addresses, phone numbers, or other personal identifiers.',
      ],
    },
    {
      heading: '2. Use of Information',
      body: [
        'To provide and maintain the service.',
        'To communicate with you about your account or content.',
        'To detect and prevent abuse or illegal activity.',
        'To display contextually relevant advertising via adult ad networks.',
        'To comply with legal obligations.',
      ],
    },
    {
      heading: '3. Data Sharing',
      body: [
        'We do not sell your personal data to third parties.',
        'Advertising partners may receive anonymised, non-identifying technical data (browser type, general location) for the purpose of serving ads. You may opt out of interest-based advertising via your browser settings or an IAB-accredited opt-out tool.',
        'Data may be shared with law enforcement only if legally required.',
      ],
    },
    {
      heading: '4. Cookies & Tracking',
      body: [
        'Essential cookies: used for authentication and session management. These cannot be disabled without breaking core functionality.',
        'Advertising cookies: set by third-party ad networks to serve and measure ads. These are only placed after you accept optional cookies via our cookie consent banner.',
        'Analytics cookies: anonymised usage analytics to improve site performance. Only placed after consent.',
        'You can withdraw cookie consent at any time by clearing your browser cookies or using the cookie preference link in the footer.',
      ],
    },
    {
      heading: '5. Data Retention',
      body: [
        'Account and content data are retained until you delete your account or content.',
        'Deleted data is removed from our systems within 30 days.',
        'Advertising-related data held by third-party networks is subject to their own retention policies.',
      ],
    },
    {
      heading: '6. Your Rights (GDPR & CCPA)',
      body: [
        'Right to access: you may request a copy of the personal data we hold about you.',
        'Right to erasure: you may request deletion of your account and associated data at any time.',
        'Right to correction: you may update your account data at any time.',
        'Right to opt out of sale/sharing: we do not sell personal data. You may opt out of advertising cookies via the consent banner.',
        'Right to data portability: request your data in a machine-readable format.',
        'California residents (CCPA): you have the right to know, delete, and opt out of the sale of personal information. We do not sell personal information.',
        'EU/UK residents (GDPR): you have the right to lodge a complaint with your supervisory authority.',
        'To exercise any of these rights, email: privacy@fuxem.xyz',
      ],
    },
    {
      heading: '7. International Transfers',
      body: [
        'Your data may be processed in countries outside your own. Where required, we apply appropriate safeguards such as standard contractual clauses.',
      ],
    },
    {
      heading: '8. Contact',
      body: ['For privacy questions or requests, email: privacy@fuxem.xyz'],
    },
  ],
}

export const TERMS_OF_SERVICE: LegalDocument = {
  title: 'Terms of Service',
  description: 'The eligibility, moderation, privacy, and content rules for using fuxem.xyz.',
  effectiveDate: 'July 12, 2026',
  intro:
    'Welcome to fuxem.xyz. By accessing or using our platform, you agree to these Terms of Service. Please read them carefully.',
  sections: [
    {
      heading: '1. Eligibility',
      body: [
        'You must be at least 18 years of age (or the age of majority in your jurisdiction, whichever is greater) to access or use this site.',
        'By entering this site, you confirm that you are of legal age in your jurisdiction to view sexually explicit adult content.',
        'If you are a minor, you must leave this site immediately.',
        'By accessing this site, you agree that you are not located in a jurisdiction where accessing such content is prohibited.',
      ],
    },
    {
      heading: '2. Adult Content & Age Verification',
      body: [
        'This site contains sexually explicit adult content intended solely for consenting adults.',
        'All performers depicted in content on this site are 18 years of age or older at the time content was created.',
        'Age and identity verification records for all performers are maintained in compliance with 18 U.S.C. § 2257 and 28 C.F.R. Part 75. See our 2257 Statement for details.',
        'We actively enforce age verification for all content contributors.',
      ],
    },
    {
      heading: '3. User Content',
      body: [
        'You are responsible for all content you upload or share.',
        'You must have the rights and explicit consent of all participants to upload any content.',
        'By uploading content, you certify that all depicted individuals are 18 years of age or older and that you hold compliant 2257 records.',
        'Prohibited content includes: CSAM or any content depicting minors, non-consensual material, revenge pornography, bestiality, content obtained without all participants\' consent, and anything otherwise illegal.',
      ],
    },
    {
      heading: '4. Privacy',
      body: [
        'We collect minimal data (see Privacy Policy).',
        'You may request deletion of your data at any time.',
        'By using the site, you consent to our Privacy Policy, including the use of advertising cookies if accepted.',
      ],
    },
    {
      heading: '5. Moderation',
      body: [
        'We reserve the right to remove content or ban users who violate these terms or our Community Guidelines.',
        'Users can report content for review via the report function on any post or profile.',
        'All reports are reviewed by our moderation team.',
      ],
    },
    {
      heading: '6. DMCA & Copyright',
      body: [
        'If you believe your copyright is infringed, see our full DMCA Policy or contact: dmca@fuxem.xyz',
        'We will promptly respond to valid DMCA takedown requests.',
        'Counter-notices may be submitted as provided under the DMCA.',
      ],
    },
    {
      heading: '7. Jurisdiction & Access',
      body: [
        'Access may be restricted from countries or regions where adult content is prohibited by law.',
        'You are responsible for compliance with all applicable local laws.',
      ],
    },
    {
      heading: '8. Disclaimers',
      body: [
        'Content is user-generated and not pre-screened before publication.',
        'We are not liable for user content, but will act on valid reports and legal requests.',
        'We make no representation that content is suitable for viewing in all jurisdictions.',
      ],
    },
    {
      heading: '9. Changes',
      body: ['We may update these terms at any time. Continued use of the site after changes are posted constitutes acceptance of the updated terms.'],
    },
    {
      heading: '10. Contact',
      body: ['For questions, contact: support@fuxem.xyz'],
    },
  ],
}

export const COMMUNITY_GUIDELINES: LegalDocument = {
  title: 'Community Guidelines',
  description: 'The core safety, consent, and moderation rules for participating on fuxem.xyz.',
  effectiveDate: 'July 12, 2026',
  intro:
    'fuxem.xyz is a platform for sharing adult content by and for consenting adults. To maintain a safe and legal environment, we require all users to follow these minimal guidelines:',
  sections: [
    {
      heading: '1. Prohibited Content',
      body: [
        'No child sexual abuse material (CSAM) or content involving minors (real or simulated).',
        'No non-consensual content (including hidden cameras, revenge porn, or content uploaded without all participants’ consent).',
        'No bestiality or content involving animals.',
        'No content that violates applicable laws or regulations.',
      ],
    },
    {
      heading: '2. Respect and Consent',
      body: [
        'Only upload content you have the right to share.',
        'All participants in content must be 18+ and have given explicit consent.',
        'Do not harass, threaten, or abuse other users.',
      ],
    },
    {
      heading: '3. Reporting and Moderation',
      body: [
        'Users can flag/report content that violates these guidelines.',
        'Our moderation team will review reports and remove illegal or abusive content promptly.',
        'Repeat or severe offenders may be banned.',
      ],
    },
    {
      heading: '4. Jurisdictional Restrictions',
      body: [
        'Access is blocked from countries with strict content laws.',
        'Users are responsible for complying with their local laws.',
      ],
    },
    {
      heading: '5. Appeals',
      body: ['If your content is removed or your account is banned, you may appeal by contacting: moderation@fuxem.xyz'],
    },
  ],
}

export const COMPLIANCE_2257: LegalDocument = {
  title: '18 U.S.C. § 2257 Record-Keeping Requirements Compliance Statement',
  description: 'Record-keeping compliance statement for all sexually explicit content on fuxem.xyz pursuant to 18 U.S.C. § 2257.',
  effectiveDate: 'July 12, 2026',
  intro:
    'All visual depictions of actual sexually explicit conduct that appear on fuxem.xyz were produced with all performers who were 18 years of age or older at the time of production. fuxem.xyz operates in compliance with 18 U.S.C. § 2257 and 28 C.F.R. Part 75.',
  sections: [
    {
      heading: 'Custodian of Records',
      body: [
        'The custodian of records required to be maintained pursuant to 18 U.S.C. § 2257 and 28 C.F.R. Part 75 is:',
        'fuxem.xyz / Compliance Officer',
        'records@fuxem.xyz',
        'Records are available for inspection during regular business hours upon lawful request.',
      ],
    },
    {
      heading: 'Third-Party Content',
      body: [
        'With respect to content produced by third-party content producers, including user-generated content, such producers are the primary producers of such content and are solely responsible for maintaining the records required pursuant to 18 U.S.C. § 2257 and 28 C.F.R. Part 75.',
        'All users who upload content to fuxem.xyz certify, by uploading, that all performers depicted are 18 years of age or older and that compliant age verification records are held by the uploader.',
      ],
    },
    {
      heading: 'Exemptions',
      body: [
        'Certain content on this site may be exempt from the requirements of 18 U.S.C. § 2257 pursuant to 18 U.S.C. § 2257(h)(2)(B)(v) and 28 C.F.R. § 75.6 because it does not contain a depiction of an actual human being engaged in actual sexually explicit conduct.',
      ],
    },
    {
      heading: 'Reporting Suspected Violations',
      body: [
        'If you believe any content on this site depicts a minor, please report it immediately to: compliance@fuxem.xyz',
        'You may also report such material to the National Center for Missing and Exploited Children (NCMEC) at CyberTipline.org or to the FBI at tips.fbi.gov.',
      ],
    },
  ],
  closingNote:
    'This statement is made in compliance with 18 U.S.C. § 2257 and 28 C.F.R. Part 75. For questions regarding this statement, contact: compliance@fuxem.xyz',
}

export const DMCA_POLICY: LegalDocument = {
  title: 'DMCA Copyright Policy',
  description: 'Copyright takedown procedures and counter-notice policy for fuxem.xyz under the Digital Millennium Copyright Act.',
  effectiveDate: 'July 12, 2026',
  intro:
    'fuxem.xyz respects the intellectual property rights of others and expects users of our platform to do the same. We will respond to notices of alleged copyright infringement that comply with the Digital Millennium Copyright Act (DMCA). This policy explains how to submit a takedown notice and how to submit a counter-notice.',
  sections: [
    {
      heading: '1. Submitting a DMCA Takedown Notice',
      body: [
        'If you believe that content on fuxem.xyz infringes your copyright, please send a written notice to our designated Copyright Agent at: dmca@fuxem.xyz',
        'Your notice must include: (a) a physical or electronic signature of the copyright owner or authorised agent; (b) identification of the copyrighted work claimed to have been infringed; (c) identification of the material that is claimed to be infringing, including a URL or sufficient detail to locate it; (d) your contact information (name, address, telephone number, and email); (e) a statement that you have a good-faith belief that the use is not authorised by the copyright owner, its agent, or law; (f) a statement, made under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner or authorised to act on their behalf.',
      ],
    },
    {
      heading: '2. Our Response to Takedown Notices',
      body: [
        'Upon receipt of a valid DMCA notice, we will expeditiously remove or disable access to the allegedly infringing content.',
        'We will notify the user who posted the content that a takedown notice has been received.',
        'Repeated infringers will have their accounts terminated.',
      ],
    },
    {
      heading: '3. Submitting a DMCA Counter-Notice',
      body: [
        'If you believe your content was removed in error, you may submit a counter-notice to: dmca@fuxem.xyz',
        'Your counter-notice must include: (a) your physical or electronic signature; (b) identification of the material that was removed and its former location; (c) a statement under penalty of perjury that you have a good-faith belief the material was removed by mistake or misidentification; (d) your name, address, telephone number, and a statement that you consent to the jurisdiction of the Federal District Court for the district in which your address is located.',
        'If we receive a valid counter-notice, we may restore the content unless the original complainant files a court action within 10–14 business days.',
      ],
    },
    {
      heading: '4. Repeat Infringer Policy',
      body: [
        'In accordance with the DMCA and other applicable law, we have adopted a policy of terminating accounts that are repeat copyright infringers, in appropriate circumstances and at our sole discretion.',
      ],
    },
    {
      heading: '5. Copyright Agent Contact',
      body: [
        'Designated Copyright Agent: fuxem.xyz / DMCA Agent',
        'Email: dmca@fuxem.xyz',
        'Please use "DMCA Takedown Notice" or "DMCA Counter-Notice" as the subject line.',
      ],
    },
  ],
  closingNote:
    'Misrepresenting that material is infringing may result in liability for damages under 17 U.S.C. § 512(f). If you are unsure whether material infringes your copyright, consult a legal professional.',
}