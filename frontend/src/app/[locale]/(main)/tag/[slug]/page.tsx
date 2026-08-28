import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { JobCard } from "@/components/JobCard";
import { serverListJobs, serverListTags } from "@/services/jobs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tags = await serverListTags();
  const tag = tags?.find((t) => t.slug === slug);
  return {
    title: `${tag?.name ?? slug} Remote | Remote IT`,
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTranslations("nav");
  const [jobsData, tags] = await Promise.all([
    serverListJobs({ tags: slug, page_size: 50 }),
    serverListTags(),
  ]);

  const tag = tags?.find((t) => t.slug === slug);

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8">
      <nav className="mb-4 text-body-sm text-secondary">
        <Link href="/" className="hover:text-primary">
          {t("home")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-on-surface">#{tag?.name ?? slug}</span>
      </nav>

      <h1 className="mb-2 font-display text-headline-lg">#{tag?.name ?? slug}</h1>
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
