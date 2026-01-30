import { Extension } from '@tiptap/core';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';

export const FontSize = Extension.create({
    name: 'fontSize',
    addOptions() {
        return {
            types: ['textStyle'],
        };
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: '12',
                        parseHTML: element => element.style.fontSize.replace('pt', '') || '12',
                        renderHTML: attributes => {
                            if (!attributes.fontSize || attributes.fontSize === '12') {
                                return {
                                    style: 'font-size: 12pt',
                                };
                            }
                            return {
                                style: `font-size: ${attributes.fontSize}pt`,
                            };
                        },
                    },
                },
            },
        ];
    },
    addCommands() {
        return {
            setFontSize: fontSize => ({ chain }) => {
                return chain()
                    .setMark('textStyle', { fontSize })
                    .run();
            },
            unsetFontSize: () => ({ chain }) => {
                return chain()
                    .setMark('textStyle', { fontSize: null })
                    .removeEmptyTextStyle()
                    .run();
            },
        };
    },
});

export const LineHeight = Extension.create({
    name: 'lineHeight',
    addOptions() {
        return {
            types: ['paragraph', 'heading'],
            defaultLineHeight: '1.5',
        };
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    lineHeight: {
                        default: this.options.defaultLineHeight,
                        parseHTML: element => element.style.lineHeight || this.options.defaultLineHeight,
                        renderHTML: attributes => {
                            if (!attributes.lineHeight) {
                                return {};
                            }
                            return {
                                style: `line-height: ${attributes.lineHeight}`,
                            };
                        },
                    },
                },
            },
        ];
    },
    addCommands() {
        return {
            setLineHeight: lineHeight => ({ commands }) => {
                return this.options.types.every(type => commands.updateAttributes(type, { lineHeight }));
            },
            unsetLineHeight: () => ({ commands }) => {
                return this.options.types.every(type => commands.resetAttributes(type, 'lineHeight'));
            },
        };
    },
});

export const CustomBulletList = BulletList.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            listStyleType: {
                default: 'disc',
                parseHTML: element => element.getAttribute('data-list-style-type'),
                renderHTML: attributes => ({
                    'data-list-style-type': attributes.listStyleType,
                    style: `list-style-type: ${attributes.listStyleType}`,
                }),
            },
        };
    },
});

export const CustomOrderedList = OrderedList.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            listStyleType: {
                default: 'decimal',
                parseHTML: element => element.getAttribute('data-list-style-type'),
                renderHTML: attributes => ({
                    'data-list-style-type': attributes.listStyleType,
                    style: `list-style-type: ${attributes.listStyleType}`,
                }),
            },
        };
    },
});
