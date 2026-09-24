// Renders every asset in platforms.config.mjs to dist/.
//
//   npm run build     → dist/ (committed)
//   npm run preview   → .preview/ with safe-area guides + circle-cropped avatars
//
// Filter by id substring: npm run build -- youtube

import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brand } from '../brand.config.mjs';
import { avatars, banners, logos } from '../platforms.config.mjs';
import { toPng, outline } from './lib/render.mjs';
import { avatarSvg, avatarCircleSvg, avatarVariants, bannerSvg } from './lib/templates.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const preview = args.includes('--preview');
const filter = args.find((a) => !a.startsWith('--'));
const out = join(root, preview ? '.preview' : 'dist');
const wanted = (id) => !filter || id.includes(filter);

let count = 0;
function write(rel, data) {
  const file = join(out, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, data);
  count++;
}

if (!filter) rmSync(out, { recursive: true, force: true });

if (preview) {
  for (const v of avatarVariants) write(`avatar-${v}-circle.png`, toPng(avatarCircleSvg(v), 512));
  for (const b of banners.filter((b) => wanted(b.id)))
    write(`banner-${b.id}.png`, toPng(bannerSvg(b, { guides: true })));
} else {
  // Avatar variants side by side, so one can be picked in brand.config.mjs.
  for (const v of avatarVariants) {
    write(`avatar/variants/${v}.png`, toPng(avatarSvg(v), 1024));
    write(`avatar/variants/${v}.svg`, outline(avatarSvg(v)));
  }

  const avatar = avatarSvg(brand.avatarVariant);
  write('avatar/avatar.svg', outline(avatar));
  for (const a of avatars.filter((a) => wanted(a.id))) write(`avatar/${a.id}.png`, toPng(avatar, a.size));

  for (const b of banners.filter((b) => wanted(b.id))) {
    const svg = bannerSvg(b);
    write(`banner/${b.id}.png`, toPng(svg));
    write(`banner/svg/${b.id}.svg`, outline(svg));
  }

  for (const l of logos.filter((l) => wanted(l.id)))
    write(`logo/${l.id}.png`, toPng(readFileSync(join(root, 'src', l.src)), l.width));
}

console.log(`${count} files → ${out}`);
