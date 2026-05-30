import type { ReactNode } from "react";

interface HomeFlowSectionProps {
  index: string;
  title: string;
  hint?: string;
  children: ReactNode;
  id?: string;
  className?: string;
}

export default function HomeFlowSection({
  index,
  title,
  hint,
  children,
  id,
  className = "",
}: HomeFlowSectionProps) {
  return (
    <section id={id} className={`home-flow-section scroll-mt-24 ${className}`}>
      <header className="home-flow-section-head mb-5 md:mb-6">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.32em] text-sky-300/80">
          {index}
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">{title}</h2>
          {hint && (
            <p className="text-xs tracking-wide text-white/45">{hint}</p>
          )}
        </div>
        <div className="home-flow-section-rule mt-4" aria-hidden />
      </header>
      {children}
    </section>
  );
}
