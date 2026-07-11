import Image from 'next/image'
import { cn } from '@/lib/cn'

const Home = () => {
  return (
    <div
      className={cn(
        'flex flex-1 flex-col items-center justify-center',
        'bg-zinc-50 font-sans dark:bg-black',
      )}
    >
      <main
        className={cn(
          'flex w-full max-w-3xl flex-1 flex-col items-center justify-between',
          'bg-white px-16 py-32 dark:bg-black',
          'sm:items-start',
        )}
      >
        <Image
          alt="Next.js logo"
          className="dark:invert"
          height={20}
          priority
          src="/next.svg"
          width={100}
        />
        <div
          className={cn(
            'flex flex-col items-center gap-6 text-center',
            'sm:items-start sm:text-left',
          )}
        >
          <h1
            className={cn(
              'max-w-xs text-3xl leading-10 font-semibold tracking-tight',
              'text-black dark:text-zinc-50',
            )}
          >
            To get started, edit the page.tsx file.
          </h1>
          <p
            className={cn(
              'max-w-md text-lg leading-8',
              'text-zinc-600 dark:text-zinc-400',
            )}
          >
            Looking for a starting point or more instructions? Head over to{' '}
            <a
              className="font-medium text-zinc-950 dark:text-zinc-50"
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            >
              Templates
            </a>{' '}
            or the{' '}
            <a
              className="font-medium text-zinc-950 dark:text-zinc-50"
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            >
              Learning
            </a>{' '}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className={cn(
              'bg-foreground text-background flex h-12 w-full items-center',
              'justify-center gap-2 rounded-full px-5 transition-colors',
              'hover:bg-[#383838] md:w-39.5 dark:hover:bg-[#ccc]',
            )}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image
              alt="Vercel logomark"
              className="dark:invert"
              height={16}
              src="/vercel.svg"
              width={16}
            />
            Deploy Now
          </a>
          <a
            className={cn(
              'flex h-12 w-full items-center justify-center rounded-full',
              'border border-solid border-black/8 px-5 transition-colors',
              'hover:border-transparent hover:bg-black/4 md:w-39.5',
              'dark:border-white/[.145] dark:hover:bg-[#1a1a1a]',
            )}
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            rel="noopener noreferrer"
            target="_blank"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  )
}

export default Home
