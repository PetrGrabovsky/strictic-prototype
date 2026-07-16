import { getTranslations } from 'next-intl/server'
import { cn } from '@/lib/cn'
import { ContentSection } from './content-section'
import { SectionHeading } from './section-heading'

const PILLAR_LI = 'border-t border-d-line py-2 text-base text-d-ink-2'

// Two mirrored columns share one shape: a coloured title + icon and a
// list of lead/rest promise lines.
const COLUMNS = [
  {
    group: 'promises',
    icon: '✓',
    ids: ['free', 'truth', 'data', 'easyWeek'],
    titleKey: 'promiseTitle',
    tone: 'text-d-green',
  },
  {
    group: 'nevers',
    icon: '✕',
    ids: ['ads', 'dataSale', 'fakeDeals', 'fakeReviews'],
    titleKey: 'neverTitle',
    tone: 'text-d-accent',
  },
] as const

/** Dark "radical honesty" manifesto: promises vs. nevers, in writing. */
export const ManifestoSection = async () => {
  const t = await getTranslations('landing')

  return (
    <ContentSection className="bg-d-bg text-d-ink">
      <SectionHeading
        dark
        kicker={t('manifesto.kicker')}
        lead={t('manifesto.lead')}
        title={t('manifesto.h2')}
      />
      <div className="mt-8.5 grid grid-cols-1 gap-4 min-[760px]:grid-cols-2">
        {COLUMNS.map((column) => (
          <div
            className="border-d-line bg-d-card rounded-md border p-6"
            key={column.group}
          >
            <h3
              className={cn(
                'mb-3.5 text-xs tracking-widest uppercase',
                column.tone,
              )}
            >
              {t(`manifesto.${column.titleKey}`)}
            </h3>
            <ul className="list-none">
              {column.ids.map((id) => (
                <li className={PILLAR_LI} key={id}>
                  <span aria-hidden className={column.tone}>
                    {column.icon}
                  </span>{' '}
                  <b className="text-d-ink font-semibold">
                    {t(`manifesto.${column.group}.${id}.lead`)}
                  </b>
                  {t(`manifesto.${column.group}.${id}.rest`)}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </ContentSection>
  )
}
