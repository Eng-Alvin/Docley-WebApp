import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Landing from './pages/Landing';
import Pricing from './pages/Pricing';
import BlogList from './pages/Blog/BlogList';
import BlogPost from './pages/Blog/BlogPost';
import { DashboardLayout } from './components/layout/DashboardLayout';
import DashboardHome from './pages/Dashboard/DashboardHome';
import DashboardDocuments from './pages/Dashboard/DashboardDocuments';
import DashboardSettings from './pages/Dashboard/DashboardSettings';
import Billing from './pages/Dashboard/Billing';
const TimetableGenerator = lazy(() => import('./pages/Dashboard/TimetableGenerator/TimetableGenerator'));
import EditorContainer from './pages/Editor/EditorContainer';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import AuthCallback from './pages/Auth/AuthCallback';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute, PublicRoute, AdminOnlyRoute } from './components/ProtectedRoute';
import { FloatingDocuments } from './components/ui/FloatingDocuments';
import { PWAInstallPrompt } from './components/ui/PWAInstallPrompt';
import { Loader2 } from 'lucide-react';
import MaintenancePage from './pages/MaintenancePage';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useAuth } from './context/AuthContext';
import apiClient from './api/client';

// Lazy-loaded Admin components (code splitting)
const AdminLayout = lazy(() => import('./layouts/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const BlogManager = lazy(() => import('./pages/Admin/BlogManager'));
const BlogPostEditor = lazy(() => import('./pages/Admin/BlogPostEditor'));
const UsersManager = lazy(() => import('./pages/Admin/UsersManager'));
const AdminSettings = lazy(() => import('./pages/Admin/AdminSettings'));
const FeedbackManager = lazy(() => import('./pages/Admin/FeedbackManager'));

// Loading fallback for lazy-loaded components
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 text-orange-500 animate-spin mx-auto" />
        <p className="mt-4 text-slate-600 text-sm">Loading...</p>
      </div>
    </div>
  );
}

// Maintenance Guard Component (Non-Blocking)
function MaintenanceGuard({ children }) {
  const { isAdmin } = useAuth();
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [connectivityError, setConnectivityError] = useState(false);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const response = await apiClient.get('/maintenance');
        setIsMaintenance(response.data.maintenance_active);
        setConnectivityError(false);
      } catch (err) {
        // If it's a cold start or network issue, don't block
        if (!err.response || err.response.status >= 500) {
          console.warn('[Maintenance] Server likely sleeping or unreachable.');
          // We don't set connectivityError here to avoid blocking the UI
          // The NotificationContext / Waking up indicator handles the UX
        }
      }
    };

    checkMaintenance();
    const interval = setInterval(checkMaintenance, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // If we definitively know it's maintenance and user is not admin, then redirect or show page
  // But we don't BLOCK the initial render.
  if (isMaintenance && !isAdmin) {
    return <MaintenancePage />;
  }

  return children;
}

// Redirect Loop Protection
function RedirectLoopProtector({ children }) {
  useEffect(() => {
    const MAX_REDIRECTS = 5;
    const TIME_WINDOW = 2000; // 2 seconds

    const lastLoad = localStorage.getItem('last_load_time');
    const redirects = parseInt(localStorage.getItem('redirect_count') || '0');
    const now = Date.now();

    if (lastLoad && now - parseInt(lastLoad) < TIME_WINDOW) {
      const newCount = redirects + 1;
      localStorage.setItem('redirect_count', newCount.toString());

      if (newCount > MAX_REDIRECTS) {
        console.error('Redirect loop detected. Clearing storage.');
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login'; // Start fresh
      }
    } else {
      localStorage.setItem('redirect_count', '0');
    }

    localStorage.setItem('last_load_time', now.toString());
  }, []);

  return children;
}

// 6. Notification Navigation Handler (inside Router context)
function NotificationNavigationHandler() {
  const navigate = useNavigate();
  const { pendingAction, resolveAction } = useNotification();

  useEffect(() => {
    if (pendingAction) {
      console.log('🚀 Handling Notification Action:', pendingAction.type);

      switch (pendingAction.type) {
        case 'upgrade':
          navigate('/pricing');
          break;
        case 'navigate':
          navigate(pendingAction.payload?.path || '/');
          break;
        case 'retry':
          window.location.reload();
          break;
        default:
          break;
      }

      resolveAction();
    }
  }, [pendingAction, navigate, resolveAction]);

  return null;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <NotificationProvider>
            <NotificationNavigationHandler />
            <FloatingDocuments />
            <PWAInstallPrompt delaySeconds={30} />
            <MaintenanceGuard>
              <RedirectLoopProtector>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/blog" element={<BlogList />} />
                  <Route path="/blog/:id" element={<BlogPost />} />

                  {/* Maintenance Page Route (for testing/direct access) */}
                  <Route path="/maintenance" element={<MaintenancePage />} />

                  {/* Auth Routes */}
                  <Route path="/login" element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  } />
                  <Route path="/signup" element={
                    <PublicRoute>
                      <Signup />
                    </PublicRoute>
                  } />
                  <Route path="/forgot-password" element={
                    <PublicRoute>
                      <ForgotPassword />
                    </PublicRoute>
                  } />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />

                  {/* Protected Editor Route - Standalone without sidebar */}
                  <Route path="/dashboard/editor/:id" element={
                    <ProtectedRoute>
                      <EditorContainer />
                    </ProtectedRoute>
                  } />

                  {/* Protected Dashboard Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<DashboardHome />} />
                    <Route path="documents" element={<DashboardDocuments />} />
                    <Route path="timetable" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <TimetableGenerator />
                      </Suspense>
                    } />
                    <Route path="settings" element={<DashboardSettings />} />
                    <Route path="settings/billing" element={<Billing />} />
                  </Route>

                  {/* Admin Routes - Lazy loaded, restricted to admin email only */}
                  <Route path="/admin" element={
                    <AdminOnlyRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <AdminLayout />
                      </Suspense>
                    </AdminOnlyRoute>
                  }>
                    <Route index element={
                      <Suspense fallback={<LoadingFallback />}>
                        <AdminDashboard />
                      </Suspense>
                    } />
                    <Route path="users" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <UsersManager />
                      </Suspense>
                    } />
                    <Route path="blog" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <BlogManager />
                      </Suspense>
                    } />
                    <Route path="blog/new" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <BlogPostEditor />
                      </Suspense>
                    } />
                    <Route path="blog/edit/:id" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <BlogPostEditor />
                      </Suspense>
                    } />
                    <Route path="feedback" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <FeedbackManager />
                      </Suspense>
                    } />
                    <Route path="settings" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <AdminSettings />
                      </Suspense>
                    } />
                  </Route>
                </Routes>
              </RedirectLoopProtector>
            </MaintenanceGuard>
          </NotificationProvider>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
