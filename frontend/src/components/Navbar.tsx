import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Moon, Sun, Menu, X, User, LogOut, Plus } from 'lucide-react';

export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const [theme, setTheme] = useState(() => localStorage.getItem('jp_theme') || 'dark');
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('jp_theme', theme);
    }, [theme]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
    const handleLogout = () => { logout(); navigate('/'); setDropdownOpen(false); };

    return (
        <nav className="navbar" style={{ boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.3)' : 'none' }}>
            {/* Logo */}
            <NavLink to="/" className="navbar__logo" style={{ textDecoration: 'none' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Briefcase size={20} style={{ color: 'var(--brand-400)' }} />
                    JobNexus
                </span>
            </NavLink>

            {/* Nav Links */}
            <ul className="navbar__links">
                <li><NavLink to="/" className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`} end>Home</NavLink></li>
                <li><NavLink to="/jobs" className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>Jobs</NavLink></li>
                {isAuthenticated && (
                    <li><NavLink to="/dashboard" className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>Dashboard</NavLink></li>
                )}
                {isAuthenticated && user?.role === 'seeker' && (
                    <li><NavLink to="/applications" className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>Applications</NavLink></li>
                )}
                {isAuthenticated && user?.role === 'employer' && (
                    <li><NavLink to="/post-job" className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>Post a Job</NavLink></li>
                )}
                {isAuthenticated && user?.role === 'admin' && (
                    <li><NavLink to="/admin" className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>Admin</NavLink></li>
                )}
            </ul>

            {/* Actions */}
            <div className="navbar__actions">
                <button className="btn btn-icon btn-ghost" onClick={toggleTheme} title="Toggle theme">
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {!isAuthenticated ? (
                    <>
                        <NavLink to="/login" className="btn btn-ghost btn-sm">Sign In</NavLink>
                        <NavLink to="/register" className="btn btn-primary btn-sm">Get Started</NavLink>
                    </>
                ) : (
                    <div style={{ position: 'relative' }}>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <div className="profile-avatar" style={{ width: 28, height: 28, fontSize: '0.75rem', border: '2px solid var(--brand-500)' }}>
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            {user?.name?.split(' ')[0]}
                        </button>
                        {dropdownOpen && (
                            <div style={{
                                position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 180,
                                background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 200,
                                overflow: 'hidden', animation: 'fadeIn 0.15s both'
                            }}>
                                <NavLink to="/profile" className="navbar__link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: 0, padding: '0.75rem 1rem' }} onClick={() => setDropdownOpen(false)}>
                                    <User size={15} /> Profile
                                </NavLink>
                                {user?.role === 'employer' && (
                                    <NavLink to="/post-job" className="navbar__link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: 0, padding: '0.75rem 1rem' }} onClick={() => setDropdownOpen(false)}>
                                        <Plus size={15} /> Post a Job
                                    </NavLink>
                                )}
                                <div style={{ borderTop: '1px solid var(--border-subtle)' }} />
                                <button onClick={handleLogout} className="navbar__link btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', borderRadius: 0, padding: '0.75rem 1rem', color: 'var(--danger)', background: 'transparent', border: 'none' }}>
                                    <LogOut size={15} /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div style={{
                    position: 'fixed', top: 64, left: 0, right: 0, bottom: 0,
                    background: 'var(--bg-surface)', zIndex: 99, padding: '1.5rem',
                    display: 'flex', flexDirection: 'column', gap: '0.5rem',
                    animation: 'fadeIn 0.2s both'
                }}>
                    {[
                        { to: '/', label: 'Home' },
                        { to: '/jobs', label: 'Browse Jobs' },
                        ...(isAuthenticated ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
                        ...(isAuthenticated && user?.role === 'seeker' ? [{ to: '/applications', label: 'My Applications' }] : []),
                        ...(isAuthenticated && user?.role === 'employer' ? [{ to: '/post-job', label: 'Post a Job' }] : []),
                        ...(isAuthenticated && user?.role === 'admin' ? [{ to: '/admin', label: 'Admin Panel' }] : []),
                        ...(isAuthenticated ? [{ to: '/profile', label: 'Profile' }] : []),
                    ].map(({ to, label }) => (
                        <NavLink key={to} to={to} className="navbar__link" style={{ padding: '0.875rem 1rem', fontSize: '1rem' }} onClick={() => setMenuOpen(false)}>{label}</NavLink>
                    ))}
                    {!isAuthenticated ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                            <NavLink to="/login" className="btn btn-secondary" onClick={() => setMenuOpen(false)} style={{ justifyContent: 'center' }}>Sign In</NavLink>
                            <NavLink to="/register" className="btn btn-primary" onClick={() => setMenuOpen(false)} style={{ justifyContent: 'center' }}>Get Started</NavLink>
                        </div>
                    ) : (
                        <button onClick={handleLogout} className="btn btn-danger" style={{ marginTop: '1rem', justifyContent: 'center' }}>
                            <LogOut size={16} /> Sign Out
                        </button>
                    )}
                </div>
            )}
        </nav>
    );
}
