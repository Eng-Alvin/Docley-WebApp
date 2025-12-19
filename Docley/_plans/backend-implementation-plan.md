# Backend Implementation Plan - Docley Academic Transformer

## Overview
This document outlines the complete backend implementation plan for Docley, using a **two-phase approach**:
- **Phase A (MVP)**: Supabase Edge Functions for rapid deployment
- **Phase B (Scale)**: NestJS backend for long-term scalability

Built with Supabase (Auth, Database, Storage, Edge Functions), OpenAI GPT-4.1, and Stripe integration.

---

## Implementation Strategy

### Phase A: MVP with Supabase Edge Functions
**Timeline: 2-3 weeks**

Use Supabase Edge Functions (Deno-based serverless functions) for:
- Quick deployment with zero infrastructure management
- Built-in authentication via Supabase Auth
- Direct database access via Supabase client
- Cost-effective for low-to-medium traffic

### Phase B: NestJS Backend for Scale
**Timeline: 4-6 weeks (after MVP validation)**

Migrate to NestJS when:
- Traffic exceeds Edge Function limits
- Need for complex background processing
- Advanced caching and queue requirements
- Custom rate limiting and middleware needs

---

## 1. Project Structure

### 1.1 MVP Structure (Supabase Edge Functions)
```
supabase/
├── functions/
│   ├── auth-verify/           # Verify JWT and sync user profile
│   ├── documents-crud/        # Document CRUD operations
│   ├── documents-upload/      # File upload handling
│   ├── diagnostics-run/       # Run AI diagnostics
│   ├── transform-document/    # AI transformation
│   ├── citations-manage/      # Citation operations
│   ├── export-document/       # Export to PDF/DOCX/TXT
│   ├── subscription-checkout/ # Stripe checkout
│   ├── stripe-webhook/        # Stripe webhook handler
│   └── _shared/               # Shared utilities
│       ├── supabase.ts        # Supabase client
│       ├── openai.ts          # OpenAI client
│       ├── stripe.ts          # Stripe client
│       ├── cors.ts            # CORS headers
│       └── validation.ts      # Input validation
├── migrations/                # Database migrations
└── seed.sql                   # Seed data
```

### 1.2 Long-term Structure (NestJS)
```
docley-backend/
├── src/
│   ├── auth/              # Supabase auth token validation
│   ├── users/             # User management
│   ├── documents/         # Document CRUD & processing
│   ├── diagnostics/       # AI diagnostic engine
│   ├── transformations/   # AI transformation engine
│   ├── citations/         # Citation management
│   ├── exports/           # Document export service
│   ├── subscriptions/     # Stripe integration
│   ├── admin/             # Admin dashboard endpoints
│   ├── storage/           # Supabase Storage integration
│   ├── jobs/              # Background job processing (Bull/BullMQ)
│   ├── cache/             # Redis caching service
│   ├── common/            # Shared utilities, guards, decorators
│   └── config/            # Configuration modules
├── test/                  # Unit & integration tests
├── migrations/            # Database migration scripts
├── .env.example
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

### 1.3 Dependencies

#### MVP Dependencies (Edge Functions - Deno)
```typescript
// Import from CDN in Edge Functions
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4'
import Stripe from 'https://esm.sh/stripe@14'
```

#### NestJS Dependencies
```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/throttler": "^5.0.0",
    "@nestjs/swagger": "^7.1.0",
    "@nestjs/bull": "^10.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "@stripe/stripe-js": "^2.0.0",
    "stripe": "^14.0.0",
    "openai": "^4.20.0",
    "mammoth": "^1.6.0",
    "pdf-parse": "^1.1.1",
    "docx": "^8.2.0",
    "pdfkit": "^0.14.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "helmet": "^7.0.0",
    "compression": "^1.7.4",
    "winston": "^3.11.0",
    "nest-winston": "^1.9.4",
    "bull": "^4.11.0",
    "ioredis": "^5.3.2",
    "redis": "^4.6.0",
    "node-cron": "^3.0.3"
  },
  "devDependencies": {
    "@nestjs/testing": "^10.0.0",
    "@types/node": "^20.0.0",
    "jest": "^29.0.0",
    "supertest": "^6.3.0",
    "ts-jest": "^29.1.0",
    "ts-node": "^10.9.0",
    "typescript": "^5.2.0"
  }
}
```

---

## 2. Authentication & Email Verification Flow

### 2.1 Authentication Overview

Authentication is handled entirely by **Supabase Auth** on the client side. The backend only:
1. Validates JWT tokens
2. Syncs user profile to `public.users` table
3. Enforces email verification before access

### 2.2 Email Verification Flow

#### Client-Side Flow (Frontend)
```
1. User signs up with email/password
   └── Supabase sends verification email automatically

