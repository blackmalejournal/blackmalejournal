import type { Metadata } from 'next';
import { Mail, MessageCircle } from 'lucide-react';
import { BrandMark } from '@/components/brand/BrandMark';
import { SOCIAL_LINKS } from '@/lib/nav';
import { CONTACT_EMAILS } from '@/lib/seo';
import { ContactForm } from './ContactForm';
import { SupportCard } from './SupportCard';
import { ScrollReveal } from '@/components/motion/ScrollReveal';

export const metadata: Metadata = {
  title: 'Connect',
  description:
    'Reach the Chairman. Contact The Black Male Journal for inquiries, collaborations, and press.',
  openGraph: {
    title: 'Connect',
    description:
      'Reach the Chairman. Contact The Black Male Journal for inquiries, collaborations, and press.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Connect',
    description:
      'Reach the Chairman. Contact The Black Male Journal for inquiries, collaborations, and press.',
  },
};

const whatsappHref = process.env.NEXT_PUBLIC_WHATSAPP_LINK ?? '#';

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-content px-6 py-16">
      <ScrollReveal as="div">
        <div className="mb-6">
          <BrandMark size={40} color="var(--bmj-red)" />
        </div>
        <h1 className="mb-2 font-display text-5xl uppercase text-bmj-white md:text-7xl">
          Connect
        </h1>
        <p className="mb-12 max-w-xl font-body text-sm leading-relaxed text-bmj-cream/70">
          Questions, ideas, collaborations, or just want to build with us — reach
          out. The Chairman reads every message.
        </p>
      </ScrollReveal>

      <ScrollReveal as="div" delay={0.1}>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div>
          <h2 className="mb-6 font-label text-xs uppercase tracking-widest text-bmj-tan">
            Send a Message
          </h2>
          <ContactForm />
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="mb-4 font-label text-xs uppercase tracking-widest text-bmj-tan">
              Direct
            </h2>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-bmj-red" />
                <a
                  href={`mailto:${CONTACT_EMAILS.general}`}
                  className="font-mono text-sm text-bmj-cream transition-colors hover:text-bmj-red"
                >
                  {CONTACT_EMAILS.general}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle size={16} className="text-bmj-red" />
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-bmj-cream transition-colors hover:text-bmj-red"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 font-label text-xs uppercase tracking-widest text-bmj-tan">
              Follow
            </h2>
            <div className="flex gap-4">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-bmj-tan transition-colors hover:text-bmj-cream"
                >
                  <Icon size={18} />
                  <span className="font-label text-xs uppercase tracking-widest">
                    {label}
                  </span>
                </a>
              ))}
            </div>
          </div>

          <SupportCard />
        </div>
      </div>
      </ScrollReveal>
    </section>
  );
}
