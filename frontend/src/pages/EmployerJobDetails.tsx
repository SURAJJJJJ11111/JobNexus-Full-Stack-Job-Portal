import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Mail, MapPin, FileText, CheckCircle, Clock, X, Briefcase } from 'lucide-react';
import { getJob, getJobApplications, updateApplicationStatus } from '../services/api';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

const statuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'hired', label: 'Hired' },
    { value: 'rejected', label: 'Rejected' }
];

export default function EmployerJobDetails() {
    const { id } = useParams<{ id: string }>();
    const [job, setJob] = useState<any>(null);
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingParams, setUpdatingParams] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const [jobRes, appRes] = await Promise.all([
                getJob(id!),
                getJobApplications(id!)
            ]);
            setJob(jobRes.data.job);
            setApplications(appRes.data.applications || []);
        } catch (error) {
            toast.error('Failed to load job details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const handleUpdateStatus = async (appId: string, status: string) => {
        setUpdatingParams(appId);
        try {
            await updateApplicationStatus(appId, { status });
            toast.success('Status updated successfully');
            setApplications(apps => apps.map(a => a._id === appId ? { ...a, status } : a));
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setUpdatingParams(null);
        }
    };

    if (loading) return <Spinner />;
    if (!job) return <div className="container" style={{ marginTop: '4rem', textAlign: 'center' }}>Job not found</div>;

    return (
        <div className="page" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <div className="container">
                <Link to="/dashboard" className="btn btn-ghost btn-sm" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
                    <ArrowLeft size={15} /> Back to Dashboard
                </Link>

                <div className="card" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1 className="heading-md">{job.title}</h1>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Briefcase size={14} /> {job.type}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {job.location}</span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div className="text-gradient" style={{ fontSize: '2rem', fontWeight: 800 }}>{applications.length}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Candidates</div>
                        </div>
                    </div>
                </div>

                <h2 className="heading-md mb-4" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={18} /> Applicants
                </h2>

                {applications.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state__icon"><Users size={48} color="var(--text-muted)" /></div>
                        <h3 className="empty-state__title">No applicants yet</h3>
                        <p className="empty-state__desc">Wait for candidates to apply to this position.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {applications.map((app, i) => (
                            <motion.div key={app._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div className="profile-avatar" style={{ width: 44, height: 44, fontSize: '1rem' }}>
                                            {app.applicant?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <h3 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{app.applicant?.name}</h3>
                                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={12} /> {app.applicant?.email}</span>
                                                {app.applicant?.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {app.applicant.location}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        {app.resume && (
                                            <a href={app.resume} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                                                <FileText size={14} /> Resume
                                            </a>
                                        )}
                                        <select
                                            className="form-input form-select"
                                            style={{ width: '130px', padding: '0.4rem 1rem', fontSize: '0.875rem' }}
                                            value={app.status}
                                            disabled={updatingParams === app._id}
                                            onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                                        >
                                            {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div style={{ padding: '1rem', background: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
                                    <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>Cover Letter</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                        {app.coverLetter}
                                    </p>
                                </div>
                                {app.applicant?.skills && app.applicant.skills.length > 0 && (
                                    <div style={{ marginTop: '1rem' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {app.applicant.skills.map((skill: string) => (
                                                <span key={skill} className="badge badge-gray" style={{ fontSize: '0.75rem' }}>{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
