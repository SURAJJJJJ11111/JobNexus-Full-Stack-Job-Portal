import { Link } from 'react-router-dom';
import { MapPin, Clock, Briefcase, IndianRupee, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';

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

export default function JobCard({ job, index = 0 }: { job: Job; index?: number }) {
    const initials = job.company?.substring(0, 2).toUpperCase() || 'JP';
    const salaryStr = formatSalary(job.salary);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
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
                        <button
                            className="btn btn-icon btn-ghost btn-sm"
                            title="Save job"
                            onClick={(e) => e.preventDefault()}
                            style={{ color: 'var(--text-muted)', flexShrink: 0 }}
                        >
                            <Bookmark size={16} />
                        </button>
                    </div>

                    {/* Meta */}
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
