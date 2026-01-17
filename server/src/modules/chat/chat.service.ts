import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../../core/supabase/supabase.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import { DIAGNOSTIC_PROMPT } from './prompts/diagnostic';
import { CITATION_PROMPT } from './prompts/citation';
import { RetrievalService } from '../documents/retrieval.service';

dotenv.config();

@Injectable()
export class ChatService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private readonly retrievalService: RetrievalService) {
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

    // RAG: If documentId is provided, fetch relevant context
    let context = '';
    if (documentId) {
      const query = instruction || text || 'General document analysis';
      const chunks = await this.retrievalService.getRelevantChunks(documentId, query);
      if (chunks.length > 0) {
        context = `\n\n--- DOCUMENT CONTEXT ---\n${chunks.join('\n\n')}\n--- END CONTEXT ---\n\n`;
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
      prompt = `You are an Expert Academic Editor.
            
            ${context}

            Current Selection:
            "${text}"
            
            Instruction:
            ${instruction || 'Improve the academic tone, clarity, and flow of this text.'}
            
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
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const generatedText = response.text();
      console.log('[ChatService] Received response from Gemini.');

      // Parse the JSON string on the server side
      try {
        const parsedData = JSON.parse(generatedText);
        return parsedData; // Return the clean object directly
      } catch (parseError) {
        console.error('[ChatService] JSON Parse Error:', parseError);
        console.error('[ChatService] Raw Text:', generatedText);
        throw new InternalServerErrorException('Failed to parse AI response');
      }
    } catch (error) {
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
}
