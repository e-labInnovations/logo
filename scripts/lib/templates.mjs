import { readFileSync } from 'node:fs';
import { brand } from '../../brand.config.mjs';
import { bbox, measureText, escape } from './render.mjs';

const { colors, fonts } = brand;
const src = (f) => readFileSync(new URL(`../../src/${f}`, import.meta.url), 'utf8');
const inner = (svg) => svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const r = (n) => Math.round(n * 100) / 100;

// ---------------------------------------------------------------------------
// Source artwork

const logoSvg = src('logo.svg');
const wideSvg = src('logo-wide.svg');

// The "e/" glyphs: every path in logo.svg except the rounded-square background.
const glyphPaths = [...logoSvg.matchAll(/<path[\s\S]*?\/>/g)]
  .slice(1)
  .map((m) => m[0].replace(/\sfill="[^"]*"/, ''))
  .join('');
const glyphBox = bbox(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${glyphPaths}</svg>`);

// Wide logo cropped to its ink so layout math uses the visible size.
const wideBox = bbox(wideSvg);
const wideAspect = wideBox.width / wideBox.height;

function wideLogo(x, y, height) {
  const vb = [wideBox.x, wideBox.y, wideBox.width, wideBox.height].map(r).join(' ');
  return `<svg x="${r(x)}" y="${r(y)}" width="${r(height * wideAspect)}" height="${r(height)}" viewBox="${vb}">${inner(wideSvg)}</svg>`;
}

// Glyphs scaled to `width` and centred on (cx, cy).
function glyph(cx, cy, width, fill) {
  const s = width / glyphBox.width;
  const tx = cx - (glyphBox.x + glyphBox.width / 2) * s;
  const ty = cy - (glyphBox.y + glyphBox.height / 2) * s;
  return `<g fill="${fill}" transform="translate(${r(tx)} ${r(ty)}) scale(${r(s * 1000) / 1000})">${glyphPaths}</g>`;
}

// ---------------------------------------------------------------------------
// Avatar — square canvas, full-bleed background, glyphs sized to sit well
// inside the circle crop every platform applies.

const AVATAR_GLYPH_WIDTH = 0.58; // of canvas width

export const avatarVariants = ['red', 'gradient', 'dark'];

export function avatarSvg(variant) {
  const S = 1000;
  const defs = {
    red: '',
    gradient:
      `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0" stop-color="${colors.red}"/><stop offset="1" stop-color="${colors.blue}"/></linearGradient>`,
    dark:
      `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0" stop-color="${colors.bgTo}"/><stop offset="1" stop-color="${colors.bgFrom}"/></linearGradient>` +
      // Resolved inside the glyph's scaled group, so use glyph-space coords.
      `<linearGradient id="ink" gradientUnits="userSpaceOnUse" x1="${r(glyphBox.x)}" y1="${r(glyphBox.y)}" ` +
      `x2="${r(glyphBox.x + glyphBox.width)}" y2="${r(glyphBox.y + glyphBox.height)}">` +
      `<stop offset="0" stop-color="${colors.red}"/><stop offset="1" stop-color="${colors.blue}"/></linearGradient>`,
  }[variant];
  if (defs === undefined) throw new Error(`unknown avatar variant "${variant}"`);

  const bg = variant === 'red' ? colors.red : 'url(#bg)';
  const ink = variant === 'dark' ? 'url(#ink)' : '#FFFFFF';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">` +
    `<defs>${defs}</defs>` +
    `<rect width="${S}" height="${S}" fill="${bg}"/>` +
    glyph(S / 2, S / 2, S * AVATAR_GLYPH_WIDTH, ink) +
    `</svg>`
  );
}

// Preview only: the avatar as platforms show it, circle-cropped.
export function avatarCircleSvg(variant) {
  const S = 1000;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">` +
    `<defs><clipPath id="c"><circle cx="${S / 2}" cy="${S / 2}" r="${S / 2}"/></clipPath></defs>` +
    `<rect width="${S}" height="${S}" fill="#FFFFFF"/>` +
    `<g clip-path="url(#c)">${inner(avatarSvg(variant))}</g></svg>`
  );
}

// ---------------------------------------------------------------------------
// Banner — dark card with brand glows, a dot grid and a faint oversized mark;
// wide logo + tagline + URL fitted into the platform's safe area.

// Layout sizes are in units where the wide logo is 100 tall.
const U = {
  tagline: 30, // font size
  taglineGap: 0.38, // word ↔ separator, in ems
  url: 17,
  stackGap: 34, // logo → tagline
  lineGap: 22, // tagline → url
  sideGap: 46, // horizontal layout: logo ↔ divider ↔ text
};

const taglineFont = { family: fonts.sans, weight: 700, size: U.tagline };
const sepFont = { family: fonts.sans, weight: 400, size: U.tagline };
const urlFont = { family: fonts.mono, weight: 500, size: U.url, letterSpacing: 1 };

function taglineMetrics() {
  const words = brand.tagline.map((w) => ({ text: w, box: measureText(w, taglineFont) }));
  const sep = measureText('|', sepFont);
  const gap = U.taglineGap * U.tagline;
  const width =
    words.reduce((a, w) => a + w.box.width, 0) + (words.length - 1) * (sep.width + 2 * gap);
  const line = measureText(brand.tagline.join(' | '), taglineFont);
  return { words, sep, gap, width, top: line.y, height: line.height };
}

