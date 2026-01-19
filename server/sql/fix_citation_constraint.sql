-- Fix for "documents_citation_style_check" constraint violation
-- The frontend is sending full names (e.g. 'APA 7th Edition'), but the DB only allowed short codes.

-- 1. Drop the old restrictive constraint
ALTER TABLE public.documents 
DROP CONSTRAINT IF EXISTS documents_citation_style_check;

-- 2. Add the new constraint with all values from IntakeModal.jsx
ALTER TABLE public.documents 
ADD CONSTRAINT documents_citation_style_check 
CHECK (citation_style IN (
    'APA 7th Edition', 
    'MLA 9th Edition', 
    'Harvard', 
    'Chicago', 
    'IEEE',
    -- Keep legacy values just in case existing rows use them
    'APA',
    'MLA'
));
