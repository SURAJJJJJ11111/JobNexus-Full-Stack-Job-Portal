import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Briefcase, Plus, Eye, CheckCircle, Clock, Inbox, FileText,
    CheckCircle2, TrendingUp, X, Trash2, BarChart3, Users,
    Award, XCircle, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyJobs, getMyApplications, deleteJob } from '../services/api';
import { JobCardSkeletonGrid } from '../components/JobCardSkeleton';
import toast from 'react-hot-toast';

// ── Horizontal bar row ───────────────────────────────────────────────────
function MetricRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{label}</span>
                <span style={{ fontWeight: 700, color }}>{value}</span>
            </div>
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 999, height: 5, overflow: 'hidden' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6 }}
                    style={{ height: '100%', background: color, borderRadius: 999 }}
                />
            </div>
        </div>
    );
}

const STATUS_META: Record<string, { label: string; color: string; bgColor: string; icon: JSX.Element }> = {
    pending:     { label: 'Pending',     color: 'var(--warning)',   bgColor: 'rgba(245,158,11,0.1)',   icon: <Clock size={13} /> },
    reviewed:    { label: 'Reviewed',    color: 'var(--info)',      bgColor: 'rgba(6,182,212,0.1)',    icon: <Eye size={13} /> },
    shortlisted: { label: 'Shortlisted', color: 'var(--success)',   bgColor: 'rgba(16,185,129,0.1)',   icon: <CheckCircle size={13} /> },
    rejected:    { label: 'Rejected',    color: 'var(--danger)',    bgColor: 'rgba(239,68,68,0.1)',    icon: <XCircle size={13} /> },
    hired:       { label: 'Hired',       color: 'var(--brand-400)', bgColor: 'rgba(59,130,246,0.1)',  icon: <Award size={13} /> },
};

