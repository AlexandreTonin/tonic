const SUFFIX = 'Tonic';
const DEFAULT_TITLE = document.title;
const DEFAULT_DESCRIPTION =
  document.querySelector('meta[name="description"]')?.getAttribute('content') ??
  '';
const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(
  /\/+$/,
  '',
);

function headTag(selector: string, create: () => HTMLElement) {
  const found = document.head.querySelector<HTMLElement>(selector);
  if (found) return found;
  const tag = create();
  document.head.append(tag);
  return tag;
}

export function applyPageMeta({
  title,
  description,
  pathname,
}: {
  title?: string;
  description?: string;
  pathname: string;
}) {
  document.title = title ? `${title} · ${SUFFIX}` : DEFAULT_TITLE;
  headTag('meta[name="description"]', () => {
    const meta = document.createElement('meta');
    meta.name = 'description';
    return meta;
  }).setAttribute('content', description ?? DEFAULT_DESCRIPTION);
  if (!SITE_URL) return;
  headTag('link[rel="canonical"]', () => {
    const link = document.createElement('link');
    link.rel = 'canonical';
    return link;
  }).setAttribute('href', `${SITE_URL}${pathname}`);
}
