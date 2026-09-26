import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { JobDetail, JobListItem } from "@/types";
import { JsonLd } from "@/components/JsonLd";
import {
  breadcrumbJsonLd,
  collectionJsonLd,
  jobPostingJsonLd,
  websiteJsonLd,
} from "./structured-data";

beforeEach(() => {
  vi.stubEnv("SITE_URL", "https://example.test");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

function makeJob(overrides: Partial<JobDetail> = {}): JobDetail {
  return {
    id: 1,
    title: "React Developer",
    slug: "react-developer",
    company_name: "Acme",
    category: { id: 1, name: "Frontend", slug: "frontend" },
    job_type: "fulltime",
    location: "Việt Nam",
    timezone: null,
    salary_min: 1000,
    salary_max: 2000,
    currency: "USD",
    tags: ["react"],
    tag_slugs: ["react"],
    created_at: "2026-09-01T00:00:00Z",
    description: "Build things",
    requirements: "3 years",
    views: 10,
    expires_at: "2026-10-01T00:00:00Z",
    contacts: [],
    ...overrides,
  };
}

function makeListItem(overrides: Partial<JobListItem> = {}): JobListItem {
  return {
    id: 1,
    title: "React Developer",
    slug: "react-developer",
    company_name: "Acme",
    category: { id: 1, name: "Frontend", slug: "frontend" },
    job_type: "fulltime",
    location: "Việt Nam",
    timezone: null,
    salary_min: 1000,
    salary_max: 2000,
    currency: "USD",
    tags: ["react"],
    tag_slugs: ["react"],
    created_at: "2026-09-01T00:00:00Z",
    ...overrides,
  };
}

describe("websiteJsonLd", () => {
  it("describes the site with locale-aware absolute URL", () => {
    const ld = websiteJsonLd("vi");
    expect(ld["@type"]).toBe("WebSite");
    expect(ld.url).toBe("https://example.test/vi");
    expect(ld.inLanguage).toBe("vi");
  });

  it("uses the English locale when requested", () => {
    expect(websiteJsonLd("en").url).toBe("https://example.test/en");
  });
});

describe("jobPostingJsonLd", () => {
  it("includes required fields and a remote location type", () => {
    const ld = jobPostingJsonLd(makeJob(), "vi");
    expect(ld["@type"]).toBe("JobPosting");
    expect(ld.title).toBe("React Developer");
    expect(ld.description).toBe("Build things");
    expect(ld.datePosted).toBe("2026-09-01T00:00:00Z");
    expect(ld.validThrough).toBe("2026-10-01T00:00:00Z");
    expect(ld.jobLocationType).toBe("TELECOMMUTE");
    expect(ld.url).toBe("https://example.test/vi/jobs/react-developer-1");
    expect(ld.hiringOrganization).toEqual({
      "@type": "Organization",
      name: "Acme",
    });
  });

  it.each([
    ["fulltime", "FULL_TIME"],
    ["parttime", "PART_TIME"],
    ["contract", "CONTRACTOR"],
    ["freelance", "CONTRACTOR"],
  ] as const)("maps %s to %s", (jobType, expected) => {
    expect(jobPostingJsonLd(makeJob({ job_type: jobType }), "vi").employmentType).toBe(
      expected,
    );
  });

  it("omits validThrough when the job has no expiry", () => {
    const ld = jobPostingJsonLd(makeJob({ expires_at: null }), "vi");
    expect(ld.validThrough).toBeUndefined();
  });

  it("omits applicantLocationRequirements when location is unknown", () => {
    const ld = jobPostingJsonLd(makeJob({ location: null }), "vi");
    expect(ld.applicantLocationRequirements).toBeUndefined();
  });

  it("declares monthly base salary for full-time jobs", () => {
    const ld = jobPostingJsonLd(makeJob(), "vi");
    expect(ld.baseSalary).toEqual({
      "@type": "MonetaryAmount",
      currency: "USD",
      value: {
        "@type": "QuantitativeValue",
        minValue: 1000,
        maxValue: 2000,
        unitText: "MONTH",
      },
    });
  });

  it("omits base salary for contract and freelance jobs", () => {
    expect(jobPostingJsonLd(makeJob({ job_type: "contract" }), "vi").baseSalary).toBeUndefined();
    expect(jobPostingJsonLd(makeJob({ job_type: "freelance" }), "vi").baseSalary).toBeUndefined();
  });

  it("omits base salary when no amount or currency is provided", () => {
    const ld = jobPostingJsonLd(
      makeJob({ salary_min: null, salary_max: null, currency: null }),
      "vi",
    );
    expect(ld.baseSalary).toBeUndefined();
  });

  it("keeps a single bound when only one salary edge exists", () => {
    const ld = jobPostingJsonLd(makeJob({ salary_max: null }), "vi");
    expect(ld.baseSalary).toEqual({
      "@type": "MonetaryAmount",
      currency: "USD",
      value: {
        "@type": "QuantitativeValue",
        minValue: 1000,
        unitText: "MONTH",
      },
    });
  });
});

describe("collectionJsonLd", () => {
  it("lists jobs as a CollectionPage with an ordered ItemList", () => {
    const ld = collectionJsonLd({
      name: "Frontend",
      path: "/category/frontend",
      locale: "vi",
      jobs: [
        makeListItem({ id: 1, title: "React Developer", slug: "react-developer" }),
        makeListItem({ id: 2, title: "Vue Developer", slug: "vue-developer" }),
      ],
    });
    expect(ld["@type"]).toBe("CollectionPage");
    expect(ld.url).toBe("https://example.test/vi/category/frontend");
    expect(ld.inLanguage).toBe("vi");
    expect(ld.mainEntity).toEqual({
      "@type": "ItemList",
      numberOfItems: 2,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "React Developer",
          url: "https://example.test/vi/jobs/react-developer-1",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Vue Developer",
          url: "https://example.test/vi/jobs/vue-developer-2",
        },
      ],
    });
  });
});

describe("breadcrumbJsonLd", () => {
  it("builds ordered breadcrumb items with absolute URLs", () => {
    const ld = breadcrumbJsonLd(
      [
        { name: "Home", path: "/" },
        { name: "Jobs", path: "/jobs" },
        { name: "React Developer", path: "/jobs/react-developer-1" },
      ],
      "en",
    );
    expect(ld["@type"]).toBe("BreadcrumbList");
    expect(ld.itemListElement).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://example.test/en",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Jobs",
        item: "https://example.test/en/jobs",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "React Developer",
        item: "https://example.test/en/jobs/react-developer-1",
      },
    ]);
  });
});

describe("JsonLd", () => {
  it("escapes angle brackets to prevent XSS", () => {
    const html = renderToStaticMarkup(
      JsonLd({ data: { name: "<script>alert(1)</script>" } }),
    );
    expect(html).toContain('type="application/ld+json"');
    expect(html).toContain("\\u003c");
    expect(html).not.toContain("<script>alert(1)</script>");
  });
});
