import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Briefcase, CheckCircle } from 'lucide-react';
import { resetPassword } from '../services/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const passwordStrength = (): { label: string; color: string; width: string } => {
        if (!password) return { label: '', color: 'transparent', width: '0%' };
        if (password.length < 6) return { label: 'Too short', color: 'var(--danger)', width: '20%' };
        if (password.length < 8) return { label: 'Weak', color: 'var(--warning)', width: '40%' };
        const hasUpper = /[A-Z]/.test(password);
        const hasNum = /[0-9]/.test(password);
        const hasSpecial = /[^a-zA-Z0-9]/.test(password);
        const score = [hasUpper, hasNum, hasSpecial].filter(Boolean).length;
        if (score === 0) return { label: 'Fair', color: 'var(--warning)', width: '55%' };
        if (score === 1) return { label: 'Good', color: 'var(--info)', width: '70%' };
        return { label: 'Strong', color: 'var(--success)', width: '100%' };
    };

    const strength = passwordStrength();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || !confirm) return toast.error('Please fill in all fields');
        if (password.length < 6) return toast.error('Password must be at least 6 characters');
        if (password !== confirm) return toast.error('Passwords do not match');
        if (!token) return toast.error('Invalid reset link');

        setLoading(true);
        try {
            await resetPassword(token, password);
            setSuccess(true);
            toast.success('Password reset successfully!');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Reset link is invalid or expired.');
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
                    {success ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
                            <CheckCircle size={56} color="var(--success)" strokeWidth={1.5} style={{ margin: '0 auto 1.25rem' }} />
                            <h2 className="heading-md" style={{ marginBottom: '0.75rem' }}>Password Updated!</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Your password has been reset. Redirecting you to login...
                            </p>
                            <div style={{ marginTop: '1.5rem' }}>
                                <Link to="/login" className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>
                                    Go to Sign In
                                </Link>
                            </div>
                        </motion.div>
                    ) : (
                        <>
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
                                <h1 className="heading-md">Set a new password</h1>
                                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                                    Choose a strong password for your account.
                                </p>
                            </div>

                            <form className="auth-form" onSubmit={handleSubmit}>
                                {/* New Password */}
                                <div className="form-group">
                                    <label className="form-label">New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            className="form-input"
                                            style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                                            placeholder="Min. 6 characters"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            autoComplete="new-password"
                                            autoFocus
                                        />
                                        <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {/* Password strength bar */}
                                    {password && (
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 2, overflow: 'hidden' }}>
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: strength.width }}
                                                    transition={{ duration: 0.3 }}
                                                    style={{ height: '100%', background: strength.color, borderRadius: 2 }}
                                                />
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: strength.color, marginTop: '0.25rem', display: 'block' }}>
                                                {strength.label}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div className="form-group">
                                    <label className="form-label">Confirm Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type={showConfirm ? 'text' : 'password'}
                                            className="form-input"
                                            style={{
                                                paddingLeft: '2.5rem', paddingRight: '2.5rem',
                                                borderColor: confirm && confirm !== password ? 'var(--danger)' : confirm && confirm === password ? 'var(--success)' : undefined,
                                            }}
                                            placeholder="Repeat your password"
                                            value={confirm}
                                            onChange={e => setConfirm(e.target.value)}
                                            autoComplete="new-password"
                                        />
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {confirm && confirm !== password && (
                                        <span className="form-error">Passwords do not match</span>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-full"
                                    style={{ justifyContent: 'center', marginTop: '0.5rem' }}
                                    disabled={loading || (!!confirm && confirm !== password)}
                                >
                                    {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Resetting...</> : 'Reset Password'}
                                </button>

                                <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    Remembered it? <Link to="/login" className="auth-link">Sign in instead</Link>
                                </p>
                            </form>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
