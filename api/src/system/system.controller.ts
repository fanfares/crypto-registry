import { Controller, Get } from '@nestjs/common';

@Controller('system')
export class SystemController {
  @Get('test')
  systemTest() {
    return {
      status: 'ok'
    };

  }

}
