import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, MapPin, X, Briefcase, ArrowRight, RefreshCw } from 'lucide-react';
import { getJobs } from '../services/api';
import JobCard from '../components/JobCard';
import { JobCardSkeletonGrid } from '../components/JobCardSkeleton';
import { Link } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'freelance'];
const LOCATION_TYPES = ['remote', 'onsite', 'hybrid'];
const CATEGORIES = ['Technology', 'Design', 'Marketing', 'Finance', 'Healthcare', 'Education', 'Sales', 'Engineering', 'HR', 'Other'];
const EXPERIENCE = ['entry', 'mid', 'senior', 'lead'];

export default function Jobs() {
    const [searchParams] = useSearchParams();
    const [jobs, setJobs] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [location, setLocation] = useState(searchParams.get('location') || '');
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        type: '', locationType: '', experience: '',
    });
    const [showFilters, setShowFilters] = useState(false);

    // Debounce search & location so API only fires 400ms after user stops typing
    const debouncedSearch = useDebounce(search, 400);
    const debouncedLocation = useDebounce(location, 400);

    // Ref for Intersection Observer (infinite scroll sentinel)
    const sentinelRef = useRef<HTMLDivElement>(null);

    // ── Initial / filter-change load (resets list) ─────────────────────────
    const fetchInitial = useCallback(async () => {
        setLoading(true);
        setPage(1);
        setJobs([]);
        try {
            const params: any = { page: 1, limit: 12, ...filters };
            if (debouncedSearch) params.search = debouncedSearch;
            if (debouncedLocation) params.location = debouncedLocation;
            Object.keys(params).forEach(k => !params[k] && delete params[k]);
            const { data } = await getJobs(params);
            const fetchedJobs = data.jobs || [];
            setJobs(fetchedJobs);
            setTotal(data.total || 0);
            setHasMore(fetchedJobs.length === 12 && fetchedJobs.length < (data.total || 0));
        } catch { setJobs([]); setHasMore(false); }
        finally { setLoading(false); }
    }, [debouncedSearch, debouncedLocation, filters]);

    // ── Load next page (infinite scroll) ───────────────────────────────────
    const fetchMore = useCallback(async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        const nextPage = page + 1;
        try {
            const params: any = { page: nextPage, limit: 12, ...filters };
            if (debouncedSearch) params.search = debouncedSearch;
            if (debouncedLocation) params.location = debouncedLocation;
            Object.keys(params).forEach(k => !params[k] && delete params[k]);
            const { data } = await getJobs(params);
            const newJobs = data.jobs || [];
            setJobs(prev => [...prev, ...newJobs]);
            setPage(nextPage);
            setHasMore(newJobs.length === 12 && (jobs.length + newJobs.length) < (data.total || 0));
        } catch { setHasMore(false); }
        finally { setLoadingMore(false); }
    }, [loadingMore, hasMore, page, filters, debouncedSearch, debouncedLocation, jobs.length]);

    // Reset + re-fetch when debounced search/location or filters change
    useEffect(() => { fetchInitial(); }, [fetchInitial]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => { if (entries[0].isIntersecting && hasMore && !loading) fetchMore(); },
            { rootMargin: '200px' }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [hasMore, loading, fetchMore]);

    const clearFilter = (key: string) => setFilters(p => ({ ...p, [key]: '' }));
    const activeFilters = Object.entries(filters).filter(([, v]) => v);
    const hasActiveFilters = activeFilters.length > 0 || debouncedSearch || debouncedLocation;

    return (
        <div className="page">
            {/* ── Header ──────────────────────────────────────────── */}
            <div className="page__header" style={{ background: 'var(--bg-surface)' }}>
                <div className="container">
                    <h1 className="heading-lg mb-4">Browse Jobs</h1>
                    <div className="search-bar" style={{ maxWidth: 'none' }}>
                        <Search size={18} style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', flexShrink: 0 }} />
                        <input
                            type="text"
                            placeholder="Job title, keyword, or company"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <div className="search-divider" />
                        <MapPin size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        <input
                            type="text"
                            placeholder="Location"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                        />
                        <button type="button" className="btn btn-secondary btn-icon" onClick={() => setShowFilters(!showFilters)} title="Filters">
                            <SlidersHorizontal size={16} />
                            {activeFilters.length > 0 && (
                                <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-500)' }} />
                            )}
                        </button>
                    </div>

                    {/* Active filter chips */}
                    <AnimatePresence>
                        {activeFilters.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}
                            >
                                {activeFilters.map(([k, v]) => (
                                    <span key={k} className="badge badge-blue" style={{ gap: '0.375rem', cursor: 'pointer' }} onClick={() => clearFilter(k)}>
                                        {v} <X size={11} />
                                    </span>
                                ))}
                                <button className="badge badge-gray" style={{ cursor: 'pointer' }} onClick={() => setFilters({ category: '', type: '', locationType: '', experience: '' })}>
                                    Clear all
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: showFilters ? '260px 1fr' : '1fr', gap: '2rem', alignItems: 'start' }}>

                    {/* ── Filters Sidebar ─────────────────────────────── */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="filters"
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                    <span style={{ fontWeight: 700 }}>Filters</span>
                                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setShowFilters(false)}><X size={14} /></button>
                                </div>
                                {[
                                    { key: 'type', label: 'Job Type', options: JOB_TYPES },
                                    { key: 'locationType', label: 'Location Type', options: LOCATION_TYPES },
                                    { key: 'category', label: 'Category', options: CATEGORIES },
                                    { key: 'experience', label: 'Experience Level', options: EXPERIENCE },
                                ].map(grp => (
                                    <div className="filter-group" key={grp.key}>
                                        <div className="filter-group__title">{grp.label}</div>
                                        {grp.options.map(opt => (
                                            <label className="filter-option" key={opt}>
                                                <input
                                                    type="radio"
                                                    name={grp.key}
                                                    checked={filters[grp.key as keyof typeof filters] === opt}
                                                    onChange={() => setFilters(p => ({ ...p, [grp.key]: p[grp.key as keyof typeof filters] === opt ? '' : opt }))}
                                                />
                                                {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                            </label>
                                        ))}
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Results ─────────────────────────────────────── */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                {loading ? 'Searching...' : `${total} job${total !== 1 ? 's' : ''} found`}
                            </p>
                        </div>

                        {/* Skeleton loaders on initial fetch */}
                        {loading ? (
                            <JobCardSkeletonGrid count={6} />
                        ) : jobs.length === 0 ? (
                            /* ── Rich Empty State ─────────────────────── */
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="empty-state"
                                style={{ padding: '4rem 2rem' }}
                            >
                                {/* SVG Illustration */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto', opacity: 0.7 }}>
                                        <circle cx="60" cy="60" r="56" stroke="var(--border-strong)" strokeWidth="2" strokeDasharray="6 4" />
                                        <circle cx="60" cy="60" r="36" fill="var(--bg-elevated)" />
                                        <path d="M44 60C44 51.163 51.163 44 60 44C68.837 44 76 51.163 76 60" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" />
                                        <circle cx="60" cy="60" r="6" fill="var(--text-muted)" />
                                        <path d="M72 72L82 82" stroke="var(--brand-400)" strokeWidth="3" strokeLinecap="round" />
                                        <circle cx="82" cy="82" r="5" fill="var(--brand-500)" fillOpacity="0.3" stroke="var(--brand-400)" strokeWidth="2" />
                                    </svg>
                                </div>
                                <h3 className="empty-state__title" style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>
                                    {hasActiveFilters ? 'No matching jobs found' : 'No jobs posted yet'}
                                </h3>
                                <p className="empty-state__desc" style={{ maxWidth: 380, margin: '0 auto 1.75rem', lineHeight: 1.7 }}>
                                    {hasActiveFilters
                                        ? "We couldn't find any jobs matching your search. Try different keywords, remove some filters, or browse all available listings."
                                        : 'Be the first to discover new opportunities. Check back soon or explore all categories.'}
                                </p>
                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    {hasActiveFilters && (
                                        <button className="btn btn-secondary" onClick={() => { setSearch(''); setLocation(''); setFilters({ category: '', type: '', locationType: '', experience: '' }); }}>
                                            <RefreshCw size={14} /> Clear Filters
                                        </button>
                                    )}
                                    <Link to="/" className="btn btn-primary">
                                        Browse All Jobs <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </motion.div>
                        ) : (
                            <>
                                <div className="jobs-grid">
                                    {jobs.map((job, i) => <JobCard key={job._id || i} job={job} index={i} />)}
                                </div>

                                {/* Infinite scroll sentinel */}
                                <div ref={sentinelRef} style={{ height: 1 }} />

                                {/* Loading more indicator */}
                                {loadingMore && (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0', gap: '0.75rem', alignItems: 'center' }}>
                                        <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading more jobs…</span>
                                    </div>
                                )}

                                {/* End of results */}
                                {!hasMore && jobs.length > 0 && !loadingMore && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0', fontSize: '0.875rem' }}
                                    >
                                        ✓ You've seen all {total} job{total !== 1 ? 's' : ''}
                                    </motion.p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
