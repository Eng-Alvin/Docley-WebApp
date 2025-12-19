import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import {
    ArrowLeft,
    Save,
    Download,
    Wand2,
    Bold,
    Italic,
    List,
    ListOrdered,
    Quote,
    Heading1,
    Heading2,
    Loader2,
    CheckCircle2,
    X,
    FileText,
    BarChart3,
    Settings,
    Sparkles,
} from 'lucide-react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { mockDocuments } from '../../data/documentsData';
import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';
import { DiagnosticReport } from '../../components/modals/DiagnosticReport';

const MenuBar = ({ editor }) => {
    if (!editor) {
        return null;
    }

    const buttons = [
        { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive('bold'), label: 'Bold' },
        { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive('italic'), label: 'Italic' },
        { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: editor.isActive('heading', { level: 1 }), label: 'Heading 1' },
        { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editor.isActive('heading', { level: 2 }), label: 'Heading 2' },
        { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), isActive: editor.isActive('bulletList'), label: 'Bullet List' },
        { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), isActive: editor.isActive('orderedList'), label: 'Numbered List' },
        { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), isActive: editor.isActive('blockquote'), label: 'Quote' },
    ];

    return (
        <div className="flex flex-wrap items-center gap-1 p-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white rounded-t-xl">
            {buttons.map((btn, index) => (
                <button
                    key={index}
                    onClick={btn.action}
                    title={btn.label}
                    className={cn(
                        'p-2 rounded-lg hover:bg-slate-200 text-slate-600 transition-all duration-200',
                        btn.isActive && 'bg-indigo-100 text-indigo-600 shadow-sm'
                    )}
                >
                    <btn.icon className="h-4 w-4" />
                </button>
            ))}
        </div>
    );
};

