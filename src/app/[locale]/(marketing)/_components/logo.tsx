import { cn } from '@/lib/cn'

type Props = Readonly<{
  className?: string
  height?: number
  width?: number
}>

/**
 * Bare Strictic mark (inherits `currentColor`) plus the wordmark. The dot
 * after "strictic" is the only accent-colored glyph, matching the in-app
 * logo.
 */
export const Logo = ({ className, height = 22, width = 16 }: Props) => (
  <span
    className={cn(
      'inline-flex items-center gap-3',
      'text-ink text-lg leading-none font-extrabold tracking-[-0.02em]',
      className,
    )}
  >
    <svg
      aria-hidden
      className="block shrink-0 fill-current"
      height={height}
      viewBox="0 0 1116 1500"
      width={width}
    >
      <path d="M0 738.156V1059.89L663.321 1442.86V1121.13L0 738.156Z" />
      <path d="M352.97 0L0 203.781V631.843L762.289 1071.95V1500L1115.26 1296.22V868.168L352.97 428.051V0Z" />
      <path d="M451.938 57.1396V378.878L1115.26 761.847V440.108L451.938 57.1396Z" />
    </svg>
    <span>
      strictic<b className="text-accent">.</b>
    </span>
  </span>
)