// Tagline line, ink-left at x, ink-top at y, all measurements scaled by k.
function tagline(x, y, k, m) {
  const baseline = y - m.top * k;
  let cx = x;
  let out = '';
  m.words.forEach((w, i) => {
    if (i > 0) {
      cx += m.gap * k;
      out += text('|', cx - m.sep.x * k, baseline, sepFont, k, colors.text, 0.25);
      cx += (m.sep.width + m.gap) * k;
    }
    const fill = i === 1 ? 'url(#brandInk)' : colors.text;
    out += text(w.text, cx - w.box.x * k, baseline, taglineFont, k, fill);
    cx += w.box.width * k;
  });
  return out;
}

function text(str, x, y, f, k, fill, opacity = 1) {
  const ls = f.letterSpacing ? ` letter-spacing="${r(f.letterSpacing * k)}"` : '';
  const op = opacity < 1 ? ` fill-opacity="${opacity}"` : '';
  return (
    `<text x="${r(x)}" y="${r(y)}" font-family="${f.family}" font-weight="${f.weight}" ` +
    `font-size="${r(f.size * k)}"${ls} fill="${fill}"${op}>${escape(str)}</text>`
  );
}

function layouts() {
  const t = taglineMetrics();
  const u = measureText(brand.url, urlFont);
  const logoW = 100 * wideAspect;

  const stacked = {
    name: 'stacked',
    width: Math.max(logoW, t.width, u.width),
    height: 100 + U.stackGap + t.height + U.lineGap + u.height,
    draw(x, y, k) {
      const w = this.width * k;
      const ty = y + (100 + U.stackGap) * k;
      const uy = ty + (t.height + U.lineGap) * k;
      return (
        wideLogo(x + (w - logoW * k) / 2, y, 100 * k) +
        tagline(x + (w - t.width * k) / 2, ty, k, t) +
        text(brand.url, x + (w - u.width * k) / 2 - u.x * k, uy - u.y * k, urlFont, k, colors.text, 0.55)
      );
    },
  };

  const colW = Math.max(t.width, u.width);
  const colH = t.height + U.lineGap * 0.75 + u.height;
  const horizontal = {
    name: 'horizontal',
    width: logoW + U.sideGap * 2 + colW,
    height: 100,
    draw(x, y, k) {
      const dx = x + (logoW + U.sideGap) * k;
      const tx = dx + U.sideGap * k;
      const ty = y + ((100 - colH) / 2) * k;
      const uy = ty + (t.height + U.lineGap * 0.75) * k;
      return (
        wideLogo(x, y, 100 * k) +
        `<rect x="${r(dx)}" y="${r(y + 8 * k)}" width="${r(Math.max(1, 1.5 * k))}" height="${r(84 * k)}" fill="${colors.text}" fill-opacity="0.14"/>` +
        tagline(tx, ty, k, t) +
        text(brand.url, tx - u.x * k, uy - u.y * k, urlFont, k, colors.text, 0.55)
      );
    },
  };

  return [stacked, horizontal];
}

function content(safe) {
  // Fill up to 92% × 86% of the safe area with whichever layout ends up larger.
  const fit = (l) => Math.min((safe.w * 0.92) / l.width, (safe.h * 0.86) / l.height);
  const layout = layouts().reduce((best, l) => (fit(l) > fit(best) ? l : best));
  const k = fit(layout);
  const cx = safe.x + (safe.w - layout.width * k) / 2;
  const cy = safe.y + (safe.h - layout.height * k) / 2;
  return layout.draw(cx, cy, k);
}

export function bannerSvg({ width: W, height: H, safe, plain = false }, { guides = false } = {}) {
  const M = Math.max(W, H);
  const dot = r(Math.max(18, H / 22));

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<defs>` +
    `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${colors.bgFrom}"/><stop offset="1" stop-color="${colors.bgTo}"/></linearGradient>` +
    `<radialGradient id="glowRed"><stop offset="0" stop-color="${colors.red}" stop-opacity="0.22"/>` +
    `<stop offset="1" stop-color="${colors.red}" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="glowBlue"><stop offset="0" stop-color="${colors.blue}" stop-opacity="0.2"/>` +
    `<stop offset="1" stop-color="${colors.blue}" stop-opacity="0"/></radialGradient>` +
    `<pattern id="dots" width="${dot}" height="${dot}" patternUnits="userSpaceOnUse">` +
    `<circle cx="${dot / 2}" cy="${dot / 2}" r="${r(Math.max(1, dot / 18))}" fill="${colors.text}" fill-opacity="0.07"/></pattern>` +
    `<linearGradient id="brandInk" x1="0" y1="0" x2="1" y2="0">` +
    `<stop offset="0" stop-color="${colors.red}"/><stop offset="1" stop-color="${colors.blue}"/></linearGradient>` +
    `</defs>` +
    `<rect width="${W}" height="${H}" fill="url(#bg)"/>` +
    `<rect width="${W}" height="${H}" fill="url(#dots)"/>` +
    `<circle cx="${r(W * 0.08)}" cy="${r(H * 0.05)}" r="${r(M * 0.45)}" fill="url(#glowRed)"/>` +
    `<circle cx="${r(W * 0.95)}" cy="${r(H * 1.05)}" r="${r(M * 0.5)}" fill="url(#glowBlue)"/>` +
    (plain
      ? ''
      : glyph(W - H * 0.35, H * 0.62, H * 1.25, colors.text).replace('<g ', '<g fill-opacity="0.025" ') +
        content(safe)) +
    (guides && safe
      ? `<rect x="${safe.x}" y="${safe.y}" width="${safe.w}" height="${safe.h}" fill="none" ` +
        `stroke="#00FFAA" stroke-width="${r(Math.max(2, H / 300))}" stroke-dasharray="12 8"/>`
      : '') +
    `</svg>`
  );
}
