import React, { useMemo, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { FontFamily } from '@tiptap/extension-font-family';
import { TextAlign } from '@tiptap/extension-text-align';
import { ResizableImage } from '../extensions/ResizableImage';
import { Pagination } from '../extensions/Pagination';
import { PageBreak } from '../extensions/PageBreak';
import ListItem from '@tiptap/extension-list-item';
import { FontSize, LineHeight, CustomBulletList, CustomOrderedList } from '../extensions/customExtensions';
import { EDITOR_CONFIG } from '../editorConfig';
import useDocumentStore from '../../../stores/useDocumentStore';

const TipTapCanvas = ({ content, editable, onEditorReady, onEditorStateChange, docMargins, headerText }) => {
    const updateContent = useDocumentStore(state => state.updateContent);
    const status = useDocumentStore(state => state.status);

    // Controlled Initialization Ref
    const isInitialized = useRef(false);

    // TipTap Extensions
    const editorExtensions = useMemo(() => [
        StarterKit.configure({
            history: true,
            bulletList: false,
            orderedList: false,
            listItem: false,
        }),
        Placeholder.configure({
            placeholder: 'Start writing or paste your assignment here...',
        }),
        TextStyle,
        Color,
        Highlight.configure({ multicolor: true }),
        FontFamily,
        TextAlign.configure({
            types: ['heading', 'paragraph'],
        }),
        ResizableImage,
        PageBreak,
        FontSize,
        LineHeight,
        CustomBulletList,
        CustomOrderedList,
        ListItem,
        Pagination.configure({
            pageWidth: EDITOR_CONFIG.PAGE_WIDTH,
            pageHeight: EDITOR_CONFIG.PAGE_HEIGHT,
            margins: docMargins || EDITOR_CONFIG.DEFAULT_MARGINS,
        }),
    ], [docMargins]);

    const editor = useEditor({
        extensions: editorExtensions,
        content: '', // Start empty, wait for 'ready' status
        editable: editable,
        editorProps: {
            attributes: {
                // 'prose' class is now defined in Editor.css with A4 specs
                class: 'prose focus:outline-none relative outline-none border-none shadow-none',
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            updateContent(html);
        },
        onTransaction: () => {
            if (onEditorStateChange) {
                onEditorStateChange();
            }
        },
        onCreate: ({ editor }) => {
            if (onEditorReady) {
                onEditorReady(editor);
            }
        }
    }, [editable]);

    // Sync Editable state
    useEffect(() => {
        if (editor && editor.isEditable !== editable) {
            editor.setEditable(editable);
        }
    }, [editor, editable]);

    // Reliable Content Initialization
    // Requirement: Set content when status is 'ready'
    useEffect(() => {
        if (editor && status === 'ready' && !isInitialized.current) {
            // High-fidelity preservation: use setContent to render HTML correctly
            if (content) {
                console.log('[TipTapCanvas] Setting initial content (high-fidelity)');
                editor.commands.setContent(content, false); // false = don't emit update
            } else {
                editor.commands.setContent('<p></p>', false);
            }
            isInitialized.current = true;
        }
    }, [editor, status, content]);

    if (!editor) {
        return null;
    }

    return (
        <div className="page-container">
            <div className="editor-canvas" style={{ transformOrigin: 'top center' }}>
                <div
                    className="cursor-text"
                    onClick={() => editor?.chain().focus().run()}
                >
                    <div
                        className="editor-content-wrapper"
                        style={{
                            position: 'relative',
                            // Margins are now handled by .prose.ProseMirror padding in CSS (20mm)
                            // But we can still support dynamic margins if docMargins is provided
                            paddingTop: docMargins ? `${docMargins.top}px` : undefined,
                            paddingBottom: docMargins ? `${docMargins.bottom}px` : undefined,
                            paddingLeft: docMargins ? `${docMargins.left}px` : undefined,
                            paddingRight: docMargins ? `${docMargins.right}px` : undefined,
                        }}
                    >
                        {headerText && (
                            <div
                                className="absolute top-0 left-0 right-0 text-center text-xs text-slate-400 font-medium"
                                style={{
                                    height: '38px', // Approx 10mm
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    pointerEvents: 'none',
                                    zIndex: 5
                                }}
                            >
                                {headerText}
                            </div>
                        )}
                        <EditorContent editor={editor} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// React.memo to prevent re-renders when parent state changes (unless props change)
// We might need to be careful with 'content' prop if it updates on every keystroke in parent.
// If parent passes store.content, this component WILL re-render.
// To satisfy "NEVER listen to state.content for re-renders", we should ensure
// the parent stops passing updated content, OR we memoize heavily.
// But TipTap `useEditor` is stable.
// The `useEffect` for initialization has an `isInitialized` guard, so it won't call setContent again.
// However, React will still diff the Virtual DOM if props change.
export default TipTapCanvas;