export default function EditorPage() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [doc, setDoc] = useState(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const { addToast } = useToast();

    // Load doc logic
    useEffect(() => {
        if (id === 'new') {
            const initialState = location.state || {};
            setDoc({
                title: initialState.title || 'Untitled Document',
                content: '',
                level: initialState.level || 'Undergraduate',
                style: initialState.style || 'APA 7th Edition',
                type: initialState.type || 'Essay',
            });
        } else {
            const found = mockDocuments.find((d) => d.id === parseInt(id));
            if (found) {
                setDoc({ ...found, content: `<p>${found.excerpt}</p><p>Sample content for editing...</p>` });
            }
        }
    }, [id, location.state]);

    const editor = useEditor(
        {
            extensions: [
                StarterKit,
                Placeholder.configure({
                    placeholder: 'Start writing or paste your assignment here...',
                }),
            ],
            content: doc?.content || '',
            editorProps: {
                attributes: {
                    class: 'prose prose-slate max-w-none focus:outline-none min-h-[500px] p-6',
                },
            },
            onUpdate: ({ editor }) => {
                // Auto-save logic here
            },
        },
        [doc]
    );

    // Update content when doc loads
    useEffect(() => {
        if (editor && doc) {
            if (editor.isEmpty) {
                editor.commands.setContent(doc.content);
            }
        }
    }, [doc, editor]);

    const handleUpgrade = () => {
        setIsUpgrading(true);
        addToast('Starting academic analysis...', 'info');

        // Simulate API call
        setTimeout(() => {
            setIsUpgrading(false);
            addToast('Upgrade complete! Improvements applied.', 'success');
        }, 2500);
    };

    const handleExport = (format) => {
        addToast(`Exporting as ${format}...`, 'info');
        setTimeout(() => {
            addToast('Download started', 'success');
            setIsExporting(false);
        }, 1000);
    };

    if (!editor) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-100px)]">
            <DiagnosticReport isOpen={showReport} onClose={() => setShowReport(false)} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-4">
                    <Link
                        to="/dashboard/documents"
                        className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="flex flex-col">
                        <input
                            type="text"
                            value={doc?.title || 'Loading...'}
                            className="text-xl font-bold text-slate-900 bg-transparent border-none focus:ring-0 p-0 placeholder:text-slate-300 focus:outline-none focus:bg-slate-50 focus:px-2 focus:py-1 focus:rounded"
                            placeholder="Document Title"
                            readOnly={!doc}
                            onChange={(e) => setDoc({ ...doc, title: e.target.value })}
                        />
                        <span className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                            <Save className="h-3 w-3" />
                            Auto-saved
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsExporting(!isExporting)}
                        className={cn('border-slate-200', isExporting && 'bg-indigo-50 border-indigo-200 text-indigo-600')}
                    >
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    <Button
                        size="sm"
                        className="shadow-lg shadow-orange-500/20 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-none text-white"
                        onClick={handleUpgrade}
                        isLoading={isUpgrading}
                    >
                        {isUpgrading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Upgrading...
                            </>
                        ) : (
                            <>
                                <Wand2 className="mr-2 h-4 w-4" /> Run Upgrade
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Main Editor */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <Card className="h-full border-slate-200 shadow-sm flex flex-col overflow-hidden bg-white">
                        <MenuBar editor={editor} />
                        <div
                            className="flex-1 overflow-y-auto cursor-text custom-scrollbar"
                            onClick={() => editor.chain().focus().run()}
                        >
                            <EditorContent editor={editor} />
                        </div>
                    </Card>
                </div>

                {/* Sidebar Panel */}
                <div className="w-80 hidden xl:flex flex-col gap-4 overflow-y-auto pb-4 custom-scrollbar">
                    {isExporting ? (
                        <Card className="border-slate-200 animate-in slide-in-from-right duration-300 shadow-sm">
                            <div className="p-4 border-b border-slate-100 font-semibold text-slate-900 flex justify-between items-center bg-gradient-to-r from-white to-slate-50/50">
                                <div className="flex items-center gap-2">
                                    <Download className="h-4 w-4 text-indigo-600" />
                                    Export Document
                                </div>
                                <button
                                    onClick={() => setIsExporting(false)}
                                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="p-4 space-y-3">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start h-auto py-3 hover:border-red-200 hover:bg-red-50"
                                    onClick={() => handleExport('PDF')}
                                >
                                    <div className="text-left">
                                        <span className="block font-medium text-slate-900">PDF Document</span>
                                        <span className="block text-xs text-slate-500">Best for sharing and printing</span>
                                    </div>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start h-auto py-3 hover:border-blue-200 hover:bg-blue-50"
                                    onClick={() => handleExport('Word')}
                                >
                                    <div className="text-left">
                                        <span className="block font-medium text-slate-900">Word (.docx)</span>
                                        <span className="block text-xs text-slate-500">Best for further editing</span>
                                    </div>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start h-auto py-3 hover:border-slate-200 hover:bg-slate-50"
                                    onClick={() => handleExport('Text')}
                                >
                                    <div className="text-left">
                                        <span className="block font-medium text-slate-900">Plain Text</span>
                                        <span className="block text-xs text-slate-500">Markdown format</span>
                                    </div>
                                </Button>
                            </div>
                        </Card>
                    ) : (
                        <>
                            {/* Upgrade Status */}
                            <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white shadow-sm">
                                <div className="p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                            <BarChart3 className="h-4 w-4 text-indigo-600" />
                                        </div>
                                        <h3 className="text-sm font-bold text-indigo-900">Upgrade Status</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm text-indigo-700">Academic Tone</span>
                                                <span className="font-bold text-indigo-900">B+</span>
                                            </div>
                                            <div className="w-full bg-indigo-200 rounded-full h-2">
                                                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm text-indigo-700">Clarity</span>
                                                <span className="font-bold text-indigo-900">A-</span>
                                            </div>
                                            <div className="w-full bg-indigo-200 rounded-full h-2">
                                                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="mt-4 w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                        onClick={() => setShowReport(true)}
                                    >
                                        View Full Report
                                    </Button>
                                </div>
                            </Card>

                            {/* Document Settings */}
                            <Card className="border-slate-200 shadow-sm">
                                <div className="p-5 space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Settings className="h-4 w-4 text-slate-400" />
                                        <h3 className="text-sm font-bold text-slate-900">Document Settings</h3>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                                            Citation Style
                                        </label>
                                        <select
                                            className="mt-1 block w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 cursor-pointer h-9 px-3 bg-white"
                                            value={doc?.style || 'APA 7th Edition'}
                                            onChange={(e) => setDoc({ ...doc, style: e.target.value })}
                                        >
                                            <option>APA 7th Edition</option>
                                            <option>MLA 9th Edition</option>
                                            <option>Harvard</option>
                                            <option>Chicago</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                                            Document Type
                                        </label>
                                        <select
                                            className="mt-1 block w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 cursor-pointer h-9 px-3 bg-white"
                                            value={doc?.type || 'Essay'}
                                            onChange={(e) => setDoc({ ...doc, type: e.target.value })}
                                        >
                                            <option>Essay</option>
                                            <option>Research Paper</option>
                                            <option>Thesis</option>
                                            <option>Case Study</option>
                                            <option>Report</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                                            Academic Level
                                        </label>
                                        <select
                                            className="mt-1 block w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 cursor-pointer h-9 px-3 bg-white"
                                            value={doc?.level || 'Undergraduate'}
                                            onChange={(e) => setDoc({ ...doc, level: e.target.value })}
                                        >
                                            <option>High School</option>
                                            <option>Undergraduate</option>
                                            <option>Postgraduate</option>
                                            <option>PhD</option>
                                        </select>
                                    </div>
                                </div>
                            </Card>

                            {/* Quick Actions */}
                            <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-sm">
                                <div className="p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles className="h-4 w-4 text-slate-400" />
                                        <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
                                    </div>
                                    <div className="space-y-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full justify-start text-sm border-slate-200 hover:bg-indigo-50 hover:border-indigo-200"
                                            onClick={() => setShowReport(true)}
                                        >
                                            <BarChart3 className="mr-2 h-4 w-4" />
                                            Run Diagnostics
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full justify-start text-sm border-slate-200 hover:bg-orange-50 hover:border-orange-200"
                                            onClick={handleUpgrade}
                                            isLoading={isUpgrading}
                                        >
                                            <Wand2 className="mr-2 h-4 w-4" />
                                            Apply Upgrade
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
