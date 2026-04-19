import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, X } from 'lucide-react';
import { getJobs } from '../services/api';
import JobCard from '../components/JobCard';
import Spinner from '../components/Spinner';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'freelance'];
const LOCATION_TYPES = ['remote', 'onsite', 'hybrid'];
const CATEGORIES = ['Technology', 'Design', 'Marketing', 'Finance', 'Healthcare', 'Education', 'Sales', 'Engineering', 'HR', 'Other'];
const EXPERIENCE = ['entry', 'mid', 'senior', 'lead'];

export default function Jobs() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [jobs, setJobs] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [location, setLocation] = useState(searchParams.get('location') || '');
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        type: '', locationType: '', experience: '',
    });
    const [showFilters, setShowFilters] = useState(false);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const params: any = { page, limit: 12, ...filters };
            if (search) params.search = search;
            if (location) params.location = location;
            Object.keys(params).forEach(k => !params[k] && delete params[k]);
            const { data } = await getJobs(params);
            setJobs(data.jobs || []);
            setTotal(data.total || 0);
            setPages(data.pages || 1);
        } catch { setJobs([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchJobs(); }, [page, filters]);

    const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchJobs(); };
    const clearFilter = (key: string) => setFilters(p => ({ ...p, [key]: '' }));
    const activeFilters = Object.entries(filters).filter(([, v]) => v);

    return (
        <div className="page">
            {/* Header */}
            <div className="page__header" style={{ background: 'var(--bg-surface)' }}>
                <div className="container">
                    <h1 className="heading-lg mb-4">Browse Jobs</h1>
                    <form onSubmit={handleSearch}>
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
                            <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>Search</button>
                            <button type="button" className="btn btn-secondary btn-icon" onClick={() => setShowFilters(!showFilters)} title="Filters">
                                <SlidersHorizontal size={16} />
                            </button>
                        </div>
                    </form>
                    {/* Active filters */}
                    {activeFilters.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                            {activeFilters.map(([k, v]) => (
                                <span key={k} className="badge badge-blue" style={{ gap: '0.375rem', cursor: 'pointer' }} onClick={() => clearFilter(k)}>
                                    {v} <X size={11} />
                                </span>
                            ))}
                            <button className="badge badge-gray" style={{ cursor: 'pointer' }} onClick={() => setFilters({ category: '', type: '', locationType: '', experience: '' })}>
                                Clear all
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: showFilters ? '260px 1fr' : '1fr', gap: '2rem', alignItems: 'start' }}>
                    {/* Filters Sidebar */}
                    {showFilters && (
                        <div className="filters">
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
                        </div>
                    )}

                    {/* Results */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                {loading ? 'Loading...' : `${total} job${total !== 1 ? 's' : ''} found`}
                            </p>
                        </div>
                        {loading ? <Spinner /> : jobs.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state__icon"><Search size={48} color="var(--text-muted)" /></div>
                                <h3 className="empty-state__title">No jobs found</h3>
                                <p className="empty-state__desc">Try adjusting your search or removing filters.</p>
                            </div>
                        ) : (
                            <>
                                <div className="jobs-grid">
                                    {jobs.map((job, i) => <JobCard key={job._id} job={job} index={i} />)}
                                </div>
                                {/* Pagination */}
                                {pages > 1 && (
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                                        {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                                            <button
                                                key={p}
                                                className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`}
                                                onClick={() => setPage(p)}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
