const PALETTE = [
  "bg-[#0f766e]", // teal-700
  "bg-[#1d4ed8]", // blue-700
  "bg-[#475569]", // slate-600
  "bg-[#0369a1]", // sky-700
  "bg-[#6d28d9]", // violet-700
  "bg-[#b45309]", // amber-700
  "bg-[#15803d]", // green-700
  "bg-[#0e7490]", // cyan-700
  "bg-[#7e22ce]", // purple-700
  "bg-[#334155]", // slate-700
];

function hashString(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function CompanyLogo({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const color = PALETTE[hashString(name) % PALETTE.length];
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  const sizeClass =
    size === "lg"
      ? "h-16 w-16 rounded-2xl text-2xl"
      : size === "sm"
        ? "h-10 w-10 rounded-lg text-base"
        : "h-12 w-12 rounded-xl text-lg";

  return (
    <div
      className={`flex shrink-0 items-center justify-center font-display font-semibold text-white ${sizeClass} ${color}`}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}
