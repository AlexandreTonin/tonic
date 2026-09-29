import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv, type Plugin } from "vite"
import { NAV } from "./src/components/layout/nav"
import { EXERCISES } from "./src/lib/technique/catalog"
import {
  findAllChords,
  findAllIntervals,
  findAllProgressions,
  findAllRhythms,
  findAllScales,
} from "./src/lib/theory/catalog"

const DETAILS = {
  scales: findAllScales(),
  chords: findAllChords(),
  arpeggios: findAllChords(),
  intervals: findAllIntervals(),
  progressions: findAllProgressions(),
  rhythm: findAllRhythms(),
  technique: EXERCISES,
}

function seo(siteUrl: string | undefined): Plugin {
  const site = siteUrl?.replace(/\/+$/, "")
  const paths = [
    "/",
    ...NAV.flatMap((group) => group.items.map((i) => i.to)),
    ...Object.entries(DETAILS).flatMap(([section, items]) =>
      items.map((i) => `/${section}/${i.id}`),
    ),
  ]

  return {
    name: "tonic-seo",
    transformIndexHtml(html) {
      if (!site) return html
      return html
        .replace('content="/og-image.png"', `content="${site}/og-image.png"`)
        .replace(
          '<meta property="og:type"',
          `<meta property="og:url" content="${site}/" />\n    <meta property="og:type"`,
        )
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: `User-agent: *\nAllow: /\n${site ? `\nSitemap: ${site}/sitemap.xml\n` : ""}`,
      })
      if (!site) return
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths
          .map((p) => `  <url><loc>${site}${p}</loc></url>`)
          .join("\n")}\n</urlset>\n`,
      })
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    seo(loadEnv(mode, process.cwd()).VITE_SITE_URL),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}))
