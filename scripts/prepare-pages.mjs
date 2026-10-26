import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const dist = join(process.cwd(), 'dist')
const requestedUrl = process.argv[2]

if (!requestedUrl) {
  throw new Error('Pass the configured GitHub Pages base URL as the first argument.')
}

const parsedUrl = new URL(requestedUrl)
if (parsedUrl.protocol !== 'https:' || parsedUrl.search || parsedUrl.hash) {
  throw new Error('The GitHub Pages base URL must be an HTTPS URL without a query or fragment.')
}

parsedUrl.pathname = `${parsedUrl.pathname.replace(/\/+$/, '')}/`
const siteUrl = parsedUrl.href
const imageUrl = new URL('og-image.jpg', siteUrl).href
const sitemapUrl = new URL('sitemap.xml', siteUrl).href
const escapeMarkup = (value) =>
  value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')
const htmlPath = join(dist, 'index.html')
let html = await readFile(htmlPath, 'utf8')

const canonical = `<link rel="canonical" href="${escapeMarkup(siteUrl)}" />`
if (/<link rel="canonical" href="[^"]*"\s*\/?>/.test(html)) {
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, canonical)
} else {
  html = html.replace('</title>', `</title>\n    ${canonical}`)
}

const setMetaContent = (attribute, value, content) => {
  const expression = new RegExp(`<meta ${attribute}="${value}" content="[^"]+" \\/>`)
  if (!expression.test(html)) {
    throw new Error(`Could not find metadata tag for ${attribute}="${value}".`)
  }
  html = html.replace(expression, `<meta ${attribute}="${value}" content="${content}" />`)
}

setMetaContent('property', 'og:url', escapeMarkup(siteUrl))
setMetaContent('property', 'og:image', escapeMarkup(imageUrl))
setMetaContent('name', 'twitter:image', escapeMarkup(imageUrl))

const jsonLd = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/)
if (!jsonLd) {
  throw new Error('Could not find the structured data script in dist/index.html.')
}
const structuredData = JSON.parse(jsonLd[1])
structuredData.url = siteUrl
structuredData.image = imageUrl
html = html.replace(jsonLd[0], `<script type="application/ld+json">\n      ${JSON.stringify(structuredData, null, 2)}\n    </script>`)

await writeFile(htmlPath, html)
await writeFile(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl.replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`,
)
await writeFile(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`)

console.log(`Generated canonical URL, social metadata, sitemap, and robots.txt for ${siteUrl}`)
