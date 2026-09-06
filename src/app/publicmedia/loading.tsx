import { Card, CardContent } from '@/components/ui/card'

export default function PublicMediaLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading public videos"
      className="min-h-screen bg-[var(--bg-base)] px-4 pb-14 pt-6 text-[var(--text-primary)] sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="h-14 border-b border-[var(--border-subtle)]" />
        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(190px,0.28fr)_minmax(0,0.72fr)]">
          <div className="hidden space-y-4 lg:block">
            <div className="h-8 w-40 animate-pulse rounded bg-[var(--bg-surface)] motion-reduce:animate-none" />
            <div className="h-16 w-full animate-pulse rounded bg-[var(--bg-surface)] motion-reduce:animate-none" />
          </div>
          <Card className="overflow-hidden rounded-2xl border-[var(--border-subtle)] bg-[var(--bg-card)]">
            <div className="aspect-video animate-pulse bg-[var(--bg-surface)] motion-reduce:animate-none" />
            <CardContent className="space-y-3 p-5">
              <div className="h-3 w-32 animate-pulse rounded bg-[var(--bg-surface)] motion-reduce:animate-none" />
              <div className="h-8 w-2/3 animate-pulse rounded bg-[var(--bg-surface)] motion-reduce:animate-none" />
              <div className="h-12 w-full animate-pulse rounded bg-[var(--bg-surface)] motion-reduce:animate-none" />
            </CardContent>
          </Card>
        </div>
        <div className="mt-16 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="overflow-hidden rounded-2xl border-[var(--border-subtle)] bg-[var(--bg-card)]">
              <div className="aspect-video animate-pulse bg-[var(--bg-surface)] motion-reduce:animate-none" />
              <CardContent className="space-y-3 p-5">
                <div className="h-5 w-3/4 animate-pulse rounded bg-[var(--bg-surface)] motion-reduce:animate-none" />
                <div className="h-10 w-full animate-pulse rounded bg-[var(--bg-surface)] motion-reduce:animate-none" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}
