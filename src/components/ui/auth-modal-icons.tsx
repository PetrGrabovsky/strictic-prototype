/**
 * Brand marks for the auth modal's OAuth buttons. Kept separate from the
 * shared line-icon set (`@/components/ui/icons`) because a brand mark can't
 * inherit a single `currentColor` — Google is multi-colour, Apple ships its
 * own viewBox — so neither fits the stroke-based `Glyph` frame. Every icon is
 * `aria-hidden`; the surrounding button carries the label.
 */

/** Google's brand mark; fixed colours, so it never inherits the button. */
export const GoogleIcon = () => (
  <svg aria-hidden height="19" viewBox="0 0 48 48" width="19">
    <path
      d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.5 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.1 17.7 9.5 24 9.5z"
      fill="#EA4335"
    />
    <path
      d="M46.5 24.5c0-1.6-.1-3.1-.4-4H24v9h12.7c-.5 3-2.2 5.5-4.7 7.2l7.4 5.7c4.3-4 6.9-9.9 6.9-17.4z"
      fill="#4285F4"
    />
    <path
      d="M10.5 19.3c-.5 1.5-.8 3-.8 4.7s.3 3.2.8 4.7l-7.9 6.1C1 31.5 0 27.9 0 24s1-7 2.6-10.8l7.9 6.1z"
      fill="#FBBC05"
    />
    <path
      d="M24 48c6.5 0 11.9-2.1 15.9-5.9l-7.4-5.7c-2.1 1.4-4.9 2.3-8 2.3-6.3 0-11.6-3.6-13.5-9.7l-7.9 6.1C6.5 42.6 14.6 48 24 48z"
      fill="#34A853"
    />
  </svg>
)

/** Apple's brand mark; inherits `currentColor` (white on the dark button). */
export const AppleIcon = () => (
  <svg
    aria-hidden
    fill="currentColor"
    height="19"
    viewBox="0 0 384 512"
    width="16"
  >
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
  </svg>
)
