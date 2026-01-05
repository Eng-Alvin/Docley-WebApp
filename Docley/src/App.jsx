import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Landing from './pages/Landing';
import Pricing from './pages/Pricing';
import BlogList from './pages/Blog/BlogList';
import BlogPost from './pages/Blog/BlogPost';
import { DashboardLayout } from './components/layout/DashboardLayout';
import DashboardHome from './pages/Dashboard/DashboardHome';
import DashboardDocuments from './pages/Dashboard/DashboardDocuments';
import DashboardSettings from './pages/Dashboard/DashboardSettings';
const TimetableGenerator = lazy(() => import('./pages/Dashboard/TimetableGenerator/TimetableGenerator'));
import EditorPage from './pages/Editor/EditorPage';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import AuthCallback from './pages/Auth/AuthCallback';
import { ToastProvider } from './context/ToastContext';
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

// Maintenance Guard Component
function MaintenanceGuard({ children }) {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Check initial status
    const checkMaintenance = async () => {
      const { data } = await supabase.from('global_settings').select('maintenance_active').single();
      if (data) setIsMaintenance(data.maintenance_active);
      setIsLoading(false);
    };
    checkMaintenance();

    // Listen for changes
    const channel = supabase
      .channel('maintenance_mode')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'global_settings', filter: 'id=eq.1' },
        (payload) => {
          setIsMaintenance(payload.new.maintenance_active);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoading || authLoading) return <LoadingFallback />;

  // Allow Admins to bypass
  const isAdmin = user?.app_metadata?.role === 'admin' || user?.user_metadata?.role === 'admin';

  if (isMaintenance && !isAdmin) {
    return <MaintenancePage />;
  }

  return children;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <FloatingDocuments />
          <PWAInstallPrompt delaySeconds={30} />
          <MaintenanceGuard>
            <Router>
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
                    <EditorPage />
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
            </Router>
          </MaintenanceGuard>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
