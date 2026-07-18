import type { VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithoutRef } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { Link } from '@/i18n/routing'
import { cn } from '@/lib/cn'

type Props = ComponentPropsWithoutRef<typeof Link> &
  VariantProps<typeof buttonVariants>

/**
 * A locale-aware {@link Link} dressed as the shared {@link buttonVariants} —
 * for navigation that reads as a button (screen CTAs). Real in-page anchors
 * (`#hash`) stay plain `<a>`s; real actions stay `<button>`s.
 */
export const ButtonLink = ({
  children,
  className,
  size,
  tone,
  variant,
  ...props
}: Props) => (
  <Link
    className={cn(buttonVariants({ size, tone, variant }), className)}
    {...props}
  >
    {children}
  </Link>
)
