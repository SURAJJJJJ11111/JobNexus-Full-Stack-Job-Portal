import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, IndianRupee, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { saveJob } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface Job {
    _id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    locationType: string;
    category: string;
    salary?: { min: number; max: number; currency: string };
    createdAt: string;
    skills?: string[];
    status: string;
}

const typeColorMap: Record<string, string> = {
    'full-time': 'badge-blue',
    'part-time': 'badge-purple',
    'contract': 'badge-yellow',
    'internship': 'badge-green',
    'freelance': 'badge-gray',
};

const locationTypeMap: Record<string, string> = {
    remote: 'Remote',
    onsite: 'On-site',
    hybrid: 'Hybrid',
};

function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
}

function formatSalary(salary?: { min: number; max: number; currency: string }) {
    if (!salary || (!salary.min && !salary.max)) return null;
    const fmt = (n: number) => n >= 100000 ? `${(n / 100000).toFixed(1)}L` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : String(n);
    return `₹${fmt(salary.min)} – ${fmt(salary.max)}`;
}

export default function JobCard({ job, index = 0, initialSaved = false }: { job: Job; index?: number; initialSaved?: boolean }) {
    const { isAuthenticated, user } = useAuth();
    const initials = job.company?.substring(0, 2).toUpperCase() || 'JP';
    const salaryStr = formatSalary(job.salary);

    // Check if job is already in user's saved list (passed from parent or context)
    const alreadySaved = initialSaved || (
        Array.isArray((user as any)?.savedJobs)
            ? (user as any).savedJobs.some((sj: any) => (sj.id || sj._id || sj) === job._id)
            : false
    );

    // ── Optimistic UI: update bookmark instantly, revert on error ─────────
    const [saved, setSaved] = useState(alreadySaved);
    const [saving, setSaving] = useState(false);

    const handleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.error('Sign in to save jobs');
            return;
        }

        // Optimistic update — flip state immediately
        const prevSaved = saved;
        setSaved(!saved);

        try {
            setSaving(true);
            await saveJob(job._id);
            toast.success(prevSaved ? 'Job removed from saved' : 'Job saved! ✓', { duration: 2000 });
        } catch {
            // Revert on failure
            setSaved(prevSaved);
            toast.error('Could not save job. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.4 }}
        >
            <Link to={`/jobs/${job._id}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div className="job-card">
                    {/* Header */}
                    <div className="job-card__header">
                        <div className="job-card__company">
                            <div className="job-card__logo">{initials}</div>
                            <div>
                                <div className="job-card__company-name">{job.company}</div>
                                <div className="job-card__title">{job.title}</div>
                            </div>
                        </div>

                        {/* Bookmark button with optimistic animation */}
                        <motion.button
                            className="btn btn-icon btn-ghost btn-sm"
                            title={saved ? 'Remove from saved' : 'Save job'}
                            onClick={handleSave}
                            disabled={saving}
                            animate={{ scale: saving ? 0.85 : 1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            style={{
                                color: saved ? 'var(--brand-400)' : 'var(--text-muted)',
                                flexShrink: 0,
                            }}
                        >
                            <Bookmark
                                size={16}
                                fill={saved ? 'var(--brand-400)' : 'none'}
                                style={{ transition: 'fill 0.2s, color 0.2s' }}
                            />
                        </motion.button>
                    </div>

                    {/* Meta badges */}
                    <div className="job-card__meta">
                        <span className={`badge ${typeColorMap[job.type] || 'badge-gray'}`}>{job.type}</span>
                        <span className="badge badge-gray">
                            {locationTypeMap[job.locationType] || job.locationType}
                        </span>
                        <span className="badge badge-gray">
                            <MapPin size={11} style={{ display: 'inline', marginRight: 3 }} />
                            {job.location}
                        </span>
                        <span className="badge badge-gray">{job.category}</span>
                    </div>

                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                            {job.skills.slice(0, 4).map(skill => (
                                <span key={skill} style={{ fontSize: '0.75rem', padding: '2px 10px', borderRadius: '999px', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                                    {skill}
                                </span>
                            ))}
                            {job.skills.length > 4 && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{job.skills.length - 4} more</span>
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="job-card__footer">
                        {salaryStr ? (
                            <span className="job-card__salary">
                                <IndianRupee size={13} style={{ display: 'inline', marginRight: 2 }} />
                                {salaryStr} / yr
                            </span>
                        ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Salary not listed</span>
                        )}
                        <span className="job-card__date">
                            <Clock size={11} style={{ display: 'inline', marginRight: 3 }} />
                            {timeAgo(job.createdAt)}
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
