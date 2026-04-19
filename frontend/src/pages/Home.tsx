import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, ArrowRight, Zap, Monitor, Palette, Megaphone, DollarSign, HeartPulse, GraduationCap, Building2, TrendingUp } from 'lucide-react';
import { getJobs } from '../services/api';
import JobCard from '../components/JobCard';

const categories = [
    { icon: <Monitor size={32} />, label: 'Technology', color: 'rgba(59,130,246,0.1)' },
    { icon: <Palette size={32} />, label: 'Design', color: 'rgba(139,92,246,0.1)' },
    { icon: <Megaphone size={32} />, label: 'Marketing', color: 'rgba(245,158,11,0.1)' },
    { icon: <DollarSign size={32} />, label: 'Finance', color: 'rgba(16,185,129,0.1)' },
    { icon: <HeartPulse size={32} />, label: 'Healthcare', color: 'rgba(239,68,68,0.1)' },
    { icon: <GraduationCap size={32} />, label: 'Education', color: 'rgba(99,102,241,0.1)' },
];

export default function Home() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchLocation, setSearchLocation] = useState('');
    const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);

    useEffect(() => {
        getJobs({ limit: 6 }).then(({ data }) => setFeaturedJobs(data.jobs || [])).catch(() => { });
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        navigate(`/jobs?search=${searchQuery}&location=${searchLocation}`);
    };

    return (
        <div>
            {/* Hero */}
            <section className="hero">
                <div className="hero__bg" />
                <div className="hero__grid" />
                <div className="hero__content">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <div className="hero__tag">
                            <Zap size={12} /> Now live — 1,200+ jobs posted this week
                        </div>
                        <h1 className="heading-xl hero__title">
                            Find Your <span className="text-gradient">Dream Career</span><br />
                            Start Today
                        </h1>
                        <p className="hero__subtitle">
                            Connect with world-class companies. Discover opportunities that match your skills, passion, and ambition.
                        </p>
                    </motion.div>

                    {/* Search Bar */}
                    <motion.form
                        onSubmit={handleSearch}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <div className="search-bar">
                            <Search size={18} style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', flexShrink: 0 }} />
                            <input
                                type="text"
                                placeholder="Job title, keyword, or company"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                            <div className="search-divider" />
                            <MapPin size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                            <input
                                type="text"
                                placeholder="City or remote"
                                value={searchLocation}
                                onChange={e => setSearchLocation(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
                                Search <ArrowRight size={15} />
                            </button>
                        </div>
                    </motion.form>

                    {/* Stats */}
                    <motion.div
                        className="hero__stats"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        {[
                            { value: '50K+', label: 'Active Jobs' },
                            { value: '12K+', label: 'Companies' },
                            { value: '2M+', label: 'Job Seekers' },
                            { value: '98%', label: 'Satisfaction Rate' },
                        ].map(s => (
                            <div key={s.label} className="hero__stat">
                                <div className="hero__stat-number">{s.value}</div>
                                <div className="hero__stat-label">{s.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Categories */}
            <section className="section" style={{ background: 'var(--bg-surface)' }}>
                <div className="container">
                    <div className="text-center mb-8">
                        <h2 className="heading-lg mb-4">Browse by Category</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Explore thousands of jobs across industries</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                        {categories.map((cat, i) => (
                            <motion.div
                                key={cat.label}
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.07 }}
                            >
                                <Link
                                    to={`/jobs?category=${cat.label}`}
                                    style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                                        padding: '1.5rem 1rem', borderRadius: 'var(--radius-lg)',
                                        background: cat.color, border: '1px solid var(--border-subtle)',
                                        color: 'var(--text-primary)', textDecoration: 'none',
                                        transition: 'all 0.2s', fontWeight: 600, fontSize: '0.9rem',
                                    }}
                                    className="card"
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cat.icon}</span>
                                    {cat.label}
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Jobs */}
            {featuredJobs.length > 0 && (
                <section className="section">
                    <div className="container">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h2 className="heading-lg">Latest Opportunities</h2>
                                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Hand-picked jobs for you</p>
                            </div>
                            <Link to="/jobs" className="btn btn-secondary">
                                View All Jobs <ArrowRight size={15} />
                            </Link>
                        </div>
                        <div className="jobs-grid">
                            {featuredJobs.map((job, i) => <JobCard key={job._id} job={job} index={i} />)}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Banner */}
            <section style={{ padding: '5rem 1.5rem', background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(124,58,237,0.12))', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="container text-center">
                    <Building2 size={40} style={{ margin: '0 auto 1rem', color: 'var(--brand-400)' }} />
                    <h2 className="heading-lg mb-4">Hiring? Post Your First Job Free</h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 2rem' }}>
                        Reach thousands of qualified candidates. Post your job listing in minutes.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Post a Job <ArrowRight size={16} />
                        </Link>
                        <Link to="/jobs" className="btn btn-secondary btn-lg">Browse Talent</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
