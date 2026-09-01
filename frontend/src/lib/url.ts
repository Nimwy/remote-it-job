export function jobUrl(slug: string, id: number): string {
  return `/jobs/${slug}-${id}`;
}

export function parseJobId(slugId: string): number {
  const match = slugId.match(/-(\d+)$/);
  return match ? Number(match[1]) : Number(slugId);
}
