"use client";

import { useEffect, useMemo } from "react";

export default function CyberDentalBackground() {
  const particles = useMemo(() => {
    return Array.from({ length: 42 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${Math.random() * 2.5 + 1}px`,
      delay: `${Math.random() * 6}s`,
      duration: `${Math.random() * 8 + 8}s`,
      depth: (Math.random() * 0.7 + 0.3).toFixed(2),
    }));
  }, []);

  useEffect(() => {
    let targetX = 0;
    let targetY = 0;

    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      targetX =
        (event.clientX / window.innerWidth - 0.5) * 2;

      targetY =
        (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.025;
      currentY += (targetY - currentY) * 0.025;

      document.documentElement.style.setProperty(
        "--dental-mouse-x",
        currentX.toFixed(3)
      );

      document.documentElement.style.setProperty(
        "--dental-mouse-y",
        currentY.toFixed(3)
      );

      requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);

    const frame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="cyber-dental-background" aria-hidden="true">

      {/* Base */}
      <div className="cyber-dental-base" />

      {/* Soft ambient glow */}
      <div className="cyber-dental-glow cyber-glow-blue" />
      <div className="cyber-dental-glow cyber-glow-gold" />
      <div className="cyber-dental-glow cyber-glow-center" />

      {/* Very subtle grid */}
      <div className="cyber-dental-grid" />

      {/* Moving technical lines */}
      <div className="cyber-tech-lines">
        <span className="tech-line line-1" />
        <span className="tech-line line-2" />
        <span className="tech-line line-3" />
        <span className="tech-line line-4" />
        <span className="tech-line line-5" />
      </div>

      {/* Dental line-art */}
      <div className="dental-outline tooth-1">
        <span />
      </div>

      <div className="dental-outline tooth-2">
        <span />
      </div>

      <div className="dental-outline tooth-3">
        <span />
      </div>

      {/* Particles */}
      <div className="cyber-dental-particles">
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="dental-particle"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
              ["--particle-depth" as string]: particle.depth,
            }}
          />
        ))}
      </div>

      {/* Floating data columns */}
      <div className="dental-data-column data-column-1">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="dental-data-column data-column-2">
        <span />
        <span />
        <span />
        <span />
      </div>

      {/* Scan */}
      <div className="cyber-dental-scan" />

      {/* Vignette */}
      <div className="cyber-dental-vignette" />

    </div>
  );
}