import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Spinner from './components/Spinner';

// Eagerly loaded (critical path — needed immediately on any visit)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Lazy loaded (only downloaded when the user navigates to them)
const Jobs = lazy(() => import('./pages/Jobs'));
const JobDetail = lazy(() => import('./pages/JobDetail'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PostJob = lazy(() => import('./pages/PostJob'));
const Profile = lazy(() => import('./pages/Profile'));
const Applications = lazy(() => import('./pages/Applications'));
const EmployerJobDetails = lazy(() => import('./pages/EmployerJobDetails'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

function ProtectedRoute({ children, role }: { children: JSX.Element; role?: string }) {
    const { isAuthenticated, user, loading } = useAuth();
    if (loading) return <Spinner />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (role && user?.role !== role) return <Navigate to="/dashboard" replace />;
    return children;
}

/** Page-level loading fallback shown while a lazy chunk is downloading */
function PageLoader() {
    return (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading…</p>
            </div>
        </div>
    );
}

function App() {
    const { loading } = useAuth();
    if (loading) return <Spinner />;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        {/* Eagerly loaded */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Lazy loaded — public */}
                        <Route path="/jobs" element={<Jobs />} />
                        <Route path="/jobs/:id" element={<JobDetail />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />

                        {/* Lazy loaded — protected */}
                        <Route path="/dashboard" element={
                            <ProtectedRoute><Dashboard /></ProtectedRoute>
                        } />
                        <Route path="/post-job" element={
                            <ProtectedRoute role="employer"><PostJob /></ProtectedRoute>
                        } />
                        <Route path="/manage/jobs/:id" element={
                            <ProtectedRoute role="employer"><EmployerJobDetails /></ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                            <ProtectedRoute><Profile /></ProtectedRoute>
                        } />
                        <Route path="/applications" element={
                            <ProtectedRoute role="seeker"><Applications /></ProtectedRoute>
                        } />
                        <Route path="/admin" element={
                            <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
                        } />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}

export default App;
