-- 1. Enable the pgvector extension to work with embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create the document_chunks table
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(768), -- Gemini text-embedding-004 uses 768 dimensions
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Enable RLS on document_chunks
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for document_chunks
-- Service role has full access
CREATE POLICY "Service role full access document_chunks"
ON public.document_chunks USING (auth.role() = 'service_role');

-- Users can read chunks of documents they own
CREATE POLICY "Users can read own document chunks"
ON public.document_chunks FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.documents
        WHERE documents.id = document_chunks.document_id
        AND documents.user_id = auth.uid()
    )
);

-- 5. Create the similarity search function
-- This allows the backend to find relevant chunks using cosine similarity
CREATE OR REPLACE FUNCTION match_document_chunks (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_document_id uuid
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    document_chunks.id,
    document_chunks.document_id,
    document_chunks.content,
    1 - (document_chunks.embedding <=> query_embedding) AS similarity
  FROM document_chunks
  WHERE document_chunks.document_id = p_document_id
  AND 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- 6. Add "processing" status index to documents
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
