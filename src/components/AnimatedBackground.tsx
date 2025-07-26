'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface IconStyle {
  top: string;
  left: string;
  size: number;
  animationDuration: string;
  animationDelay: string;
  opacity: number;
}

interface AnimatedBackgroundProps {
  imageUrl: string;
}

const AnimatedBackground = ({ imageUrl }: AnimatedBackgroundProps) => {
  const [icons, setIcons] = useState<IconStyle[]>([]);

  useEffect(() => {
    const newIcons: IconStyle[] = Array.from({ length: 20 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.floor(Math.random() * 25) + 15, // 15px to 40px
      animationDuration: `${Math.random() * 10 + 10}s`, // 10s to 20s
      animationDelay: `${Math.random() * 5}s`, // 0s to 5s delay
      opacity: Math.random() * 0.3 + 0.1, // 0.1 to 0.4
    }));
    setIcons(newIcons);
  }, [imageUrl]);

  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {icons.map((style, index) => (
        <div
          key={index}
          className="absolute animate-float"
          style={{
            top: style.top,
            left: style.left,
            width: `${style.size}px`,
            height: `${style.size}px`,
            animationDuration: style.animationDuration,
            animationDelay: style.animationDelay,
            opacity: style.opacity,
          }}
        >
          <Image
            src={imageUrl}
            alt=""
            layout="fill"
            className="object-contain"
            unoptimized
          />
        </div>
      ))}
    </div>
  );
};

export default AnimatedBackground;