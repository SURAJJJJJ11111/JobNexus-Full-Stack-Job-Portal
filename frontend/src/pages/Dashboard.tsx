import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Plus, Eye, CheckCircle, Clock, Save, BarChart3, Inbox, FileText, CheckCircle2, TrendingUp, X, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyJobs, getMyApplications, deleteJob } from '../services/api';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const { user } = useAuth();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
        if (!confirm('Delete this job posting?')) return;
        try { await deleteJob(id); toast.success('Job deleted'); fetchData(); }
        catch { toast.error('Failed to delete'); }
    };

    const statusIcon: Record<string, JSX.Element> = {
        pending: <Clock size={14} style={{ color: 'var(--warning)' }} />,
        reviewed: <Eye size={14} style={{ color: 'var(--info)' }} />,
        shortlisted: <CheckCircle size={14} style={{ color: 'var(--success)' }} />,
        rejected: <X size={14} style={{ color: 'var(--danger)' }} />,
        hired: <CheckCircle size={14} style={{ color: 'var(--brand-400)' }} />,
    };

    const stats = user?.role === 'employer'
        ? [
            { icon: <Briefcase size={24} />, label: 'Total Jobs', value: data.length, color: 'rgba(59,130,246,0.12)' },
            { icon: <CheckCircle2 size={24} />, label: 'Open Jobs', value: data.filter((j: any) => j.status === 'open').length, color: 'rgba(16,185,129,0.12)' },
            { icon: <Inbox size={24} />, label: 'Total Applications', value: data.reduce((a: number, j: any) => a + (j.applicationsCount || 0), 0), color: 'rgba(139,92,246,0.12)' },
            { icon: <TrendingUp size={24} />, label: 'Total Views', value: data.reduce((a: number, j: any) => a + (j.views || 0), 0), color: 'rgba(245,158,11,0.12)' },
        ]
        : [
            { icon: <FileText size={24} />, label: 'Applied', value: data.length, color: 'rgba(59,130,246,0.12)' },
            { icon: <CheckCircle2 size={24} />, label: 'Shortlisted', value: data.filter((a: any) => a.status === 'shortlisted' || a.status === 'hired').length, color: 'rgba(16,185,129,0.12)' },
            { icon: <Clock size={24} />, label: 'Pending', value: data.filter((a: any) => a.status === 'pending').length, color: 'rgba(245,158,11,0.12)' },
            { icon: <Eye size={24} />, label: 'Reviewed', value: data.filter((a: any) => a.status === 'reviewed').length, color: 'rgba(139,92,246,0.12)' },
        ];

    return (
        <div className="dashboard">
            <div className="container">
                {/* Welcome */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ margin: '2rem 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1 className="heading-lg">
                                Welcome, {user?.name?.split(' ')[0]}
                            </h1>
                            <p style={{ color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                                {user?.role === 'employer' ? 'Manage your job postings and applications' : 'Track your job applications'}
                            </p>
                        </div>
                        {user?.role === 'employer' && (
                            <Link to="/post-job" className="btn btn-primary">
                                <Plus size={15} /> Post a Job
                            </Link>
                        )}
                    </div>
                </motion.div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {stats.map((s, i) => (
                        <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                            <div className="stat-card">
                                <div className="stat-card__icon" style={{ background: s.color, fontSize: '1.5rem' }}>{s.icon}</div>
                                <div>
                                    <div className="stat-card__value">{s.value}</div>
                                    <div className="stat-card__label">{s.label}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Content */}
                {loading ? <Spinner /> : data.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state__icon"><Inbox size={48} color="var(--text-muted)" /></div>
                        <h3 className="empty-state__title">
                            {user?.role === 'employer' ? 'No job postings yet' : 'No applications yet'}
                        </h3>
                        <p className="empty-state__desc" style={{ marginBottom: '1.5rem' }}>
                            {user?.role === 'employer' ? 'Start by posting your first job.' : 'Browse jobs and apply to get started.'}
                        </p>
                        <Link to={user?.role === 'employer' ? '/post-job' : '/jobs'} className="btn btn-primary">
                            {user?.role === 'employer' ? 'Post a Job' : 'Browse Jobs'}
                        </Link>
                    </div>
                ) : (
                    <>
                        <h2 className="heading-md mb-4">
                            {user?.role === 'employer' ? 'Your Job Listings' : 'Recent Applications'}
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {data.map((item: any, i: number) => (
                                <motion.div key={item._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                                    <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                                        {user?.role === 'employer' ? (
                                            <>
                                                <div style={{ flex: 1, minWidth: 200 }}>
                                                    <Link to={`/manage/jobs/${item._id}`} style={{ fontWeight: 700, fontSize: '1rem', textDecoration: 'none', color: 'var(--text-primary)' }}>
                                                        {item.title}
                                                    </Link>
                                                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.375rem', flexWrap: 'wrap' }}>
                                                        <span className={`badge ${item.status === 'open' ? 'badge-green' : 'badge-gray'}`}>{item.status}</span>
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.location} · {item.type}</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>{item.applicationsCount || 0}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Applicants</div>
                                                    </div>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>{item.views || 0}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Views</div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <Link to={`/manage/jobs/${item._id}`} className="btn btn-ghost btn-icon btn-sm"><Eye size={14} /></Link>
                                                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(item._id)}><Trash2 size={14} /></button>
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
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                    </>
                )}
            </div>
        </div>
    );
}
