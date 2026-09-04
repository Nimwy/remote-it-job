"use client";

import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { listCategories, listTags } from "../services/jobs";
import type { HrJob } from "../types";
import { Button } from "./ui/Button";
import { Input, inputClass } from "./ui/Input";

export type JobFormData = {
  title: string;
  category_id: number;
  job_type: "fulltime" | "parttime" | "freelance" | "contract";
  location?: string;
  timezone?: string;
  salary_min?: number | null;
  salary_max?: number | null;
  currency?: string;
  description: string;
  requirements: string;
  tag_ids: number[];
};

interface JobFormProps {
  initialValues?: HrJob;
  onSubmit: (data: JobFormData, dirtyFields: string[]) => Promise<void>;
  submitLabel: string;
}


export function JobForm({ initialValues, onSubmit, submitLabel }: JobFormProps) {
  const t = useTranslations("jobForm");
  const jt = useTranslations("jobType");
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const { data: tags } = useQuery({ queryKey: ["tags"], queryFn: listTags });

  const schema = useMemo(
    () =>
      z.object({
        title: z.string().min(1, "Required"),
        category_id: z.number().min(1, "Required"),
        job_type: z.enum(["fulltime", "parttime", "freelance", "contract"]),
        location: z.string().optional(),
        timezone: z.string().optional(),
        salary_min: z.number().nullable().optional(),
        salary_max: z.number().nullable().optional(),
        currency: z.string().optional(),
        description: z.string().min(1, "Required"),
        requirements: z.string().min(1, "Required"),
        tag_ids: z.array(z.number()),
      }),
    [],
  );

  const defaultTags = initialValues
    ? (tags ?? []).filter((tg) => initialValues.tags.includes(tg.name)).map((tg) => tg.id)
    : [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<JobFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialValues
      ? {
          title: initialValues.title,
          category_id: initialValues.category.id,
          job_type: initialValues.job_type,
          location: initialValues.location ?? "",
          timezone: initialValues.timezone ?? "",
          salary_min: initialValues.salary_min ?? null,
          salary_max: initialValues.salary_max ?? null,
          currency: initialValues.currency ?? "",
          description: initialValues.description,
          requirements: initialValues.requirements,
          tag_ids: defaultTags,
        }
      : {
          job_type: "fulltime",
          tag_ids: [],
        },
  });

  // F-01: Khi query tags chạy xong nhưng JobForm đã mount trước đó,
  // useForm chỉ đọc defaultValues ở lần render đầu nên tag_ids = [].
  // Cần đồng bộ lại tag_ids từ initialValues một lần khi tags có dữ liệu.
  const didInitTagsRef = useRef(false);
  useEffect(() => {
    if (tags && initialValues && !didInitTagsRef.current) {
      didInitTagsRef.current = true;
      setValue(
        "tag_ids",
        tags.filter((tg) => initialValues.tags.includes(tg.name)).map((tg) => tg.id),
      );
    }
  }, [tags, initialValues, setValue]);

  const selectedTags = watch("tag_ids") ?? [];

  const toggleTag = (id: number) => {
    if (selectedTags.includes(id)) {
      setValue("tag_ids", selectedTags.filter((tg) => tg !== id));
    } else {
      setValue("tag_ids", [...selectedTags, id]);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        const dirty = Object.keys(dirtyFields);
        await onSubmit(data, dirty);
      })}
      className="space-y-6"
    >
      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
        <h2 className="mb-4 font-display text-headline-sm">{t("basicInfo")}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-label-sm text-secondary">{t("title")} *</label>
            <Input {...register("title")} />
            {errors.title && <p className="mt-1 text-body-sm text-error">{errors.title.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-label-sm text-secondary">{t("category")} *</label>
            <select {...register("category_id", { valueAsNumber: true })} className={inputClass}>
              <option value={0}>{t("chooseCategory")}</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="mt-1 text-body-sm text-error">{errors.category_id.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-label-sm text-secondary">{t("jobType")} *</label>
            <select {...register("job_type")} className={inputClass}>
              <option value="fulltime">{jt("fulltime")}</option>
              <option value="parttime">{jt("parttime")}</option>
              <option value="freelance">{jt("freelance")}</option>
              <option value="contract">{jt("contract")}</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-label-sm text-secondary">{t("location")}</label>
            <Input {...register("location")} />
          </div>
          <div>
            <label className="mb-1 block text-label-sm text-secondary">{t("timezone")}</label>
            <Input {...register("timezone")} placeholder="UTC+7" />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
        <h2 className="mb-4 font-display text-headline-sm">{t("salary")}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-label-sm text-secondary">{t("salaryFrom")}</label>
            <Input
              type="number"
              {...register("salary_min", { setValueAs: (v) => (v === "" ? null : Number(v)) })}
            />
          </div>
          <div>
            <label className="mb-1 block text-label-sm text-secondary">{t("salaryTo")}</label>
            <Input
              type="number"
              {...register("salary_max", { setValueAs: (v) => (v === "" ? null : Number(v)) })}
            />
          </div>
          <div>
            <label className="mb-1 block text-label-sm text-secondary">{t("currency")}</label>
            <select {...register("currency")} className={inputClass}>
              <option value="USD">USD</option>
              <option value="VND">VND</option>
              <option value="EUR">EUR</option>
              <option value="SGD">SGD</option>
              <option value="JPY">JPY</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
        <h2 className="mb-4 font-display text-headline-sm">{t("details")}</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-label-sm text-secondary">{t("description")} *</label>
            <textarea rows={5} {...register("description")} className={inputClass} />
            {errors.description && (
              <p className="mt-1 text-body-sm text-error">{errors.description.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-label-sm text-secondary">{t("requirements")} *</label>
            <textarea rows={5} {...register("requirements")} className={inputClass} />
            {errors.requirements && (
              <p className="mt-1 text-body-sm text-error">{errors.requirements.message}</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
        <h2 className="mb-4 font-display text-headline-sm">{t("skills")}</h2>
        <div className="flex flex-wrap gap-2">
          {tags?.map((tag) => (
            <button
              type="button"
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`rounded-full px-3 py-1.5 text-body-sm transition-colors ${
                selectedTags.includes(tag.id)
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-high text-secondary hover:bg-surface-container"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
