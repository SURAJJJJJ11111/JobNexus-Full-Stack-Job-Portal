import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, MapPin, FileText, Tag, Save, X, Plus,
    Building2, Globe, ExternalLink, Briefcase, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';
import toast from 'react-hot-toast';

const CITY_SUGGESTIONS = [
    'Mumbai, Maharashtra', 'Delhi, NCR', 'Bengaluru, Karnataka', 'Hyderabad, Telangana',
    'Chennai, Tamil Nadu', 'Kolkata, West Bengal', 'Pune, Maharashtra', 'Ahmedabad, Gujarat',
    'Jaipur, Rajasthan', 'Lucknow, Uttar Pradesh', 'Chandigarh, Punjab', 'Kochi, Kerala',
    'Indore, Madhya Pradesh', 'Bhopal, Madhya Pradesh', 'Nagpur, Maharashtra', 'Surat, Gujarat',
    'Vadodara, Gujarat', 'Patna, Bihar', 'Bhubaneswar, Odisha', 'Visakhapatnam, Andhra Pradesh',
    'Coimbatore, Tamil Nadu', 'Mysuru, Karnataka', 'Thiruvananthapuram, Kerala', 'Noida, Uttar Pradesh',
    'Gurgaon, Haryana', 'Faridabad, Haryana', 'Ghaziabad, Uttar Pradesh', 'Agra, Uttar Pradesh',
    'Meerut, Uttar Pradesh', 'Ranchi, Jharkhand', 'Raipur, Chhattisgarh', 'Dehradun, Uttarakhand',
    'Shimla, Himachal Pradesh', 'Jammu, J&K', 'Srinagar, J&K', 'Guwahati, Assam',
    'Imphal, Manipur', 'Shillong, Meghalaya', 'Aizawl, Mizoram', 'Panaji, Goa',
    'Remote, India', 'Bangalore (Remote)', 'Mumbai (Hybrid)', 'Delhi (Hybrid)',
];
import toast from 'react-hot-toast';

const ROLE_META: Record<string, { label: string; badge: string; icon: JSX.Element }> = {
    seeker:   { label: 'Job Seeker',  badge: 'badge-blue',   icon: <Briefcase size={14} /> },
    employer: { label: 'Employer',    badge: 'badge-purple', icon: <Building2 size={14} /> },
    admin:    { label: 'Admin',       badge: 'badge-red',    icon: <Shield size={14} /> },
};

