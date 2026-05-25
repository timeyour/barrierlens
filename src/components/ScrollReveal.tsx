"use client";

import { ensureGsapPlugins, gsap, useGSAP } from "@/lib/gsapClient";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { ReactNode } from "react";
import { useRef } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
}

ensureGsapPlugins();

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion || !ref.current) return;

      const x =
        direction === "left" ? -24 : direction === "right" ? 24 : 0;
      const y = direction === "up" ? 32 : 0;

      gsap.from(ref.current, {
        x,
        y,
        autoAlpha: 0,
        duration: 0.75,
        delay,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      });
    },
    { scope: ref, dependencies: [reducedMotion, delay, direction], revertOnUpdate: true },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
