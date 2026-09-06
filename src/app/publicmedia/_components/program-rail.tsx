export default function ProgramRail() {
  return (
    <aside className="hidden lg:block" aria-label="Public screening note">
      <div className="flex min-h-full gap-4">
        <div className="flex flex-col items-center" aria-hidden="true">
          <span className="font-mono text-[10px] tracking-[0.14em] text-primary/80">01</span>
          <span className="mt-3 w-px flex-1 bg-gradient-to-b from-primary/60 via-primary/20 to-transparent" />
        </div>
        <div className="flex min-h-[22rem] flex-col">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Current drop
          </p>
          <h1 className="mt-4 max-w-[12rem] font-[family:var(--font-heading-family)] text-3xl leading-tight text-[var(--text-primary)]">
            Public screening
          </h1>
          <p className="mt-5 max-w-[13rem] text-base leading-6 text-[var(--text-muted)]">
            Public uploads from verified Fuxem members. Watch freely; saves and reactions stay within member access.
          </p>
          <div className="mt-auto max-w-[13rem] border-l border-secondary/50 pl-3 text-xs leading-5 text-secondary">
            <p className="font-mono uppercase tracking-[0.14em]">18+ only</p>
            <p className="mt-1 text-[var(--text-muted)]">Public viewing does not include member interactions.</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
