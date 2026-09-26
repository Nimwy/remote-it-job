import type {
  BreadcrumbList,
  CollectionPage,
  ItemList,
  JobPosting,
  WebSite,
  WithContext,
} from "schema-dts";
import type { JobDetail, JobListItem } from "@/types";
import type { Locale } from "@/i18n/routing";
import { absUrl } from "@/lib/site";

export const SITE_NAME = "Remote IT";

export function websiteJsonLd(locale: Locale): WithContext<WebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absUrl(locale, "/"),
    inLanguage: locale,
  };
}

const EMPLOYMENT_TYPE: Record<JobDetail["job_type"], string> = {
  fulltime: "FULL_TIME",
  parttime: "PART_TIME",
  contract: "CONTRACTOR",
  freelance: "CONTRACTOR",
};

export function jobPostingJsonLd(
  job: JobDetail,
  locale: Locale,
): WithContext<JobPosting> {
  const posting: WithContext<JobPosting> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.created_at,
    employmentType: EMPLOYMENT_TYPE[job.job_type],
    hiringOrganization: {
      "@type": "Organization",
      name: job.company_name,
    },
    jobLocationType: "TELECOMMUTE",
    identifier: {
      "@type": "PropertyValue",
      name: SITE_NAME,
      value: String(job.id),
    },
    url: absUrl(locale, `/jobs/${job.slug}-${job.id}`),
  };

  if (job.expires_at) {
    posting.validThrough = job.expires_at;
  }

  if (job.location) {
    posting.applicantLocationRequirements = {
      "@type": "Country",
      name: job.location,
    };
  }

  const hasSalary = job.salary_min !== null || job.salary_max !== null;
  if (
    (job.job_type === "fulltime" || job.job_type === "parttime") &&
    job.currency &&
    hasSalary
  ) {
    posting.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.currency,
      value: {
        "@type": "QuantitativeValue",
        ...(job.salary_min !== null ? { minValue: job.salary_min } : {}),
        ...(job.salary_max !== null ? { maxValue: job.salary_max } : {}),
        unitText: "MONTH",
      },
    };
  }

  return posting;
}

export function collectionJsonLd({
  name,
  path,
  locale,
  jobs,
}: {
  name: string;
  path: string;
  locale: Locale;
  jobs: JobListItem[];
}): WithContext<CollectionPage> {
  const itemList: ItemList = {
    "@type": "ItemList",
    numberOfItems: jobs.length,
    itemListElement: jobs.map((job, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: job.title,
      url: absUrl(locale, `/jobs/${job.slug}-${job.id}`),
    })),
  };

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url: absUrl(locale, path),
    inLanguage: locale,
    mainEntity: itemList,
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
  locale: Locale,
): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absUrl(locale, item.path),
    })),
  };
}
