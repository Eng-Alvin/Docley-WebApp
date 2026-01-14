Architectural Decision: Termination of "Live Pagination"
As lead architect, I am exercising veto power over the current pursuit of "True Live Pagination" within the existing technical stack.

1. The Veto: Infeasibility of Live Pagination
Decision: True Word-like live pagination is NOT realistically achievable with React + TipTap.

The Technical Wall: HTML/CSS is a fluid layout engine designed for infinite scrolling, not fixed dimensions. TipTap (ProseMirror) operates on a logical document tree, not a geometric one.
The Geometry Problem: Accurately predicting where a page breaks requires measuring every rendered DOM node's height in real-time. On a 10-page document, doing this on every keystroke will cause catastrophic input lag.
The "Docs" Reality: Google Docs achieved this by building a custom layout engine from scratch that bypasses the browser's DOM for rendering. Attempting to force the DOM to behave like a paged physical medium via Tiptap extensions will result in a "buggy-forever" product that jumps, flickers, and misaligns.
2. The Honest Product Scope: "Structure-First" Editor
Docley must pivot from being a Page Editor to an Academic Writing Environment. We will optimize for the process of student writing, not the visual simulation of paper while typing.

What Must Be Removed
REJECTED: Live A4-style page containers in the editor.
REJECTED: Decoration-based headers/footers that "float" between pages.
REJECTED: Real-time character-count-to-height heuristics.
The New Architecture: "Fluid Write, Fixed Export"
Continuous Editor: The writing canvas will be a single, fluid container. This ensures 60fps typing performance and stable AI transformations.
Structural Headers: Headers/Footers will be managed in a side-panel or a single top/bottom configuration, not repeated visually every 11 inches.
The "Print Preview" Mode: A dedicated, read-only layout view using Paged.js or a backend PDF generator will be the only place where the student sees actual pagination.
Academic Guardrails: Instead of "Page 2," we focus on "Section: Introduction," "Word Count," and "Citation Density."
3. Product Roadmap (Hard Constraints)
AI Sanitization Layer: Mandatory implementation of a whitelist-based HTML sanitizer on the backend. This is a non-negotiable security requirement.
Supabase RLS: All ownership logic must be moved to the database. The API is no longer trusted as the sole arbiter of data access.
Stateless AI: AI prompts must be rewritten to include the full document context (academic level and style) to prevent the LLM from hallucinating formatting that doesn't exist.
Conclusion: We will build a high-performance academic writing tool that exports perfect A4 documents, rather than a low-performance A4 simulator that is difficult to write in.