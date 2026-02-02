export const EDITOR_CONFIG = {
    // A4 Dimensions at 96 DPI
    // Width: 210mm = 793.7px -> 794px
    // Height: 297mm = 1122.5px -> 1123px
    PAGE_WIDTH: 794,
    PAGE_HEIGHT: 1123,

    // Page Rendering Constants
    PAGE_GAP: 32,
    PAGE_SHADOW: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',

    // Default Margins (20mm ≈ 76px)
    DEFAULT_MARGINS: {
        top: 76,
        bottom: 76,
        left: 76,
        right: 76
    },

    // Academic Defaults
    DEFAULT_FONT_SIZE: '11',
    DEFAULT_LINE_HEIGHT: '1.5',
    DEFAULT_FONT_FAMILY: 'Arial',

    // Zoom presets
    ZOOM_LEVELS: [
        { label: '75%', value: 0.75 },
        { label: '90%', value: 0.9 },
        { label: '100%', value: 1.0 },
        { label: '110%', value: 1.1 },
        { label: '125%', value: 1.25 },
        { label: '150%', value: 1.5 }
    ]
};
