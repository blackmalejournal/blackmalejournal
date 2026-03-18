import Image from 'next/image';

type ImageVariant = 'editorial' | 'portrait' | 'hero';

interface TreatedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  variant?: ImageVariant;
  className?: string;
  priority?: boolean;
}

const imageClasses: Record<ImageVariant, string> = {
  editorial: 'halftone',
  portrait: 'halftone-heavy',
  hero: 'duotone',
};

export function TreatedImage({
  src,
  alt,
  width,
  height,
  variant = 'editorial',
  className = '',
  priority = false,
}: TreatedImageProps) {
  const imgClass = [imageClasses[variant], className].filter(Boolean).join(' ');

  if (variant === 'portrait') {
    return (
      <div className="halftone-dots relative">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={imgClass}
          priority={priority}
        />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={imgClass}
      priority={priority}
    />
  );
}
