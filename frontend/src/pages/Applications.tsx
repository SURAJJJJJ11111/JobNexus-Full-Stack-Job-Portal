import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase, MapPin, Clock, CheckCircle, Eye, XCircle,
    ChevronDown, ChevronUp, Award, Send, Users
} from 'lucide-react';
import { getMyApplications } from '../services/api';
import { JobCardSkeletonGrid } from '../components/JobCardSkeleton';

// ── Timeline steps definition ────────────────────────────────────────────
const TIMELINE_STEPS = [
    { key: 'pending',     label: 'Applied',     icon: <Send size={14} /> },
    { key: 'reviewed',   label: 'Reviewed',    icon: <Eye size={14} /> },
    { key: 'shortlisted',label: 'Shortlisted', icon: <Users size={14} /> },
    { key: 'hired',      label: 'Hired',       icon: <Award size={14} /> },
];

// Maps each status to how far along the timeline it is (index)
const STATUS_STEP: Record<string, number> = {
    pending:     0,
    reviewed:    1,
    shortlisted: 2,
    hired:       3,
    rejected:    -1, // special case
};

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
    pending:     { label: 'Pending Review', color: 'var(--warning)',   bg: 'rgba(245,158,11,0.08)' },
    reviewed:    { label: 'Under Review',   color: 'var(--info)',      bg: 'rgba(6,182,212,0.08)' },
    shortlisted: { label: 'Shortlisted',    color: 'var(--success)',   bg: 'rgba(16,185,129,0.08)' },
    rejected:    { label: 'Not Selected',   color: 'var(--danger)',    bg: 'rgba(239,68,68,0.08)' },
    hired:       { label: 'Hired!',         color: 'var(--brand-400)', bg: 'rgba(59,130,246,0.08)' },
};

