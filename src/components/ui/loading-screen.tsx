import { cn } from '@/lib/cn'
import { MICRO_LABEL } from '@/styles/type'

type Props = {
  label: string
  /** Show the spinner for longer, deliberate waits (plan building). */
  spinner?: boolean
  /** `dark` matches the training screen; `light` is everything else. */
  tone?: 'dark' | 'light'
}

/**
 * The one centered pending state — the loading counterpart to
 * {@link StatusScreen}, so every screen's fourth state speaks with the same
 * voice. `<output>` announces the label to screen readers; `aria-busy` marks
 * the region as loading.
 */
export const LoadingScreen = ({
  label,
  spinner = false,
  tone = 'light',
}: Props) => {
  const isDark = tone === 'dark'
  return (
    <main
      aria-busy="true"
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-4 px-5',
        isDark && 'bg-d-bg',
      )}
    >
      {spinner ? (
        <span
          aria-hidden
          className={cn(
            'size-8 rounded-full border-2 motion-safe:animate-spin',
            isDark
              ? 'border-d-line-2 border-t-d-accent'
              : 'border-line-2 border-t-accent',
          )}
        />
      ) : null}
      <output
        className={cn(MICRO_LABEL, isDark ? 'text-d-ink-3' : 'text-ink-2')}
      >
        {label}
      </output>
    </main>
  )
}
