import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, Tag, Plus, X } from 'lucide-react';
import { createJob } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['Technology', 'Design', 'Marketing', 'Finance', 'Healthcare', 'Education', 'Sales', 'Engineering', 'HR', 'Other'];
const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'freelance'];
const LOCATION_TYPES = ['remote', 'onsite', 'hybrid'];
const EXPERIENCE_LEVELS = ['entry', 'mid', 'senior', 'lead', 'any'];

export default function PostJob() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [skillInput, setSkillInput] = useState('');
    const [form, setForm] = useState({
        title: '', company: user?.company?.name || '', description: '',
        location: '', locationType: 'onsite', type: 'full-time',
        category: 'Technology', experience: 'any',
        skills: [] as string[],
        salary: { min: 0, max: 0, currency: 'INR', period: 'yearly' },
        requirements: [''],
        status: 'open',
    });

    const set = (key: string, val: any) => setForm(p => ({ ...p, [key]: val }));

    const addSkill = () => {
        const s = skillInput.trim();
        if (s && !form.skills.includes(s)) set('skills', [...form.skills, s]);
        setSkillInput('');
    };
    const removeSkill = (s: string) => set('skills', form.skills.filter(x => x !== s));

    const addRequirement = () => set('requirements', [...form.requirements, '']);
    const updateReq = (i: number, val: string) => {
        const reqs = [...form.requirements];
        reqs[i] = val;
        set('requirements', reqs);
    };
    const removeReq = (i: number) => set('requirements', form.requirements.filter((_, idx) => idx !== i));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.company || !form.description || !form.location || !form.category) {
            return toast.error('Please fill in all required fields');
        }
        setLoading(true);
        try {
            const payload = { ...form, requirements: form.requirements.filter(r => r.trim()) };
            await createJob(payload);
            toast.success('Job posted successfully!');
            navigate('/dashboard');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to post job');
        } finally { setLoading(false); }
    };

    const inputStyle = { paddingLeft: '2.75rem' };

    return (
        <div className="page">
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: 800 }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h1 className="heading-lg">Post a New Job</h1>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.375rem' }}>Reach thousands of qualified candidates</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Basic Info */}
                        <div className="card">
                            <h2 className="heading-md mb-4">Basic Information</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                                    <label className="form-label">Job Title *</label>
                                    <div style={{ position: 'relative' }}>
                                        <Briefcase size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input className="form-input" style={inputStyle} placeholder="e.g. Senior React Developer" value={form.title} onChange={e => set('title', e.target.value)} required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Company Name *</label>
                                    <input className="form-input" placeholder="Your company name" value={form.company} onChange={e => set('company', e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Location *</label>
                                    <div style={{ position: 'relative' }}>
                                        <MapPin size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input className="form-input" style={inputStyle} placeholder="e.g. Mumbai, India" value={form.location} onChange={e => set('location', e.target.value)} required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Category *</label>
                                    <select className="form-input form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Job Type</label>
                                    <select className="form-input form-select" value={form.type} onChange={e => set('type', e.target.value)}>
                                        {JOB_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Location Type</label>
                                    <select className="form-input form-select" value={form.locationType} onChange={e => set('locationType', e.target.value)}>
                                        {LOCATION_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Experience Level</label>
                                    <select className="form-input form-select" value={form.experience} onChange={e => set('experience', e.target.value)}>
                                        {EXPERIENCE_LEVELS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Salary */}
                        <div className="card">
                            <h2 className="heading-md mb-4">Salary Range</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Min Salary</label>
                                    <div style={{ position: 'relative' }}>
                                        <DollarSign size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input type="number" className="form-input" style={inputStyle} placeholder="e.g. 500000" value={form.salary.min || ''} onChange={e => set('salary', { ...form.salary, min: +e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Max Salary</label>
                                    <div style={{ position: 'relative' }}>
                                        <DollarSign size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input type="number" className="form-input" style={inputStyle} placeholder="e.g. 1200000" value={form.salary.max || ''} onChange={e => set('salary', { ...form.salary, max: +e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Currency</label>
                                    <select className="form-input form-select" value={form.salary.currency} onChange={e => set('salary', { ...form.salary, currency: e.target.value })}>
                                        <option value="INR">INR (₹)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="card">
                            <h2 className="heading-md mb-4">Job Description *</h2>
                            <textarea className="form-input form-textarea" rows={8} placeholder="Describe the role, responsibilities, team culture, and what makes this opportunity special..." value={form.description} onChange={e => set('description', e.target.value)} required />
                        </div>

                        {/* Requirements */}
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2 className="heading-md">Requirements</h2>
                                <button type="button" className="btn btn-ghost btn-sm" onClick={addRequirement}><Plus size={14} /> Add</button>
                            </div>
                            {form.requirements.map((r, i) => (
                                <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.625rem' }}>
                                    <input className="form-input" placeholder={`Requirement ${i + 1}`} value={r} onChange={e => updateReq(i, e.target.value)} />
                                    {form.requirements.length > 1 && (
                                        <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => removeReq(i)}><X size={14} /></button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Skills */}
                        <div className="card">
                            <h2 className="heading-md mb-4">Required Skills</h2>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <Tag size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        className="form-input" style={inputStyle}
                                        placeholder="e.g. React, Node.js" value={skillInput}
                                        onChange={e => setSkillInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                                    />
                                </div>
                                <button type="button" className="btn btn-secondary" onClick={addSkill}><Plus size={14} /> Add</button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {form.skills.map(s => (
                                    <span key={s} className="badge badge-blue" style={{ gap: '0.375rem', cursor: 'pointer' }} onClick={() => removeSkill(s)}>
                                        {s} <X size={10} />
                                    </span>
                                ))}
                                {form.skills.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No skills added yet</span>}
                            </div>
                        </div>

                        {/* Submit */}
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Cancel</button>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
                                {loading ? 'Posting...' : 'Publish Job Listing'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