// ── Animated Progress Timeline ────────────────────────────────────────────
function ApplicationTimeline({ status }: { status: string }) {
    const currentStep = STATUS_STEP[status] ?? 0;
    const isRejected = status === 'rejected';

    return (
        <div style={{ padding: '1.25rem 0 0.5rem', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
                {/* Connecting line track */}
                <div style={{
                    position: 'absolute',
                    top: 18,
                    left: 18,
                    right: 18,
                    height: 3,
                    background: 'var(--bg-elevated)',
                    borderRadius: 999,
                    zIndex: 0,
                }} />
                {/* Filled progress bar */}
                {!isRejected && (
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStep / (TIMELINE_STEPS.length - 1)) * (100 - 12)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                        style={{
                            position: 'absolute',
                            top: 18,
                            left: 18,
                            height: 3,
                            background: 'linear-gradient(90deg, var(--brand-500), var(--success))',
                            borderRadius: 999,
                            zIndex: 1,
                        }}
                    />
                )}

                {/* Steps */}
                {TIMELINE_STEPS.map((step, i) => {
                    const isDone = !isRejected && i < currentStep;
                    const isCurrent = !isRejected && i === currentStep;
                    const isFuture = isRejected || i > currentStep;

                    return (
                        <div key={step.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', zIndex: 2 }}>
                            {/* Circle */}
                            <motion.div
                                initial={{ scale: 0.6, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: i * 0.1 + 0.1 }}
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    transition: 'all 0.4s',
                                    background: isDone
                                        ? 'linear-gradient(135deg, var(--brand-500), var(--success))'
                                        : isCurrent
                                            ? 'linear-gradient(135deg, var(--brand-600), var(--accent-600))'
                                            : 'var(--bg-elevated)',
                                    color: isFuture ? 'var(--text-muted)' : '#fff',
                                    border: isCurrent ? '2px solid var(--brand-400)' : '2px solid transparent',
                                    boxShadow: isCurrent ? '0 0 0 4px rgba(59,130,246,0.15)' : 'none',
                                }}
                            >
                                {isDone ? <CheckCircle size={16} /> : step.icon}
                            </motion.div>
                            {/* Label */}
                            <span style={{
                                fontSize: '0.7rem',
                                fontWeight: isCurrent ? 700 : 500,
                                color: isDone || isCurrent ? 'var(--text-primary)' : 'var(--text-muted)',
                                textAlign: 'center',
                                lineHeight: 1.3,
                            }}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Rejected pill */}
            {isRejected && (
                <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        marginTop: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '0.5rem 0.875rem',
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: 'var(--radius-md)',
                        width: 'fit-content',
                        color: 'var(--danger)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                    }}
                >
                    <XCircle size={14} /> Application closed — not selected this time
                </motion.div>
            )}
        </div>
    );
}

// ── Application Card ──────────────────────────────────────────────────────
function ApplicationCard({ app, index }: { app: any; index: number }) {
    const [expanded, setExpanded] = useState(false);
    const meta = STATUS_META[app.status] || STATUS_META.pending;
    const appliedDate = new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <div
                className="card"
                style={{
                    cursor: 'pointer',
                    border: expanded ? `1px solid ${meta.color}40` : '1px solid var(--border-subtle)',
                    transition: 'border-color 0.2s',
                    background: expanded ? meta.bg : undefined,
                }}
                onClick={() => setExpanded(v => !v)}
            >
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    {/* Company logo */}
                    <div className="job-card__logo" style={{ width: 48, height: 48, fontSize: '0.875rem', flexShrink: 0 }}>
                        {app.job?.company?.substring(0, 2).toUpperCase() || 'JP'}
                    </div>

                    {/* Title + meta */}
                    <div style={{ flex: 1, minWidth: 180 }}>
                        <Link
                            to={`/jobs/${app.job?._id}`}
                            style={{ fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none', fontSize: '1rem' }}
                            onClick={e => e.stopPropagation()}
                        >
                            {app.job?.title || 'Position Removed'}
                        </Link>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.3rem', color: 'var(--text-muted)', fontSize: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Briefcase size={11} /> {app.job?.company}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <MapPin size={11} /> {app.job?.location}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Clock size={11} /> Applied {appliedDate}
                            </span>
                        </div>
                    </div>

                    {/* Status badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                        <span style={{
                            padding: '0.3rem 0.875rem',
                            borderRadius: 999,
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: meta.color,
                            background: meta.bg,
                            border: `1px solid ${meta.color}30`,
                        }}>
                            {meta.label}
                        </span>
                        <div style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none' }}>
                            <ChevronDown size={16} />
                        </div>
                    </div>
                </div>

                {/* Expanded section */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div style={{ paddingTop: '1.25rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>

                                {/* === ANIMATED TIMELINE === */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                        Application Progress
                                    </p>
                                    <ApplicationTimeline status={app.status} />
                                </div>

                                {/* Cover letter */}
                                {app.coverLetter && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                            Your Cover Letter
                                        </p>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.75, whiteSpace: 'pre-wrap', background: 'var(--bg-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                                            {app.coverLetter}
                                        </p>
                                    </div>
                                )}

                                {/* Employer note */}
                                {app.employerNote && (
                                    <div style={{
                                        padding: '0.875rem 1rem',
                                        background: `${meta.color}0d`,
                                        borderRadius: 'var(--radius-md)',
                                        borderLeft: `3px solid ${meta.color}`,
                                    }}>
                                        <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                                            Employer Note
                                        </p>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{app.employerNote}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function Applications() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all');

    useEffect(() => {
        getMyApplications()
            .then(({ data }) => setApplications(data.applications || []))
            .catch(() => setApplications([]))
            .finally(() => setLoading(false));
    }, []);

    const active  = applications.filter(a => ['pending', 'reviewed', 'shortlisted'].includes(a.status));
    const closed  = applications.filter(a => ['rejected', 'hired'].includes(a.status));
    const visible = filter === 'active' ? active : filter === 'closed' ? closed : applications;

    return (
        <div className="page">
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: 860 }}>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
                    <h1 className="heading-lg">My Applications</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                        Track every application and its status in real time
                    </p>
                </motion.div>

                {/* Summary cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                    {[
                        { label: 'Total',       value: applications.length,                                                              color: 'var(--brand-500)',  bg: 'rgba(59,130,246,0.08)',  key: 'all' },
                        { label: 'Active',      value: active.length,                                                                   color: 'var(--success)',    bg: 'rgba(16,185,129,0.08)', key: 'active' },
                        { label: 'Shortlisted', value: applications.filter(a => a.status === 'shortlisted' || a.status === 'hired').length, color: 'var(--accent-400)', bg: 'rgba(139,92,246,0.08)', key: 'active' },
                        { label: 'Closed',      value: closed.length,                                                                   color: 'var(--text-muted)', bg: 'rgba(100,116,139,0.08)', key: 'closed' },
                    ].map((s, i) => (
                        <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                            <div
                                onClick={() => setFilter(s.key as any)}
                                style={{
                                    padding: '1rem 1.25rem',
                                    borderRadius: 'var(--radius-lg)',
                                    background: filter === s.key ? s.bg : 'var(--bg-card)',
                                    border: filter === s.key ? `1px solid ${s.color}40` : '1px solid var(--border-subtle)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* List */}
                {loading ? (
                    <JobCardSkeletonGrid count={3} />
                ) : applications.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state__icon"><Briefcase size={48} color="var(--text-muted)" /></div>
                        <h3 className="empty-state__title">No applications yet</h3>
                        <p className="empty-state__desc" style={{ marginBottom: '1.5rem' }}>Start applying to jobs to track your progress here.</p>
                        <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
                    </div>
                ) : visible.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No {filter} applications found.
                        <button onClick={() => setFilter('all')} style={{ display: 'block', margin: '0.75rem auto 0', color: 'var(--brand-400)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>
                            Show all
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {visible.map((app, i) => <ApplicationCard key={app._id} app={app} index={i} />)}
                    </div>
                )}
            </div>
        </div>
    );
}
