import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  RequestTimeoutException,
} from '@nestjs/common';
import { SupabaseService } from '../../core/supabase/supabase.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import { DIAGNOSTIC_PROMPT } from './prompts/diagnostic';
import { CITATION_PROMPT } from './prompts/citation';
import { RetrievalService } from '../documents/retrieval.service';
import DOMPurify from 'isomorphic-dompurify';

dotenv.config();

@Injectable()
export class ChatService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private readonly retrievalService: RetrievalService,
    private readonly supabaseService: SupabaseService,
  ) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error(
        'CRITICAL CONFIG ERROR: GOOGLE_API_KEY is missing. AI features will not function. Please add it to your server .env file.',
      );
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });
  }

  async processText(
    text: string,
    instruction: string,
    mode: string,
    documentId?: string,
  ): Promise<any> {
    console.log(
      `[ChatService] Received request: Mode=${mode}, TextLength=${text?.length}, DocumentId=${documentId}`,
    );

    if (!text) {
      throw new BadRequestException('Input text is missing.');
    }

    // mode: 'diagnostic' | 'upgrade' | 'analysis' (legacy)
    let prompt;

    // RAG: If documentId is provided, fetch relevant context and metadata
    let context = '';
    if (documentId) {
      // 1. Fetch document metadata
      const { data: doc } = await this.supabaseService.getClient()
        .from('documents')
        .select('title, academic_level, citation_style, document_type')
        .eq('id', documentId)
        .single();

      if (doc) {
        context += `--- DOCUMENT METADATA ---\n`;
        context += `Title: ${doc.title}\n`;
        context += `Type: ${doc.document_type}\n`;
        context += `Academic Level: ${doc.academic_level}\n`;
        context += `Preferred Citation Style: ${doc.citation_style}\n`;
        context += `--- END METADATA ---\n\n`;
      }

      // 2. Fetch relevant chunks
      const query = instruction || text || 'General document analysis';
      const chunks = await this.retrievalService.getRelevantChunks(documentId, query);
      if (chunks.length > 0) {
        context += `--- DOCUMENT CONTEXT ---\n${chunks.join('\n\n')}\n--- END CONTEXT ---\n\n`;
      }
    }

    if (mode === 'diagnostic' || mode === 'analysis') {
      prompt = `
      ${context}
      User Question/Instruction: ${instruction || 'Analyze this text'}
      Current Selection: "${text}"
      
      ${DIAGNOSTIC_PROMPT}
      `;
    } else if (mode === 'upgrade' || mode === 'transform') {
      // Upgrade / Transform mode
      prompt = `ROLE & IDENTITY
You are "Docley Architect," You act as a senior professor. Your core specialty is upgrading students document, research paper, reports and thesis to modern, highly good paper.
            
            ${context}

            Current Selection:
            "${text}"
            
            Instruction:
            ${instruction || 'Revise this text to a formal academic standard. Improve clarity, coherence, and scholarly tone without altering the original meaning. Standardize and correct all in-text citations and references to accepted academic formats. Ensure the rewritten content is fully original, paraphrased, and plagiarism-safe under automated plagiarism detection. Do not add new ideas or remove existing ones..'}
            
            Return a JSON object with a single key "result" containing the improved text as valid HTML fragments.
            Example: { "result": "<p>Improved text...</p>" }
            `;
    } else if (mode === 'citation') {
      prompt = CITATION_PROMPT.replace('{{TEXT}}', text).replace(
        '{{STYLE}}',
        instruction || 'APA 7th Edition',
      );
    } else {
      throw new BadRequestException(
        'Invalid mode. Supported modes: diagnostic, upgrade, citation',
      );
    }

    try {
      console.log('[ChatService] Sending prompt to Gemini...');
      const startTime = Date.now();

      // Create a timeout promise that rejects after 60 seconds
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new RequestTimeoutException(
                'AI processing timed out after 60 seconds. Please try again with a shorter text or specific instruction.',
              ),
            ),
          60000,
        ),
      );

      // Race the generation against the timeout
      const result: any = await Promise.race([
        this.model.generateContent(prompt),
        timeoutPromise,
      ]);

      const duration = Date.now() - startTime;
      console.log(
        `[ChatService] Received response from Gemini in ${duration}ms.`,
      );

      const response = await result.response;
      const generatedText = response.text();

      // Parse the JSON string on the server side
      const parsed = this.extractJsonFromResponse(generatedText);

      // Sanitize specifically the 'result' field if it exists (which contains the HTML)
      if (parsed && typeof parsed.result === 'string') {
        parsed.result = this.sanitizeAIHTML(parsed.result);
      }

      return parsed;
    } catch (error) {
      const duration = Date.now() - (Date.now() - 60000); // Approximate if timed out, but better to track start time in outer scope if needed.
      // Actually simpler:
      if (error instanceof RequestTimeoutException) {
        console.error('[ChatService] Request timed out.');
        throw error;
      }

      console.error('[ChatService] Error generating content:', error);
      console.error(
        '[ChatService] Error Details:',
        JSON.stringify(error, null, 2),
      );
      throw new InternalServerErrorException(
        `Failed to generate content: ${error.message} `,
      );
    }
  }

  /**
   * Specifically polishes text for academic tone and style.
   * Returns HTML fragment.
   */
  async polishText(text: string, level: string, style: string): Promise<string> {
    if (!text) throw new BadRequestException('Text is required');

    const prompt = `
      You are a professional academic editor. 
      Rewrite the provided text for a ${level || 'undergraduate'} student using ${style || 'APA'} citations. 
      
      Return ONLY the polished HTML fragment (e.g., <p>...</p>). 
      No preamble, no markdown code blocks, and no conversational text.
      
      Original Text:
      "${text}"
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let generatedText = response.text();

      // Cleanup if Gemini wraps in markdown despite instructions
      generatedText = generatedText.replace(/^```html\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();

      return this.sanitizeAIHTML(generatedText);
    } catch (error) {
      console.error('[ChatService] Polish error:', error);
      throw new InternalServerErrorException('Failed to polish text');
    }
  }

  private extractJsonFromResponse(rawText: string): any {
    try {
      if (!rawText) return {};

      // Regex to strip markdown code blocks (```json ... ``` or just ``` ... ```)
      let cleanText = rawText
        .replace(/^```json\s*/i, '') // Remove top ```json
        .replace(/^```\s*/i, '')     // Remove top ```
        .replace(/```\s*$/, '')      // Remove bottom ```
        .trim();

      return JSON.parse(cleanText);
    } catch (error) {
      console.error('[ChatService] JSON Parsing Logic Failed:', error.message);
      console.warn('[ChatService] Returning raw text as fallback.');

      // Return a safe fallback object so the frontend doesn't crash
      return {
        result: rawText,
        fallback: true,
        error: 'JSON_PARSE_FAILED'
      };
    }
  }
  /**
   * Sanitize HTML content to prevent XSS while allowing safe document formatting.
   */
  private sanitizeAIHTML(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p', 'b', 'i', 'strong', 'em', 'u', 's', 'span', 'div',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'br', 'hr',
        'blockquote', 'pre', 'code',
      ],
      ALLOWED_ATTR: ['class', 'style'], // Allow basic styling
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    });
  }
}
