/** Skeleton shimmer card — mirrors the shape of a JobCard */
export default function JobCardSkeleton() {
    return (
        <div className="job-card" style={{ cursor: 'default' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 8, flexShrink: 0 }} />
                    <div>
                        <div className="skeleton" style={{ width: 80, height: 12, borderRadius: 6, marginBottom: 8 }} />
                        <div className="skeleton" style={{ width: 160, height: 16, borderRadius: 6 }} />
                    </div>
                </div>
                <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0 }} />
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div className="skeleton" style={{ width: 72, height: 22, borderRadius: 999 }} />
                <div className="skeleton" style={{ width: 58, height: 22, borderRadius: 999 }} />
                <div className="skeleton" style={{ width: 90, height: 22, borderRadius: 999 }} />
            </div>

            {/* Skills row */}
            <div style={{ display: 'flex', gap: '0.375rem' }}>
                <div className="skeleton" style={{ width: 56, height: 20, borderRadius: 999 }} />
                <div className="skeleton" style={{ width: 68, height: 20, borderRadius: 999 }} />
                <div className="skeleton" style={{ width: 50, height: 20, borderRadius: 999 }} />
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <div className="skeleton" style={{ width: 110, height: 14, borderRadius: 6 }} />
                <div className="skeleton" style={{ width: 56, height: 12, borderRadius: 6 }} />
            </div>
        </div>
    );
}

/** Renders N skeleton cards in a jobs-grid */
export function JobCardSkeletonGrid({ count = 6 }: { count?: number }) {
    return (
        <div className="jobs-grid">
            {Array.from({ length: count }).map((_, i) => (
                <JobCardSkeleton key={i} />
            ))}
        </div>
    );
}
