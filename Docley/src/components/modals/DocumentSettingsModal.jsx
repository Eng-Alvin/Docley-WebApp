import { useState, useEffect } from 'react';
import { X, Settings, Layout, AlignLeft, Type, Save } from 'lucide-react';
import { Button } from '../ui/Button';

export function DocumentSettingsModal({ isOpen, onClose, onSave, initialSettings }) {
    const [settings, setSettings] = useState({
        margins: {
            top: 96,
            bottom: 96,
            left: 96,
            right: 96
        },
        headerText: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (initialSettings) {
            setSettings({
                margins: initialSettings.margins || { top: 96, bottom: 96, left: 96, right: 96 },
                headerText: initialSettings.headerText || ''
            });
        }
    }, [initialSettings, isOpen]);

    if (!isOpen) return null;

    const handleMarginChange = (side, value) => {
        const numValue = parseInt(value, 10) || 0;
        setSettings(prev => ({
            ...prev,
            margins: {
                ...prev.margins,
                [side]: numValue
            }
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(settings);
            onClose();
        } catch (error) {
            console.error('Failed to save document settings:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-white to-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                            <Settings className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Document Settings</h2>
                            <p className="text-xs text-slate-500">Customize layout and appearance</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Margins Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <Layout className="h-4 w-4 text-indigo-600" />
                            Page Margins (px)
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Top</label>
                                <input
                                    type="number"
                                    value={settings.margins.top}
                                    onChange={(e) => handleMarginChange('top', e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Bottom</label>
                                <input
                                    type="number"
                                    value={settings.margins.bottom}
                                    onChange={(e) => handleMarginChange('bottom', e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Left</label>
                                <input
                                    type="number"
                                    value={settings.margins.left}
                                    onChange={(e) => handleMarginChange('left', e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Right</label>
                                <input
                                    type="number"
                                    value={settings.margins.right}
                                    onChange={(e) => handleMarginChange('right', e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400">Default academic margin is 96px (approx. 1 inch).</p>
                    </div>

                    {/* Header Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <Type className="h-4 w-4 text-indigo-600" />
                            Custom Header
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Header Text</label>
                            <input
                                type="text"
                                value={settings.headerText}
                                onChange={(e) => setSettings({ ...settings, headerText: e.target.value })}
                                placeholder="e.g., Course Name • Student ID"
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                        <p className="text-xs text-slate-500 italic">This text will appear at the top of every page in your document.</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose} className="text-slate-600">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        isLoading={isSaving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}
