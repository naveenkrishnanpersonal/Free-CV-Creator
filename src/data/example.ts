import { DEFAULT_SETTINGS, DEFAULT_STYLE } from '@/data/defaults'
import type { SectionKind } from '@/lib/constants'
import { newId } from '@/lib/ids'
import type { Entry, ResumeDoc, Section } from '@/lib/schema'
import { SECTION_META } from '@/lib/sectionMeta'

function entry(input: Partial<Entry> & Pick<Entry, 'id' | 'title'>): Entry {
  return {
    organization: '',
    location: '',
    start: '',
    end: '',
    current: false,
    url: '',
    summary: '',
    bullets: [],
    tags: [],
    meta: {},
    visible: true,
    ...input,
  }
}

function section(kind: SectionKind, title: string, items: Entry[]): Section {
  return {
    id: `section-${kind}`,
    kind,
    title,
    visible: true,
    layout: SECTION_META[kind].defaultLayout,
    items,
  }
}

export const EXAMPLE_DOC: ResumeDoc = {
  schemaVersion: 1,
  id: 'example-senior-product-designer',
  title: 'Senior Product Designer CV',
  createdAt: '2026-01-12T09:00:00.000Z',
  updatedAt: '2026-01-12T09:00:00.000Z',
  basics: {
    name: 'Amara Okafor',
    headline: 'Senior Product Designer',
    email: 'amara.okafor@example.com',
    phone: '+44 20 7946 0821',
    city: 'London',
    country: 'United Kingdom',
    website: 'amaraokafor.design',
    summary:
      'Senior product designer with eight years of experience turning complex financial workflows into products people can use without a manual. I led the redesign of a payments dashboard used by 40,000 businesses, built a six-person design practice, and introduced research habits that changed how three squads ship. I care about clarity, accessibility, and work that survives contact with real data.',
    profiles: [
      {
        id: 'profile-linkedin',
        network: 'LinkedIn',
        label: 'in/amaraokafor',
        url: 'https://www.linkedin.com/in/amaraokafor',
      },
      {
        id: 'profile-dribbble',
        network: 'Dribbble',
        label: 'dribbble.com/amaraokafor',
        url: 'https://dribbble.com/amaraokafor',
      },
    ],
    photo: null,
  },
  sections: [
    section('summary', 'Profile', []),
    section('experience', 'Experience', [
      entry({
        id: 'exp-northwind',
        title: 'Senior Product Designer',
        organization: 'Northwind Payments',
        location: 'London, UK',
        start: '2022-03',
        current: true,
        summary:
          'Payments platform serving 40,000 small businesses; led design across merchant experience and growth.',
        bullets: [
          'Led the end-to-end redesign of the merchant dashboard, lifting weekly active usage by 34% and reducing support tickets by 22%.',
          'Built and mentored a six-person product design team; introduced a critique and research cadence now used by three squads.',
          'Partnered with data science to define activation metrics, informing a roadmap that raised trial-to-paid conversion by 8.4%.',
        ],
        tags: ['Design systems', 'Research', 'Product strategy'],
      }),
      entry({
        id: 'exp-ledgerly',
        title: 'Product Designer',
        organization: 'Ledgerly',
        location: 'Berlin, Germany',
        start: '2019-06',
        end: '2022-02',
        summary: 'Invoicing and spend management for finance teams.',
        bullets: [
          'Designed a multi-entity invoicing flow used by 12,000 finance teams, cutting time-to-first-invoice from 11 minutes to 4.',
          'Ran 60+ moderated interviews and turned the findings into a component library adopted by four product teams.',
          'Shipped WCAG 2.1 AA improvements across onboarding, raising completion by 17%.',
        ],
        tags: ['Interaction design', 'Design systems', 'Accessibility'],
      }),
      entry({
        id: 'exp-kite',
        title: 'UI Designer',
        organization: 'Studio Kite',
        location: 'Lagos, Nigeria',
        start: '2017-09',
        end: '2019-05',
        summary: 'Brand and product studio serving early-stage teams.',
        bullets: [
          'Delivered brand and product design for 14 early-stage clients across fintech and logistics.',
          'Created a reusable design system that reduced new landing-page build time from five days to one.',
        ],
        tags: ['Visual design', 'Brand', 'Prototyping'],
      }),
    ]),
    section('education', 'Education', [
      entry({
        id: 'edu-rca',
        title: 'MA Interaction Design',
        organization: 'Royal College of Art',
        location: 'London, UK',
        start: '2015-09',
        end: '2017-06',
        summary: 'Distinction. Thesis on trust signals in financial interfaces.',
      }),
      entry({
        id: 'edu-unilag',
        title: 'BSc Computer Science',
        organization: 'University of Lagos',
        location: 'Lagos, Nigeria',
        start: '2011-09',
        end: '2015-06',
        summary: 'First Class Honours.',
      }),
    ]),
    section('projects', 'Selected Projects', [
      entry({
        id: 'project-insights',
        title: 'Merchant Insights',
        organization: 'Northwind Payments',
        start: '2023-01',
        end: '2023-09',
        summary:
          'Self-serve analytics for merchants who had never used a data tool before.',
        bullets: [
          'Shaped the information architecture around four merchant questions, validated with 18 usability sessions.',
          'Shipped a dashboard that became the second most-used feature in the product within one quarter.',
        ],
        tags: ['Figma', 'Research'],
      }),
      entry({
        id: 'project-open-banking',
        title: 'Open Banking Onboarding',
        organization: 'Ledgerly',
        start: '2021-03',
        end: '2021-11',
        summary: 'A shorter, clearer path from sign-up to a connected bank account.',
        bullets: [
          'Reduced the onboarding flow from nine screens to four without losing regulatory disclosures.',
          'Increased successful bank connections by 26% across three markets.',
        ],
        tags: ['Prototyping', 'Maze'],
      }),
    ]),
    section('skills', 'Skills', [
      entry({
        id: 'skills-product',
        title: 'Product design',
        tags: ['Research', 'Interaction design', 'Prototyping', 'Design systems', 'Accessibility'],
      }),
      entry({
        id: 'skills-tools',
        title: 'Tools',
        tags: ['Figma', 'Framer', 'Maze', 'Linear', 'Notion'],
      }),
      entry({
        id: 'skills-leadership',
        title: 'Leadership',
        tags: ['Team building', 'Coaching', 'Roadmapping', 'Stakeholder alignment'],
      }),
    ]),
    section('certifications', 'Certifications', [
      entry({
        id: 'cert-cpacc',
        title: 'Certified Professional in Accessibility Core Competencies',
        organization: 'IAAP',
        start: '2024-05',
        summary: 'Credential ID 48219.',
      }),
      entry({
        id: 'cert-ideo',
        title: 'Leading Product Design',
        organization: 'IDEO U',
        start: '2022-09',
      }),
    ]),
    section('awards', 'Awards', [
      entry({
        id: 'award-dad',
        title: 'D&AD Wood Pencil',
        organization: 'D&AD',
        start: '2023-05',
        summary: 'Merchant dashboard redesign.',
      }),
    ]),
    section('languages', 'Languages', [
      entry({ id: 'lang-en', title: 'English', summary: 'Native' }),
      entry({ id: 'lang-de', title: 'German', summary: 'Professional working proficiency' }),
      entry({ id: 'lang-yo', title: 'Yoruba', summary: 'Native' }),
    ]),
  ],
  style: structuredClone(DEFAULT_STYLE),
  settings: structuredClone(DEFAULT_SETTINGS),
}

export function createExampleDoc(): ResumeDoc {
  const now = new Date().toISOString()
  return {
    ...structuredClone(EXAMPLE_DOC),
    id: newId(),
    createdAt: now,
    updatedAt: now,
  }
}
