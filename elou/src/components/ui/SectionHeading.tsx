export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  const alignment = align === "center" ? "text-center items-center" : "text-left items-start";

  return (
    <div className={`flex flex-col gap-3 ${alignment}`}>
      {eyebrow ? (
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-ink text-balance">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-base text-ink-soft text-pretty">
          {description}
        </p>
      ) : null}
    </div>
  );
}
