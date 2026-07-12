/**
 * Plain-object mirror of the `@theme` color tokens in `globals.css`, for
 * canvas contexts (shared progress images) where `ctx.fillStyle` needs a
 * real hex string, not a CSS variable. Must stay in sync with `@theme` —
 * manual sync, no build step generates this.
 */
export const tokens = {
  light: {
    bg: '#F4F4F2',
    surface: '#FFFFFF',
    line: '#ECECEA',
    line2: '#E0E0DD',
    lineField: '#8B8B85',
    ink: '#0A0A0A',
    ink2: '#6E6E6B',
    ink3: '#67675F',
    accent: '#FF4D1C',
    accentDeep: '#C13A12',
    cream: '#F8EFE7',
    green: '#3E9457',
  },
  dark: {
    bg: '#0C0C0B',
    surface: '#15150F',
    card: '#1E1E18',
    line: '#2A2A24',
    line2: '#3A3A30',
    ink: '#F5F5F2',
    ink2: '#A4A49C',
    ink3: '#828278',
    accent: '#FF5A2C',
    green: '#4FB06A',
  },
} as const
