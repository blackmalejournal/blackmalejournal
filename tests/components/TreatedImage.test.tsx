import { render } from '@testing-library/react';
import { TreatedImage } from '@/components/ui/TreatedImage';

const baseProps = {
  src: '/test-image.jpg',
  alt: 'Test image',
  width: 400,
  height: 300,
};

describe('TreatedImage', () => {
  it('applies halftone class by default (editorial variant)', () => {
    const { container } = render(<TreatedImage {...baseProps} />);
    const img = container.querySelector('img');
    expect(img?.className).toMatch(/halftone/);
  });

  it('applies halftone class for editorial variant', () => {
    const { container } = render(<TreatedImage {...baseProps} variant="editorial" />);
    const img = container.querySelector('img');
    expect(img?.className).toMatch(/halftone/);
    expect(img?.className).not.toMatch(/halftone-heavy/);
  });

  it('wraps portrait variant in halftone-dots container', () => {
    const { container } = render(<TreatedImage {...baseProps} variant="portrait" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toMatch(/halftone-dots/);
    const img = wrapper.querySelector('img');
    expect(img?.className).toMatch(/halftone-heavy/);
  });

  it('applies duotone class for hero variant', () => {
    const { container } = render(<TreatedImage {...baseProps} variant="hero" />);
    const img = container.querySelector('img');
    expect(img?.className).toMatch(/duotone/);
  });

  it('passes through additional className', () => {
    const { container } = render(
      <TreatedImage {...baseProps} className="w-full object-cover" />
    );
    const img = container.querySelector('img');
    expect(img?.className).toMatch(/w-full/);
    expect(img?.className).toMatch(/object-cover/);
  });

  it('renders accessible alt text', () => {
    const { getByAltText } = render(
      <TreatedImage {...baseProps} alt="Portrait of a man reading" />
    );
    expect(getByAltText('Portrait of a man reading')).toBeInTheDocument();
  });
});
