// Brand tokens shared by every generated asset. Mirrors elabins-v3
// (src/lib/site.ts + opengraph-image.tsx) so banners match the site.
export const brand = {
  name: 'e-lab innovations',
  tagline: ['Learn', 'Innovate', 'Share'], // middle word gets the gradient
  url: 'elabins.com',

  colors: {
    red: '#E63E5A',
    blue: '#2D6FF5',
    bgFrom: '#0E1116',
    bgTo: '#1A2030',
    text: '#FBFAF7',
  },

  fonts: {
    sans: 'Titillium Web',
    mono: 'JetBrains Mono',
  },

  // Which avatar variant the per-platform avatar exports use.
  // Compare dist/avatar/variants/*.png and pick one: 'red' | 'gradient' | 'dark'
  avatarVariant: 'red',
};
