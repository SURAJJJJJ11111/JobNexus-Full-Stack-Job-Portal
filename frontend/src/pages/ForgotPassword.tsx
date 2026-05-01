import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Briefcase, ArrowLeft, CheckCircle } from 'lucide-react';
import { forgotPassword } from '../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [devResetUrl, setDevResetUrl] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return toast.error('Please enter your email address');
        setLoading(true);
        try {
            const { data } = await forgotPassword(email);
            setSubmitted(true);
            // Dev mode: backend returns the reset URL directly if no email service is set up
            if (data.resetUrl) setDevResetUrl(data.resetUrl);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Something went wrong. Please try again.');
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
                    <AnimatePresence mode="wait">
                        {!submitted ? (
                            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                {/* Header */}
                                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                                        <div style={{
                                            width: 52, height: 52, borderRadius: '50%',
                                            background: 'linear-gradient(135deg, var(--brand-600), var(--accent-600))',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <Briefcase size={24} color="#fff" />
                                        </div>
                                    </div>
                                    <h1 className="heading-md">Forgot your password?</h1>
                                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                                        No worries — enter your email and we'll send you a reset link.
                                    </p>
                                </div>

                                <form className="auth-form" onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label className="form-label">Email Address</label>
                                        <div style={{ position: 'relative' }}>
                                            <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input
                                                type="email"
                                                className="form-input"
                                                style={{ paddingLeft: '2.5rem' }}
                                                placeholder="you@example.com"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                autoFocus
                                                autoComplete="email"
                                            />
                                        </div>
                                    </div>

                                    <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center' }} disabled={loading}>
                                        {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Sending...</> : 'Send Reset Link'}
                                    </button>

                                    <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                        <Link to="/login" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                            <ArrowLeft size={14} /> Back to Sign In
                                        </Link>
                                    </p>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                                    <CheckCircle size={56} color="var(--success)" strokeWidth={1.5} />
                                </div>
                                <h2 className="heading-md" style={{ marginBottom: '0.75rem' }}>Check your email</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                                    If <strong style={{ color: 'var(--text-primary)' }}>{email}</strong> is registered, a password reset link has been sent. It expires in <strong style={{ color: 'var(--text-primary)' }}>1 hour</strong>.
                                </p>

                                {/* Dev mode helper — shows reset link when no email service is configured */}
                                {devResetUrl && (
                                    <div style={{
                                        marginTop: '1.25rem', padding: '1rem',
                                        background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
                                        borderRadius: 'var(--radius-md)', textAlign: 'left',
                                    }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 700, marginBottom: '0.5rem' }}>
                                            ⚠️ Dev Mode — No email service configured
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                            Use this link to reset the password:
                                        </p>
                                        <a href={devResetUrl} style={{
                                            fontSize: '0.75rem', color: 'var(--brand-400)',
                                            wordBreak: 'break-all', display: 'block',
                                        }}>
                                            {devResetUrl}
                                        </a>
                                    </div>
                                )}

                                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <button className="btn btn-secondary w-full" style={{ justifyContent: 'center' }} onClick={() => { setSubmitted(false); setEmail(''); setDevResetUrl(''); }}>
                                        Try a different email
                                    </button>
                                    <Link to="/login" className="btn btn-ghost w-full" style={{ justifyContent: 'center' }}>
                                        <ArrowLeft size={14} /> Back to Sign In
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
