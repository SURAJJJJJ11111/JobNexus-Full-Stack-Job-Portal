import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, CheckCircle, Eye, XCircle } from 'lucide-react';
import { getMyApplications } from '../services/api';
import Spinner from '../components/Spinner';

const statusConfig: Record<string, { label: string; color: string; icon: JSX.Element }> = {
    pending: { label: 'Pending Review', color: 'var(--warning)', icon: <Clock size={14} /> },
    reviewed: { label: 'Under Review', color: 'var(--info)', icon: <Eye size={14} /> },
    shortlisted: { label: 'Shortlisted', color: 'var(--success)', icon: <CheckCircle size={14} /> },
    rejected: { label: 'Not Selected', color: 'var(--danger)', icon: <XCircle size={14} /> },
    hired: { label: 'Hired!', color: 'var(--brand-400)', icon: <CheckCircle size={14} /> },
};

export default function Applications() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyApplications()
            .then(({ data }) => setApplications(data.applications || []))
            .catch(() => setApplications([]))
            .finally(() => setLoading(false));
    }, []);

    const grouped = {
        active: applications.filter(a => ['pending', 'reviewed', 'shortlisted'].includes(a.status)),
        closed: applications.filter(a => ['rejected', 'hired'].includes(a.status)),
    };

    return (
        <div className="page">
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 className="heading-lg">My Applications</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                        Track all your job applications in one place
                    </p>
                </div>

                {/* Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { label: 'Total', value: applications.length, color: 'rgba(59,130,246,0.1)' },
                        { label: 'Active', value: grouped.active.length, color: 'rgba(16,185,129,0.1)' },
                        { label: 'Shortlisted', value: applications.filter(a => a.status === 'shortlisted' || a.status === 'hired').length, color: 'rgba(139,92,246,0.1)' },
                        { label: 'Rejected', value: applications.filter(a => a.status === 'rejected').length, color: 'rgba(239,68,68,0.1)' },
                    ].map(s => (
                        <div key={s.label} className="stat-card" style={{ background: s.color }}>
                            <div>
                                <div className="stat-card__value">{s.value}</div>
                                <div className="stat-card__label">{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {loading ? <Spinner /> : applications.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state__icon"><Briefcase size={48} color="var(--text-muted)" /></div>
                        <h3 className="empty-state__title">No applications yet</h3>
                        <p className="empty-state__desc" style={{ marginBottom: '1.5rem' }}>
                            Start applying to jobs to see your applications here.
                        </p>
                        <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
                    </div>
                ) : (
                    <>
                        {grouped.active.length > 0 && (
                            <div style={{ marginBottom: '2rem' }}>
                                <h2 className="heading-md mb-4" style={{ color: 'var(--success)' }}>🟢 Active Applications ({grouped.active.length})</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {grouped.active.map((app, i) => <ApplicationRow key={app._id} app={app} index={i} />)}
                                </div>
                            </div>
                        )}
                        {grouped.closed.length > 0 && (
                            <div>
                                <h2 className="heading-md mb-4" style={{ color: 'var(--text-muted)' }}>Closed Applications ({grouped.closed.length})</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', opacity: 0.8 }}>
                                    {grouped.closed.map((app, i) => <ApplicationRow key={app._id} app={app} index={i} />)}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function ApplicationRow({ app, index }: { app: any; index: number }) {
    const [expanded, setExpanded] = useState(false);
    const status = statusConfig[app.status] || statusConfig.pending;

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
            <div className="card" style={{ cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div className="job-card__logo" style={{ width: 44, height: 44, flexShrink: 0 }}>
                        {app.job?.company?.substring(0, 2).toUpperCase() || 'JP'}
                    </div>
                    <div style={{ flex: 1, minWidth: 180 }}>
                        <Link to={`/jobs/${app.job?._id}`} style={{ fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.95rem' }} onClick={e => e.stopPropagation()}>
                            {app.job?.title || 'Job Removed'}
                        </Link>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', color: 'var(--text-muted)', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Briefcase size={11} />{app.job?.company}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={11} />{app.job?.location}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={11} />{new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: status.color, fontWeight: 600, fontSize: '0.875rem' }}>
                        {status.icon} {status.label}
                    </div>
                </div>

                {expanded && (
                    <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', animation: 'fadeIn 0.2s both' }}>
                        <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Cover Letter</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{app.coverLetter}</p>
                        {app.employerNote && (
                            <div style={{ marginTop: '1rem', padding: '0.875rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', borderLeft: `3px solid ${status.color}` }}>
                                <h4 style={{ fontWeight: 700, marginBottom: '0.375rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Employer Note</h4>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{app.employerNote}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
