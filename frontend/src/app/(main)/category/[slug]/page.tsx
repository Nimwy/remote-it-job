import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { JobCard } from "@/components/JobCard";
import { serverListCategories, serverListJobs } from "@/services/jobs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categories = await serverListCategories();
  const category = categories?.find((c) => c.slug === slug);
  return {
    title: category ? `Việc làm ${category.name} Remote | Remote IT` : "Việc làm Remote",
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTranslations("nav");
  const [jobsData, categories] = await Promise.all([
    serverListJobs({ category: slug, page_size: 50 }),
    serverListCategories(),
  ]);

  const category = categories?.find((c) => c.slug === slug);

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8">
      <nav className="mb-4 text-body-sm text-secondary">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-on-surface">{category?.name ?? slug}</span>
      </nav>

      <h1 className="mb-2 font-display text-headline-lg">
        {category?.name ?? slug} · {t("findJobs")}
      </h1>
      <p className="mb-6 text-body-md text-secondary">
        {jobsData?.total ?? 0} {category?.name ?? ""}
      </p>

      {jobsData && jobsData.items.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobsData.items.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <p className="text-body-md text-secondary">No jobs in this category.</p>
      )}
    </div>
  );
}
