import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Mensagem básica da API' })
  @ApiResponse({ status: 200, description: 'API em execução' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check da API e banco de dados' })
  @ApiResponse({ status: 200, description: 'Serviço saudável' })
  async getHealth() {
    return this.appService.getHealth();
  }
}
