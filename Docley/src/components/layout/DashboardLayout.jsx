import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import {
    LayoutDashboard,
    FileText,
    Settings,
    Menu,
    X,
    Plus,
    LogOut,
    MessageSquarePlus,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export function DashboardLayout() {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();
    const { addToast } = useToast();

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
        addToast("Signing out...", "info");
        setTimeout(() => {
            addToast("Successfully signed out", "success");
            navigate('/login');
        }, 1000);
    };

    const handleFeedback = () => {
        addToast("Thanks for your feedback! We'll look into it.", "success");
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Menu Button - Fixed */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <Button variant="outline" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 bg-slate-50 border-r border-slate-200 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen flex flex-col",
                isMobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full",
                isCollapsed ? "lg:w-[60px]" : "lg:w-[240px]"
            )}>
                {/* Logo & Toggle */}
                <div className={cn("h-14 flex items-center border-b border-slate-200 transition-all duration-300 relative", isCollapsed ? "justify-center px-0" : "justify-between px-4")}>
                    <Link to="/" className="flex items-center gap-2 overflow-hidden">
                        <div className="bg-indigo-600 text-white p-1 rounded-md flex-shrink-0">
                            <FileText className="h-5 w-5" />
                        </div>
                        {!isCollapsed && (
                            <span className="font-semibold text-slate-900 tracking-tight whitespace-nowrap animate-in fade-in duration-300">Docley</span>
                        )}
                    </Link>

                    {/* Toggle Button - Only visible on desktop */}
                    {!isCollapsed && (
                        <button
                            onClick={() => setIsCollapsed(true)}
                            className="hidden lg:flex text-slate-400 hover:text-slate-600 transition-colors p-1 rounded hover:bg-slate-200"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-2 space-y-1 mt-4 overflow-x-hidden overflow-y-auto custom-scrollbar">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            title={isCollapsed ? item.name : undefined}
                            className={cn(
                                "flex items-center py-2 rounded-md transition-all duration-200 group relative min-h-[40px]",
                                isCollapsed ? "justify-center px-0" : "px-3",
                                isActive(item.href)
                                    ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                                    : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                            )}
                        >
                            <item.icon className={cn(
                                "h-5 w-5 flex-shrink-0 transition-colors",
                                isActive(item.href) ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600",
                                !isCollapsed && "mr-3"
                            )} />
                            {!isCollapsed && (
                                <span className="whitespace-nowrap animate-in fade-in duration-200 text-sm font-medium">{item.name}</span>
                            )}

                            {/* Hover Tooltip for Collapsed State */}
                            {isCollapsed && (
                                <div className="fixed left-[70px] bg-slate-900 text-white text-xs px-2 py-1.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[60] pointer-events-none translate-y-[-50%] top-auto">
                                    {item.name}
                                </div>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Bottom Sidebar */}
                <div className="p-2 space-y-2 border-t border-slate-200 bg-slate-50/50">
                    {/* Expand Button when collapsed */}
                    {isCollapsed && (
                        <button
                            onClick={() => setIsCollapsed(false)}
                            className="w-full flex justify-center p-2 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    )}

                    {/* Usage Stats (Hidden when collapsed) */}
                    {!isCollapsed && (
                        <div className="px-2 py-3 bg-white border border-slate-100 rounded-lg shadow-sm mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-900 mb-1.5">
                                <span>Free Plan</span>
                                <Link to="/pricing" className="text-indigo-600 hover:underline">Upgrade</Link>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full w-1/3 bg-indigo-500 rounded-full"></div>
                            </div>
                        </div>
                    )}

                    {/* Sign Out */}
                    <button
                        onClick={handleSignOut}
                        title={isCollapsed ? "Sign Out" : undefined}
                        className={cn(
                            "flex items-center w-full py-2 text-sm font-medium text-slate-600 rounded-md hover:bg-slate-200/50 hover:text-slate-900 transition-colors group relative min-h-[40px]",
                            isCollapsed ? "justify-center px-0" : "px-3"
                        )}
                    >
                        <LogOut className={cn("h-4 w-4 transition-colors text-slate-400 group-hover:text-slate-600", !isCollapsed && "mr-3")} />
                        {!isCollapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 overflow-y-auto">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center h-16 px-4 bg-white border-b border-slate-200 sticky top-0 z-30">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="text-slate-500 hover:text-slate-700 p-2 -ml-2"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="ml-2 font-semibold text-slate-900">Dashboard</span>
                </div>

                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
