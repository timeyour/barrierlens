interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  titleClassName?: string;
  descriptionClassName?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  titleClassName = "",
  descriptionClassName = "",
}: SectionHeaderProps) {
  const alignClass = align === "center" ? "text-center mx-auto max-w-2xl" : "";

  return (
    <div className={`mb-6 sm:mb-8 ${alignClass}`}>
      <p className="section-eyebrow">{eyebrow}</p>
      <h2
        className={`mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl ${titleClassName}`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-2 text-sm leading-relaxed text-slate-600 sm:text-base ${descriptionClassName}`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
