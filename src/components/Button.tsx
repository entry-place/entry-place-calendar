import * as Headless from '@headlessui/react'
import { clsx } from 'clsx'
import { Link } from './Link'

const variants = {
  checkin: clsx(
    'inline-flex items-center justify-center px-4 py-[calc(theme(spacing.2)-1px)]',
    'rounded-full border border-transparent bg-green-600 shadow-md',
    'whitespace-nowrap text-base font-medium text-white cursor-pointer',
    'data-[disabled]:bg-green-800 data-[hover]:bg-green-500 data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed',
  ),
  primary: clsx(
    'inline-flex items-center justify-center px-4 py-[calc(theme(spacing.2)-1px)]',
    'rounded-full border border-transparent bg-gray-950 shadow-md',
    'whitespace-nowrap text-base font-medium text-white cursor-pointer',
    'data-[disabled]:bg-gray-950 data-[hover]:bg-gray-800 data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed',
  ),
secondary: clsx(
    'relative inline-flex items-center justify-center px-4 py-[calc(theme(spacing.2)-1px)]',
    'rounded-full border border-transparent bg-white/15 shadow-md ring-1 ring-[#D15052]/15',
    'after:absolute after:inset-0 after:rounded-full after:shadow-[inset_0_0_2px_1px_#ffffff4d]',
    'whitespace-nowrap text-base font-medium text-gray-950 cursor-pointer',
    'data-[disabled]:bg-white/15 data-[hover]:bg-white/20 data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed hover:ring-2 hover:ring-[#D15052]/40',
  ),
  secondaryDestructiveHover: clsx(
    'relative inline-flex items-center justify-center px-4 py-[calc(theme(spacing.2)-1px)]',
    'rounded-full border border-transparent bg-white/15 shadow-md ring-1 ring-[#D15052]/15',
    'after:absolute after:inset-0 after:rounded-full after:shadow-[inset_0_0_2px_1px_#ffffff4d]',
    'whitespace-nowrap text-base font-medium text-gray-950 cursor-pointer',
    'data-[disabled]:bg-white/15 data-[hover]:bg-[#D15052]/20 data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed hover:ring-2 hover:ring-[#D15052]/40',
  ),
  outline: clsx(
    'inline-flex items-center justify-center px-2 py-[calc(theme(spacing.[1.5])-1px)]',
    'rounded-lg border border-transparent shadow ring-1 ring-black/10',
    'whitespace-nowrap text-sm font-medium text-gray-950 cursor-pointer',
    'data-[disabled]:bg-transparent data-[hover]:bg-gray-50 data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed',
  ),
  outlineDisabled: clsx(
    'inline-flex items-center justify-center px-2 py-[calc(theme(spacing.[1.5])-1px)]',
    'rounded-lg border border-transparent shadow ring-1 ring-black/10',
    'whitespace-nowrap text-sm font-medium text-gray-500',
    'bg-transparent cursor-not-allowed',
  ),
  outlineRounded: clsx(
    'relative inline-flex items-center justify-center px-4 py-[calc(theme(spacing.2)-1px)]',
    'rounded-full border border-transparent bg-white/15 shadow-md ring-1 ring-black/10',
    'after:absolute after:inset-0 after:rounded-full after:shadow-[inset_0_0_2px_1px_#ffffff4d]',
    'whitespace-nowrap text-base font-medium text-gray-950 cursor-pointer',
    'data-[disabled]:bg-white/15 data-[hover]:bg-white/20 data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed hover:ring-2 hover:ring-[#D15052]/40',
  ),
  // Matches primary button dimensions - use for loading states to prevent CLS
  primaryLoading: clsx(
    'inline-flex items-center justify-center px-4 py-[calc(theme(spacing.2)-1px)]',
    'rounded-full border border-transparent shadow-md ring-1 ring-black/10',
    'whitespace-nowrap text-base font-medium text-gray-500',
    'data-[disabled]:opacity-40 data-[hover]:bg-gray-50 data-[disabled]:cursor-not-allowed',
  ),
  link: clsx(
    'relative text-sm cursor-pointer rounded-md font-medium text-indigo-600',
    ' focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600',
    'focus-within:ring-offset-2 hover:text-indigo-500 underline',
  ),
}

type ButtonProps = {
  variant?: keyof typeof variants
} & (
  | React.ComponentPropsWithoutRef<typeof Link>
  | (Headless.ButtonProps & { href?: undefined })
)

export function Button({
  variant = 'primary' as keyof typeof variants,
  className,
  ...props
}: ButtonProps) {
  className = clsx(className, variants[variant])

  if (typeof props.href === 'undefined') {
    return <Headless.Button {...props} className={className} />
  }

  return <Link {...props} className={className} />
}
