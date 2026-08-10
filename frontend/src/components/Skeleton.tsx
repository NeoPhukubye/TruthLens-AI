export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-dark-600 rounded-lg ${className}`} />
}

export function CardSkeleton() {
  return (
    <div className="card p-6 space-y-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}

export function StatSkeleton() {
  return (
    <div className="stat-card">
      <Skeleton className="h-10 w-10 rounded-lg mb-3" />
      <Skeleton className="h-7 w-16 mb-2" />
      <Skeleton className="h-4 w-24" />
    </div>
  )
}
