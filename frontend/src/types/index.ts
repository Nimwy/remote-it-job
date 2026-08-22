export interface User {
  id: number;
  role: "hr" | "admin";
  name: string;
  email: string;
  company_name: string | null;
  avatar: string | null;
  status: "pending" | "active" | "blocked";
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  is_active?: boolean;
}

export interface Contact {
  channel: "zalo" | "telegram" | "linkedin" | "phone" | "email";
  value: string;
}

export interface JobListItem {
  id: number;
  title: string;
  slug: string;
  company_name: string;
  category: Category;
  job_type: "fulltime" | "parttime" | "freelance" | "contract";
  location: string | null;
  timezone: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  tags: string[];
  tag_slugs: string[];
  created_at: string;
}

export interface JobDetail extends JobListItem {
  description: string;
  requirements: string;
  views: number;
  expires_at: string | null;
  contacts: Contact[];
}

export interface HrJob {
  id: number;
  title: string;
  slug: string;
  category: Category;
  job_type: "fulltime" | "parttime" | "freelance" | "contract";
  location: string | null;
  timezone: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  description: string;
  requirements: string;
  status: "draft" | "pending" | "approved" | "rejected" | "closed" | "hidden" | "expired";
  rejection_reason: string | null;
  views: number;
  expires_at: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface AdminJob extends HrJob {
  company_name: string;
  hr_id: number;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  company_name: string | null;
  status: "pending" | "active" | "blocked";
  created_at: string;
  job_count: number;
}

export interface HrProfile {
  id: number;
  name: string;
  email: string;
  company_name: string | null;
  avatar: string | null;
  status: string;
  contacts: Contact[];
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export const JOB_TYPE_LABELS: Record<string, string> = {
  fulltime: "Toàn thời gian",
  parttime: "Bán thời gian",
  freelance: "Freelance",
  contract: "Hợp đồng",
};

export const JOB_STATUS_LABELS: Record<string, string> = {
  draft: "Nháp",
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
  closed: "Đã đóng",
  hidden: "Đã ẩn",
  expired: "Hết hạn",
};

export const CONTACT_LABELS: Record<string, string> = {
  zalo: "Zalo",
  telegram: "Telegram",
  linkedin: "LinkedIn",
  phone: "Điện thoại",
  email: "Email",
};
