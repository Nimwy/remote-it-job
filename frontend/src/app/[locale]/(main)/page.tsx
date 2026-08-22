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
      <section className="flex flex-col items-center gap-4 py-8 text-center md:py-16">
        <h1 className="max-w-3xl font-display text-display leading-tight">{t("title")}</h1>
        <p className="max-w-2xl text-body-lg text-on-surface-variant">{t("subtitle")}</p>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-card">
        <div className="flex flex-wrap gap-2 border-b border-outline-variant pb-4">
          <Link
            href="/jobs"
            className="rounded-full border border-primary-container bg-primary-container px-4 py-1.5 text-label-md text-on-primary-container transition-colors"
          >
            {t("all")}
          </Link>
          {(categories ?? []).map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="rounded-full border border-outline-variant bg-surface-container px-4 py-1.5 text-label-md text-on-surface transition-colors hover:bg-surface-variant"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 flex flex-col gap-6">
        <div className="mb-2 flex items-end justify-between">
          <h2 className="font-display text-headline-md">{t("featuredJobs")}</h2>
          <span className="text-label-md text-secondary">
            {jobsData ? t("jobsCount", { count: jobsData.total }) : ""}
          </span>
        </div>

        {jobsData && jobsData.items.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobsData.items.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <p className="text-body-md text-secondary">{t("noJobs")}</p>
        )}

        <div className="flex justify-center">
          <Link
            href="/jobs"
            className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container px-6 py-3 text-label-md text-on-surface shadow-sm transition-colors hover:bg-surface-variant"
          >
            {t("viewMore")}
            <Icon name="arrow_downward" className="text-[18px]" />
          </Link>
        </div>
      </section>
    </div>
  );
}
