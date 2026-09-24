// Every PNG the build produces.
//
// avatars — square; platforms crop them to a circle, so they use the
//           circle-safe avatar design (src is generated, see templates.mjs).
// banners — `safe` is the rect {x, y, w, h} that stays visible on every
//           device and is not covered by the profile picture. Content is
//           fitted inside it; decoration fills the rest. `plain: true`
//           renders the background texture only (no logo/text/watermark).
// logos   — plain renders of src/logo.svg and src/logo-wide.svg.

export const avatars = [
  { id: 'avatar-2048', size: 2048 },
  { id: 'avatar-1024', size: 1024 },
  { id: 'avatar-512', size: 512 },
  { id: 'avatar-400', size: 400 },
  { id: 'avatar-256', size: 256 },
  { id: 'avatar-128', size: 128 },

  { id: 'github', size: 500 },
  { id: 'gravatar', size: 2048 },
  { id: 'x-twitter', size: 400 },
  { id: 'linkedin', size: 400 },
  { id: 'youtube', size: 800 },
  { id: 'instagram', size: 1080 },
  { id: 'facebook', size: 720 },
  { id: 'discord', size: 1024 },
  { id: 'telegram', size: 640 },
  { id: 'whatsapp', size: 640 },
  { id: 'bluesky', size: 1000 },
];

export const banners = [
  // Visible on all devices: centre 1546×423.
  { id: 'youtube', width: 2560, height: 1440, safe: { x: 507, y: 508, w: 1546, h: 423 } },
  // Mobile crops ~60px top/bottom; avatar sits bottom-left.
  { id: 'x-twitter', width: 1500, height: 500, safe: { x: 260, y: 70, w: 980, h: 360 } },
  { id: 'bluesky', width: 3000, height: 1000, safe: { x: 520, y: 140, w: 1960, h: 720 } },
  // Avatar covers the left third on desktop; keep content to the right.
  { id: 'linkedin', width: 1584, height: 396, safe: { x: 520, y: 56, w: 980, h: 284 } },
  // Mobile shows ~16:9 centre crop; desktop avatar bottom-left.
  { id: 'facebook', width: 1640, height: 624, safe: { x: 300, y: 80, w: 1040, h: 440 } },
  // Profile banner (17:6), rendered at 2×; avatar overlaps bottom-left.
  { id: 'discord-profile', width: 1360, height: 480, safe: { x: 360, y: 60, w: 900, h: 300 } },
  { id: 'discord-server', width: 960, height: 540, safe: { x: 80, y: 70, w: 800, h: 400 } },
  // Repo social preview (Settings → Social preview).
  { id: 'github-social', width: 1280, height: 640, safe: { x: 80, y: 90, w: 1120, h: 460 } },
  // Header image for the profile README (github.com/<user>/<user>).
  { id: 'github-readme', width: 1280, height: 320, safe: { x: 60, y: 44, w: 1160, h: 232 } },
  { id: 'og-default', width: 1200, height: 630, safe: { x: 80, y: 90, w: 1040, h: 450 } },
  // Gravatar publishes no size and crops with an adjustable fill mode/position,
  // so keep content in a conservative centre area.
  { id: 'gravatar-header', width: 2400, height: 800, safe: { x: 600, y: 180, w: 1200, h: 440 } },
  // Sits behind profile sections (with an opacity control): texture only.
  { id: 'gravatar-background', width: 1920, height: 1080, plain: true },
];

export const logos = [
  { id: 'logo-128', src: 'logo.svg', width: 128 },
  { id: 'logo-256', src: 'logo.svg', width: 256 },
  { id: 'logo-512', src: 'logo.svg', width: 512 },
  { id: 'logo-1024', src: 'logo.svg', width: 1024 },
  { id: 'logo-wide-1000', src: 'logo-wide.svg', width: 1000 },
  { id: 'logo-wide-2000', src: 'logo-wide.svg', width: 2000 },
];
