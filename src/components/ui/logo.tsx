import {
  LOGO_MARK_ASPECT_RATIO,
  LOGO_MARK_PATHS,
  LOGO_MARK_VIEWBOX,
} from '@/components/ui/logo-mark'
import { BRAND_WORDMARK } from '@/lib/brand'
import { cn } from '@/lib/cn'

type Props = {
  className?: string
  height?: number
  withWordmark?: boolean
}

/**
 * The Strictic mark, inheriting `currentColor`. With `withWordmark` it also
 * renders the "strictic." wordmark (the dot is the only accent glyph). Shared
 * by the app and the marketing site so the mark never diverges between them.
 *
 * The lockup proportions are tuned, not arbitrary: a 20px mark is ~1.45× the
 * wordmark's ascender and the 10px gap ~⅔ of the mark's width — the optical
 * sweet spot for a lowercase wordmark. Keep them in step if either changes.
 */
export const Logo = ({
  className,
  height = 20,
  withWordmark = false,
}: Props) => {
  const mark = (
    <svg
      aria-hidden
      className={cn('block shrink-0 fill-current', !withWordmark && className)}
      height={height}
      viewBox={LOGO_MARK_VIEWBOX}
      width={height * LOGO_MARK_ASPECT_RATIO}
    >
      {LOGO_MARK_PATHS.map((path) => (
        <path d={path} key={path} />
      ))}
    </svg>
  )

  if (!withWordmark) {
    return mark
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2.5',
        'text-ink text-lg leading-none font-extrabold tracking-tight',
        className,
      )}
    >
      {mark}
      <span>
        {BRAND_WORDMARK}
        <b className="text-accent">.</b>
      </span>
    </span>
  )
}
