const PNG_SCALE = 2;
const PADDING = 32;
const HEADER = 64;
const FOOTER = 28;

const appUrl = () => window.location.host;
const GAP = 24;
const CAPTION = 24;

export type ExportCaption = { title: string; details: string };

export type ExportAppendix = { heading: string; lines: string[] }[];

export type ExportLayout = {
  columns: number;
  itemScale: number;
  printMaxWidth: string;
};

export const FRETBOARD_LAYOUT: ExportLayout = {
  columns: 1,
  itemScale: 1,
  printMaxWidth: '100%',
};

type Shot = {
  clone: SVGSVGElement;
  width: number;
  height: number;
  caption?: string;
};

function withLightTheme<T>(run: () => T) {
  const root = document.documentElement;
  const dark = root.classList.contains('dark');
  if (dark) root.classList.replace('dark', 'light');
  try {
    return run();
  } finally {
    if (dark) root.classList.replace('light', 'dark');
  }
}

function snapshot(svg: SVGSVGElement, caption?: string): Shot {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const originals = [svg, ...svg.querySelectorAll('*')];
  const copies = [clone, ...clone.querySelectorAll('*')];
  originals.forEach((original, i) => {
    const style = getComputedStyle(original);
    for (const attribute of ['fill', 'stroke'] as const) {
      if (copies[i].getAttribute(attribute)?.includes('var(')) {
        copies[i].setAttribute(attribute, style[attribute]);
      }
    }
  });
  clone.querySelectorAll('[class*="animate-"]').forEach((e) => e.remove());
  clone.removeAttribute('style');
  clone.removeAttribute('class');
  clone.style.fontFamily = getComputedStyle(document.body).fontFamily;
  const { width, height } = svg.viewBox.baseVal;
  return { clone, width, height, caption };
}

function capture(container: HTMLElement) {
  return withLightTheme(() => {
    const items = container.querySelectorAll<HTMLElement>('[data-export-item]');
    const shots = items.length
      ? [...items].flatMap((item) => {
          const svg = item.querySelector('svg');
          return svg ? [snapshot(svg, item.dataset.caption)] : [];
        })
      : [...container.querySelectorAll('svg')]
          .slice(0, 1)
          .map((svg) => snapshot(svg));
    const body = getComputedStyle(document.body);
    return {
      shots,
      font: body.fontFamily,
      background: body.backgroundColor,
      foreground: body.color,
      muted: getComputedStyle(document.documentElement)
        .getPropertyValue('--muted-foreground')
        .trim(),
    };
  });
}

const serialize = (svg: SVGSVGElement) =>
  new XMLSerializer().serializeToString(svg);

const escapeHtml = (text: string) =>
  text.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

