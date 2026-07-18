import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { StatusScreen } from '@/components/ui/status-screen'
import { Link } from '@/i18n/routing'
import { cn } from '@/lib/cn'
import { QUIET_ACTION } from '@/styles/type'

type Props = {
  error: Error & { digest?: string }
  /** Translation namespace holding `title`/`description`/`retry` (+ optional `backHome`). */
  namespace: string
  reset: () => void
  /** Render the "back home" escape hatch — off for the Home screen itself. */
  showHomeLink?: boolean
  tone?: 'dark' | 'light'
}

/**
 * The shared body of every route `error.tsx`: the crash is contained to the
 * screen (the app shell and header stay up), surfaced to the console, and the
 * user gets a retry that re-mounts the segment plus an optional way home.
 */
export const RouteError = ({
  error,
  namespace,
  reset,
  showHomeLink = true,
  tone = 'light',
}: Props) => {
  const t = useTranslations(namespace)

  // Surface the crash to the console/telemetry — the recovery card must not be
  // the only trace of it (the storage layer swallows on purpose; a boundary
  // must not).
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <StatusScreen
      action={
        <div className="flex flex-col items-center gap-2">
          <Button className="px-6" onClick={reset} tone={tone} variant="ink">
            {t('retry')}
          </Button>
          {showHomeLink ? (
            <Link
              className={cn(
                QUIET_ACTION,
                tone === 'dark' ? 'text-d-ink-3' : 'text-ink-3',
              )}
              href="/app"
            >
              {t('backHome')}
            </Link>
          ) : null}
        </div>
      }
      description={t('description')}
      title={t('title')}
      tone={tone}
    />
  )
}
