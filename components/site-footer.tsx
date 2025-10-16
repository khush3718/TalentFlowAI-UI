export function SiteFooter() {
  return (
    <footer>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} TalentFlow AI. All rights reserved.
          </p>
          <nav className="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground">
              Terms
            </a>
            <a href="#" className="hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground">
              Contact
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
