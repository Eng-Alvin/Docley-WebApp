import React, { useState } from 'react';
import { shallow } from 'zustand/shallow';
import {
    Book, GraduationCap, FileType, Sparkles, CheckCircle,
    AlertCircle, Loader2, ChevronRight, Wand2
} from 'lucide-react';
import useDocumentStore from '../../../stores/useDocumentStore';
import { cn } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';

export const EditorSidebar = ({ className }) => {
    // Select only needed state to minimize re-renders
    const {
        title,
        metadata,
        saveStatus,
        setTitle,
        updateMetadata,
        isProcessing
    } = useDocumentStore(
        (state) => ({
            title: state.title,
            metadata: state.metadata,
            saveStatus: state.saveStatus,
            setTitle: state.setTitle,
            updateMetadata: state.updateMetadata,
            isProcessing: state.isProcessing
        }),
        shallow
    );

    // Local state for AI tools interactions (if needed) or UI toggles
    // For now, simple direct integration.

    const handleChange = (key, value) => {
        updateMetadata({ [key]: value });
    };

    return (
        <aside className={cn(
            "w-80 bg-white border-l border-slate-200 flex flex-col h-full",
            className
        )}>
            {/* Status Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Document Status</span>
                <div className="flex items-center gap-2">
                    {saveStatus === 'saving' && (
                        <span className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving
                        </span>
                    )}
                    {saveStatus === 'saved' && (
                        <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                            <CheckCircle className="h-3.5 w-3.5" /> Saved
                        </span>
                    )}
                    {saveStatus === 'unsaved' && (
                        <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                            <AlertCircle className="h-3.5 w-3.5" /> Unsaved
                        </span>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                {/* Metadata Section */}
                <section className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Document Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900"
                            placeholder="Untitled Document"
                        />
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                            <GraduationCap className="h-3.5 w-3.5" /> Academic Settings
                        </h3>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Academic Level</label>
                            <select
                                value={metadata.academic_level || 'undergraduate'}
                                onChange={(e) => handleChange('academic_level', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                            >
                                <option value="high_school">High School</option>
                                <option value="undergraduate">Undergraduate</option>
                                <option value="graduate">Graduate (Masters)</option>
                                <option value="phd">PhD / Doctorate</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Citation Style</label>
                            <select
                                value={metadata.citation_style || 'APA 7th Edition'}
                                onChange={(e) => handleChange('citation_style', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                            >
                                <option value="APA 7th Edition">APA 7th Edition</option>
                                <option value="MLA 9th Edition">MLA 9th Edition</option>
                                <option value="Chicago 17th (Author-Date)">Chicago 17th (Author-Date)</option>
                                <option value="Harvard">Harvard</option>
                                <option value="IEEE">IEEE</option>
                            </select>
                        </div>
                    </div>
                </section>

                <div className="h-px bg-slate-100" />

                {/* AI Tools Placeholder */}
                <section className="space-y-4">
                    <h3 className="text-xs font-semibold text-indigo-500 uppercase tracking-wide flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5" /> Academic Tools
                    </h3>

                    <div className="grid gap-3">
                        <Button
                            variant="outline"
                            className="w-full justify-start text-slate-600 hover:text-indigo-600 hover:border-indigo-200 bg-white"
                            disabled={isProcessing}
                        >
                            <Wand2 className="mr-2 h-4 w-4 text-indigo-500" />
                            Diagnostic Check
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start text-slate-600 hover:text-indigo-600 hover:border-indigo-200 bg-white"
                            disabled={isProcessing}
                        >
                            <Book className="mr-2 h-4 w-4 text-emerald-500" />
                            Academic Polish
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start text-slate-600 hover:text-indigo-600 hover:border-indigo-200 bg-white"
                            disabled={isProcessing}
                        >
                            <FileType className="mr-2 h-4 w-4 text-amber-500" />
                            Fix Citations
                        </Button>
                    </div>

                    {isProcessing && (
                        <div className="p-3 bg-indigo-50 rounded-lg flex items-center gap-3 text-xs text-indigo-700">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            AI is processing your document...
                        </div>
                    )}
                </section>

            </div>
        </aside>
    );
};