2. User clicks verification link in email
   └── Supabase verifies and sets email_confirmed_at

3. User is redirected to app with verified session
   └── Frontend checks session.user.email_confirmed_at

4. If not verified, show "Check your email" message
   └── Provide "Resend verification email" button
```

#### Database Trigger for User Sync
```sql
-- Trigger to create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### Email Verification Enforcement Middleware
```typescript
// Edge Function: Verify email before allowing API access
async function verifyEmailConfirmed(req: Request, supabase: SupabaseClient) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    throw new Error('Missing authorization header')
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    throw new Error('Invalid token')
  }

  // Check if email is verified
  if (!user.email_confirmed_at) {
    throw new Error('Email not verified. Please check your inbox and verify your email.')
  }

  return user
}
```

### 2.3 Password Reset Flow

#### Client-Side Flow
```
1. User clicks "Forgot Password"
   └── Frontend calls supabase.auth.resetPasswordForEmail(email)

2. Supabase sends password reset email
   └── Email contains link to /reset-password?token=xxx

3. User clicks link, enters new password
   └── Frontend calls supabase.auth.updateUser({ password: newPassword })

4. Password updated, user redirected to login
```

### 2.4 Supabase Auth Configuration

```sql
-- Configure Auth settings in Supabase Dashboard:
-- 1. Enable Email provider
-- 2. Set custom email templates (optional)
-- 3. Configure redirect URLs:
--    - Site URL: https://your-app.com
--    - Redirect URLs: 
--      - https://your-app.com/auth/callback
--      - https://your-app.com/reset-password
--      - http://localhost:5173/auth/callback (development)

-- Email template placeholders:
-- {{ .ConfirmationURL }} - Verification link
-- {{ .Token }} - Verification token
-- {{ .SiteURL }} - Your site URL
```

### 2.5 API Endpoints (Auth)

#### MVP (Edge Functions)
- `POST /functions/v1/auth-verify` - Verify JWT and get/create user profile
- Email verification and password reset handled by Supabase Auth SDK client-side

#### NestJS (Long-term)
- `POST /auth/verify` - Verify Supabase JWT token and sync user profile
- `GET /auth/me` - Get current authenticated user (validates token + email verification)
- `POST /auth/resend-verification` - Resend verification email

---

## 3. Database Schema (Supabase)

### 3.1 Core Tables

#### `users` (extends Supabase auth.users)
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT false,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  usage_count INTEGER DEFAULT 0,
  usage_limit INTEGER DEFAULT 3, -- Free: 3, Pro: unlimited (NULL)
  usage_reset_date DATE, -- Monthly reset date
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_stripe_customer ON public.users(stripe_customer_id);
CREATE INDEX idx_users_is_admin ON public.users(is_admin) WHERE is_admin = true;
```

#### `documents`
```sql
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Original content
  upgraded_content TEXT, -- Transformed content
  content_html TEXT, -- Rich text HTML version
  academic_level TEXT NOT NULL CHECK (academic_level IN ('undergraduate', 'postgraduate', 'masters', 'phd')),
  citation_style TEXT NOT NULL CHECK (citation_style IN ('APA 7th Edition', 'MLA 9th Edition', 'Harvard', 'Chicago')),
  document_type TEXT NOT NULL CHECK (document_type IN ('Essay', 'Research Paper', 'Thesis', 'Case Study', 'Report')),
  word_count INTEGER DEFAULT 0,
  file_url TEXT, -- Supabase Storage URL if uploaded
  file_name TEXT,
  file_size INTEGER, -- Bytes
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'diagnosed', 'upgraded', 'exported')),
  deleted_at TIMESTAMPTZ, -- Soft delete
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_edited_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_documents_created_at ON public.documents(created_at DESC);
CREATE INDEX idx_documents_deleted_at ON public.documents(deleted_at) WHERE deleted_at IS NULL;
```

#### `document_versions`
```sql
CREATE TABLE public.document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  content_html TEXT,
  upgraded_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, version_number)
);

