import React, { useState, useEffect } from 'react';
import {
    X,
    Share2,
    Mail,
    Users,
    Shield,
    Trash2,
    Copy,
    Check,
    Loader2,
    Lock,
    Unlock,
    Settings,
    UserPlus
} from 'lucide-react';
import { Button } from '../ui/Button';
import { shareDocument, getDocumentShares } from '../../services/documentsService';
import { useToast } from '../../context/ToastContext';

export const ShareModal = ({ isOpen, onClose, documentId, documentTitle }) => {
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState('read');
    const [isSharing, setIsSharing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [shares, setShares] = useState([]);
    const [copied, setCopied] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        if (isOpen && documentId) {
            loadShares();
        }
    }, [isOpen, documentId]);

    const loadShares = async () => {
        setIsLoading(true);
        try {
            const data = await getDocumentShares(documentId);
            setShares(data);
        } catch (error) {
            console.error('Error loading shares:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleShare = async () => {
        if (!email.trim()) {
            addToast('Please enter an email address', 'error');
            return;
        }

        setIsSharing(true);
        try {
            await shareDocument(documentId, email, permission);
            addToast(`Shared with ${email} successfully`, 'success');
            setEmail('');
            loadShares();
        } catch (error) {
            console.error('Sharing error:', error);
            addToast(error.message || 'Failed to share document', 'error');
        } finally {
            setIsSharing(false);
        }
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}/dashboard/editor/${documentId}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        addToast('Link copied to clipboard', 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-white to-indigo-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                            <Share2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Share Workspace</h2>
                            <p className="text-xs text-slate-500 truncate max-w-[200px]">{documentTitle}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Invite Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pr-1">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <UserPlus className="h-4 w-4 text-slate-400" />
                                Invite Collaborators
                            </label>
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Permissions</span>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Add collaborators by email..."
                                    className="w-full pl-10 pr-4 h-11 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                />
                            </div>
                            <select
                                value={permission}
                                onChange={(e) => setPermission(e.target.value)}
                                className="h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-700 hover:bg-white cursor-pointer"
                            >
                                <option value="read">Can View</option>
                                <option value="write">Can Edit</option>
                            </select>
                            <Button
                                onClick={handleShare}
                                disabled={isSharing || !email.trim()}
                                className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/10"
                            >
                                {isSharing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Invite'}
                            </Button>
                        </div>
                    </div>

                    {/* Shared List */}
                    <div className="space-y-3">
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Users className="h-3.5 w-3.5" />
                            Collaborators ({shares.length})
                        </h3>
                        <div className="max-h-48 overflow-auto custom-scrollbar space-y-2 pr-1">
                            {isLoading ? (
                                <div className="py-8 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-slate-300 mx-auto" />
                                </div>
                            ) : shares.length > 0 ? (
                                shares.map((share, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 group hover:border-indigo-100 hover:bg-white transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                                                {share.users?.email?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-700 truncate">{share.users?.email}</p>
                                                <p className="text-[10px] text-slate-400 flex items-center gap-1 uppercase tracking-wide">
                                                    {share.permission === 'write' ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                                    {share.permission === 'write' ? 'Editor' : 'Viewer'}
                                                </p>
                                            </div>
                                        </div>
                                        <button className="p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                                    <Shield className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                                    <p className="text-sm text-slate-400">No collaborators yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Link Section */}
                    <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white border border-indigo-100 shadow-sm">
                                <Copy className="h-4 w-4 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-900">Workspace Link</p>
                                <p className="text-[10px] text-slate-500">Share this URL with collaborators</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyLink}
                            className="bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50 gap-2"
                        >
                            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            {copied ? 'Copied' : 'Copy Link'}
                        </Button>
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-center">
                    <p className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
                        <Shield className="h-3 w-3" />
                        Only collaborators can access this private workspace.
                    </p>
                </div>
            </div>
        </div>
    );
};
