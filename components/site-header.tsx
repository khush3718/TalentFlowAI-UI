"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const nav = [
  { href: "/", label: "Home" },
  { href: "/scan", label: "Scan" },
  // { href: "/history", label: "History" },
  // { href: "/candidates", label: "Candidates" },
  // { href: "/settings", label: "Settings" },
]

export function SiteHeader() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-sm bg-sidebar-primary" aria-hidden />
          <span className="text-sm font-semibold tracking-tight">TalentFlow AI</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm text-muted-foreground transition-colors hover:text-foreground",
                pathname === item.href && "text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {/* <div className="flex items-center gap-2">
          <Button className="bg-sidebar-primary text-sidebar-primary-foreground hover:opacity-90">
            Request a Demo
          </Button>
        </div> */}
      </div>
    </header>
  )
}
