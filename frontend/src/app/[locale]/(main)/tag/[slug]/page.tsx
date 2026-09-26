import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { JobCard } from "@/components/JobCard";
import { JsonLd } from "@/components/JsonLd";
import { serverListJobs, serverListTags } from "@/services/jobs";
import { breadcrumbJsonLd, collectionJsonLd } from "@/lib/structured-data";
import { alternates } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = (await getLocale()) as Locale;
  const tags = await serverListTags();
  const tag = tags?.find((t) => t.slug === slug);
  return {
    title: `${tag?.name ?? slug} Remote | Remote IT`,
    alternates: alternates(locale, `/tag/${slug}`),
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTranslations("nav");
  const locale = (await getLocale()) as Locale;
  const [jobsData, tags] = await Promise.all([
    serverListJobs({ tags: slug, page_size: 50 }),
    serverListTags(),
  ]);

  const tag = tags?.find((t) => t.slug === slug);
  const tagName = `#${tag?.name ?? slug}`;

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8">
      <JsonLd
        data={collectionJsonLd({
          name: tagName,
          path: `/tag/${slug}`,
          locale,
          jobs: jobsData?.items ?? [],
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: t("home"), path: "/" },
            { name: tagName, path: `/tag/${slug}` },
          ],
          locale,
        )}
      />
      <nav className="mb-4 text-body-sm text-secondary">
        <Link href="/" className="hover:text-primary">
          {t("home")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-on-surface">{tagName}</span>
      </nav>

      <h1 className="mb-2 font-display text-headline-lg">{tagName}</h1>
      <p className="mb-6 text-body-md text-secondary">
        {t("jobsCount", { count: jobsData?.total ?? 0 })}
      </p>

      {jobsData && jobsData.items.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobsData.items.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <p className="text-body-md text-secondary">{t("noJobsForTag")}</p>
      )}
    </div>
  );
}
