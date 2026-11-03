import Image from "next/image"
import Link from "next/link"

const navItems = [
  { href: "/#ranking", label: "Ranking" },
  { href: "/#metodologia", label: "Metodologia" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/95 text-paper backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <Image
            src="/comparativo-ev-portugal-icon.svg"
            alt=""
            width={36}
            height={36}
            priority
            className="size-9 transition-transform group-hover:-rotate-3"
          />
          <span className="flex flex-col leading-none">
            <span className="font-heading text-sm font-semibold tracking-tight">
              Comparativo EV
            </span>
            <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.28em] text-white/45">
              Portugal
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-xs font-medium uppercase tracking-[0.18em] text-white/55 sm:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-lime"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
