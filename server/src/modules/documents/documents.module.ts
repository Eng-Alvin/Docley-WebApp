import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { IngestionService } from './ingestion.service';
import { RetrievalService } from './retrieval.service';

@Module({
  imports: [UsersModule, NotificationsModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, IngestionService, RetrievalService],
  exports: [DocumentsService, IngestionService, RetrievalService],
})
export class DocumentsModule { }
