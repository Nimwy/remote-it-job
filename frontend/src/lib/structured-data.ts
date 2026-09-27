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

// Google yêu cầu description dạng HTML (tối thiểu có ngắt đoạn). Escape ký tự HTML
// của người dùng rồi biến newline thành <br> — chỉ <br> do ta tạo mới là thẻ thật.
function toHtmlParagraphs(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}

// Khi HR không đặt hạn, dùng validThrough = created_at + 60 ngày (Google khuyến nghị).
const DEFAULT_VALIDITY_DAYS = 60;

function addDays(iso: string, days: number): string {
  const date = new Date(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

export function jobPostingJsonLd(
  job: JobDetail,
  locale: Locale,
): WithContext<JobPosting> {
  const posting: WithContext<JobPosting> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: `${toHtmlParagraphs(job.description)}<br><br>${toHtmlParagraphs(job.requirements)}`,
    datePosted: job.created_at,
    validThrough: job.expires_at ?? addDays(job.created_at, DEFAULT_VALIDITY_DAYS),
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
