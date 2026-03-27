import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import VerifyLogin from './pages/VerifyLogin';
import { Toaster } from 'react-hot-toast';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/pages/Dashboard';
import AdminElections from './admin/pages/Elections';
import AdminElectionDetails from './admin/pages/ElectionDetails';
import AdminCandidates from './admin/pages/Candidates';
import AdminVoters from './admin/pages/Voters';
import AdminMonitoring from './admin/pages/Monitoring';
import AdminResults from './admin/pages/Results';
import AdminBlockchain from './admin/pages/Blockchain';
import AdminAudit from './admin/pages/Audit';
import AdminOwners from './admin/pages/Owners';
import AdminSettings from './admin/pages/Settings';
import AdminProfile from './admin/pages/AdminProfile';
import VoterLayout from './voter/layout/VoterLayout';
import VoterDashboard from './voter/pages/Dashboard';
import ElectionWorkspace from './voter/pages/ElectionWorkspace';
import Calendar from './voter/pages/Calendar';
import ResultsPage from './voter/pages/ResultsPage';
import VoterSettings from './voter/pages/Settings';
import Home from './pages/Home';

// Public Route (Redirect if already logged in)
const PublicRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <div>Loading...</div>;
    if (user) {
        return <Navigate to={user.role === 'admin' ? "/admin" : "/dashboard"} replace />;
    }
    return children;
};

// Simple Protected Route
const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useContext(AuthContext);
    console.log("ProtectedRoute: Rendering...", { loading, hasUser: !!user });

    if (loading) {
        console.log("ProtectedRoute: Auth is loading...");
        return <div>Loading...</div>;
    }

    if (!user) {
        console.log("ProtectedRoute: No user found, redirecting to /");
        return <Navigate to="/" />;
    }

    if (role && user.role !== role) {
        console.log(`ProtectedRoute: Role mismatch. Required: ${role}, User: ${user.role}`);
        // Redirect based on role to avoid infinite loops
        if (user.role === 'admin' && role !== 'admin') {
            return <Navigate to="/admin" />;
        }
        return <Navigate to="/" />;
    }

    console.log("ProtectedRoute: Authorized, rendering children");
    return children;
};

function App() {
    console.log("App: Rendering...");
    return (
        <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}>
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                <Router>
                    <AuthProvider>
                        <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
                            <Toaster position="top-right" />
                            <Routes>
                                <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
                                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                                <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                                <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
                                <Route path="/auth/verify-login" element={<VerifyLogin />} />

                                <Route path="/admin" element={
                                    <ProtectedRoute role="admin">
                                        <AdminLayout />
                                    </ProtectedRoute>
                                }>
                                    <Route index element={<Navigate to="dashboard" replace />} />
                                    <Route path="dashboard" element={<AdminDashboard />} />
                                    <Route path="elections" element={<AdminElections />} />
                                    <Route path="elections/:id" element={<AdminElectionDetails />} />
                                    <Route path="candidates" element={<AdminCandidates />} />
                                    <Route path="voters" element={<AdminVoters />} />
                                    <Route path="owners" element={<AdminOwners />} />
                                    <Route path="monitoring" element={<AdminMonitoring />} />
                                    <Route path="results" element={<AdminResults />} />
                                    <Route path="blockchain" element={<AdminBlockchain />} />
                                    <Route path="audit" element={<AdminAudit />} />
                                    <Route path="settings" element={<AdminSettings />} />
                                    <Route path="profile" element={<AdminProfile />} />
                                </Route>

                                {/* Voter Routes */}
                                <Route element={
                                    <ProtectedRoute role="user">
                                        <VoterLayout />
                                    </ProtectedRoute>
                                }>
                                    <Route path="dashboard" element={<VoterDashboard />} />
                                    <Route path="election/:id" element={<ElectionWorkspace />} />
                                    <Route path="activity" element={<Calendar />} />
                                    <Route path="results" element={<ResultsPage />} />
                                    <Route path="settings" element={<VoterSettings />} />
                                    <Route path="profile" element={<VoterSettings />} />
                                </Route>

                                <Route path="*" element={<Navigate to="/" />} />
                            </Routes>
                        </div>
                    </AuthProvider>
                </Router>
            </GoogleOAuthProvider>
        </GoogleReCaptchaProvider>
    );
}

export default App;