export function printSvgs(
  container: HTMLElement,
  { title, details }: ExportCaption,
  layout: ExportLayout,
  appendix: ExportAppendix = [],
) {
  const page = capture(container);
  if (!page.shots.length) return;
  const figures = page.shots
    .map((shot) => {
      shot.clone.setAttribute('width', '100%');
      shot.clone.removeAttribute('height');
      const caption = shot.caption
        ? `<figcaption>${escapeHtml(shot.caption)}</figcaption>`
        : '';
      return `<figure>${serialize(shot.clone)}${caption}</figure>`;
    })
    .join('');
  const notes = appendix
    .map(
      ({ heading, lines }) =>
        `<section><h2>${escapeHtml(heading)}</h2>${lines.map((line) => `<p>${escapeHtml(line)}</p>`).join('')}</section>`,
    )
    .join('');

  const frame = document.createElement('iframe');
  frame.style.position = 'fixed';
  frame.style.width = '0';
  frame.style.height = '0';
  frame.style.border = '0';
  document.body.append(frame);
  const doc = frame.contentDocument;
  const view = frame.contentWindow;
  if (!doc || !view) return frame.remove();
  doc.open();
  doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>
@page { size: A4 portrait; margin: 12mm; }
body { margin: 0; font-family: ${page.font}; color: ${page.foreground}; background: ${page.background}; font-variant-numeric: tabular-nums; }
h1 { font-size: 20px; font-weight: 600; margin: 0 0 4px; }
p { font-size: 14px; color: ${page.muted}; margin: 0 0 16px; }
main { display: grid; grid-template-columns: repeat(${Math.min(layout.columns, page.shots.length)}, minmax(0, 1fr)); gap: 8mm; max-width: ${layout.printMaxWidth}; }
figure { margin: 0; text-align: center; break-inside: avoid; }
figcaption { font-size: 13px; color: ${page.muted}; margin-top: 4px; }
section { break-inside: avoid; margin-top: 8mm; }
section h2 { font-size: 15px; font-weight: 600; margin: 0 0 4px; }
section p { color: ${page.foreground}; margin: 0 0 4px; }
footer { position: fixed; bottom: 0; left: 0; font-size: 11px; color: ${page.muted}; }
</style></head><body><h1>${escapeHtml(title)}</h1><p>${escapeHtml(details)}</p><main>${figures}</main>${notes}<footer>${escapeHtml(appUrl())}</footer></body></html>`);
  doc.close();
  view.addEventListener('afterprint', () => frame.remove(), { once: true });
  view.focus();
  view.print();
}

const loadImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });

async function toImage(shot: Shot) {
  shot.clone.setAttribute('width', String(shot.width));
  shot.clone.setAttribute('height', String(shot.height));
  const url = URL.createObjectURL(
    new Blob([serialize(shot.clone)], { type: 'image/svg+xml' }),
  );
  try {
    return await loadImage(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function downloadSvgsPng(
  container: HTMLElement,
  { title, details, filename }: ExportCaption & { filename: string },
  layout: ExportLayout,
) {
  const page = capture(container);
  if (!page.shots.length) return;
  const images = await Promise.all(page.shots.map(toImage));

  const columns = Math.min(layout.columns, page.shots.length);
  const rows = Math.ceil(page.shots.length / columns);
  const hasCaptions = page.shots.some((s) => s.caption);
  const cellWidth =
    Math.max(...page.shots.map((s) => s.width)) * layout.itemScale;
  const cellHeight =
    Math.max(...page.shots.map((s) => s.height)) * layout.itemScale +
    (hasCaptions ? CAPTION : 0);

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return;
  const titleFont = `600 20px ${page.font}`;
  const detailsFont = `14px ${page.font}`;
  context.font = titleFont;
  const titleWidth = context.measureText(title).width;
  context.font = detailsFont;
  const detailsWidth = context.measureText(details).width;
  const gridWidth = columns * cellWidth + (columns - 1) * GAP;
  const width = Math.max(gridWidth, titleWidth, detailsWidth) + 2 * PADDING;
  const height =
    HEADER + rows * cellHeight + (rows - 1) * GAP + FOOTER + PADDING;

  canvas.width = width * PNG_SCALE;
  canvas.height = height * PNG_SCALE;
  context.scale(PNG_SCALE, PNG_SCALE);
  context.fillStyle = page.background;
  context.fillRect(0, 0, width, height);
  context.fillStyle = page.foreground;
  context.font = titleFont;
  context.fillText(title, PADDING, PADDING + 4);
  context.fillStyle = page.muted;
  context.font = detailsFont;
  context.fillText(details, PADDING, PADDING + 28);

  context.font = `13px ${page.font}`;
  context.textAlign = 'center';
  page.shots.forEach((shot, i) => {
    const x = PADDING + (i % columns) * (cellWidth + GAP);
    const y = HEADER + Math.floor(i / columns) * (cellHeight + GAP);
    const w = shot.width * layout.itemScale;
    const h = shot.height * layout.itemScale;
    context.drawImage(images[i], x + (cellWidth - w) / 2, y, w, h);
    if (shot.caption) {
      context.fillText(shot.caption, x + cellWidth / 2, y + h + 18);
    }
  });

  context.textAlign = 'left';
  context.font = `12px ${page.font}`;
  context.fillText(appUrl(), PADDING, height - PADDING / 2);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png'),
  );
  if (!blob) return;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.png`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export const fileSlug = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/#/g, '-sharp')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
