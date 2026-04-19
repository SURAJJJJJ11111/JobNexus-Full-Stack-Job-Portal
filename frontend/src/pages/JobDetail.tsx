import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, Briefcase, IndianRupee, Users, Globe, ArrowLeft, Send, Bookmark, FileText } from 'lucide-react';
import { getJob, applyToJob, saveJob } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatSalary(salary?: any) {
    if (!salary || (!salary.min && !salary.max)) return null;
    const fmt = (n: number) => n >= 100000 ? `${(n / 100000).toFixed(1)}L` : `${(n / 1000).toFixed(0)}K`;
    return `₹${fmt(salary.min)} – ${fmt(salary.max)} / yr`;
}

export default function JobDetail() {
    const { id } = useParams<{ id: string }>();
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');
    const [resume, setResume] = useState(user?.resume || '');
    const [applied, setApplied] = useState(false);

    useEffect(() => {
        if (!id) return;
        getJob(id).then(({ data }) => setJob(data.job)).catch(() => navigate('/jobs')).finally(() => setLoading(false));
    }, [id]);

    const handleApply = async () => {
        if (!isAuthenticated) { toast.error('Please sign in to apply'); navigate('/login'); return; }
        if (user?.role !== 'seeker') { toast.error('Only job seekers can apply'); return; }
        if (!coverLetter.trim()) { toast.error('Please write a cover letter'); return; }
        setApplying(true);
        try {
            await applyToJob(id!, { coverLetter, resume });
            setApplied(true);
            setShowApplyModal(false);
            toast.success('Application submitted!');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to apply');
        } finally { setApplying(false); }
    };

    if (loading) return <Spinner />;
    if (!job) return null;

    const salary = formatSalary(job.salary);

    return (
        <div className="page">
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
                <Link to="/jobs" className="btn btn-ghost btn-sm" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
                    <ArrowLeft size={15} /> Back to Jobs
                </Link>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
                    {/* Main */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        {/* Job Header */}
                        <div className="card" style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div className="job-card__logo" style={{ width: 60, height: 60, fontSize: '1.3rem', flexShrink: 0 }}>
                                    {job.company?.substring(0, 2).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h1 className="heading-md mb-2">{job.title}</h1>
                                    <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{job.company}</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.875rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} />{job.location}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Briefcase size={14} />{job.type}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Globe size={14} />{job.locationType}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} />{timeAgo(job.createdAt)}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={14} />{job.applicationsCount} applicant{job.applicationsCount !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                            </div>
                            {salary && (
                                <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(16,185,129,0.08)', borderRadius: 'var(--radius-md)', display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--success)', fontWeight: 700 }}>
                                    <IndianRupee size={15} />{salary}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="card" style={{ marginBottom: '1.5rem' }}>
                            <h2 className="heading-md mb-4">About the Role</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{job.description}</p>
                        </div>

                        {/* Requirements */}
                        {job.requirements?.length > 0 && (
                            <div className="card" style={{ marginBottom: '1.5rem' }}>
                                <h2 className="heading-md mb-4">Requirements</h2>
                                <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                    {job.requirements.map((r: string, i: number) => (
                                        <li key={i} style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Skills */}
                        {job.skills?.length > 0 && (
                            <div className="card">
                                <h2 className="heading-md mb-4">Skills Required</h2>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
                                    {job.skills.map((skill: string) => (
                                        <span key={skill} className="badge badge-blue" style={{ fontSize: '0.8rem' }}>{skill}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Sidebar */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                        <div className="card" style={{ marginBottom: '1rem' }}>
                            {applied ? (
                                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--success)' }}>
                                    Application Submitted!
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.375rem' }}>
                                        The employer will review your application.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {isAuthenticated && user?.role === 'seeker' ? (
                                        <button className="btn btn-primary w-full" style={{ justifyContent: 'center', marginBottom: '0.75rem' }} onClick={() => setShowApplyModal(true)}>
                                            <Send size={15} /> Apply Now
                                        </button>
                                    ) : !isAuthenticated ? (
                                        <Link to="/login" className="btn btn-primary w-full" style={{ justifyContent: 'center', marginBottom: '0.75rem' }}>
                                            Sign in to Apply
                                        </Link>
                                    ) : null}
                                    <button className="btn btn-secondary w-full" style={{ justifyContent: 'center' }} onClick={() => saveJob(id!).then(() => toast.success('Job saved!')).catch(() => { })}>
                                        <Bookmark size={15} /> Save Job
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Job Details */}
                        <div className="card">
                            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Job Overview</h3>
                            {[
                                { label: 'Category', value: job.category },
                                { label: 'Job Type', value: job.type },
                                { label: 'Location Type', value: job.locationType },
                                { label: 'Experience', value: job.experience },
                                { label: 'Posted', value: timeAgo(job.createdAt) },
                                ...(job.deadline ? [{ label: 'Deadline', value: new Date(job.deadline).toLocaleDateString() }] : []),
                            ].map(item => (
                                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.875rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                                    <span style={{ fontWeight: 600 }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Apply Modal */}
            {showApplyModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', padding: '2rem', width: '100%', maxWidth: 560, border: '1px solid var(--border-subtle)' }}>
                        <h2 className="heading-md mb-2">Apply to {job.title}</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>at {job.company}</p>
                        <div className="form-group">
                            <label className="form-label">Cover Letter *</label>
                            <textarea
                                className="form-input form-textarea"
                                placeholder="Introduce yourself and explain why you're a great fit for this role..."
                                value={coverLetter}
                                onChange={e => setCoverLetter(e.target.value)}
                                rows={6}
                            />
                        </div>
                        <div className="form-group" style={{ marginTop: '1rem' }}>
                            <label className="form-label">Resume Link (URL)</label>
                            <div style={{ position: 'relative' }}>
                                <FileText size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="url"
                                    className="form-input"
                                    style={{ paddingLeft: '2.5rem' }}
                                    placeholder="https://drive.google.com/..."
                                    value={resume}
                                    onChange={e => setResume(e.target.value)}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowApplyModal(false)}>Cancel</button>
                            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleApply} disabled={applying}>
                                {applying ? 'Submitting...' : <><Send size={15} />Submit Application</>}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
