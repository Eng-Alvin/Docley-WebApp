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

  @Post()
  @UseGuards(UsageGuard)
  async create(@Req() req, @Body() createDocumentDto: any) {
    const doc = await this.documentsService.create(
      req.user.id,
      createDocumentDto,
    );

    // Trigger ingestion in background if content is present
    if (doc.content_html || doc.content) {
      this.ingestionService.processDocument(doc.id).catch(err => {
        console.error('[DocumentsController] Ingestion trigger error:', err);
      });
    }

    return doc;
  }

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
    const result = await this.documentsService.uploadFile(req.user.id, documentId, file);

    // Trigger ingestion in background
    this.ingestionService.processDocument(documentId).catch(err => {
      console.error('[DocumentsController] Ingestion trigger error:', err);
    });

    return result;
  }

  @Get()
  async findAll(@Req() req, @Query() query: any) {
    const filters = {
      status: query.status,
      academic_level: query.academic_level,
    };
    return this.documentsService.findAll(req.user.id, filters);
  }

  @Get(':id')
  async findOne(@Req() req, @Param('id') id: string) {
    return this.documentsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  async update(@Req() req, @Param('id') id: string, @Body() body: any) {
    return this.documentsService.update(id, body, req.user.id);
  }

  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    return this.documentsService.remove(id, req.user.id);
  }
}
