import { useState } from 'react';
import { X, FileText, ChevronRight, GraduationCap, Quote } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

export function IntakeModal({ isOpen, onClose }) {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        type: 'Essay',
        level: 'Undergraduate',
        style: 'APA 7th Edition'
    });

    if (!isOpen) return null;

    const handleSubmit = () => {
        addToast("Document created successfully", "success");
        navigate('/dashboard/editor/new', { state: { ...formData } });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">New Document</h2>
                        <p className="text-xs text-slate-500">Set up your assignment details</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Title Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-indigo-600" />
                            Document Title
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., The Impact of AI on Modern Education"
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Type Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-indigo-600" />
                                Type
                            </label>
                            <select
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option>Essay</option>
                                <option>Research Paper</option>
                                <option>Thesis</option>
                                <option>Case Study</option>
                                <option>Report</option>
                            </select>
                        </div>

                        {/* Level Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-indigo-600" />
                                Academic Level
                            </label>
                            <select
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                            >
                                <option>High School</option>
                                <option>Undergraduate</option>
                                <option>Postgraduate</option>
                                <option>PhD</option>
                            </select>
                        </div>
                    </div>

                    {/* Citation Style */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Quote className="h-4 w-4 text-indigo-600" />
                            Citation Style
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {['APA 7th Edition', 'MLA 9th Edition', 'Harvard', 'Chicago'].map((style) => (
                                <button
                                    key={style}
                                    onClick={() => setFormData({ ...formData, style })}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${formData.style === style
                                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-slate-50'
                                        }`}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!formData.title.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        Create Document <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
