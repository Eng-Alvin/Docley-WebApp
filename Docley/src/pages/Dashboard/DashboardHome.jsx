import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    FileText,
    TrendingUp,
    Clock,
    AlertCircle,
    Plus,
    ChevronRight,
    ShieldCheck,
    Sparkles,
    ArrowRight,
    Zap,
    CheckCircle2,
    BarChart3,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { ContentIntakeModal } from '../../components/modals/ContentIntakeModal';
import { IntakeModal } from '../../components/modals/IntakeModal';
import { getDocuments } from '../../services/documentsService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

export default function DashboardHome() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [showContentModal, setShowContentModal] = useState(false);
    const [showIntakeModal, setShowIntakeModal] = useState(false);
    const [intakeContent, setIntakeContent] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load recent documents
    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            const docs = await getDocuments({ limit: 6 });
            setDocuments(docs);
        } catch (error) {
            console.error('Error loading documents:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleContentContinue = (content) => {
        setIntakeContent(content);
        setShowContentModal(false);
        setShowIntakeModal(true);
    };

    const handleIntakeClose = () => {
        setShowIntakeModal(false);
        setIntakeContent(null);
        // Reload documents after creating new one
        loadDocuments();
    };

    const handleIntakeBack = () => {
        setShowIntakeModal(false);
        setShowContentModal(true);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    // Get user's display name
    const getUserDisplayName = () => {
        if (user?.user_metadata?.full_name) {
            return user.user_metadata.full_name.split(' ')[0]; // First name only
        }
        if (user?.email) {
            return user.email.split('@')[0]; // Username from email
        }
        return 'there';
    };

    return (
        <div className="space-y-8">
            {/* Modals */}
            <ContentIntakeModal
                isOpen={showContentModal}
                onClose={() => setShowContentModal(false)}
                onContinue={handleContentContinue}
            />
            <IntakeModal
                isOpen={showIntakeModal}
                onClose={handleIntakeClose}
                onBack={handleIntakeBack}
                initialContent={intakeContent}
            />

            {/* Welcome Message */}
            <div className={cn(
                "rounded-2xl border p-6 backdrop-blur-xl",
                isDark 
                    ? "bg-white/5 border-white/10" 
                    : "bg-gradient-to-br from-indigo-50 via-white to-orange-50/30 border-indigo-100/50"
            )}>
                <h1 className={cn(
                    "text-3xl md:text-4xl font-bold mb-2",
                    isDark ? "text-white" : "text-slate-900"
                )}>
                    Welcome back, {getUserDisplayName()}! 👋
                </h1>
                <p className={cn(
                    "text-base md:text-lg",
                    isDark ? "text-slate-300" : "text-slate-600"
                )}>
                    Ready to transform your next assignment into submission-ready work?
                </p>
            </div>

            {/* Hero Section */}
            <div className={cn(
                "relative overflow-hidden rounded-2xl border p-8 md:p-10 backdrop-blur-xl",
                isDark 
                    ? "bg-white/5 border-white/10" 
                    : "bg-gradient-to-br from-indigo-50 via-white to-orange-50/30 border-indigo-100/50"
            )}>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4 flex-1">
                        <div className={cn(
                            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm border w-fit",
                            isDark
                                ? "bg-white/10 border-white/20"
                                : "bg-white/80 border-indigo-100"
                        )}>
                            <Sparkles className={cn(
                                "h-3.5 w-3.5",
                                isDark ? "text-orange-400" : "text-indigo-600"
                            )} />
                            <span className={cn(
                                "text-xs font-semibold uppercase tracking-wide",
                                isDark ? "text-white/90" : "text-indigo-700"
                            )}>
                                Academic Transformer
                            </span>
                        </div>
                        <h1 className={cn(
                            "text-3xl md:text-4xl lg:text-5xl font-bold leading-tight",
                            isDark ? "text-white" : "text-slate-900"
                        )}>
                            Transform your rough draft into{' '}
                            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                                submission-ready
                            </span>{' '}
                            work
                        </h1>
                        <p className={cn(
                            "text-base md:text-lg max-w-2xl leading-relaxed",
                            isDark ? "text-slate-300" : "text-slate-600"
                        )}>
                            Start with your own work, run diagnostics, then transform it into clear, structured, and
                            academically safe writing—before you submit.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Button
                                onClick={() => setShowContentModal(true)}
                                className="w-full sm:w-auto shadow-xl shadow-orange-500/25 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-none text-white text-base px-6 py-3 h-auto"
                            >
                                <Plus className="mr-2 h-5 w-5" /> Upgrade New Assignment
                            </Button>
                            <Link to="/dashboard/documents">
                                <Button 
                                    variant="outline" 
                                    className={cn(
                                        "w-full sm:w-auto text-base px-6 py-3 h-auto",
                                        isDark
                                            ? "border-white/20 bg-white/5 text-white hover:bg-white/10"
                                            : "border-slate-300 hover:bg-slate-50"
                                    )}
                                >
                                    View All Documents
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
                {/* Decorative gradient blob */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-200/20 to-indigo-200/20 rounded-full blur-3xl -z-0"></div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                <Card className={cn(
                    "hover:shadow-lg transition-all duration-300",
                    isDark
                        ? "bg-white/5 border-white/10"
                        : "border-indigo-100 bg-gradient-to-br from-white via-indigo-50/30 to-white"
                )}>
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <div className={cn(
                                    "flex items-center gap-2 text-sm font-medium",
                                    isDark ? "text-slate-300" : "text-slate-600"
                                )}>
                                    <FileText className="h-4 w-4 hidden md:block" />
                                    Structure Quality
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <h3 className={cn(
                                        "text-3xl font-bold",
                                        isDark ? "text-white" : "text-slate-900"
                                    )}>
                                        B+
                                    </h3>
                                    <span className={cn(
                                        "text-xs",
                                        isDark ? "text-slate-400" : "text-slate-500"
                                    )}>
                                        Average
                                    </span>
                                </div>
                                <p className={cn(
                                    "text-xs leading-relaxed",
                                    isDark ? "text-slate-400" : "text-slate-500"
                                )}>
                                    Your drafts show solid outline and paragraph structure
                                </p>
                            </div>
                            <div className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 hidden md:flex",
                                isDark
                                    ? "bg-indigo-500/20"
                                    : "bg-indigo-100"
                            )}>
                                <BarChart3 className={cn(
                                    "h-6 w-6",
                                    isDark ? "text-indigo-400" : "text-indigo-600"
                                )} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className={cn(
                    "hover:shadow-lg transition-all duration-300",
                    isDark
                        ? "bg-white/5 border-white/10"
                        : "border-green-100 bg-gradient-to-br from-white via-green-50/30 to-white"
                )}>
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <div className={cn(
                                    "flex items-center gap-2 text-sm font-medium",
                                    isDark ? "text-slate-300" : "text-slate-600"
                                )}>
                                    <TrendingUp className="h-4 w-4 hidden md:block" />
                                    Academic Tone
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <h3 className={cn(
                                        "text-3xl font-bold",
                                        isDark ? "text-white" : "text-slate-900"
                                    )}>
                                        A-
                                    </h3>
                                    <span className={cn(
                                        "text-xs",
                                        isDark ? "text-slate-400" : "text-slate-500"
                                    )}>
                                        Strong
                                    </span>
                                </div>
                                <p className={cn(
                                    "text-xs leading-relaxed",
                                    isDark ? "text-slate-400" : "text-slate-500"
                                )}>
                                    Consistently matches formal academic language standards
                                </p>
                            </div>
                            <div className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 hidden md:flex",
                                isDark
                                    ? "bg-green-500/20"
                                    : "bg-green-100"
                            )}>
                                <Zap className={cn(
                                    "h-6 w-6",
                                    isDark ? "text-green-400" : "text-green-600"
                                )} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className={cn(
                    "hover:shadow-lg transition-all duration-300",
                    isDark
                        ? "bg-white/5 border-white/10"
                        : "border-amber-100 bg-gradient-to-br from-white via-amber-50/30 to-white"
                )}>
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <div className={cn(
                                    "flex items-center gap-2 text-sm font-medium",
                                    isDark ? "text-slate-300" : "text-slate-600"
                                )}>
                                    <ShieldCheck className="h-4 w-4 hidden md:block" />
                                    Plagiarism Risk
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <h3 className={cn(
                                        "text-3xl font-bold",
                                        isDark ? "text-white" : "text-slate-900"
                                    )}>
                                        Low
                                    </h3>
                                    <span className={cn(
                                        "text-xs",
                                        isDark ? "text-slate-400" : "text-slate-500"
                                    )}>
                                        Safe
                                    </span>
                                </div>
                                <p className={cn(
                                    "text-xs leading-relaxed",
                                    isDark ? "text-slate-400" : "text-slate-500"
                                )}>
                                    Transformations prioritize originality and safe paraphrasing
                                </p>
                            </div>
                            <div className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 hidden md:flex",
                                isDark
                                    ? "bg-amber-500/20"
                                    : "bg-amber-100"
                            )}>
                                <ShieldCheck className={cn(
                                    "h-6 w-6",
                                    isDark ? "text-amber-400" : "text-amber-600"
                                )} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>


            {/* Recent Documents */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className={cn(
                            "text-2xl font-bold mb-1",
                            isDark ? "text-white" : "text-slate-900"
                        )}>
                            Recent Documents
                        </h2>
                        <p className={cn(
                            "text-sm",
                            isDark ? "text-slate-400" : "text-slate-500"
                        )}>
                            Pick up where you left off, compare before/after, or refine one more time.
                        </p>
                    </div>
                    <Link to="/dashboard/documents">
                        <Button 
                            variant="ghost" 
                            className={cn(
                                isDark
                                    ? "text-orange-400 hover:text-orange-300 hover:bg-white/10"
                                    : "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                            )}
                        >
                            View All
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="h-48 animate-pulse bg-slate-100 border-slate-200" />
                        ))}
                    </div>
                ) : documents.length === 0 ? (
                    <Card className={cn(
                        "border-dashed border-2",
                        isDark
                            ? "border-white/10 bg-white/5"
                            : "border-slate-200 bg-slate-50/50"
                    )}>
                        <CardContent className="p-12 text-center">
                            <div className={cn(
                                "mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4",
                                isDark ? "bg-white/10" : "bg-slate-100"
                            )}>
                                <FileText className={cn(
                                    "h-8 w-8",
                                    isDark ? "text-slate-500" : "text-slate-400"
                                )} />
                            </div>
                            <h3 className={cn(
                                "text-lg font-semibold mb-2",
                                isDark ? "text-white" : "text-slate-900"
                            )}>
                                No documents yet
                            </h3>
                            <p className={cn(
                                "text-sm mb-6",
                                isDark ? "text-slate-400" : "text-slate-500"
                            )}>
                                Create your first document to start transforming your academic work.
                            </p>
                            <Button
                                onClick={() => setShowContentModal(true)}
                                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Create Document
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {documents.map((doc) => (
                            <Link
                                to={`/dashboard/editor/${doc.id}`}
                                key={doc.id}
                                className="group block h-full"
                            >
                                <Card className={cn(
                                    "h-full hover:shadow-lg transition-all duration-300",
                                    isDark
                                        ? "bg-white/5 border-white/10 hover:border-orange-500/30"
                                        : "border-slate-200 hover:border-indigo-300 bg-white"
                                )}>
                                    <CardContent className="p-6 flex flex-col h-full">
                                        <div className="flex items-start justify-between mb-4">
                                            <div
                                                className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${doc.status === 'upgraded'
                                                        ? 'bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600'
                                                        : 'bg-slate-100 text-slate-500'
                                                    }`}
                                            >
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            {doc.status === 'upgraded' ? (
                                                <div className="text-right">
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200">
                                                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                        <span className="text-xs font-bold text-green-700 uppercase tracking-wide">
                                                            Upgraded
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200">
                                                    <AlertCircle className="h-3 w-3 text-amber-600" />
                                                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                                                        {doc.status === 'diagnosed' ? 'Diagnosed' : 'Draft'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-2">
                                            <h3 className={cn(
                                                "text-base font-bold line-clamp-2 leading-snug transition-colors",
                                                isDark
                                                    ? "text-white group-hover:text-orange-400"
                                                    : "text-slate-900 group-hover:text-indigo-600"
                                            )}>
                                                {doc.title}
                                            </h3>
                                            <div className={cn(
                                                "flex items-center gap-3 text-xs",
                                                isDark ? "text-slate-400" : "text-slate-500"
                                            )}>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5 hidden md:block" />
                                                    {formatDate(doc.updated_at)}
                                                </span>
                                                <span>•</span>
                                                <span>{doc.word_count?.toLocaleString() || 0} words</span>
                                            </div>
                                        </div>

                                        <div className={cn(
                                            "pt-4 mt-4 border-t flex items-center justify-between",
                                            isDark ? "border-white/10" : "border-slate-100"
                                        )}>
                                            <span className={cn(
                                                "text-xs font-medium transition-colors",
                                                isDark
                                                    ? "text-slate-400 group-hover:text-orange-400"
                                                    : "text-slate-500 group-hover:text-indigo-600"
                                            )}>
                                                View & Edit
                                            </span>
                                            <ChevronRight className={cn(
                                                "h-4 w-4 transition-all",
                                                isDark
                                                    ? "text-slate-500 group-hover:text-orange-400 group-hover:translate-x-1"
                                                    : "text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1"
                                            )} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
