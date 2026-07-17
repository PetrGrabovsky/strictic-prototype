'use client'

import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'
import { cn } from '@/lib/cn'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Route-level error boundary for the Progress screen. A crash while deriving
 * or rendering progress is contained here — the app shell and header stay up,
 * only this screen swaps to a recovery card (BUILD-GUIDE §4). History is
 * untouched, so "try again" re-mounts the screen and re-reads it.
 */
const ProgressError = ({ error, reset }: Props) => {
  const t = useTranslations('progress.error')

  // Surface the crash to the console/telemetry — the recovery card must not be
  // the only trace of it (the storage layer swallows on purpose; a boundary
  // must not).
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-4 px-6',
        'text-center',
      )}
    >
      <h1 className="text-ink text-xl font-semibold">{t('title')}</h1>
      <p className="text-ink-2 max-w-xs text-sm leading-relaxed">
        {t('description')}
      </p>
      <div className="flex flex-col items-center gap-2">
        <Button className="px-6" onClick={reset} variant="dark">
          {t('retry')}
        </Button>
        <Link
          className="text-ink-3 text-2xs py-2 font-mono tracking-wide uppercase"
          href="/app"
        >
          {t('backHome')}
        </Link>
      </div>
    </main>
  )
}

export default ProgressError
