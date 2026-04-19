import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, FileText, Tag, Save, X, Plus, Building2, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [skillInput, setSkillInput] = useState('');
    const [form, setForm] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
        location: user?.location || '',
        skills: user?.skills || [],
        resume: user?.resume || '',
        company: {
            name: user?.company?.name || '',
            website: user?.company?.website || '',
            description: user?.company?.description || '',
        },
    });

    const set = (key: string, val: any) => setForm(p => ({ ...p, [key]: val }));

    const addSkill = () => {
        const s = skillInput.trim();
        if (s && !form.skills.includes(s)) set('skills', [...form.skills, s]);
        setSkillInput('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await updateProfile(form);
            updateUser(data.user);
            toast.success('Profile updated successfully!');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to update profile');
        } finally { setLoading(false); }
    };

    return (
        <div className="page">
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: 740 }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div className="profile-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                        <div>
                            <h1 className="heading-md">{user?.name}</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user?.email}</p>
                            {user?.role === 'employer' ? 'Employer' : 'Job Seeker'}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Basic Info */}
                        <div className="card">
                            <h2 className="heading-md mb-4">Personal Information</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                                    <label className="form-label">Full Name</label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input className="form-input" style={{ paddingLeft: '2.5rem' }} value={form.name} onChange={e => set('name', e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Location</label>
                                    <div style={{ position: 'relative' }}>
                                        <MapPin size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="City, Country" value={form.location} onChange={e => set('location', e.target.value)} />
                                    </div>
                                </div>
                                {user?.role === 'seeker' && (
                                    <div className="form-group">
                                        <label className="form-label">Resume Link (URL)</label>
                                        <div style={{ position: 'relative' }}>
                                            <FileText size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="https://drive.google.com/..." value={form.resume} onChange={e => set('resume', e.target.value)} />
                                        </div>
                                    </div>
                                )}
                                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                                    <label className="form-label">Bio</label>
                                    <textarea className="form-input form-textarea" rows={4} placeholder="Write a brief bio about yourself..." value={form.bio} onChange={e => set('bio', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* Skills (seeker) */}
                        {user?.role === 'seeker' && (
                            <div className="card">
                                <h2 className="heading-md mb-4">Skills</h2>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <Tag size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="Add a skill (press Enter)" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
                                    </div>
                                    <button type="button" className="btn btn-secondary" onClick={addSkill}><Plus size={14} /> Add</button>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {form.skills.map((s: string) => (
                                        <span key={s} className="badge badge-blue" style={{ gap: '0.375rem', cursor: 'pointer' }} onClick={() => set('skills', form.skills.filter((x: string) => x !== s))}>
                                            {s} <X size={10} />
                                        </span>
                                    ))}
                                    {form.skills.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Add skills to improve job match</span>}
                                </div>
                            </div>
                        )}

                        {/* Company (employer) */}
                        {user?.role === 'employer' && (
                            <div className="card">
                                <h2 className="heading-md mb-4">Company Information</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Company Name</label>
                                        <div style={{ position: 'relative' }}>
                                            <Building2 size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="Your Company Ltd." value={form.company.name} onChange={e => set('company', { ...form.company, name: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Company Website</label>
                                        <div style={{ position: 'relative' }}>
                                            <Globe size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="https://yourcompany.com" value={form.company.website} onChange={e => set('company', { ...form.company, website: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Company Description</label>
                                        <textarea className="form-input form-textarea" rows={3} placeholder="Tell candidates about your company..." value={form.company.description} onChange={e => set('company', { ...form.company, description: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }} disabled={loading}>
                            <Save size={15} /> {loading ? 'Saving...' : 'Save Profile'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
