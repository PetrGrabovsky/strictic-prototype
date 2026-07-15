/**
 * Small line marks for the onboarding wizard, kept inline so the project
 * stays free of an icon dependency (the reference used `lucide-react`, which
 * is not a project dep). Every icon is `aria-hidden` — the surrounding
 * control carries the accessible label.
 */

/** Confirmation check; inherits `currentColor`. */
export const CheckIcon = () => (
  <svg aria-hidden fill="none" height="16" viewBox="0 0 24 24" width="16">
    <path
      d="M5 13l4 4L19 7"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.4"
    />
  </svg>
)

/** Back chevron; inherits `currentColor`. */
export const ChevronLeftIcon = () => (
  <svg aria-hidden fill="none" height="20" viewBox="0 0 24 24" width="20">
    <path
      d="M15 6l-6 6 6 6"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
)

/** Forward arrow for the primary CTA; inherits `currentColor`. */
export const ArrowRightIcon = () => (
  <svg aria-hidden fill="none" height="18" viewBox="0 0 24 24" width="18">
    <path
      d="M5 12h14M13 6l6 6-6 6"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
)
