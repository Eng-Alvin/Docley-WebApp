import { Controller, Get, HttpCode, Head } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Public()
@Controller()
export class AppController {
    @Get()
    @HttpCode(200)
    getHello() {
        return {
            message: 'Docley API is running',
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }

    @Head()
    @HttpCode(200)
    getHead() {
        return;
    }
}
