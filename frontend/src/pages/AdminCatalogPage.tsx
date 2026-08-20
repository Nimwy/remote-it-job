import { useState } from 'react'
import {
  useAdminCategories,
  useAdminTags,
  useCreateCategory,
  useCreateTag,
  useDeactivateCategory,
  useDeactivateTag,
} from '../hooks/useAdmin'
import { Button } from '../components/ui/Button'

const inputClass =
  'w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-body-md focus:border-primary focus:outline-none'

export function AdminCatalogPage() {
  const { data: categories } = useAdminCategories()
  const { data: tags } = useAdminTags()
  const createCategory = useCreateCategory()
  const createTag = useCreateTag()
  const deactivateCategory = useDeactivateCategory()
  const deactivateTag = useDeactivateTag()

  const [categoryName, setCategoryName] = useState('')
  const [tagName, setTagName] = useState('')

  return (
    <div className="mx-auto max-w-container px-6 py-8">
      <h1 className="mb-6 font-display text-headline-lg">Quản lý catalog</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 font-display text-headline-md">Categories</h2>
          <div className="mb-4 flex gap-2">
            <input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Tên category mới..."
              className={inputClass}
            />
            <Button
              onClick={() => {
                if (categoryName.trim()) {
                  createCategory.mutate({ name: categoryName.trim() })
                  setCategoryName('')
                }
              }}
            >
              Thêm
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
                  {!c.is_active && (
                    <span className="ml-2 text-body-sm text-error">(đã ẩn)</span>
                  )}
                </div>
                {c.is_active && (
                  <Button variant="ghost" onClick={() => deactivateCategory.mutate(c.id)}>
                    Ẩn
                  </Button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-headline-md">Tags</h2>
          <div className="mb-4 flex gap-2">
            <input
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="Tên tag mới..."
              className={inputClass}
            />
            <Button
              onClick={() => {
                if (tagName.trim()) {
                  createTag.mutate({ name: tagName.trim() })
                  setTagName('')
                }
              }}
            >
              Thêm
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags?.map((t) => (
              <span
                key={t.id}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-body-sm ${
                  t.is_active
                    ? 'border-outline-variant bg-surface-container-lowest'
                    : 'border-outline-variant bg-surface-container-high text-secondary line-through'
                }`}
              >
                {t.name}
                {t.is_active && (
                  <button
                    onClick={() => deactivateTag.mutate(t.id)}
                    className="text-secondary hover:text-error"
                    title="Ẩn tag"
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
  )
}
