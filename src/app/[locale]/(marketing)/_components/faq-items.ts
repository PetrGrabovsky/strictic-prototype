/**
 * FAQ entry ids, in display order. Shared by the visible {@link FaqSection}
 * and the {@link StructuredData} `FAQPage` JSON-LD so both read the exact
 * same `faq.items.<id>.{question,answer}` messages — the structured data
 * mirrors the page word for word, never a paraphrase.
 */
export const FAQ_ITEMS = [
  'dumbbells',
  'free',
  'offline',
  'install',
  'beginner',
  'weightloss',
  'youtube',
  'minimal',
] as const
