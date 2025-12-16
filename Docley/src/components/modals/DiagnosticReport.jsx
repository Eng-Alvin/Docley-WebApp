import { X, CheckCircle2, AlertCircle, TrendingUp, Info } from 'lucide-react';
import { Button } from '../ui/Button';

export function DiagnosticReport({ isOpen, onClose }) {
    if (!isOpen) return null;

    const scores = [
        { label: 'Structure', score: 85, color: 'text-green-600', bg: 'bg-green-100', bar: 'bg-green-600' },
        { label: 'Academic Tone', score: 72, color: 'text-amber-600', bg: 'bg-amber-100', bar: 'bg-amber-500' },
        { label: 'Clarity', score: 90, color: 'text-indigo-600', bg: 'bg-indigo-100', bar: 'bg-indigo-600' },
        { label: 'Plagiarism Risk', score: 5, color: 'text-slate-600', bg: 'bg-slate-100', bar: 'bg-slate-400', invert: true },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-50 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-indigo-600" />
                            Diagnostic Report
                        </h2>
                        <p className="text-sm text-slate-500">Analysis of your document draft</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Overall Score */}
                    <div className="bg-indigo-600 rounded-xl p-6 text-white flex items-center justify-between shadow-lg shadow-indigo-600/20">
                        <div>
                            <h3 className="text-lg font-semibold mb-1">Overall Grade Prediction</h3>
                            <p className="text-indigo-100 text-sm">Based on current academic standards</p>
                        </div>
                        <div className="text-4xl font-black tracking-tight">B+</div>
                    </div>

                    {/* Detailed Scores */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        {scores.map((item) => (
                            <div key={item.label} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold text-slate-700">{item.label}</span>
                                    <span className={`font-bold ${item.color}`}>{item.invert ? `${item.score}%` : `${item.score}/100`}</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
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
                        <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-900">
                            Key Improvements Needed
                        </div>
                        <div className="divide-y divide-slate-100">
                            <div className="p-4 flex gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Tone Inconsistency</p>
                                    <p className="text-sm text-slate-500 mt-1">Found 3 colloquial phrases that weaken the academic voice. Consider replacing "a lot of" with "significant quantities of".</p>
                                </div>
                            </div>
                            <div className="p-4 flex gap-3">
                                <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Citation Check</p>
                                    <p className="text-sm text-slate-500 mt-1">2 paragraphs lack citations despite making factual claims. Ensure you reference your sources.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-end flex-shrink-0">
                    <Button onClick={onClose} className="bg-indigo-600 text-white hover:bg-indigo-700">
                        Close Report
                    </Button>
                </div>
            </div>
        </div>
    );
}
