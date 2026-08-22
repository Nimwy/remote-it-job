import type { Metadata } from "next";
import Link from "next/link";
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
    title: `Việc làm ${tag?.name ?? slug} Remote | Remote IT`,
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [jobsData, tags] = await Promise.all([
    serverListJobs({ tags: slug, page_size: 50 }),
    serverListTags(),
  ]);

  const tag = tags?.find((t) => t.slug === slug);

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8">
      <nav className="mb-4 text-body-sm text-secondary">
        <Link href="/" className="hover:text-primary">
          Trang chủ
        </Link>
        <span className="mx-2">/</span>
        <span className="text-on-surface">Tag {tag?.name ?? slug}</span>
      </nav>

      <h1 className="mb-2 font-display text-headline-lg">Việc làm {tag?.name ?? slug}</h1>
      <p className="mb-6 text-body-md text-secondary">
        {jobsData?.total ?? 0} việc làm liên quan đến {tag?.name ?? slug}
      </p>

      {jobsData && jobsData.items.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobsData.items.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <p className="text-body-md text-secondary">Chưa có tin tuyển dụng cho tag này.</p>
      )}
    </div>
  );
}
