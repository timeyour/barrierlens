export default function PageBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="page-grid absolute inset-0" />
      <div className="absolute -left-32 top-32 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="absolute -right-24 top-[40%] h-80 w-80 rounded-full bg-emerald-400/15 blur-3xl" />
      <div className="absolute bottom-0 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-blue-300/10 blur-3xl" />
    </div>
  );
}