export default function Profile() {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [skillInput, setSkillInput] = useState('');
    const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeSuggestion, setActiveSuggestion] = useState(-1);
    const locationRef = useRef<HTMLDivElement>(null);

    // Close suggestion dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLocationChange = (val: string) => {
        set('location', val);
        setActiveSuggestion(-1);
        if (val.trim().length >= 1) {
            const filtered = CITY_SUGGESTIONS.filter(c =>
                c.toLowerCase().includes(val.toLowerCase())
            ).slice(0, 6);
            setLocationSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleLocationKey = (e: React.KeyboardEvent) => {
        if (!showSuggestions) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); setActiveSuggestion(i => Math.min(i + 1, locationSuggestions.length - 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveSuggestion(i => Math.max(i - 1, 0)); }
        else if (e.key === 'Enter' && activeSuggestion >= 0) { e.preventDefault(); selectLocation(locationSuggestions[activeSuggestion]); }
        else if (e.key === 'Escape') setShowSuggestions(false);
    };

    const selectLocation = (city: string) => {
        set('location', city);
        setShowSuggestions(false);
        setActiveSuggestion(-1);
    };

    const [form, setForm] = useState({
        name:     user?.name || '',
        bio:      user?.bio  || '',
        location: user?.location || '',
        skills:   (user?.skills as string[]) || [],
        resume:   user?.resume || '',
        company: {
            name:        user?.company?.name        || '',
            website:     user?.company?.website     || '',
            description: user?.company?.description || '',
        },
    });

    const set = (key: string, val: any) => setForm(p => ({ ...p, [key]: val }));

    const addSkill = () => {
        const s = skillInput.trim();
        if (s && !(form.skills as string[]).includes(s)) set('skills', [...(form.skills as string[]), s]);
        setSkillInput('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await updateProfile(form);
            updateUser(data.user);
            toast.success('Profile updated!');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to update profile');
        } finally { setLoading(false); }
    };

    const roleMeta = ROLE_META[user?.role || 'seeker'];

    return (
        <div className="page">
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: 780 }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

                    {/* ── Profile Hero ──────────────────────────────────── */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem',
                        padding: '1.75rem', borderRadius: 'var(--radius-xl)',
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(139,92,246,0.06))',
                        border: '1px solid var(--border-subtle)',
                        flexWrap: 'wrap',
                    }}>
                        {/* Avatar */}
                        <div style={{ position: 'relative' }}>
                            <div className="profile-avatar" style={{ width: 80, height: 80, fontSize: '2rem' }}>
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <h1 className="heading-md" style={{ marginBottom: '0.25rem' }}>{user?.name}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    <Mail size={13} /> {user?.email}
                                </span>
                                {user?.location && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        <MapPin size={13} /> {user?.location}
                                    </span>
                                )}
                            </div>
                            <span className={`badge ${roleMeta.badge}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                {roleMeta.icon} {roleMeta.label}
                            </span>
                        </div>
                        {/* Resume link shortcut for seekers */}
                        {user?.role === 'seeker' && (user as any)?.resume && (
                            <a href={(user as any).resume} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                                <ExternalLink size={13} /> View Resume
                            </a>
                        )}
                        {/* Company website shortcut for employers */}
                        {user?.role === 'employer' && user?.company?.website && (
                            <a href={user.company.website} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                                <ExternalLink size={13} /> Company Site
                            </a>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* ── Personal Information ──────────────────────── */}
                        <div className="card">
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <User size={16} color="var(--brand-400)" /> Personal Information
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                {/* Full Name */}
                                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                                    <label className="form-label">Full Name</label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input className="form-input" style={{ paddingLeft: '2.5rem' }} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" />
                                    </div>
                                </div>
                                {/* Location with autocomplete */}
                                <div className="form-group" ref={locationRef}>
                                    <label className="form-label">Location</label>
                                    <div style={{ position: 'relative' }}>
                                        <MapPin size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                                        <input
                                            className="form-input"
                                            style={{ paddingLeft: '2.5rem' }}
                                            placeholder="Type a city name…"
                                            value={form.location}
                                            onChange={e => handleLocationChange(e.target.value)}
                                            onKeyDown={handleLocationKey}
                                            onFocus={() => form.location && handleLocationChange(form.location)}
                                            autoComplete="off"
                                        />
                                        <AnimatePresence>
                                            {showSuggestions && (
                                                <motion.ul
                                                    initial={{ opacity: 0, y: -6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -6 }}
                                                    transition={{ duration: 0.15 }}
                                                    style={{
                                                        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                                                        background: 'var(--bg-surface)',
                                                        border: '1px solid var(--border-subtle)',
                                                        borderRadius: 'var(--radius-md)',
                                                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                                        marginTop: 4,
                                                        listStyle: 'none',
                                                        padding: '0.375rem',
                                                        maxHeight: 220,
                                                        overflowY: 'auto',
                                                    }}
                                                >
                                                    {locationSuggestions.map((city, i) => (
                                                        <li
                                                            key={city}
                                                            onMouseDown={() => selectLocation(city)}
                                                            style={{
                                                                padding: '0.5rem 0.75rem',
                                                                borderRadius: 'var(--radius-sm)',
                                                                cursor: 'pointer',
                                                                fontSize: '0.875rem',
                                                                display: 'flex', alignItems: 'center', gap: 8,
                                                                background: i === activeSuggestion ? 'var(--bg-hover)' : 'transparent',
                                                                color: 'var(--text-primary)',
                                                                transition: 'background 0.1s',
                                                            }}
                                                        >
                                                            <MapPin size={12} color="var(--brand-400)" />
                                                            {city}
                                                        </li>
                                                    ))}
                                                </motion.ul>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                                {/* Resume URL — seeker only */}
                                {user?.role === 'seeker' && (
                                    <div className="form-group">
                                        <label className="form-label">Resume Link (URL)</label>
                                        <div style={{ position: 'relative' }}>
                                            <FileText size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="https://drive.google.com/..." value={form.resume} onChange={e => set('resume', e.target.value)} />
                                        </div>
                                        {form.resume && (
                                            <a href={form.resume} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--brand-400)', marginTop: '0.375rem' }}>
                                                <ExternalLink size={11} /> Preview Resume
                                            </a>
                                        )}
                                    </div>
                                )}
                                {/* Bio */}
                                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                                    <label className="form-label">Bio</label>
                                    <textarea className="form-input form-textarea" rows={4} placeholder="Write a brief bio about yourself..." value={form.bio} onChange={e => set('bio', e.target.value)} />
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right', display: 'block', marginTop: 4 }}>{form.bio.length} / 500</span>
                                </div>
                            </div>
                        </div>

                        {/* ── Skills (seeker) ───────────────────────────── */}
                        {user?.role === 'seeker' && (
                            <div className="card">
                                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Tag size={16} color="var(--accent-400)" /> Skills
                                </h2>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <Tag size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            className="form-input"
                                            style={{ paddingLeft: '2.5rem' }}
                                            placeholder="Add a skill and press Enter"
                                            value={skillInput}
                                            onChange={e => setSkillInput(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                                        />
                                    </div>
                                    <button type="button" className="btn btn-secondary" onClick={addSkill}><Plus size={14} /> Add</button>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {(form.skills as string[]).map((s) => (
                                        <motion.span
                                            key={s}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="badge badge-blue"
                                            style={{ gap: '0.375rem', cursor: 'pointer' }}
                                            onClick={() => set('skills', (form.skills as string[]).filter(x => x !== s))}
                                        >
                                            {s} <X size={10} />
                                        </motion.span>
                                    ))}
                                    {(form.skills as string[]).length === 0 && (
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Add skills to improve job match visibility</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── Company (employer) ────────────────────────── */}
                        {user?.role === 'employer' && (
                            <div className="card">
                                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Building2 size={16} color="var(--accent-400)" /> Company Information
                                </h2>
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
                                        {form.company.website && (
                                            <a href={form.company.website} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--brand-400)', marginTop: '0.375rem' }}>
                                                <ExternalLink size={11} /> Visit Website
                                            </a>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Company Description</label>
                                        <textarea className="form-input form-textarea" rows={3} placeholder="Tell candidates about your company culture, mission, and what makes you unique..." value={form.company.description} onChange={e => set('company', { ...form.company, description: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Save ──────────────────────────────────────── */}
                        <button type="submit" className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }} disabled={loading}>
                            <Save size={16} /> {loading ? 'Saving…' : 'Save Profile'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
