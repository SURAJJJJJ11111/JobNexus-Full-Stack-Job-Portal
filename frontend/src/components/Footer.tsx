import { Link } from 'react-router-dom';
import { Briefcase, Github, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
    const year = new Date().getFullYear();
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer__grid">
                    <div>
                        <div className="footer__brand-name">
                            <span>JobNexus</span>
                        </div>
                        <p className="footer__desc">
                            The modern job portal connecting top talent with leading companies. Find your dream role or hire your next star.
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                            {[
                                { icon: <Github size={16} />, href: '#' },
                                { icon: <Linkedin size={16} />, href: '#' },
                                { icon: <Twitter size={16} />, href: '#' },
                            ].map((s, i) => (
                                <a key={i} href={s.href} className="btn btn-icon btn-ghost btn-sm">{s.icon}</a>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="footer__col-title">For Job Seekers</p>
                        <ul className="footer__links">
                            {['Browse Jobs', 'Create Profile', 'Saved Jobs', 'Career Tips'].map(l => (
                                <li key={l}><Link to="/jobs" className="footer__link">{l}</Link></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="footer__col-title">For Employers</p>
                        <ul className="footer__links">
                            {['Post a Job', 'Browse Talent', 'Pricing', 'Resources'].map(l => (
                                <li key={l}><Link to="/register" className="footer__link">{l}</Link></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="footer__col-title">Company</p>
                        <ul className="footer__links">
                            {['About Us', 'Blog', 'Privacy Policy', 'Terms of Service'].map(l => (
                                <li key={l}><a href="#" className="footer__link">{l}</a></li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="footer__bottom">
                    <span>© {year} JobNexus. All rights reserved.</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        Built with <Briefcase size={14} style={{ color: 'var(--brand-400)' }} /> by JobNexus Team
                    </span>
                </div>
            </div>
        </footer>
    );
}
