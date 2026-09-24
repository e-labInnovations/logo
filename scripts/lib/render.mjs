import { Resvg } from '@resvg/resvg-js';
import { fileURLToPath } from 'node:url';

const font = (f) => fileURLToPath(new URL(`../../fonts/${f}`, import.meta.url));

const resvgOptions = {
  font: {
    fontFiles: [
      font('TitilliumWeb-Regular.ttf'),
      font('TitilliumWeb-SemiBold.ttf'),
      font('TitilliumWeb-Bold.ttf'),
      font('JetBrainsMono.ttf'),
    ],
    // Only bundled fonts, so output is identical on every machine.
    loadSystemFonts: false,
    defaultFontFamily: 'Titillium Web',
  },
};

const resvg = (svg, extra = {}) => new Resvg(svg, { ...resvgOptions, ...extra });

export function toPng(svg, width) {
  return resvg(svg, width ? { fitTo: { mode: 'width', value: width } } : {}).render().asPng();
}

// Normalised SVG with text converted to paths — renders the same without the fonts.
export function outline(svg) {
  return resvg(svg).toString();
}

// Ink bounding box of an SVG's content, in its own user units.
export function bbox(svg) {
  const b = resvg(svg).getBBox();
  if (!b) throw new Error('empty SVG, nothing to measure');
  return { x: b.x, y: b.y, width: b.width, height: b.height };
}

// Ink box of a single line of text, relative to its baseline origin.
const textCache = new Map();
export function measureText(text, { family, weight = 400, size, letterSpacing = 0 }) {
  const key = [text, family, weight, size, letterSpacing].join('|');
  if (!textCache.has(key)) {
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size * text.length * 2}" height="${size * 4}">` +
      `<text x="${size}" y="${size * 2}" font-family="${family}" font-weight="${weight}" ` +
      `font-size="${size}" letter-spacing="${letterSpacing}">${escape(text)}</text></svg>`;
    const b = bbox(svg);
    textCache.set(key, { x: b.x - size, y: b.y - size * 2, width: b.width, height: b.height });
  }
  return textCache.get(key);
}

export const escape = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
