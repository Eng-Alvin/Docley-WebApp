import React, { useState, useMemo, useCallback, memo } from 'react';
import { cn } from '../../../lib/utils';
import { ColorPicker } from '../../../components/ui/ColorPicker';
import { EDITOR_CONFIG } from '../editorConfig';
import {
    Undo, Redo, Bold, Italic, Underline as UnderlineIcon,
    List, ListOrdered, Quote, ChevronDown, AlignLeft,
    AlignCenter, AlignRight, AlignJustify, highlighter,
    Type as FontIcon, ImageIcon, Layout, Eraser, Highlighter
} from 'lucide-react';

export const EditorToolbar = memo(({ editor, zoom, setZoom, onImageUpload, onCitationClick, imageInputRef, editorStateToken }) => {
    const [showFontFamily, setShowFontFamily] = useState(false);
    const [showHeadings, setShowHeadings] = useState(false);
    const [showLineHeight, setShowLineHeight] = useState(false);
    const [showPageSetup, setShowPageSetup] = useState(false);
    const [showTextColor, setShowTextColor] = useState(false);
    const [showHighlightColor, setShowHighlightColor] = useState(false);
    const [showImageOptions, setShowImageOptions] = useState(false);
    const [showBulletDropdown, setShowBulletDropdown] = useState(false);
    const [showOrderedDropdown, setShowOrderedDropdown] = useState(false);

    // Static Data
    const lineHeights = useMemo(() => [
        { label: 'Single', value: '1.0' },
        { label: '1.15', value: '1.15' },
        { label: '1.5', value: '1.5' },
        { label: 'Double', value: '2.0' },
    ], []);

    const fonts = useMemo(() => [
        { name: 'Arial', value: 'Arial' },
        { name: 'Calibri', value: 'Calibri' },
        { name: 'Cambria', value: 'Cambria' },
        { name: 'Consolas', value: 'Consolas' },
        { name: 'Courier New', value: 'Courier New' },
        { name: 'EB Garamond', value: 'EB Garamond' },
        { name: 'Georgia', value: 'Georgia' },
        { name: 'Lora', value: 'Lora' },
        { name: 'Merriweather', value: 'Merriweather' },
        { name: 'Montserrat', value: 'Montserrat' },
        { name: 'Open Sans', value: 'Open Sans' },
        { name: 'Roboto', value: 'Roboto' },
        { name: 'Roboto Mono', value: 'Roboto Mono' },
        { name: 'Source Code Pro', value: 'Source Code Pro' },
        { name: 'Times New Roman', value: 'Times New Roman' },
    ], []);

    const headingLevels = useMemo(() => [
        { label: 'Normal Text', level: 0 },
        { label: 'Heading 1', level: 1 },
        { label: 'Heading 2', level: 2 },
        { label: 'Heading 3', level: 3 },
    ], []);

    const bulletStyles = useMemo(() => [
        { label: 'Default', value: 'disc', icon: '●' },
        { label: 'Hollow', value: 'circle', icon: '○' },
        { label: 'Square', value: 'square', icon: '■' },
        { label: 'Dash', value: 'none', icon: '—' },
    ], []);

    const numberedStyles = useMemo(() => [
        { label: '1. 2. 3.', value: 'decimal', icon: '1.' },
        { label: 'a. b. c.', value: 'lower-alpha', icon: 'a.' },
        { label: 'i. ii. iii.', value: 'lower-roman', icon: 'i.' },
    ], []);

    // Helpers
    const clampFontSize = (val) => {
        const size = parseInt(val);
        if (isNaN(size)) return 12;
        return Math.min(Math.max(size, 6), 72);
    };

    const currentFontSize = useMemo(() => {
        if (!editor) return '12';
        const storedMarks = editor.getAttributes('textStyle');
        if (storedMarks && storedMarks.fontSize) {
            return storedMarks.fontSize;
        }
        return editor.getAttributes('textStyle').fontSize || '12';
    }, [editor?.state.selection, editor?.state.storedMarks, editorStateToken]);


    // Handlers
    const updateFontSize = useCallback((newSize) => {
        if (!editor || !newSize) return;
        const clamped = clampFontSize(newSize);
        editor.chain().focus().setFontSize(clamped.toString()).run();
    }, [editor]);

    const incrementFontSize = useCallback(() => {
        if (!editor) return;
        const size = parseInt(currentFontSize) || 12;
        updateFontSize((size + 1).toString());
    }, [currentFontSize, updateFontSize, editor]);

    const decrementFontSize = useCallback(() => {
        if (!editor) return;
        const size = parseInt(currentFontSize) || 12;
        if (size > 1) {
            updateFontSize((size - 1).toString());
        }
    }, [currentFontSize, updateFontSize, editor]);

    const addColor = useCallback((color) => {
        if (!editor) return;
        editor.chain().focus().setColor(color).run();
        setShowTextColor(false);
    }, [editor]);

    const addHighlight = useCallback((color) => {
        if (!editor) return;
        if (color === null) {
            editor.chain().focus().unsetHighlight().run();
        } else {
            editor.chain().focus().toggleHighlight({ color }).run();
        }
        setShowHighlightColor(false);
    }, [editor]);

    const handleBold = useCallback(() => editor?.chain().focus().toggleBold().run(), [editor]);
    const handleItalic = useCallback(() => editor?.chain().focus().toggleItalic().run(), [editor]);
    const handleUnderline = useCallback(() => editor?.chain().focus().toggleUnderline().run(), [editor]);
    const handleUndo = useCallback(() => editor?.chain().focus().undo().run(), [editor]);
    const handleRedo = useCallback(() => editor?.chain().focus().redo().run(), [editor]);

    const handleHeading = useCallback((level) => {
        if (!editor) return;
        if (level === 0) {
            editor.chain().focus().setParagraph().run();
        } else {
            editor.chain().focus().toggleHeading({ level }).run();
        }
        setShowHeadings(false);
    }, [editor]);

    const handleFontFamily = useCallback((value) => {
        if (!editor) return;
        editor.chain().focus().setFontFamily(value).run();
        setShowFontFamily(false);
    }, [editor]);

    const handleLineHeight = useCallback((value) => {
        if (!editor) return;
        editor.chain().focus().setLineHeight(value).run();
        setShowLineHeight(false);
    }, [editor]);

    const handleImageUrl = useCallback(() => {
        const url = window.prompt('Enter image URL');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
        setShowImageOptions(false);
    }, [editor]);

    const handleAlign = useCallback((align) => {
        if (!editor) return;
        editor.chain().focus().setTextAlign(align).run();
    }, [editor]);

    const handleBulletList = useCallback(() => editor?.chain().focus().toggleBulletList().run(), [editor]);
    const handleOrderedList = useCallback(() => editor?.chain().focus().toggleOrderedList().run(), [editor]);

    const handleClearFormatting = useCallback(() => {
        if (!editor) return;
        editor.chain().focus().unsetAllMarks().clearNodes().run();
    }, [editor]);

    const handleBulletStyle = useCallback((style) => {
        if (!editor) return;
        editor.chain().focus().toggleBulletList().updateAttributes('bulletList', { listStyleType: style }).run();
        setShowBulletDropdown(false);
    }, [editor]);

    const handleOrderedStyle = useCallback((style) => {
        if (!editor) return;
        editor.chain().focus().toggleOrderedList().updateAttributes('orderedList', { listStyleType: style }).run();
        setShowOrderedDropdown(false);
    }, [editor]);

    if (!editor) return null;

    // Active States
    const isBold = editor.isActive('bold');
    const isItalic = editor.isActive('italic');
    const isUnderline = editor.isActive('underline');
    const canUndo = editor.can().undo();
    const canRedo = editor.can().redo();
    const activeHeading = editor.isActive('heading', { level: 1 }) ? 1 :
        editor.isActive('heading', { level: 2 }) ? 2 :
            editor.isActive('heading', { level: 3 }) ? 3 : 0;
    const activeFontFamily = fonts.find(f => editor.isActive('textStyle', { fontFamily: f.value }))?.value || '';
    const activeLineHeight = editor.getAttributes('paragraph').lineHeight || '1.5';
    const textAlign = editor.getAttributes('textAlign') || 'left';

    return (
        <div className="flex flex-wrap items-center gap-0.5 px-3 py-1.5 bg-slate-50 border-b border-slate-200 sticky top-0 z-30">
            {/* History */}
            <div className="flex items-center">
                <button
                    onClick={handleUndo}
                    disabled={!canUndo}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30 transition-colors"
                    title="Undo"
                >
                    <Undo className="h-4 w-4" />
                </button>
                <button
                    onClick={handleRedo}
                    disabled={!canRedo}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30 transition-colors"
                    title="Redo"
                >
                    <Redo className="h-4 w-4" />
                </button>
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Headings */}
            <div className="relative group">
                <button
                    onClick={() => setShowHeadings(!showHeadings)}
                    className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-200 text-sm text-slate-700 min-w-[100px] transition-colors"
                >
                    {headingLevels.find(h => h.level === activeHeading)?.label || 'Normal Text'}
                    <ChevronDown className="h-3 w-3" />
                </button>
                {showHeadings && (
                    <>
                        <div className="fixed inset-0 z-39" onClick={() => setShowHeadings(false)} />
                        <div className="absolute top-full left-0 mt-1 w-40 bg-white shadow-lg border border-slate-200 rounded-md py-1 z-40">
                            {headingLevels.map(h => (
                                <button
                                    key={h.level}
                                    onClick={() => handleHeading(h.level)}
                                    className={cn(
                                        "w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100 transition-colors",
                                        activeHeading === h.level && "text-indigo-600 bg-indigo-50 font-medium"
                                    )}
                                >
                                    {h.label}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Font Family */}
            <div className="relative group">
                <button
                    onClick={() => setShowFontFamily(!showFontFamily)}
                    className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-200 text-sm text-slate-700 min-w-[100px] transition-colors"
                >
                    <span className="truncate">{fonts.find(f => f.value === activeFontFamily)?.name || 'Arial'}</span>
                    <ChevronDown className="h-3 w-3" />
                </button>
                {showFontFamily && (
                    <>
                        <div className="fixed inset-0 z-39" onClick={() => setShowFontFamily(false)} />
                        <div className="absolute top-full left-0 mt-1 w-40 bg-white shadow-lg border border-slate-200 rounded-md py-1 z-40">
                            {fonts.map(f => (
                                <button
                                    key={f.name}
                                    onClick={() => handleFontFamily(f.value)}
                                    style={{ fontFamily: f.value }}
                                    className={cn(
                                        "w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100 transition-colors",
                                        activeFontFamily === f.value && "text-indigo-600 bg-indigo-50 font-medium"
                                    )}
                                >
                                    {f.name}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Font Size */}
            <div className="flex items-center gap-1">
                <button onClick={decrementFontSize} className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Decrease font size">
                    <span className="text-lg font-bold">-</span>
                </button>
                <input
                    type="text"
                    value={currentFontSize}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value) updateFontSize(value);
                    }}
                    className="w-10 h-7 text-center text-sm border border-slate-200 rounded hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                <button onClick={incrementFontSize} className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Increase font size">
                    <span className="text-lg font-bold">+</span>
                </button>
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Basic Formatting */}
            <div className="flex items-center gap-0.5">
                <button onClick={handleBold} className={cn("p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors", isBold && "bg-indigo-100 text-indigo-700")} title="Bold (Ctrl+B)">
                    <Bold className="h-4 w-4" />
                </button>
                <button onClick={handleItalic} className={cn("p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors", isItalic && "bg-indigo-100 text-indigo-700")} title="Italic (Ctrl+I)">
                    <Italic className="h-4 w-4" />
                </button>
                <button onClick={handleUnderline} className={cn("p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors", isUnderline && "bg-indigo-100 text-indigo-700")} title="Underline (Ctrl+U)">
                    <UnderlineIcon className="h-4 w-4" />
                </button>

                {/* Text Color */}
                <div className="relative group">
                    <button onClick={() => setShowTextColor(!showTextColor)} className="flex items-center gap-1 p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Text Color">
                        <div className="flex flex-col items-center">
                            <span className="font-serif font-bold text-sm leading-none">A</span>
                            <div className="h-1 w-4 mt-0.5" style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }} />
                        </div>
                        <ChevronDown className="h-3 w-3 ml-0.5" />
                    </button>
                    {showTextColor && (
                        <>
                            <div className="fixed inset-0 z-39" onClick={() => setShowTextColor(false)} />
                            <div className="absolute top-full left-0 mt-1 bg-white shadow-lg border border-slate-200 rounded-md py-1 z-40">
                                <ColorPicker value={editor.getAttributes('textStyle').color || '#000000'} onChange={addColor} onClose={() => setShowTextColor(false)} />
                            </div>
                        </>
                    )}
                </div>

                {/* Highlight/Marker Color */}
                <div className="relative group">
                    <button onClick={() => setShowHighlightColor(!showHighlightColor)} className="flex items-center gap-1 p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Highlight Color">
                        <div className="flex flex-col items-center">
                            <Highlighter className="h-3.5 w-3.5" />
                            <div className="h-1 w-4 mt-0.5" style={{ backgroundColor: editor.getAttributes('highlight').color || 'transparent' }} />
                        </div>
                        <ChevronDown className="h-3 w-3 ml-0.5" />
                    </button>
                    {showHighlightColor && (
                        <>
                            <div className="fixed inset-0 z-39" onClick={() => setShowHighlightColor(false)} />
                            <div className="absolute top-full left-0 mt-1 bg-white shadow-lg border border-slate-200 rounded-md py-1 z-40">
                                <ColorPicker type="highlight" value={editor.getAttributes('highlight').color} onChange={addHighlight} onClose={() => setShowHighlightColor(false)} />
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Alignment */}
            <div className="flex items-center gap-0.5">
                {[
                    { align: 'left', Icon: AlignLeft },
                    { align: 'center', Icon: AlignCenter },
                    { align: 'right', Icon: AlignRight },
                    { align: 'justify', Icon: AlignJustify }
                ].map(({ align, Icon }) => (
                    <button
                        key={align}
                        onClick={() => handleAlign(align)}
                        className={cn("p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors", textAlign === align && "bg-indigo-100 text-indigo-700")}
                        title={`Align ${align}`}
                    >
                        <Icon className="h-4 w-4" />
                    </button>
                ))}
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Lists */}
            <div className="flex items-center gap-0.5">
                <div className="relative group">
                    <div className="flex items-center">
                        <button onClick={handleBulletList} className={cn("p-1.5 rounded-l hover:bg-slate-200 text-slate-600 border-r border-slate-200", editor.isActive('bulletList') && "bg-indigo-100 text-indigo-700")}>
                            <List className="h-4 w-4" />
                        </button>
                        <button onClick={() => setShowBulletDropdown(!showBulletDropdown)} className="p-1.5 px-1 rounded-r hover:bg-slate-200 text-slate-600">
                            <ChevronDown className="h-3 w-3" />
                        </button>
                    </div>
                    {showBulletDropdown && (
                        <>
                            <div className="fixed inset-0 z-39" onClick={() => setShowBulletDropdown(false)} />
                            <div className="absolute top-full left-0 mt-1 w-32 bg-white shadow-lg border border-slate-200 rounded-md py-1 z-40">
                                {bulletStyles.map(s => (
                                    <button key={s.value} onClick={() => handleBulletStyle(s.value)} className={cn("w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100 flex items-center gap-2", editor.isActive('bulletList', { listStyleType: s.value }) && "text-indigo-600 bg-indigo-50 font-medium")}>
                                        <span className="text-lg leading-none">{s.icon}</span>{s.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="relative group ml-0.5">
                    <div className="flex items-center">
                        <button onClick={handleOrderedList} className={cn("p-1.5 rounded-l hover:bg-slate-200 text-slate-600 border-r border-slate-200", editor.isActive('orderedList') && "bg-indigo-100 text-indigo-700")}>
                            <ListOrdered className="h-4 w-4" />
                        </button>
                        <button onClick={() => setShowOrderedDropdown(!showOrderedDropdown)} className="p-1.5 px-1 rounded-r hover:bg-slate-200 text-slate-600">
                            <ChevronDown className="h-3 w-3" />
                        </button>
                    </div>
                    {showOrderedDropdown && (
                        <>
                            <div className="fixed inset-0 z-39" onClick={() => setShowOrderedDropdown(false)} />
                            <div className="absolute top-full left-0 mt-1 w-32 bg-white shadow-lg border border-slate-200 rounded-md py-1 z-40">
                                {numberedStyles.map(s => (
                                    <button key={s.value} onClick={() => handleOrderedStyle(s.value)} className={cn("w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100 flex items-center gap-2", editor.isActive('orderedList', { listStyleType: s.value }) && "text-indigo-600 bg-indigo-50 font-medium")}>
                                        <span className="text-sm font-bold min-w-[20px]">{s.icon}</span>{s.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            <button onClick={onCitationClick} className="p-1.5 rounded hover:bg-indigo-100 text-indigo-600 transition-colors" title="AI Citation Assistant">
                <Quote className="h-4 w-4" />
            </button>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Line Spacing */}
            <div className="relative group">
                <button onClick={() => setShowLineHeight(!showLineHeight)} className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Line spacing">
                    <div className="flex flex-col items-center leading-[0.5]">
                        <span className="text-[10px] font-bold">---</span>
                        <span className="text-[10px] font-bold">---</span>
                    </div>
                </button>
                {showLineHeight && (
                    <>
                        <div className="fixed inset-0 z-39" onClick={() => setShowLineHeight(false)} />
                        <div className="absolute top-full left-0 mt-1 w-32 bg-white shadow-lg border border-slate-200 rounded-md py-1 z-40">
                            {lineHeights.map(lh => (
                                <button key={lh.value} onClick={() => handleLineHeight(lh.value)} className={cn("w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100", activeLineHeight === lh.value && "text-indigo-600 bg-indigo-50 font-medium")}>
                                    {lh.label}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Image Upload */}
            <div className="relative group">
                <input ref={imageInputRef} type="file" accept="image/*" onChange={onImageUpload} className="hidden" />
                <button onClick={() => setShowImageOptions(!showImageOptions)} className="flex items-center gap-1 p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Insert Image">
                    <ImageIcon className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3" />
                </button>
                {showImageOptions && (
                    <>
                        <div className="fixed inset-0 z-39" onClick={() => setShowImageOptions(false)} />
                        <div className="absolute top-full left-0 mt-1 w-40 bg-white shadow-lg border border-slate-200 rounded-md py-1 z-40">
                            <button onClick={() => { imageInputRef.current?.click(); setShowImageOptions(false); }} className="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100">Upload from Computer</button>
                            <button onClick={handleImageUrl} className="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100">By URL</button>
                        </div>
                    </>
                )}
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Clear Formatting */}
            <button onClick={handleClearFormatting} className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Clear Formatting">
                <Eraser className="h-4 w-4" />
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 ml-auto border-l border-slate-200 pl-2">
                <button
                    onClick={() => {
                        const currentIndex = EDITOR_CONFIG.ZOOM_LEVELS.findIndex(z => z.value === zoom);
                        if (currentIndex > 0) setZoom(EDITOR_CONFIG.ZOOM_LEVELS[currentIndex - 1].value);
                    }}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                    title="Zoom Out"
                >
                    <span className="text-lg font-bold">-</span>
                </button>
                <select
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="appearance-none bg-transparent hover:bg-slate-200 px-2 py-1 rounded text-sm font-medium text-slate-600 focus:outline-none cursor-pointer transition-colors"
                >
                    {EDITOR_CONFIG.ZOOM_LEVELS.map(z => (
                        <option key={z.value} value={z.value}>{z.label}</option>
                    ))}
                </select>
                <button
                    onClick={() => {
                        const currentIndex = EDITOR_CONFIG.ZOOM_LEVELS.findIndex(z => z.value === zoom);
                        if (currentIndex < EDITOR_CONFIG.ZOOM_LEVELS.length - 1) setZoom(EDITOR_CONFIG.ZOOM_LEVELS[currentIndex + 1].value);
                    }}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                    title="Zoom In"
                >
                    <span className="text-lg font-bold">+</span>
                </button>
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Page Setup */}
            <div className="relative group">
                <button onClick={() => setShowPageSetup(!showPageSetup)} className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-slate-200 text-sm text-slate-700 transition-colors" title="Page Setup">
                    <Layout className="h-4 w-4 text-slate-600" />
                    <span>Page Setup</span>
                    <ChevronDown className="h-3 w-3" />
                </button>
                {showPageSetup && (
                    <>
                        <div className="fixed inset-0 z-39" onClick={() => setShowPageSetup(false)} />
                        <div className="absolute top-full right-0 mt-1 w-56 bg-white shadow-xl border border-slate-200 rounded-md py-2 z-40 animate-in fade-in slide-in-from-top-1">
                            <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase">Page Numbers</div>
                            <button onClick={() => { editor.setOptions({ pagination: { showPageNumbers: true, pageNumberPosition: 'footer-right' } }); setShowPageSetup(false); }} className="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50 flex items-center justify-between">
                                <span>Bottom Right</span><div className="w-2 h-2 rounded-full bg-indigo-500" />
                            </button>
                            <button onClick={() => { editor.setOptions({ pagination: { showPageNumbers: true, pageNumberPosition: 'footer-center' } }); setShowPageSetup(false); }} className="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50">Bottom Center</button>
                            <button onClick={() => { editor.setOptions({ pagination: { showPageNumbers: true, pageNumberPosition: 'header-right' } }); setShowPageSetup(false); }} className="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50">Top Right</button>
                            <div className="h-px bg-slate-100 my-1" />
                            <button onClick={() => { editor.setOptions({ pagination: { showPageNumbers: false } }); setShowPageSetup(false); }} className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50">Disable Page Numbers</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
});

EditorToolbar.displayName = 'EditorToolbar';
