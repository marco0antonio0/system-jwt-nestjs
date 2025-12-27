import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  getHeath() {
    return { status: 'up' };
  }
}
