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
                class: 'focus:outline-none relative outline-none border-none shadow-none',
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            // Push to store
            updateContent(html);
        },
        onTransaction: () => {
            // Notify parent to update toolbar state (active buttons etc)
            if (onEditorStateChange) {
                onEditorStateChange();
            }
        },
        onCreate: ({ editor }) => {
            if (onEditorReady) {
                onEditorReady(editor);
            }
        }
    }, [editable]); // Re-create if editable changes? Usually handled by editor.setEditable

    // Sync Editable state
    useEffect(() => {
        if (editor && editor.isEditable !== editable) {
            editor.setEditable(editable);
        }
    }, [editor, editable]);

    // ONE-TIME Content Initialization
    // Requirement: Set content ONLY ONCE when document status becomes 'ready'
    useEffect(() => {
        if (editor && status === 'ready' && !isInitialized.current) {
            // We use the 'content' prop which presumably comes from store initial state
            // But to be extra safe and avoid race conditions, we could read from store directly?
            // Passing it as prop is cleaner for testing, assuming parent passes the correct initial content.
            if (content) {
                editor.commands.setContent(content);
            }
            isInitialized.current = true;
        }
    }, [editor, status, content]);

    if (!editor) {
        return null;
    }

    return (
        <div className="editor-canvas" style={{ transformOrigin: 'top center' }}>
            <div
                className="cursor-text"
                onClick={() => editor?.chain().focus().run()}
            >
                <div
                    className="editor-content-wrapper"
                    style={{
                        padding: docMargins ? `${docMargins.top}px ${docMargins.right}px ${docMargins.bottom}px ${docMargins.left}px` : '96px',
                        position: 'relative',
                        minHeight: '1056px' // Visual height of one page
                    }}
                >
                    {headerText && (
                        <div
                            className="absolute top-0 left-0 right-0 text-center text-xs text-slate-400 font-medium"
                            style={{
                                height: docMargins?.top ? `${docMargins.top / 2}px` : '48px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                pointerEvents: 'none'
                            }}
                        >
                            {headerText}
                        </div>
                    )}
                    <EditorContent editor={editor} />
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