CREATE INDEX idx_document_versions_document_id ON public.document_versions(document_id);
CREATE INDEX idx_document_versions_created_at ON public.document_versions(created_at DESC);
```

#### `diagnostics`
```sql
CREATE TABLE public.diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  structure_score INTEGER CHECK (structure_score >= 0 AND structure_score <= 100),
  tone_score INTEGER CHECK (tone_score >= 0 AND tone_score <= 100),
  clarity_score INTEGER CHECK (clarity_score >= 0 AND clarity_score <= 100),
  plagiarism_risk INTEGER CHECK (plagiarism_risk >= 0 AND plagiarism_risk <= 100),
  citation_score INTEGER CHECK (citation_score >= 0 AND citation_score <= 100),
  overall_grade TEXT, -- e.g., 'B+', 'A-'
  feedback JSONB, -- Detailed feedback array
  issues JSONB, -- Array of issues found
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_diagnostics_document_id ON public.diagnostics(document_id);
```

#### `transformations`
```sql
CREATE TABLE public.transformations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  original_content TEXT NOT NULL,
  transformed_content TEXT NOT NULL,
  changes_summary JSONB, -- Summary of changes made
  model_used TEXT DEFAULT 'gpt-4.1',
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transformations_document_id ON public.transformations(document_id);
```

#### `citations`
```sql
CREATE TABLE public.citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  citation_text TEXT NOT NULL,
  citation_type TEXT CHECK (citation_type IN ('in_text', 'reference')),
  source_url TEXT,
  source_title TEXT,
  source_author TEXT,
  source_year INTEGER,
  position_start INTEGER, -- Character position in document
  position_end INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_citations_document_id ON public.citations(document_id);
```

#### `exports`
```sql
CREATE TABLE public.exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL CHECK (export_type IN ('pdf', 'docx', 'txt')),
  file_url TEXT NOT NULL, -- Supabase Storage URL
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exports_document_id ON public.exports(document_id);
```

#### `usage_logs`
```sql
CREATE TABLE public.usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('diagnostic', 'transformation', 'export')),
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  cost_usd DECIMAL(10, 6),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX idx_usage_logs_created_at ON public.usage_logs(created_at DESC);
```

#### `admin_actions`
```sql
CREATE TABLE public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_type TEXT, -- 'user', 'document', 'subscription'
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_actions_admin_id ON public.admin_actions(admin_id);
CREATE INDEX idx_admin_actions_created_at ON public.admin_actions(created_at DESC);
```

#### `error_logs`
```sql
CREATE TABLE public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  endpoint TEXT,
  method TEXT,
  error_message TEXT NOT NULL,
  error_code TEXT,
  stack_trace TEXT,
  request_body JSONB,
  request_headers JSONB,
  response_status INTEGER,
  severity TEXT DEFAULT 'error' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_error_logs_user_id ON public.error_logs(user_id);
CREATE INDEX idx_error_logs_created_at ON public.error_logs(created_at DESC);
CREATE INDEX idx_error_logs_severity ON public.error_logs(severity);
CREATE INDEX idx_error_logs_resolved ON public.error_logs(resolved) WHERE resolved = false;
```

#### `file_cleanup_jobs`
```sql
CREATE TABLE public.file_cleanup_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_url TEXT NOT NULL,
  bucket_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_file_cleanup_jobs_status ON public.file_cleanup_jobs(status);
