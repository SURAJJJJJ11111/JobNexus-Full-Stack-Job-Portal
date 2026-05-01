import { Link } from 'react-router-dom';
import { Briefcase, Github, Linkedin, Twitter } from 'lucide-react';

const FOOTER_LINKS = {
    'For Job Seekers': [
        { label: 'Browse Jobs',    to: '/jobs' },
        { label: 'Create Profile', to: '/profile' },
        { label: 'Saved Jobs',     to: '/dashboard' },
        { label: 'Apply Now',      to: '/jobs' },
    ],
    'For Employers': [
        { label: 'Post a Job',     to: '/post-job' },
        { label: 'Browse Talent',  to: '/jobs' },
        { label: 'My Dashboard',   to: '/dashboard' },
        { label: 'Sign Up Free',   to: '/register' },
    ],
    'Company': [
        { label: 'About JobNexus', to: '/' },
        { label: 'Browse All Jobs',to: '/jobs' },
        { label: 'Login',          to: '/login' },
        { label: 'Register',       to: '/register' },
    ],
};

export default function Footer() {
    const year = new Date().getFullYear();
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer__grid">
                    {/* Brand */}
                    <div>
                        <div className="footer__brand-name">
                            <span>JobNexus</span>
                        </div>
                        <p className="footer__desc">
                            The modern job portal connecting top talent with leading companies. Find your dream role or hire your next star.
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                            <a href="https://github.com/SURAJJJJJ11111/JobNexus-Full-Stack-Job-Portal" target="_blank" rel="noopener noreferrer" className="btn btn-icon btn-ghost btn-sm" title="GitHub">
                                <Github size={16} />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="btn btn-icon btn-ghost btn-sm" title="LinkedIn">
                                <Linkedin size={16} />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="btn btn-icon btn-ghost btn-sm" title="Twitter">
                                <Twitter size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(FOOTER_LINKS).map(([col, links]) => (
                        <div key={col}>
                            <p className="footer__col-title">{col}</p>
                            <ul className="footer__links">
                                {links.map(({ label, to }) => (
                                    <li key={label}>
                                        <Link to={to} className="footer__link">{label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="footer__bottom">
                    <span>© {year} JobNexus. All rights reserved.</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        Built with <Briefcase size={14} style={{ color: 'var(--brand-400)' }} /> by the JobNexus Team
                    </span>
                </div>
            </div>
        </footer>
    );
}