export default function Dashboard() {
    const { user } = useAuth();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState<'overview' | 'list'>('overview');

    const fetchData = async () => {
        setLoading(true);
        try {
            if (user?.role === 'employer') {
                const { data: d } = await getMyJobs();
                setData(d.jobs || []);
            } else {
                const { data: d } = await getMyApplications();
                setData(d.applications || []);
            }
        } catch { setData([]); } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [user]);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this job posting? All applications will be lost.')) return;
        try { await deleteJob(id); toast.success('Job deleted'); fetchData(); }
        catch { toast.error('Failed to delete'); }
    };

    const statusIcon: Record<string, JSX.Element> = {
        pending:     <Clock size={14} style={{ color: 'var(--warning)' }} />,
        reviewed:    <Eye size={14} style={{ color: 'var(--info)' }} />,
        shortlisted: <CheckCircle size={14} style={{ color: 'var(--success)' }} />,
        rejected:    <X size={14} style={{ color: 'var(--danger)' }} />,
        hired:       <CheckCircle size={14} style={{ color: 'var(--brand-400)' }} />,
    };

    // ── Employer analytics ──────────────────────────────────────────────
    const totalApps  = data.reduce((a, j) => a + (j.applicationsCount || 0), 0);
    const totalViews = data.reduce((a, j) => a + (j.views || 0), 0);
    const openJobs   = data.filter(j => j.status === 'open').length;
    const mostPopular = [...data].sort((a, b) => (b.applicationsCount || 0) - (a.applicationsCount || 0))[0];
    const maxApps    = Math.max(...data.map(j => j.applicationsCount || 0), 1);
    const maxViews   = Math.max(...data.map(j => j.views || 0), 1);

    const employerStats = [
        { icon: <Briefcase size={22} />,   label: 'Total Jobs',       value: data.length,  color: 'rgba(59,130,246,0.12)',  accent: 'var(--brand-500)' },
        { icon: <CheckCircle2 size={22} />, label: 'Open Jobs',       value: openJobs,     color: 'rgba(16,185,129,0.12)', accent: 'var(--success)' },
        { icon: <Users size={22} />,        label: 'Total Applicants', value: totalApps,    color: 'rgba(139,92,246,0.12)', accent: 'var(--accent-500)' },
        { icon: <TrendingUp size={22} />,   label: 'Total Views',      value: totalViews,   color: 'rgba(245,158,11,0.12)', accent: 'var(--warning)' },
    ];

    // ── Seeker analytics ────────────────────────────────────────────────
    const seekerStats = [
        { icon: <FileText size={22} />,    label: 'Applied',     value: data.length, color: 'rgba(59,130,246,0.12)',  accent: 'var(--brand-500)' },
        { icon: <CheckCircle2 size={22} />, label: 'Shortlisted', value: data.filter((a) => a.status === 'shortlisted' || a.status === 'hired').length, color: 'rgba(16,185,129,0.12)', accent: 'var(--success)' },
        { icon: <Clock size={22} />,       label: 'Pending',     value: data.filter((a) => a.status === 'pending').length, color: 'rgba(245,158,11,0.12)', accent: 'var(--warning)' },
        { icon: <Eye size={22} />,         label: 'Reviewed',    value: data.filter((a) => a.status === 'reviewed').length, color: 'rgba(139,92,246,0.12)', accent: 'var(--accent-500)' },
    ];

    const stats = user?.role === 'employer' ? employerStats : seekerStats;

    return (
        <div className="dashboard">
            <div className="container">
                {/* ── Welcome Bar ─────────────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ margin: '2rem 0 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1 className="heading-lg">
                                Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span>
                            </h1>
                            <p style={{ color: 'var(--text-muted)', marginTop: '0.375rem', fontSize: '0.9rem' }}>
                                {user?.role === 'employer' ? 'Manage your job postings and discover top talent' : 'Track your applications and land your dream job'}
                            </p>
                        </div>
                        {user?.role === 'employer' && (
                            <Link to="/post-job" className="btn btn-primary">
                                <Plus size={15} /> Post a Job
                            </Link>
                        )}
                    </div>
                </motion.div>

                {loading ? (
                    <JobCardSkeletonGrid count={4} />
                ) : (
                    <>
                        {/* ── KPI Stats ───────────────────────────────────── */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                            {stats.map((s, i) => (
                                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                                    <div className="stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${s.accent}, transparent)` }} />
                                        <div className="stat-card__icon" style={{ background: s.color, color: s.accent }}>{s.icon}</div>
                                        <div>
                                            <div className="stat-card__value">{s.value.toLocaleString('en-IN')}</div>
                                            <div className="stat-card__label">{s.label}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* ── Employer-specific analytics section ─────────── */}
                        {user?.role === 'employer' && data.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                {/* Applicants per job */}
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                                    className="card">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
                                        <Users size={17} color="var(--brand-400)" />
                                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Applicants per Job</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                        {data.slice(0, 5).map(j => (
                                            <MetricRow key={j._id} label={j.title} value={j.applicationsCount || 0} max={maxApps} color="var(--brand-400)" />
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Views per job + star listing */}
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                                    style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                                    {/* Views per job */}
                                    <div className="card" style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
                                            <BarChart3 size={17} color="var(--accent-400)" />
                                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Views per Job</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                            {data.slice(0, 5).map(j => (
                                                <MetricRow key={j._id} label={j.title} value={j.views || 0} max={maxViews} color="var(--accent-400)" />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Star job */}
                                    {mostPopular && (
                                        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))', border: '1px solid rgba(59,130,246,0.2)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.625rem' }}>
                                                <Award size={16} color="var(--warning)" />
                                                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Top Job Post</span>
                                            </div>
                                            <div style={{ fontWeight: 700, marginBottom: 4 }}>{mostPopular.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {mostPopular.applicationsCount || 0} applicants · {mostPopular.views || 0} views
                                            </div>
                                            <Link to={`/manage/jobs/${mostPopular._id}`} className="btn btn-secondary btn-sm" style={{ marginTop: '0.875rem', display: 'inline-flex' }}>
                                                Manage <ChevronRight size={13} />
                                            </Link>
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        )}

                        {/* ── Seeker: application status breakdown ─────────── */}
                        {user?.role === 'seeker' && data.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                                className="card" style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
                                    <BarChart3 size={17} color="var(--brand-400)" />
                                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Application Status Breakdown</span>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    {Object.entries(STATUS_META).map(([status, meta]) => {
                                        const count = data.filter(a => a.status === status).length;
                                        return (
                                            <div key={status} style={{
                                                padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)',
                                                background: meta.bgColor, border: `1px solid ${meta.color}33`,
                                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            }}>
                                                <span style={{ color: meta.color }}>{meta.icon}</span>
                                                <span style={{ fontWeight: 700, color: meta.color, fontSize: '1.1rem' }}>{count}</span>
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{meta.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {/* ── Content List ────────────────────────────────── */}
                        {data.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
                                <div className="empty-state__icon"><Inbox size={48} color="var(--text-muted)" /></div>
                                <h3 className="empty-state__title">
                                    {user?.role === 'employer' ? 'No job postings yet' : 'No applications yet'}
                                </h3>
                                <p className="empty-state__desc" style={{ marginBottom: '1.5rem' }}>
                                    {user?.role === 'employer' ? 'Start attracting top talent by posting your first job.' : 'Browse open positions and apply to get started.'}
                                </p>
                                <Link to={user?.role === 'employer' ? '/post-job' : '/jobs'} className="btn btn-primary">
                                    {user?.role === 'employer' ? <><Plus size={14} /> Post a Job</> : 'Browse Jobs'}
                                </Link>
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                                <h2 className="heading-md mb-4">
                                    {user?.role === 'employer' ? 'Your Job Listings' : 'Recent Applications'}
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                    {data.map((item, i) => (
                                        <motion.div key={item._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                                            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', transition: 'all 0.2s' }}>
                                                {user?.role === 'employer' ? (
                                                    <>
                                                        <div style={{ flex: 1, minWidth: 200 }}>
                                                            <Link to={`/manage/jobs/${item._id}`} style={{ fontWeight: 700, fontSize: '1rem', textDecoration: 'none', color: 'var(--text-primary)' }}>
                                                                {item.title}
                                                            </Link>
                                                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.375rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                                                <span className={`badge ${item.status === 'open' ? 'badge-green' : 'badge-gray'}`}>{item.status}</span>
                                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.location} · {item.type}</span>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                                                            <div style={{ textAlign: 'center' }}>
                                                                <div style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--brand-400)' }}>{item.applicationsCount || 0}</div>
                                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Applicants</div>
                                                            </div>
                                                            <div style={{ textAlign: 'center' }}>
                                                                <div style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--text-secondary)' }}>{item.views || 0}</div>
                                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Views</div>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                <Link to={`/manage/jobs/${item._id}`} className="btn btn-ghost btn-icon btn-sm" title="Manage"><Eye size={14} /></Link>
                                                                <button className="btn btn-danger btn-icon btn-sm" title="Delete" onClick={() => handleDelete(item._id)}><Trash2 size={14} /></button>
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div style={{ flex: 1, minWidth: 200 }}>
                                                            <Link to={`/jobs/${item.job?._id}`} style={{ fontWeight: 700, textDecoration: 'none', color: 'var(--text-primary)' }}>
                                                                {item.job?.title}
                                                            </Link>
                                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                                {item.job?.company} · {item.job?.location}
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                                            {statusIcon[item.status]}
                                                            <span className={`status-${item.status}`} style={{ fontWeight: 600, fontSize: '0.875rem', textTransform: 'capitalize' }}>
                                                                {item.status}
                                                            </span>
                                                        </div>
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                            {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
