import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Pricing from './pages/Pricing';
import BlogList from './pages/Blog/BlogList';
import BlogPost from './pages/Blog/BlogPost';
import { DashboardLayout } from './components/layout/DashboardLayout';
import DashboardHome from './pages/Dashboard/DashboardHome';
import DashboardDocuments from './pages/Dashboard/DashboardDocuments';
import DashboardSettings from './pages/Dashboard/DashboardSettings';
import EditorPage from './pages/Editor/EditorPage';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import { ToastProvider } from './context/ToastContext';

// Placeholder components to prevent router errors until implemented
const PlaceholderPage = ({ title }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900">
    <h1 className="text-3xl font-bold">{title} Page - Coming Soon</h1>
  </div>
);

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:id" element={<BlogPost />} />

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="documents" element={<DashboardDocuments />} />
            <Route path="editor/:id" element={<EditorPage />} />
            <Route path="settings" element={<DashboardSettings />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
