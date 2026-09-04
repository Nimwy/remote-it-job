"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  useAdminCategories,
  useAdminTags,
  useCreateCategory,
  useCreateTag,
  useDeactivateCategory,
  useDeactivateTag,
} from "@/hooks/useAdmin";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function AdminCatalog() {
  const t = useTranslations("admin");
  const { data: categories } = useAdminCategories();
  const { data: tags } = useAdminTags();
  const createCategory = useCreateCategory();
  const createTag = useCreateTag();
  const deactivateCategory = useDeactivateCategory();
  const deactivateTag = useDeactivateTag();

  const [categoryName, setCategoryName] = useState("");
  const [tagName, setTagName] = useState("");

  return (
    <div>
      <h1 className="mb-6 font-display text-headline-lg">{t("catalogTitle")}</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 font-display text-headline-md">{t("categories")}</h2>
          <div className="mb-4 flex gap-2">
            <Input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder={t("newCategory")}
            />
            <Button
              onClick={() => {
                if (categoryName.trim()) {
                  createCategory.mutate({ name: categoryName.trim() });
                  setCategoryName("");
                }
              }}
            >
              {t("add")}
            </Button>
          </div>
          <div className="space-y-2">
            {categories?.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5"
              >
                <div>
                  <span className="font-medium">{c.name}</span>
                  <span className="ml-2 text-body-sm text-secondary">/{c.slug}</span>
                  {!c.is_active && <span className="ml-2 text-body-sm text-error">({t("hidden")})</span>}
                </div>
                {c.is_active && (
                  <Button variant="ghost" onClick={() => deactivateCategory.mutate(c.id)}>
                    {t("hide")}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-headline-md">{t("tags")}</h2>
          <div className="mb-4 flex gap-2">
            <input
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder={t("newTag")}
            />
            <Button
              onClick={() => {
                if (tagName.trim()) {
                  createTag.mutate({ name: tagName.trim() });
                  setTagName("");
                }
              }}
            >
              {t("add")}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags?.map((tg) => (
              <span
                key={tg.id}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-body-sm ${
                  tg.is_active
                    ? "border-outline-variant bg-surface-container-lowest"
                    : "border-outline-variant bg-surface-container-high text-secondary line-through"
                }`}
              >
                {tg.name}
                {tg.is_active && (
                  <button
                    onClick={() => deactivateTag.mutate(tg.id)}
                    className="text-secondary hover:text-error"
                    title={t("hide")}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
