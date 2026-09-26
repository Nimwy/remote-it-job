import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["vi", "en"],
  defaultLocale: "vi",
  // "always": mọi URL đều có prefix locale (/vi/..., /en/...). Root "/" redirect sang /vi.
  // Tránh middleware rewrite tuyệt đối của Next 16 khi bind hostname -> chạy được với `-H 127.0.0.1`.
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
