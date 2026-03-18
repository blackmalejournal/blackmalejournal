// tests/components/ScrollReveal.test.tsx
import { render, screen } from '@testing-library/react';
import { ScrollReveal } from '@/components/motion/ScrollReveal';

// Mock framer-motion with Proxy to handle motion.div, motion.section, etc.
jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: new Proxy({}, {
      get: (_target: unknown, prop: string) =>
        React.forwardRef((props: Record<string, unknown>, ref: React.Ref<unknown>) => {
          const { initial: _i, animate: _a, exit: _e, transition: _t, ...rest } = props;
          return React.createElement(prop, { ...rest, ref, 'data-testid': `motion-${prop}` });
        }),
    }),
    useInView: jest.fn(() => true),
  };
});

describe('ScrollReveal', () => {
  it('renders children', () => {
    render(
      <ScrollReveal>
        <p>Hello</p>
      </ScrollReveal>,
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('passes className to wrapper', () => {
    render(
      <ScrollReveal className="mt-8">
        <p>Content</p>
      </ScrollReveal>,
    );
    expect(screen.getByTestId('motion-div')).toHaveClass('mt-8');
  });

  it('renders as a section element when as="section"', () => {
    render(
      <ScrollReveal as="section">
        <p>Section content</p>
      </ScrollReveal>,
    );
    expect(screen.getByTestId('motion-section')).toBeInTheDocument();
    expect(screen.getByText('Section content')).toBeInTheDocument();
  });
});
