import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class SupabaseService implements OnModuleInit {
    private supabase: SupabaseClient;

    onModuleInit() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Supabase credentials missing in .env');
            throw new Error('Supabase URL or Key not found');
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.ensureBucketExists();
    }

    private async ensureBucketExists() {
        const bucketName = 'documents';
        try {
            const { data: buckets, error: listError } = await this.supabase.storage.listBuckets();

            if (listError) {
                console.error(`Error listing buckets: ${listError.message}`);
                return;
            }

            const bucketExists = buckets.some(b => b.name === bucketName);

            if (!bucketExists) {
                console.log(`Bucket '${bucketName}' not found. Creating it...`);
                const { error: createError } = await this.supabase.storage.createBucket(bucketName, {
                    public: true,
                    allowedMimeTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
                    fileSizeLimit: 20 * 1024 * 1024 // 20MB
                });

                if (createError) {
                    console.error(`Failed to create bucket '${bucketName}': ${createError.message}`);
                } else {
                    console.log(`Bucket '${bucketName}' created successfully.`);
                }
            } else {
                console.log(`Bucket '${bucketName}' already exists.`);
            }
        } catch (err) {
            console.error('Unexpected error checking/creating bucket:', err.message);
        }
    }

    getClient(): SupabaseClient {
        return this.supabase;
    }
}
