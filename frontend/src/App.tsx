import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Spinner from './components/Spinner';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Dashboard from './pages/Dashboard';
import PostJob from './pages/PostJob';
import Profile from './pages/Profile';
import Applications from './pages/Applications';
import EmployerJobDetails from './pages/EmployerJobDetails';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children, role }: { children: JSX.Element; role?: string }) {
    const { isAuthenticated, user, loading } = useAuth();
    if (loading) return <Spinner />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (role && user?.role !== role) return <Navigate to="/dashboard" replace />;
    return children;
}

function App() {
    const { loading } = useAuth();
    if (loading) return <Spinner />;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/jobs" element={<Jobs />} />
                    <Route path="/jobs/:id" element={<JobDetail />} />
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
            </main>
            <Footer />
        </div>
    );
}

export default App;
