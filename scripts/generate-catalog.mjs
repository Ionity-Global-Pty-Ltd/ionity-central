import { execFileSync } from 'node:child_process'
import { statSync, writeFileSync } from 'node:fs'
import { extname } from 'node:path'

const repo = 'Ionity-Global-Pty-Ltd/ionity-assets'
const branch = 'main'
const excluded = new Set([
  '.nojekyll',
  '.gitattributes',
  'LICENSE',
  'README.md',
  'assets.json',
  'assets.schema.json',
  'index.html',
  'llms.txt',
  'robots.txt',
  'sitemap.xml',
  'styles.css',
  'app.js',
  'scripts/generate-catalog.mjs',
])

const categories = {
  image: new Set(['.gif', '.ico', '.jpeg', '.jpg', '.png', '.svg', '.webp']),
  video: new Set(['.mp4', '.mov', '.webm']),
  audio: new Set(['.mp3', '.wav', '.ogg', '.m4a']),
  document: new Set(['.pdf', '.doc', '.docx']),
  metadata: new Set(['.json', '.yml', '.yaml', '.txt', '.b64']),
  code: new Set(['.css', '.html', '.js', '.ps1', '.ts']),
  archive: new Set(['.zip', '.tar', '.gz']),
}

function categoryFor(path) {
  const extension = extname(path).toLowerCase()
  return Object.entries(categories).find(([, extensions]) => extensions.has(extension))?.[0] ?? 'other'
}

function encodePath(path) {
  return path.split('/').map(encodeURIComponent).join('/')
}

const paths = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((path) => !excluded.has(path))

const assets = paths.map((path) => {
  const encodedPath = encodePath(path)
  const extension = extname(path).slice(1).toLowerCase() || 'file'
  const name = path.split('/').at(-1)

  return {
    id: path.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name,
    path,
    category: categoryFor(path),
    format: extension,
    bytes: statSync(path).size,
    raw_url: `https://raw.githubusercontent.com/${repo}/${branch}/${encodedPath}`,
    github_url: `https://github.com/${repo}/blob/${branch}/${encodedPath}`,
  }
})

const counts = Object.fromEntries(
  [...new Set(assets.map(({ category }) => category))]
    .sort()
    .map((category) => [category, assets.filter((asset) => asset.category === category).length]),
)

const catalog = {
  schema: 'https://ionity-global-pty-ltd.github.io/ionity-assets/assets.schema.json',
  name: 'Ionity Assets',
  description: 'Official public digital asset catalog for Ionity Global (Pty) Ltd.',
  repository: `https://github.com/${repo}`,
  homepage: `https://ionity-global-pty-ltd.github.io/ionity-assets/`,
  generated_at: new Date().toISOString(),
  asset_count: assets.length,
  counts,
  assets,
}

writeFileSync('assets.json', `${JSON.stringify(catalog, null, 2)}\n`)
console.log(`Generated assets.json with ${assets.length} assets.`)