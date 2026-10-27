// Packs the Vite build (dist/) into one self-contained page for hosting as a
// claude.ai artifact: CSS and JS are inlined, and the document wrapper tags are
// stripped because the host adds its own <html>/<head>/<body> skeleton.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const html = readFileSync(join(dist, 'index.html'), 'utf8');

const asset = (href) => readFileSync(join(dist, href.replace(/^\//, '')), 'utf8');

const cssHref = html.match(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/)?.[1];
const jsSrc = html.match(/<script type="module"[^>]*src="(\/assets\/[^"]+\.js)"[^>]*><\/script>/)?.[1];
if (!cssHref || !jsSrc) throw new Error('Could not find the built CSS/JS in dist/index.html');

const js = asset(jsSrc).replace(/<\/script/gi, '<\\/script');
const title = html.match(/<title>.*?<\/title>/)[0];
const fonts = html.match(/<link\s+href="https:\/\/fonts\.googleapis\.com[^>]*>/)?.[0] ?? '';

const page = `${title}
<meta name="description" content="Illuminatix presents The Icebreaker — Spin. Play. Connect." />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
${fonts}
<style>
${asset(cssHref)}
</style>
<div id="root"></div>
<script type="module">
${js}
</script>
`;

const outDir = join(root, 'dist-single');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'akruti.html'), page);
console.log(`Wrote dist-single/akruti.html (${(page.length / 1024).toFixed(1)} KB)`);
