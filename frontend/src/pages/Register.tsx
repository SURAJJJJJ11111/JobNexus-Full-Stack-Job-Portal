import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Briefcase, Building2, Eye, EyeOff, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'seeker', resume: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) return toast.error('Please fill in all fields');
        if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
        setLoading(true);
        try {
            await register(form);
            navigate('/dashboard');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%', maxWidth: 480 }}
            >
                <div className="auth-card">
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-600), var(--accent-600))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Briefcase size={24} color="#fff" />
                            </div>
                        </div>
                        <h1 className="heading-md">Create your account</h1>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.375rem', fontSize: '0.9rem' }}>
                            Join thousands of professionals on JobNexus
                        </p>
                    </div>

                    {/* Role Toggle */}
                    <div className="role-toggle">
                        <button
                            type="button"
                            className={`role-btn ${form.role === 'seeker' ? 'active' : ''}`}
                            onClick={() => setForm(p => ({ ...p, role: 'seeker' }))}
                        >
                            <User size={16} style={{ display: 'inline', marginRight: 6 }} />
                            Job Seeker
                        </button>
                        <button
                            type="button"
                            className={`role-btn ${form.role === 'employer' ? 'active' : ''}`}
                            onClick={() => setForm(p => ({ ...p, role: 'employer' }))}
                        >
                            <Building2 size={16} style={{ display: 'inline', marginRight: 6 }} />
                            Employer
                        </button>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit} style={{ marginTop: '1.25rem' }}>
                        <div className="form-group">
                            <label className="form-label">{form.role === 'employer' ? 'Company / Full Name' : 'Full Name'}</label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    className="form-input"
                                    style={{ paddingLeft: '2.5rem' }}
                                    placeholder={form.role === 'employer' ? 'Acme Inc. / John Doe' : 'John Doe'}
                                    value={form.name}
                                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="email"
                                    className="form-input"
                                    style={{ paddingLeft: '2.5rem' }}
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    className="form-input"
                                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                                    placeholder="Min. 6 characters"
                                    value={form.password}
                                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    autoComplete="new-password"
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {form.role === 'seeker' && (
                            <div className="form-group">
                                <label className="form-label">Resume Link (URL) <span style={{ color: 'var(--text-muted)' }}>(Optional)</span></label>
                                <div style={{ position: 'relative' }}>
                                    <FileText size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="url"
                                        className="form-input"
                                        style={{ paddingLeft: '2.5rem' }}
                                        placeholder="https://drive.google.com/..."
                                        value={form.resume}
                                        onChange={e => setForm(p => ({ ...p, resume: e.target.value }))}
                                    />
                                </div>
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center', marginTop: '0.5rem' }} disabled={loading}>
                            {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating account...</> : `Create ${form.role === 'employer' ? 'Employer' : 'Seeker'} Account`}
                        </button>

                        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
                        </p>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
