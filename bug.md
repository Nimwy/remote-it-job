## Error Type
Runtime TypeError

## Error Message
Cannot read properties of undefined (reading '0')


    at eval (src/app/(main)/jobs/[slugId]/page.tsx:111:48)
    at Array.map (<anonymous>:1:18)
    at JobDetailPage (src/app/(main)/jobs/[slugId]/page.tsx:108:27)

## Code Frame
  109 |                   <Link
  110 |                     key={tag}
> 111 |                     href={`/tag/${job.tag_slugs[i] ?? tag}`}
      |                                                ^
  112 |                     className="rounded-full bg-surface-container-high px-3 py-1 font-mono text-body-sm text-secondary transition-colors hover:bg-primary hover:text-on-primary"
  113 |                   >
  114 |                     {tag}

Next.js version: 16.3.2 (Turbopack)
