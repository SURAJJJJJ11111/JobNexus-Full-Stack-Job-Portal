import { useState, useEffect } from 'react';
import { ShieldAlert, Users, Briefcase, Trash2 } from 'lucide-react';
import { getAdminStats, getAdminUsers, getAdminJobs, deleteUser, deleteAdminJob } from '../services/api';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

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
        } catch (error) {
            toast.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDeleteUser = async (id: string) => {
        if (!window.confirm('Delete this user? All their data will be destroyed.')) return;
        try {
            await deleteUser(id);
            setUsers(users.filter(u => u._id !== id));
            toast.success('User deleted');
        } catch { toast.error('Failed to delete user'); }
    };

    const handleDeleteJob = async (id: string) => {
        if (!window.confirm('Delete this job? All associated applications will be destroyed.')) return;
        try {
            await deleteAdminJob(id);
            setJobs(jobs.filter(j => j._id !== id));
            toast.success('Job deleted');
        } catch { toast.error('Failed to delete job'); }
    };

    if (loading) return <Spinner />;

    return (
        <div className="page" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <div className="container">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <h1 className="heading-lg">Admin Control Panel</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Ultimate system access</p>
                    </div>
                </div>

                <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                    <div className="stat-card">
                        <div className="stat-card__icon" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--brand-500)' }}><Users size={24} /></div>
                        <div><div className="stat-card__label">Total Users</div><div className="stat-card__value">{stats?.users || 0}</div></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card__icon" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}><Briefcase size={24} /></div>
                        <div><div className="stat-card__label">Total Jobs</div><div className="stat-card__value">{stats?.jobs || 0}</div></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card__icon" style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--accent-500)' }}><Briefcase size={24} /></div>
                        <div><div className="stat-card__label">Total Applications</div><div className="stat-card__value">{stats?.applications || 0}</div></div>
                    </div>
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)' }}>
                        <button className={`btn ${activeTab === 'users' ? 'btn-ghost' : ''}`} style={{ flex: 1, borderRadius: 0, background: activeTab === 'users' ? 'var(--bg-surface)' : 'transparent', borderBottom: activeTab === 'users' ? '2px solid var(--brand-500)' : 'none' }} onClick={() => setActiveTab('users')}>Users</button>
                        <button className={`btn ${activeTab === 'jobs' ? 'btn-ghost' : ''}`} style={{ flex: 1, borderRadius: 0, background: activeTab === 'jobs' ? 'var(--bg-surface)' : 'transparent', borderBottom: activeTab === 'jobs' ? '2px solid var(--brand-500)' : 'none' }} onClick={() => setActiveTab('jobs')}>Jobs</button>
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                        {activeTab === 'users' && (
                            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        <th style={{ paddingBottom: '1rem' }}>Name</th>
                                        <th style={{ paddingBottom: '1rem' }}>Email</th>
                                        <th style={{ paddingBottom: '1rem' }}>Role</th>
                                        <th style={{ paddingBottom: '1rem' }}>Joined</th>
                                        <th style={{ paddingBottom: '1rem', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u._id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                            <td style={{ padding: '1rem 0', fontWeight: 600 }}>{u.name}</td>
                                            <td style={{ padding: '1rem 0', color: 'var(--text-secondary)' }}>{u.email}</td>
                                            <td style={{ padding: '1rem 0' }}><span className={`badge badge-${u.role === 'admin' ? 'red' : u.role === 'employer' ? 'purple' : 'blue'}`}>{u.role}</span></td>
                                            <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                                                <button className="btn btn-danger btn-sm" disabled={u.role === 'admin'} onClick={() => handleDeleteUser(u._id)}><Trash2 size={14} /> Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {activeTab === 'jobs' && (
                            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        <th style={{ paddingBottom: '1rem' }}>Job Title</th>
                                        <th style={{ paddingBottom: '1rem' }}>Company</th>
                                        <th style={{ paddingBottom: '1rem' }}>Employer Email</th>
                                        <th style={{ paddingBottom: '1rem' }}>Posted</th>
                                        <th style={{ paddingBottom: '1rem', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jobs.map(j => (
                                        <tr key={j._id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                            <td style={{ padding: '1rem 0', fontWeight: 600 }}>{j.title}</td>
                                            <td style={{ padding: '1rem 0', color: 'var(--text-secondary)' }}>{j.company}</td>
                                            <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>{j.employer?.email}</td>
                                            <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>{new Date(j.createdAt).toLocaleDateString()}</td>
                                            <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteJob(j._id)}><Trash2 size={14} /> Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
