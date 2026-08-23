import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { JobCard } from "@/components/JobCard";
import { Icon } from "@/components/ui/Icon";
import { serverListCategories, serverListJobs } from "@/services/jobs";

export default async function HomePage() {
  const t = await getTranslations("home");
  const [jobsData, categories] = await Promise.all([
    serverListJobs({ page: 1, page_size: 9 }),
    serverListCategories(),
  ]);

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-tertiary px-6 py-14 text-center md:py-20">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white" />
          <div className="absolute -bottom-16 -left-10 h-72 w-72 rounded-full bg-white" />
        </div>
        <h1 className="relative mx-auto max-w-3xl font-display text-display leading-tight text-on-primary">
          {t("title")}
        </h1>
        <p className="relative mx-auto mt-4 max-w-2xl text-body-lg text-on-primary/85">
          {t("subtitle")}
        </p>

        <form method="GET" action="/jobs" className="relative mx-auto mt-8 flex max-w-xl gap-2">
          <div className="relative flex-1">
            <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
            <input
              name="q"
              placeholder={t("searchPlaceholder")}
              className="h-12 w-full rounded-lg border border-transparent bg-white pl-11 pr-4 text-body-md text-on-surface shadow-sm placeholder:text-outline focus:border-primary focus:outline-none focus:ring-2 focus:ring-on-primary/30"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-on-primary px-6 text-label-md font-semibold text-primary transition-colors hover:bg-on-primary/90"
          >
            {t("search")}
          </button>
        </form>
      </section>

      <section className="mt-8 flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-outline-variant pb-4">
          <span className="mr-2 flex items-center gap-1.5 text-label-sm uppercase tracking-wider text-secondary">
            <Icon name="category" className="text-[16px]" />
          </span>
          <Link
            href="/jobs"
            className="rounded-full border border-primary-container bg-primary-container px-4 py-1.5 text-label-md text-on-primary-container transition-colors hover:bg-primary hover:text-on-primary"
          >
            {t("all")}
          </Link>
          {(categories ?? []).map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="rounded-full border border-outline-variant bg-surface-container px-4 py-1.5 text-label-md text-on-surface transition-colors hover:border-primary hover:bg-primary hover:text-on-primary"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 flex flex-col gap-6">
        <div className="mb-2 flex items-end justify-between">
          <h2 className="font-display text-headline-md">{t("featuredJobs")}</h2>
          <Link
            href="/jobs"
            className="flex items-center gap-1 text-label-md text-primary hover:underline"
          >
            {t("viewMore")}
            <Icon name="arrow_forward" className="text-[18px]" />
          </Link>
        </div>

        {jobsData && jobsData.items.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobsData.items.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest py-16 text-center">
            <Icon name="work_off" className="text-[48px] text-outline" />
            <p className="text-body-md text-secondary">{t("noJobs")}</p>
          </div>
        )}
      </section>
    </div>
  );
}
