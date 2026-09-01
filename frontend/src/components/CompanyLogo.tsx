const PALETTE = [
  "bg-[#0d9488]", // teal
  "bg-[#2563eb]", // blue
  "bg-[#7c3aed]", // violet
  "bg-[#db2777]", // pink
  "bg-[#ea580c]", // orange
  "bg-[#16a34a]", // green
  "bg-[#dc2626]", // red
  "bg-[#0891b2]", // cyan
  "bg-[#ca8a04]", // amber
  "bg-[#4f46e5]", // indigo
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
