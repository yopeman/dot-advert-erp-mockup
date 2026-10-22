import Image from 'next/image';

interface BrandLogoProps {
  size?: number;
  radius?: number;
}

export default function BrandLogo({ size = 38, radius = 10 }: BrandLogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Dot Advert"
      width={size}
      height={size}
      priority
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${radius}px`,
        objectFit: 'contain',
        flexShrink: 0,
      }}
    />
  );
}
