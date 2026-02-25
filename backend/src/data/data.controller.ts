import { Controller, Get, Post, Body } from '@nestjs/common';
import { DataService } from './data.service';

@Controller('api/data')
export class DataController {
  constructor(private dataService: DataService) {}

  @Get()
  async getData() {
    return await this.dataService.readData();
  }

  @Post()
  async addData(
    @Body() body: { name: string; email: string; phone: string }
  ) {
    return await this.dataService.addData(body);
  }
}