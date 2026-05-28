export default function PageBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[var(--background)]">
      <div className="page-grid absolute inset-0 opacity-80" />
      <div className="absolute -right-20 top-24 h-96 w-96 rounded-full bg-blue-500/[0.06] blur-3xl" />
    </div>
  );
}
