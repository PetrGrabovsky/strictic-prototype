import { cn } from '@/lib/cn'

/**
 * The one `(app)` screen container: centered `max-w-md` column, 20px gutter,
 * default vertical rhythm (`pt-6 pb-8`). Screens with a reason to differ
 * (the workout leaves room for its bottom rail, the summary breathes more on
 * top) override just the vertical paddings via `cn`.
 */
export const SCREEN = cn(
  'mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-6 pb-8',
)

/**
 * A swipeable track with its scrollbar hidden on every engine: standard
 * `scrollbar-width` (Firefox, Chromium 121+), the `::-webkit-scrollbar`
 * fallback for older WebKit. Shared by the chart and carousel tracks — the
 * scroll still works, only the bar is invisible.
 */
export const SCROLLBAR_HIDDEN = cn(
  'scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
)