CREATE INDEX idx_file_cleanup_jobs_scheduled_at ON public.file_cleanup_jobs(scheduled_at);
```

### 3.2 Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transformations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_cleanup_jobs ENABLE ROW LEVEL SECURITY;

-- Users can only see/update their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Admin can view all users
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Documents policies (exclude soft-deleted)
CREATE POLICY "Users can view own documents" ON public.documents
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create own documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can delete own documents" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id); -- Soft delete via deleted_at

-- Document versions policies
CREATE POLICY "Users can view own document versions" ON public.document_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE id = document_versions.document_id
      AND user_id = auth.uid()
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Users can create own document versions" ON public.document_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE id = document_versions.document_id
      AND user_id = auth.uid()
    )
  );

-- Diagnostics policies
CREATE POLICY "Users can view own diagnostics" ON public.diagnostics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE id = diagnostics.document_id
      AND user_id = auth.uid()
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Users can create own diagnostics" ON public.diagnostics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE id = diagnostics.document_id
      AND user_id = auth.uid()
    )
  );

-- Transformations policies
CREATE POLICY "Users can view own transformations" ON public.transformations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE id = transformations.document_id
      AND user_id = auth.uid()
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Users can create own transformations" ON public.transformations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE id = transformations.document_id
      AND user_id = auth.uid()
    )
  );

-- Citations policies
CREATE POLICY "Users can manage own citations" ON public.citations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE id = citations.document_id
      AND user_id = auth.uid()
      AND deleted_at IS NULL
    )
  );

-- Exports policies
CREATE POLICY "Users can view own exports" ON public.exports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE id = exports.document_id
      AND user_id = auth.uid()
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Users can create own exports" ON public.exports
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE id = exports.document_id
      AND user_id = auth.uid()
    )
  );

-- Usage logs policies
CREATE POLICY "Users can view own usage logs" ON public.usage_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Error logs policies (users can only see their own, admins see all)
CREATE POLICY "Users can view own error logs" ON public.error_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all error logs" ON public.error_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- File cleanup jobs (admin only)
CREATE POLICY "Admins can manage cleanup jobs" ON public.file_cleanup_jobs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

### 3.3 Storage Buckets (Supabase Storage)

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('documents', 'documents', false),
  ('exports', 'exports', false);

-- Storage policies
CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## 4. API Endpoints Structure

### 4.1 MVP Endpoints (Supabase Edge Functions)

| Function Name | Method | Description |
|---------------|--------|-------------|
| `auth-verify` | POST | Verify JWT, sync user profile |
| `user-profile` | GET/PATCH | Get/update user profile |
| `user-usage` | GET | Get usage statistics |
| `documents-list` | GET | List user's documents |
| `documents-create` | POST | Create document (text paste) |
| `documents-get` | GET | Get document by ID |
| `documents-update` | PATCH | Update document |
| `documents-delete` | DELETE | Soft delete document |
| `documents-upload` | POST | Upload file (.docx, .pdf) |
| `documents-auto-save` | POST | Auto-save document content |
| `diagnostics-run` | POST | Run AI diagnostics |
| `diagnostics-get` | GET | Get diagnostic results |
| `transform-document` | POST | Apply AI transformation |
| `citations-manage` | GET/POST/PATCH/DELETE | Manage citations |
| `citations-detect` | POST | Auto-detect citations |
| `export-document` | POST | Export to PDF/DOCX/TXT |
| `subscription-checkout` | POST | Create Stripe checkout |
| `subscription-portal` | GET | Get Stripe portal URL |
| `stripe-webhook` | POST | Handle Stripe webhooks |

### 4.2 Full API Endpoints (NestJS - Long-term)

#### Authentication Endpoints
- `POST /auth/verify` - Verify Supabase JWT token and create/update user profile
- `GET /auth/me` - Get current authenticated user (validates token + email verification)
- `POST /auth/resend-verification` - Resend email verification

#### User Endpoints
- `GET /users/me` - Get current user profile
- `PATCH /users/me` - Update user profile
- `GET /users/me/usage` - Get usage statistics
- `GET /users/me/subscription` - Get subscription details

#### Document Endpoints
- `GET /documents` - List user's documents (with pagination, filtering, sorting)
  - Query params: `page`, `limit`, `status`, `sort`, `order`
- `GET /documents/:id` - Get document by ID
- `POST /documents` - Create new document (text paste)
- `POST /documents/upload` - Upload document file (.docx, .pdf)
- `PATCH /documents/:id` - Update document metadata/content
- `DELETE /documents/:id` - Soft delete document
- `POST /documents/:id/auto-save` - Auto-save document content
- `GET /documents/:id/versions` - Get document version history
- `POST /documents/:id/versions/:versionId/restore` - Restore specific version

#### Diagnostic Endpoints
- `POST /documents/:id/diagnostics` - Run diagnostics on document
- `GET /documents/:id/diagnostics` - Get diagnostic results
- `GET /documents/:id/diagnostics/latest` - Get latest diagnostic

#### Transformation Endpoints
- `POST /documents/:id/transform` - Apply transformation/upgrade
- `GET /documents/:id/transformations` - Get transformation history
- `POST /documents/:id/transform/revert` - Revert to previous version

#### Citation Endpoints
- `GET /documents/:id/citations` - Get all citations for document
- `POST /documents/:id/citations` - Add citation
- `PATCH /documents/:id/citations/:citationId` - Update citation
- `DELETE /documents/:id/citations/:citationId` - Delete citation
- `POST /documents/:id/citations/detect` - Auto-detect citations from content
- `POST /documents/:id/citations/format` - Format citations according to style

#### Export Endpoints
- `POST /documents/:id/export` - Export document (PDF, DOCX, TXT)
- `GET /documents/:id/exports` - Get export history
- `GET /documents/:id/exports/:exportId/download` - Download exported file
- `POST /documents/:id/export/comparison` - Export before/after comparison

#### Subscription Endpoints
- `GET /subscriptions/plans` - Get available subscription plans
- `POST /subscriptions/create-checkout` - Create Stripe checkout session
- `POST /subscriptions/cancel` - Cancel subscription
- `POST /subscriptions/reactivate` - Reactivate canceled subscription
- `GET /subscriptions/portal` - Get Stripe customer portal URL
- `POST /webhooks/stripe` - Stripe webhook handler

#### Admin Endpoints
- `GET /admin/users` - List all users (with pagination, filters)
- `GET /admin/users/:id` - Get user details
- `PATCH /admin/users/:id` - Update user (moderation, set admin role)
- `DELETE /admin/users/:id` - Delete user
- `GET /admin/documents` - List all documents
- `GET /admin/analytics` - Platform analytics
- `GET /admin/usage-stats` - Usage statistics
- `GET /admin/revenue` - Revenue statistics
- `GET /admin/errors` - Error logs
- `PATCH /admin/errors/:id/resolve` - Mark error as resolved

---

## 5. OpenAI Integration (GPT-4.1)

### 5.1 Configuration
```typescript
// OpenAI Configuration
export const openaiConfig = {
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4.1',           // Primary model
  fallbackModel: 'gpt-4.1-mini', // Fallback for high-volume
  maxTokens: 4000,
  temperature: 0.7,
  timeout: 60000,             // 60 seconds
  maxRetries: 3,
  retryDelay: 1000,           // Exponential backoff starting at 1s
  rateLimitPerMinute: 60,
};
```

### 5.2 Diagnostic Prompts
```typescript
const diagnosticPrompt = `
You are an academic writing expert. Analyze the following academic document and provide scores (0-100) for:

1. Structure Quality: Organization, paragraphs, logical flow
2. Academic Tone: Formal language, objectivity, professional voice
3. Clarity & Coherence: Clear arguments, smooth transitions, readability
4. Plagiarism Risk: Originality estimate (lower is better)
5. Citation Quality: Proper formatting, adequate sources

Also provide:
- Overall grade (A+, A, A-, B+, B, B-, C+, C, C-, D, F)
- Detailed feedback for each category
- List of specific issues found

Document Type: {{documentType}}
Academic Level: {{academicLevel}}
Citation Style: {{citationStyle}}

Document Content:
{{content}}

Respond in JSON format:
{
  "structure_score": number,
  "tone_score": number,
  "clarity_score": number,
  "plagiarism_risk": number,
  "citation_score": number,
  "overall_grade": string,
  "feedback": [
    { "category": string, "message": string, "severity": "info"|"warning"|"error" }
  ],
  "issues": [
    { "type": string, "description": string, "location": string }
  ]
}
`;
```

### 5.3 Transformation Prompts
```typescript
const transformationPrompt = `
You are an expert academic editor. Transform the following student-written content into professional, submission-ready academic work.

Requirements:
1. Maintain the original meaning and arguments
2. Use formal academic language appropriate for {{academicLevel}} level
3. Improve paragraph structure and logical flow
4. Strengthen arguments with clear reasoning
5. Fix grammar, syntax, and punctuation
6. Apply {{citationStyle}} citation format
7. Remove informal language and contractions

Document Type: {{documentType}}
Academic Level: {{academicLevel}}
Citation Style: {{citationStyle}}

Original Content:
{{content}}

Provide the transformed content with academic improvements while preserving the author's original ideas.
`;
```

### 5.4 Error Handling
```typescript
async function callOpenAI(prompt: string, retries = 3): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: openaiConfig.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: openaiConfig.maxTokens,
        temperature: openaiConfig.temperature,
      });
      
      return response.choices[0].message.content;
    } catch (error) {
      if (error.status === 429) {
        // Rate limit - wait with exponential backoff
        const delay = openaiConfig.retryDelay * Math.pow(2, attempt - 1);
        await sleep(delay);
        continue;
      }
      
      if (attempt === retries) {
        // Log error and throw
        await logError({
          endpoint: 'openai',
          error_message: error.message,
          error_code: error.code || error.status,
          severity: 'error',
        });
        throw error;
      }
    }
  }
}
```

---

## 6. Supabase Edge Function Examples

### 6.1 Auth Verify Function
```typescript
// supabase/functions/auth-verify/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check email verification
    if (!user.email_confirmed_at) {
      return new Response(
        JSON.stringify({ 
          error: 'Email not verified',
          message: 'Please check your inbox and verify your email address.'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get or create user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError
    }

    // If no profile exists, it will be created by the trigger
    // Just return the user data

    return new Response(
      JSON.stringify({ user, profile }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

### 6.2 Diagnostics Function
```typescript
// supabase/functions/diagnostics-run/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check email verification
    if (!user.email_confirmed_at) {
      return new Response(
        JSON.stringify({ error: 'Email not verified' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { documentId } = await req.json()

    // Get document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (docError || !document) {
      return new Response(
        JSON.stringify({ error: 'Document not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check usage limits
    const { data: userProfile } = await supabase
      .from('users')
      .select('usage_count, usage_limit, subscription_tier')
      .eq('id', user.id)
      .single()

    if (userProfile.subscription_tier === 'free' && 
        userProfile.usage_count >= userProfile.usage_limit) {
      return new Response(
        JSON.stringify({ 
          error: 'Usage limit reached',
          message: 'Upgrade to Pro for unlimited diagnostics'
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const startTime = Date.now()

    // Call OpenAI for diagnostics
    const prompt = `
You are an academic writing expert. Analyze the following academic document and provide scores (0-100) for:
1. Structure Quality
2. Academic Tone
3. Clarity & Coherence
4. Plagiarism Risk (lower is better)
5. Citation Quality

Document Type: ${document.document_type}
Academic Level: ${document.academic_level}
Citation Style: ${document.citation_style}

Document Content:
${document.content}

Respond in JSON format only.
`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const diagnosticResult = JSON.parse(completion.choices[0].message.content)
    const processingTime = Date.now() - startTime
    const tokensUsed = completion.usage?.total_tokens || 0

    // Save diagnostic result
    const { data: diagnostic, error: saveError } = await supabase
      .from('diagnostics')
      .insert({
        document_id: documentId,
        structure_score: diagnosticResult.structure_score,
        tone_score: diagnosticResult.tone_score,
        clarity_score: diagnosticResult.clarity_score,
        plagiarism_risk: diagnosticResult.plagiarism_risk,
        citation_score: diagnosticResult.citation_score,
        overall_grade: diagnosticResult.overall_grade,
        feedback: diagnosticResult.feedback,
        issues: diagnosticResult.issues,
      })
      .select()
      .single()

    if (saveError) throw saveError

    // Update document status
    await supabase
      .from('documents')
      .update({ status: 'diagnosed', updated_at: new Date().toISOString() })
      .eq('id', documentId)

    // Log usage
    await supabase.from('usage_logs').insert({
      user_id: user.id,
      action_type: 'diagnostic',
      document_id: documentId,
      tokens_used: tokensUsed,
      processing_time_ms: processingTime,
      cost_usd: tokensUsed * 0.00001, // Approximate cost
    })

    // Increment usage count
    await supabase.rpc('increment_usage_count', { user_id: user.id })

    return new Response(
      JSON.stringify({ diagnostic }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Diagnostic error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

---

## 7. Stripe Integration

### 7.1 Configuration
```typescript
export const stripeConfig = {
  apiKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  testMode: process.env.NODE_ENV !== 'production',
  apiVersion: '2024-11-20.acacia',
  
  // Products/Prices (create in Stripe Dashboard)
  products: {
    pro: {
      priceId: process.env.STRIPE_PRO_PRICE_ID,
      name: 'Docley Pro',
      price: 9.99,
      interval: 'month',
    },
  },
};
```

### 7.2 Webhook Handler (Edge Function)
```typescript
// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-11-20.acacia',
})

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!
  const body = await req.text()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      
      await supabase
        .from('users')
        .update({
          subscription_tier: 'pro',
          subscription_status: 'active',
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          usage_limit: null, // Unlimited
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.metadata?.userId)
      
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      
      await supabase
        .from('users')
        .update({
          subscription_status: subscription.status,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id)
      
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      
      await supabase
        .from('users')
        .update({
          subscription_tier: 'free',
          subscription_status: 'canceled',
          usage_limit: 3,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id)
      
      break
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

---

## 8. Environment Variables

### 8.1 MVP (.env for Edge Functions)
Set these in Supabase Dashboard > Project Settings > Edge Functions > Secrets

```env
# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PRO_PRICE_ID=price_xxxxx
```

### 8.2 NestJS (.env)
```env
# Server
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key
STRIPE_PRO_PRICE_ID=price_xxxxx

# File Upload
MAX_FILE_SIZE=20971520 # 20MB in bytes
ALLOWED_FILE_TYPES=application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
THROTTLE_LIMIT_FREE=50
THROTTLE_LIMIT_PRO=200

# Redis (NestJS only)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL=3600

# Background Jobs (NestJS only)
QUEUE_CONCURRENCY=5
CLEANUP_JOB_SCHEDULE=0 2 * * *
FILE_RETENTION_DAYS=30

# Logging
LOG_LEVEL=info
```

---

## 9. Implementation Phases

### Phase A: MVP with Supabase Edge Functions (2-3 weeks)

#### Week 1: Foundation
- [ ] Set up Supabase project
- [ ] Create database schema and migrations
- [ ] Configure RLS policies
- [ ] Set up storage buckets
- [ ] Create user sync trigger
- [ ] Deploy `auth-verify` Edge Function
- [ ] Test email verification flow

#### Week 2: Core Features
- [ ] Deploy `documents-crud` Edge Functions
- [ ] Deploy `documents-upload` Edge Function
- [ ] Deploy `diagnostics-run` Edge Function
- [ ] Deploy `transform-document` Edge Function
- [ ] Deploy `citations-manage` Edge Function
- [ ] Test OpenAI integration

#### Week 3: Monetization & Polish
- [ ] Deploy `export-document` Edge Function
- [ ] Deploy `subscription-checkout` Edge Function
- [ ] Deploy `stripe-webhook` Edge Function
- [ ] Set up Stripe products and webhooks
- [ ] End-to-end testing
- [ ] Frontend integration

### Phase B: NestJS Migration (4-6 weeks - after MVP validation)

#### Week 1: Setup
- [ ] Initialize NestJS project
- [ ] Configure TypeScript, ESLint
- [ ] Set up folder structure
- [ ] Configure environment variables
- [ ] Set up Supabase client

#### Week 2: Core Modules
- [ ] Auth module (JWT validation)
- [ ] Users module
- [ ] Documents module
- [ ] File upload handling

#### Week 3: AI Features
- [ ] Diagnostics service
- [ ] Transformation service
- [ ] Citation service

#### Week 4: Export & Subscriptions
- [ ] Export service (PDF, DOCX, TXT)
- [ ] Stripe integration
- [ ] Webhook handling

#### Week 5: Admin & Background Jobs
- [ ] Redis setup
- [ ] Bull/BullMQ queues
- [ ] Admin endpoints
- [ ] File cleanup jobs
- [ ] Analytics aggregation

#### Week 6: Polish & Deploy
- [ ] Rate limiting
- [ ] Error handling
- [ ] Logging (Winston)
- [ ] API documentation (Swagger)
- [ ] Testing
- [ ] Deploy to Render/Railway

---

## 10. Database Helper Functions

```sql
-- Increment usage count function
CREATE OR REPLACE FUNCTION increment_usage_count(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET 
    usage_count = usage_count + 1,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reset usage counts (run monthly via cron)
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET 
    usage_count = 0,
    usage_reset_date = CURRENT_DATE + INTERVAL '1 month',
    updated_at = NOW()
  WHERE subscription_tier = 'free'
    AND (usage_reset_date IS NULL OR usage_reset_date <= CURRENT_DATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get next version number for document
CREATE OR REPLACE FUNCTION get_next_version_number(doc_id UUID)
RETURNS INTEGER AS $$
DECLARE
  next_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO next_version
  FROM public.document_versions
  WHERE document_id = doc_id;
  
  RETURN next_version;
END;
$$ LANGUAGE plpgsql;
```

---

## 11. Implementation Checklist

### MVP (Supabase Edge Functions)
- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] RLS policies configured
- [ ] Storage buckets created
- [ ] User sync trigger active
- [ ] Edge Functions deployed:
  - [ ] auth-verify
  - [ ] user-profile
  - [ ] documents-crud
  - [ ] documents-upload
  - [ ] diagnostics-run
  - [ ] transform-document
  - [ ] citations-manage
  - [ ] export-document
  - [ ] subscription-checkout
  - [ ] stripe-webhook
- [ ] Email verification flow working
- [ ] OpenAI integration tested
- [ ] Stripe integration tested
- [ ] Frontend connected

### NestJS Migration
- [ ] NestJS project initialized
- [ ] All Edge Function logic migrated
- [ ] Redis caching implemented
- [ ] Background jobs implemented
- [ ] Admin endpoints implemented
- [ ] Rate limiting configured
- [ ] Logging configured
- [ ] API documentation complete
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Deployed to production

---

## 12. Next Steps

1. **Set up Supabase Project**
   - Create new project at supabase.com
   - Run database migrations
   - Configure auth settings

2. **Configure OpenAI**
   - Get API key from OpenAI
   - Add to Supabase Edge Function secrets

3. **Set up Stripe**
   - Create Stripe account
   - Create Pro product and price
   - Get API keys

4. **Deploy Edge Functions**
   - Install Supabase CLI
   - Deploy functions one by one
   - Test each endpoint

5. **Connect Frontend**
   - Update API base URLs
   - Implement auth flow with email verification
   - Test end-to-end

---

**Ready to start implementing?** Let me know which part you'd like to begin with!