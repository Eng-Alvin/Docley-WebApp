import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import {
    LayoutDashboard,
    FileText,
    Settings,
    Menu,
    X,
    LogOut,
    Sparkles,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { OnboardingFlow, isOnboardingCompleted } from '../onboarding/OnboardingFlow';

export function DashboardLayout() {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const navigate = useNavigate();
    const { addToast } = useToast();

    // Check onboarding on mount
    useEffect(() => {
        if (!isOnboardingCompleted()) {
            setShowOnboarding(true);
        }
    }, []);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'My Documents', href: '/dashboard/documents', icon: FileText },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    const isActive = (path) => {
        if (path === '/dashboard' && location.pathname !== '/dashboard') return false;
        return location.pathname.startsWith(path);
    };

    const handleSignOut = () => {
        addToast('Signing out...', 'info');
        setTimeout(() => {
            addToast('Successfully signed out', 'success');
            navigate('/login');
        }, 1000);
    };

    const handleOnboardingComplete = () => {
        setShowOnboarding(false);
    };

    // Sidebar is collapsed by default, expands on hover
    const isCollapsed = !isHovered;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex">
            {/* Onboarding Flow */}
            {showOnboarding && <OnboardingFlow onComplete={handleOnboardingComplete} />}

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Menu Button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="bg-white shadow-lg border-slate-200"
                >
                    {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>

            {/* Sidebar - Fixed position, auto-collapse with hover expand */}
            <aside
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={cn(
                    'fixed inset-y-0 left-0 z-30 bg-white border-r border-slate-200 flex flex-col shadow-lg transition-all duration-300 ease-in-out',
                    // Mobile: hidden by default, shown when menu is open
                    isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full',
                    // Desktop: always visible, collapsed by default, expands on hover
                    'lg:translate-x-0',
                    isCollapsed ? 'lg:w-[70px]' : 'lg:w-[260px]'
                )}
            >
                {/* Logo */}
                <div
                    className={cn(
                        'h-16 flex items-center border-b border-slate-200 transition-all duration-300 relative bg-gradient-to-r from-white to-indigo-50/30',
                        isCollapsed ? 'justify-center px-0' : 'justify-center px-5'
                    )}
                >
                    <Link to="/" className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-2 rounded-lg flex-shrink-0 shadow-lg shadow-indigo-500/25">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col animate-in fade-in duration-200">
                                <span className="font-bold text-slate-900 tracking-tight whitespace-nowrap text-lg">
                                    Docley
                                </span>
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Academic Transformer</span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 mt-2 overflow-x-hidden overflow-y-auto custom-scrollbar">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            title={isCollapsed ? item.name : undefined}
                            className={cn(
                                'flex items-center py-2.5 rounded-lg transition-all duration-200 group relative min-h-[44px]',
                                isCollapsed ? 'justify-center px-0' : 'px-3',
                                isActive(item.href)
                                    ? 'bg-gradient-to-r from-indigo-50 to-indigo-50/50 text-indigo-700 shadow-sm border border-indigo-100'
                                    : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900'
                            )}
                        >
                            <item.icon
                                className={cn(
                                    'h-5 w-5 flex-shrink-0 transition-colors',
                                    isActive(item.href) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600',
                                    !isCollapsed && 'mr-3'
                                )}
                            />
                            {!isCollapsed && (
                                <span className="whitespace-nowrap animate-in fade-in duration-200 text-sm font-medium">
                                    {item.name}
                                </span>
                            )}

                            {/* Hover Tooltip for Collapsed State */}
                            {isCollapsed && (
                                <div className="fixed left-[80px] bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[60] pointer-events-none">
                                    {item.name}
                                </div>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Bottom Sidebar */}
                <div className="p-3 space-y-2 border-t border-slate-200 bg-gradient-to-b from-white to-slate-50/50">
                    {/* Usage Stats (Hidden when collapsed) */}
                    {!isCollapsed && (
                        <div className="px-3 py-3 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl shadow-sm mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-900 mb-2">
                                <span>Free Plan</span>
                                <Link
                                    to="/pricing"
                                    className="text-indigo-600 hover:text-indigo-700 hover:underline text-xs font-medium"
                                >
                                    Upgrade
                                </Link>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full" style={{ width: '33%' }}></div>
                            </div>
                            <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
                                <span>1 / 3 documents</span>
                                <span>This month</span>
                            </div>
                        </div>
                    )}

                    {/* Sign Out */}
                    <button
                        onClick={handleSignOut}
                        title={isCollapsed ? 'Sign Out' : undefined}
                        className={cn(
                            'flex items-center w-full py-2.5 text-sm font-medium text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors group relative min-h-[44px]',
                            isCollapsed ? 'justify-center px-0' : 'px-3'
                        )}
                    >
                        <LogOut
                            className={cn(
                                'h-5 w-5 transition-colors text-slate-400 group-hover:text-red-600',
                                !isCollapsed && 'mr-3'
                            )}
                        />
                        {!isCollapsed && <span className="animate-in fade-in duration-200">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content - Add left margin/padding to account for fixed sidebar */}
            <main className="flex-1 min-w-0 overflow-y-auto custom-scrollbar lg:ml-[70px]">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center h-16 px-4 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                    <span className="ml-12 font-bold text-slate-900 text-lg">Dashboard</span>
                </div>

                <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
