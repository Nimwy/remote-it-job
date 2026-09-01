"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { routing } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const switchTo = (nextLocale: string) => {
    router.replace(
      { pathname, query: Object.fromEntries(searchParams) },
      { locale: nextLocale },
    );
  };

  return (
    <div className="flex items-center rounded-lg border border-outline-variant">
      {routing.locales.map((l) => (
        <button
          key={l}
          onClick={() => switchTo(l)}
          className={`px-2.5 py-1 text-label-sm uppercase transition-colors ${
            locale === l ? "bg-primary text-on-primary" : "text-secondary hover:text-primary"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
