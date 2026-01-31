import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../core/supabase/supabase.service';


@Injectable()
@Injectable()
export class DocumentsService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) { }

  private get client() {
    return this.supabaseService.getClient();
  }

  async uploadFile(
    userId: string,
    documentId: string,
    file: Express.Multer.File,
  ) {
    const fileExt = file.originalname.includes('.')
      ? file.originalname.split('.').pop()
      : '';
    const safeExt = fileExt ? `.${fileExt}` : '';
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2)}${safeExt}`;
    const filePath = `${userId}/${documentId}/${uniqueName}`;

    const { error: uploadError } = await this.client.storage
      .from('documents')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      throw new InternalServerErrorException(uploadError.message);
    }

    return { filePath };
  }

  async saveUploadResult(documentId: string, contentHtml: string, filePath: string) {
    try {
      console.log(`[DocumentsService] Saving upload result for document: ${documentId}`);

      const { data, error } = await this.client
        .from('documents')
        .update({
          content: contentHtml, // For TipTap
          content_html: contentHtml, // Legacy/Backup
          file_url: filePath,
          status: 'ready',
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId)
        .select()
        .single();

      if (error) {
        console.error('[DocumentsService] Supabase UPDATE error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          documentId,
        });
        throw new InternalServerErrorException(`Failed to save document content: ${error.message}`);
      }

      if (!data) {
        console.error('[DocumentsService] No document found to update:', documentId);
        throw new NotFoundException(`Document ${documentId} not found`);
      }

      console.log(`[DocumentsService] Successfully saved document: ${documentId}`);
      return data;
    } catch (err) {
      console.error('[DocumentsService] saveUploadResult failed:', err);
      throw err;
    }
  }
}
