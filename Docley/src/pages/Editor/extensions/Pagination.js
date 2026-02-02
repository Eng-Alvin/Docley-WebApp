import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { EDITOR_CONFIG } from '../editorConfig';

export const Pagination = Extension.create({
    name: 'pagination',

    addOptions() {
        return {
            pageWidth: EDITOR_CONFIG.PAGE_WIDTH || 816,
            pageHeight: EDITOR_CONFIG.PAGE_HEIGHT || 1056,
            margins: EDITOR_CONFIG.DEFAULT_MARGINS || { top: 96, bottom: 96, left: 96, right: 96 },
            showPageNumbers: true,
        };
    },

    addProseMirrorPlugins() {
        const extension = this;
        const { pageWidth, pageHeight, margins } = this.options;

        return [
            new Plugin({
                key: new PluginKey('pagination'),
                props: {
                    decorations(state) {
                        const { doc } = state;
                        const decorations = [];

                        // Height estimation constants
                        const LINE_HEIGHT = 24;
                        const CHARS_PER_LINE = 85;
                        const BLOCK_MARGIN = 12;

                        let currentHeight = 0; // Relative to current page content area
                        let pageCount = 1;

                        // 1. Initial Page Top Margin (Page 1)
                        decorations.push(
                            Decoration.widget(0, () => {
                                const div = document.createElement('div');
                                div.className = 'page-break-container first-page';
                                div.innerHTML = `<div class="page-header first-page"></div>`;
                                return div;
                            }, { side: -1 })
                        );

                        doc.descendants((node, pos) => {
                            if (node.isBlock) {
                                // Simple height estimation
                                const text = node.textContent;
                                const lines = text.length > 0 ? Math.ceil(text.length / CHARS_PER_LINE) : 1;
                                let nodeHeight = (lines * LINE_HEIGHT) + (BLOCK_MARGIN * 2);

                                // Adjust for headings
                                if (node.type.name === 'heading') {
                                    const level = node.attrs.level || 1;
                                    nodeHeight = (32 + (6 - level) * 4) + BLOCK_MARGIN;
                                }

                                // Check if node fits on current page
                                // Content area height = pageHeight - topMargin - bottomMargin
                                const contentAreaHeight = pageHeight - margins.top - margins.bottom;

                                if (currentHeight + nodeHeight > contentAreaHeight) {
                                    // Inject Page Gap + Footer + Header
                                    const footerNum = pageCount;
                                    pageCount++;

                                    decorations.push(
                                        Decoration.widget(pos, () => {
                                            const div = document.createElement('div');
                                            div.className = 'page-break-container';
                                            div.innerHTML = `
                                                <div class="page-footer">
                                                    ${extension.options.showPageNumbers ? `<span class="page-number">Page ${footerNum}</span>` : ''}
                                                </div>
                                                <div class="page-gap"></div>
                                                <div class="page-header"></div>
                                            `;
                                            return div;
                                        }, { side: -1 })
                                    );

                                    currentHeight = nodeHeight; // Start new page with this node
                                } else {
                                    currentHeight += nodeHeight;
                                }
                            }
                            return false; // Don't descend into block children
                        });

                        return DecorationSet.create(doc, decorations);
                    },
                },
            }),
        ];
    },
});
