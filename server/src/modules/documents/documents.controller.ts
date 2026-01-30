import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { IngestionService } from './ingestion.service';
import { UsageGuard } from '../users/guards/usage.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly ingestionService: IngestionService,
  ) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('documentId') documentId: string,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // 1. Upload to Storage
    const { filePath } = await this.documentsService.uploadFile(req.user.id, documentId, file);

    // 2. Extract HTML (High-Fidelity) - Synchronous
    const html = await this.ingestionService.extractContentHtml(file.buffer, file.mimetype);

    // 3. Save to DB - Synchronous
    // This guarantees content is ready when frontend redirects
    await this.documentsService.saveUploadResult(documentId, html, filePath);

    // 4. Trigger AI ingestion (Embeddings) - Asynchronous Background Task
    this.ingestionService.processDocument(documentId).catch(err => {
      console.error('[DocumentsController] Ingestion trigger error:', err);
    });

    return { documentId, filePath };
  }
}
