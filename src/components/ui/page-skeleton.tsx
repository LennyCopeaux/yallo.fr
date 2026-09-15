export function PageSkeleton({
  cards = 3,
  rows = 6,
}: Readonly<{ cards?: number; rows?: number }>) {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-3 h-8 w-52 rounded-lg bg-muted" />
      <div className="mb-8 h-4 w-72 rounded-md bg-muted" />
      {cards > 0 && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: cards }, (_, index) => (
            <div key={index} className="h-28 rounded-xl bg-muted" />
          ))}
        </div>
      )}
      <div className="space-y-3 rounded-xl border border-border/60 p-4">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="h-11 rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 h-9 w-24 rounded-lg bg-muted" />
      <div className="mb-2 h-9 w-64 rounded-lg bg-muted" />
      <div className="mb-8 h-4 w-48 rounded-md bg-muted" />
      <div className="mb-6 flex gap-2">
        <div className="h-10 w-40 rounded-lg bg-muted" />
        <div className="h-10 w-32 rounded-lg bg-muted" />
        <div className="h-10 w-36 rounded-lg bg-muted" />
      </div>
      <div className="h-80 rounded-xl bg-muted" />
    </div>
  );
}
