import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ShieldAlert, Users, Briefcase, FileText, Trash2,
    TrendingUp, Building2, UserCheck, UserPlus, BarChart3,
    CheckCircle, Clock, Eye, XCircle, Award
} from 'lucide-react';
import { getAdminStats, getAdminUsers, getAdminJobs, deleteUser, deleteAdminJob } from '../services/api';
import { JobCardSkeletonGrid } from '../components/JobCardSkeleton';
import toast from 'react-hot-toast';

// ── Tiny pure-CSS bar chart (no external lib needed) ──────────────────────
function MiniBarChart({ data }: { data: { label: string; count: number }[] }) {
    const max = Math.max(...data.map(d => d.count), 1);
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 80, padding: '0 0.25rem' }}>
            {data.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>{d.count || ''}</span>
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max((d.count / max) * 60, d.count > 0 ? 4 : 0)}px` }}
                        transition={{ delay: i * 0.05, duration: 0.5, type: 'spring' }}
                        style={{
                            width: '100%',
                            background: d.count > 0
                                ? 'linear-gradient(180deg, var(--brand-500), var(--accent-500))'
                                : 'var(--bg-hover)',
                            borderRadius: '4px 4px 0 0',
                            minHeight: 3,
                        }}
                    />
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2 }}>
                        {d.label.split(' ')[0]}
                    </span>
                </div>
            ))}
        </div>
    );
}

// ── Horizontal progress bar ──────────────────────────────────────────────
function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div style={{ background: 'var(--bg-elevated)', borderRadius: 999, height: 6, overflow: 'hidden' }}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: 0.1 }}
                style={{ height: '100%', background: color, borderRadius: 999 }}
            />
        </div>
    );
}

const STATUS_META: Record<string, { label: string; color: string; icon: JSX.Element }> = {
    pending:     { label: 'Pending',     color: 'var(--warning)',  icon: <Clock size={14} /> },
    reviewed:    { label: 'Reviewed',    color: 'var(--info)',     icon: <Eye size={14} /> },
    shortlisted: { label: 'Shortlisted', color: 'var(--success)',  icon: <CheckCircle size={14} /> },
    rejected:    { label: 'Rejected',    color: 'var(--danger)',   icon: <XCircle size={14} /> },
    hired:       { label: 'Hired',       color: 'var(--brand-400)', icon: <Award size={14} /> },
};

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'users' | 'jobs'>('users');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [stRes, usRes, jbRes] = await Promise.all([
                getAdminStats(),
                getAdminUsers(),
                getAdminJobs()
            ]);
            setStats(stRes.data.stats);
            setUsers(usRes.data.users || []);
            setJobs(jbRes.data.jobs || []);
        } catch {
            toast.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDeleteUser = async (id: string) => {
        if (!window.confirm('Delete this user? All their data will be permanently destroyed.')) return;
        try {
            await deleteUser(id);
            setUsers(u => u.filter(x => x._id !== id));
            toast.success('User deleted');
        } catch { toast.error('Failed to delete user'); }
    };

    const handleDeleteJob = async (id: string) => {
        if (!window.confirm('Delete this job? All associated applications will be destroyed.')) return;
        try {
            await deleteAdminJob(id);
            setJobs(j => j.filter(x => x._id !== id));
            toast.success('Job deleted');
        } catch { toast.error('Failed to delete job'); }
    };

    const topAppCount = stats?.funnel?.reduce((m: number, f: any) => Math.max(m, f.count), 1) || 1;

    return (
        /* padding-top: 80px fixes the navbar overlap */
        <div style={{ paddingTop: 80, minHeight: '100vh', paddingBottom: '4rem', background: 'var(--bg-base)' }}>
            <div className="container">
                {/* ── Header ─────────────────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ margin: '2rem 0 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: 'var(--radius-lg)',
                            background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.08))',
                            border: '1px solid rgba(239,68,68,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444'
                        }}>
                            <ShieldAlert size={26} />
                        </div>
                        <div>
                            <h1 className="heading-lg" style={{ marginBottom: 2 }}>Admin Control Panel</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Full platform overview & management</p>
                        </div>
                    </div>
                </motion.div>

                {loading ? (
                    <div style={{ marginTop: '1rem' }}><JobCardSkeletonGrid count={3} /></div>
                ) : (
                    <>
                        {/* ── KPI Cards Row ──────────────────────────────── */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                            {[
                                { icon: <Users size={22} />, label: 'Total Users',        value: stats?.users || 0,        color: 'rgba(59,130,246,0.12)',  accent: 'var(--brand-500)' },
                                { icon: <UserCheck size={22} />, label: 'Job Seekers',    value: stats?.seekers || 0,      color: 'rgba(16,185,129,0.12)',  accent: 'var(--success)' },
                                { icon: <Building2 size={22} />, label: 'Employers',      value: stats?.employers || 0,    color: 'rgba(139,92,246,0.12)', accent: 'var(--accent-500)' },
                                { icon: <Briefcase size={22} />, label: 'Total Jobs',     value: stats?.jobs || 0,         color: 'rgba(245,158,11,0.12)', accent: 'var(--warning)' },
                                { icon: <FileText size={22} />,  label: 'Applications',   value: stats?.applications || 0, color: 'rgba(6,182,212,0.12)',  accent: 'var(--info)' },
                                { icon: <UserPlus size={22} />,  label: 'New This Week',  value: stats?.newUsersThisWeek || 0, color: 'rgba(239,68,68,0.08)', accent: '#ef4444' },
                            ].map((s, i) => (
                                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                                    <div className="stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
                                        <div style={{
                                            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                                            background: `linear-gradient(90deg, ${s.accent}, transparent)`
                                        }} />
                                        <div className="stat-card__icon" style={{ background: s.color, color: s.accent }}>{s.icon}</div>
                                        <div>
                                            <div className="stat-card__value">{s.value.toLocaleString('en-IN')}</div>
                                            <div className="stat-card__label">{s.label}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* ── Charts Row ─────────────────────────────────── */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>

                            {/* Jobs posted last 7 days */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                                className="card" style={{ gridColumn: 'span 2' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                                    <BarChart3 size={18} color="var(--brand-400)" />
                                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Jobs Posted — Last 7 Days</span>
                                </div>
                                <MiniBarChart data={stats?.jobsPerDay || []} />
                            </motion.div>

                            {/* Application funnel */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                                className="card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                                    <TrendingUp size={18} color="var(--accent-400)" />
                                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Application Funnel</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {(stats?.funnel || []).length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No applications yet</p>
                                    ) : (
                                        (stats?.funnel || []).map((f: any) => {
                                            const meta = STATUS_META[f.status] || { label: f.status, color: 'var(--text-muted)', icon: null };
                                            return (
                                                <div key={f.status}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.8rem' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: meta.color }}>
                                                            {meta.icon} {meta.label}
                                                        </span>
                                                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{f.count}</span>
                                                    </div>
                                                    <ProgressBar value={f.count} max={topAppCount} color={meta.color} />
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* ── Most Active Companies ──────────────────────── */}
                        {stats?.topCompanies?.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                                className="card" style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
                                    <Building2 size={18} color="var(--warning)" />
                                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Most Active Companies</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.875rem' }}>
                                    {stats.topCompanies.map((c: any, i: number) => (
                                        <div key={c.name} style={{
                                            display: 'flex', alignItems: 'center', gap: '0.875rem',
                                            padding: '0.875rem', background: 'var(--bg-elevated)',
                                            borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)'
                                        }}>
                                            <div style={{
                                                width: 38, height: 38, borderRadius: 8, flexShrink: 0,
                                                background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-400)',
                                            }}>
                                                {i + 1}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                                    {c.jobs} job{c.jobs !== 1 ? 's' : ''} · {c.applications} applicant{c.applications !== 1 ? 's' : ''}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* ── Data Tables ────────────────────────────────── */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                            className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            {/* Tabs */}
                            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)' }}>
                                {(['users', 'jobs'] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        style={{
                                            flex: 1, padding: '1rem', fontWeight: 600, fontSize: '0.875rem',
                                            background: activeTab === tab ? 'var(--bg-surface)' : 'transparent',
                                            borderBottom: activeTab === tab ? '2px solid var(--brand-500)' : '2px solid transparent',
                                            color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                                            border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                        }}
                                    >
                                        {tab === 'users' ? <><Users size={15} /> Users ({users.length})</> : <><Briefcase size={15} /> Jobs ({jobs.length})</>}
                                    </button>
                                ))}
                            </div>

                            <div style={{ padding: '1.5rem', overflowX: 'auto' }}>
                                {activeTab === 'users' && (
                                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: 500 }}>
                                        <thead>
                                            <tr style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                                <th style={{ paddingBottom: '0.875rem' }}>Name</th>
                                                <th style={{ paddingBottom: '0.875rem' }}>Email</th>
                                                <th style={{ paddingBottom: '0.875rem' }}>Role</th>
                                                <th style={{ paddingBottom: '0.875rem' }}>Joined</th>
                                                <th style={{ paddingBottom: '0.875rem', textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((u, i) => (
                                                <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                                                    style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                                    <td style={{ padding: '0.875rem 0', fontWeight: 600 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <div style={{
                                                                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                                                background: 'linear-gradient(135deg, var(--brand-600), var(--accent-600))',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                fontSize: '0.75rem', fontWeight: 800, color: '#fff'
                                                            }}>{u.name?.charAt(0).toUpperCase()}</div>
                                                            {u.name}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '0.875rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{u.email}</td>
                                                    <td style={{ padding: '0.875rem 0' }}>
                                                        <span className={`badge badge-${u.role === 'admin' ? 'red' : u.role === 'employer' ? 'purple' : 'blue'}`}>{u.role}</span>
                                                    </td>
                                                    <td style={{ padding: '0.875rem 0', color: 'var(--text-muted)', fontSize: '0.825rem' }}>{new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</td>
                                                    <td style={{ padding: '0.875rem 0', textAlign: 'right' }}>
                                                        <button className="btn btn-danger btn-sm" disabled={u.role === 'admin'} onClick={() => handleDeleteUser(u._id)}>
                                                            <Trash2 size={13} /> Delete
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                                {activeTab === 'jobs' && (
                                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: 600 }}>
                                        <thead>
                                            <tr style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                                <th style={{ paddingBottom: '0.875rem' }}>Job Title</th>
                                                <th style={{ paddingBottom: '0.875rem' }}>Company</th>
                                                <th style={{ paddingBottom: '0.875rem', textAlign: 'center' }}>Apps</th>
                                                <th style={{ paddingBottom: '0.875rem', textAlign: 'center' }}>Views</th>
                                                <th style={{ paddingBottom: '0.875rem' }}>Status</th>
                                                <th style={{ paddingBottom: '0.875rem' }}>Posted</th>
                                                <th style={{ paddingBottom: '0.875rem', textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {jobs.map((j, i) => (
                                                <motion.tr key={j._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                                                    style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                                    <td style={{ padding: '0.875rem 0', fontWeight: 600, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.title}</td>
                                                    <td style={{ padding: '0.875rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{j.company}</td>
                                                    <td style={{ padding: '0.875rem 0', textAlign: 'center', fontWeight: 700, color: 'var(--brand-400)' }}>{j.applicationsCount || 0}</td>
                                                    <td style={{ padding: '0.875rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>{j.views || 0}</td>
                                                    <td style={{ padding: '0.875rem 0' }}>
                                                        <span className={`badge badge-${j.status === 'open' ? 'green' : 'gray'}`}>{j.status}</span>
                                                    </td>
                                                    <td style={{ padding: '0.875rem 0', color: 'var(--text-muted)', fontSize: '0.825rem' }}>{new Date(j.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                                                    <td style={{ padding: '0.875rem 0', textAlign: 'right' }}>
                                                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteJob(j._id)}>
                                                            <Trash2 size={13} /> Delete
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    );
}
