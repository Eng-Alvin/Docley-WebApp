import { Node, mergeAttributes } from '@tiptap/core';

export const PageBreak = Node.create({
    name: 'pageBreak',

    group: 'block',

    atom: true,

    addOptions() {
        return {
            HTMLAttributes: {
                class: 'page-break',
            },
        };
    },

    parseHTML() {
        return [
            { tag: 'div[data-type="page-break"]' },
            { tag: 'div.page-break' },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'page-break' }),
            ['div', { class: 'page-break-visual' }, 'Page Break']
        ];
    },

    addCommands() {
        return {
            setPageBreak: () => ({ commands }) => {
                return commands.insertContent({ type: this.name });
            },
        };
    },

    addKeyboardShortcuts() {
        return {
            'Mod-Enter': () => this.editor.commands.setPageBreak(),
        };
    },
});
