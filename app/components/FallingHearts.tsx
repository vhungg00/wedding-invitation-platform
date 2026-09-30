"use client";
import { useEffect, useState } from "react";

interface Heart {
  id: number;
  left: number;
  animationDuration: number;
  delay: number;
  size: number;
}

export default function FallingHearts() {
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    const createHeart = (): Heart => ({
      id: Math.random(),
      left: Math.random() * 100,
      animationDuration: 2 + Math.random() * 2, // 2-4 seconds (consistent speed)
      delay: 0, // No delay - immediate start
      size: 8 + Math.random() * 12, // 8-20px
    });

    const generateHearts = () => {
      const newHearts: Heart[] = [];
      for (let i = 0; i < 30; i++) {
        // More hearts for continuous effect
        newHearts.push(createHeart());
      }
      setHearts(newHearts);
    };

    generateHearts();

    // Regenerate hearts every 2 seconds for continuous flow
    const interval = setInterval(generateHearts, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute animate-falling-heart"
          style={{
            left: `${heart.left}%`,
            animationDuration: `${heart.animationDuration}s`,
            animationDelay: `${heart.delay}s`,
            fontSize: `${heart.size}px`,
          }}
        >
          ❤️
        </div>
      ))}
    </div>
  );
}
