import { X, CheckCircle2, AlertCircle, TrendingUp, Info, BarChart3, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export function DiagnosticReport({ isOpen, onClose }) {
    if (!isOpen) return null;

    const scores = [
        { label: 'Structure Quality', score: 85, color: 'text-green-600', bg: 'bg-green-100', bar: 'bg-green-600', icon: BarChart3 },
        { label: 'Academic Tone', score: 72, color: 'text-amber-600', bg: 'bg-amber-100', bar: 'bg-amber-500', icon: TrendingUp },
        { label: 'Clarity & Coherence', score: 90, color: 'text-indigo-600', bg: 'bg-indigo-100', bar: 'bg-indigo-600', icon: Sparkles },
        { label: 'Plagiarism Risk', score: 5, color: 'text-green-600', bg: 'bg-green-100', bar: 'bg-green-500', invert: true, icon: ShieldCheck },
    ];

    const improvements = [
        {
            type: 'warning',
            icon: AlertCircle,
            title: 'Tone Inconsistency',
            description: 'Found 3 colloquial phrases that weaken the academic voice. Consider replacing "a lot of" with "significant quantities of".',
        },
        {
            type: 'info',
            icon: Info,
            title: 'Citation Check',
            description: '2 paragraphs lack citations despite making factual claims. Ensure you reference your sources appropriately.',
        },
        {
            type: 'success',
            icon: CheckCircle2,
            title: 'Strong Structure',
            description: 'Your document demonstrates clear paragraph flow and logical progression. Well-organized introduction and conclusion.',
        },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-5 bg-gradient-to-r from-indigo-50 via-white to-indigo-50/30 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">Diagnostic Report</h2>
                            <p className="text-sm text-slate-500">Comprehensive analysis of your document</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                    {/* Overall Score */}
                    <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg shadow-indigo-600/25">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Overall Grade Prediction
                                </h3>
                                <p className="text-indigo-100 text-sm">Based on current academic standards and best practices</p>
                            </div>
                            <div className="text-right">
                                <div className="text-5xl font-black tracking-tight">B+</div>
                                <div className="text-sm text-indigo-200 mt-1">Good</div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Scores */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        {scores.map((item) => (
                            <div
                                key={item.label}
                                className="bg-gradient-to-br from-white to-slate-50/50 p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`h-8 w-8 rounded-lg ${item.bg} flex items-center justify-center`}>
                                            <item.icon className={`h-4 w-4 ${item.color}`} />
                                        </div>
                                        <span className="font-semibold text-slate-700 text-sm">{item.label}</span>
                                    </div>
                                    <span className={`font-bold text-lg ${item.color}`}>
                                        {item.invert ? `${item.score}%` : `${item.score}/100`}
                                    </span>
                                </div>
                                <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${item.bar}`}
                                        style={{ width: `${item.score}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Actionable Feedback */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 bg-gradient-to-r from-slate-50 to-indigo-50/30 border-b border-slate-100 font-semibold text-slate-900 flex items-center gap-2">
                            <Info className="h-4 w-4 text-indigo-600" />
                            Key Improvements & Insights
                        </div>
                        <div className="divide-y divide-slate-100">
                            {improvements.map((item, idx) => (
                                <div key={idx} className="p-4 flex gap-4 hover:bg-slate-50/50 transition-colors">
                                    <div
                                        className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                            item.type === 'warning'
                                                ? 'bg-amber-100'
                                                : item.type === 'info'
                                                ? 'bg-blue-100'
                                                : 'bg-green-100'
                                        }`}
                                    >
                                        <item.icon
                                            className={`h-5 w-5 ${
                                                item.type === 'warning'
                                                    ? 'text-amber-600'
                                                    : item.type === 'info'
                                                    ? 'text-blue-600'
                                                    : 'text-green-600'
                                            }`}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-slate-900 mb-1">{item.title}</p>
                                        <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Citation Quality */}
                    <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-xl p-5 border border-slate-200">
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <h4 className="font-semibold text-slate-900">Citation Quality</h4>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Your document uses proper citation formatting. All referenced sources are correctly attributed according
                            to the selected citation style (APA 7th Edition).
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
                    <Button variant="outline" onClick={onClose} className="border-slate-200">
                        Close Report
                    </Button>
                    <Button
                        onClick={() => {
                            onClose();
                            // Trigger upgrade action
                        }}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-none text-white shadow-lg shadow-orange-500/25"
                    >
                        Apply Upgrade
                    </Button>
                </div>
            </div>
        </div>
    );
}
