import { getTranslations } from 'next-intl/server'
import { cn } from '@/lib/cn'

/**
 * Live-looking training-screen mock that anchors the hero. A real
 * screenshot replaces it later; for now the dark card is pure static
 * markup floating gently via the `.hero-float` keyframes.
 */
export const PhoneMock = async () => {
  const t = await getTranslations('landing')

  return (
    <div className="hero-float">
      <div
        className={cn(
          'mx-auto w-[min(320px,88vw)] rounded-[34px]',
          'border-d-line bg-d-bg text-d-ink border',
          'px-[16px] pt-[20px] pb-[18px]',
          'shadow-[0_24px_60px_rgba(10,10,10,0.28),inset_0_0_0_6px_#111]',
        )}
      >
        <div
          className={cn(
            'mb-[16px] flex justify-between tabular-nums',
            'text-2xs text-d-ink-2 tracking-[0.14em] uppercase',
          )}
        >
          <span>{t('hero.phone.exercise')}</span>
          <span>{t('hero.phone.clock')}</span>
        </div>
        <div className="mb-[2px] text-lg font-bold tracking-[-0.02em]">
          {t('hero.phone.name')}
        </div>
        <div
          className={cn(
            'text-2xs mb-[18px] uppercase',
            'text-d-ink-2 tracking-[0.08em]',
          )}
        >
          {t('hero.phone.muscles')}
        </div>
        <div className="border-d-line bg-d-card mb-[12px] rounded-md border p-[16px]">
          <div className="text-2xs text-d-ink-2 tracking-[0.14em] uppercase">
            {t('hero.phone.weightLabel')}
          </div>
          <div className="mt-[2px] text-[38px] font-extrabold tabular-nums">
            {t('hero.phone.weight')}{' '}
            <small className="text-d-ink-2 text-base font-semibold">
              {t('hero.phone.weightUnit')}
            </small>
          </div>
          <div className="mt-[14px] flex gap-[8px]">
            <div
              className={cn(
                'flex h-[40px] flex-1 items-center justify-center',
                'rounded-md text-xs tabular-nums',
                'border border-[rgba(79,176,106,0.5)]',
                'text-d-green bg-[rgba(79,176,106,0.14)]',
              )}
            >
              {t('hero.phone.setDone')}
            </div>
            <div
              className={cn(
                'flex h-[40px] flex-1 items-center justify-center',
                'rounded-md text-xs tabular-nums',
                'border-d-accent text-d-ink border',
              )}
            >
              {t('hero.phone.setCurrent')}
            </div>
            <div
              className={cn(
                'flex h-[40px] flex-1 items-center justify-center',
                'rounded-md text-xs tabular-nums',
                'border-d-line text-d-ink-3 border border-dashed',
              )}
            >
              {t('hero.phone.setNext')}
            </div>
          </div>
        </div>
        <div
          className={cn(
            'bg-d-accent mt-[14px] w-full rounded-md py-[15px]',
            'text-d-bg text-center text-base font-bold',
          )}
        >
          {t('hero.phone.cta')}
        </div>
      </div>
      <div className="text-2xs text-ink-3 mt-[14px] text-center tracking-[0.08em]">
        {t('hero.phone.note')}
      </div>
    </div>
  )
}
