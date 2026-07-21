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

/**
 * A scrolling track that shows its scrollbar as a designed rail rather than
 * hiding it. The browser draws the rail only while the content really
 * overflows, so it doubles as the "there is more this way" affordance — and
 * on a pointer device it is the only way to pan at all, since a vertical
 * wheel does not scroll a horizontal track and hijacking the wheel would
 * trap the page. Styled through the WebKit pseudo-elements alone, not the
 * standard `scrollbar-width`/`scrollbar-color` pair: setting either of those
 * makes Chromium ignore the pseudo-elements, and their thin preset drags in
 * platform stepper arrows. Firefox keeps its own slim scrollbar. The thumb
 * rides the mid-grey line token — 3.43:1 on the card, clearing WCAG 1.4.11
 * for a UI component. `pb-2` keeps the rail off the content it scrolls.
 */
export const SCROLL_RAIL = cn(
  'pb-2',
  '[&::-webkit-scrollbar-thumb]:bg-line-field',
  '[&::-webkit-scrollbar-thumb]:rounded-full',
  '[&::-webkit-scrollbar-track]:bg-transparent',
  '[&::-webkit-scrollbar]:h-1.5',
)
