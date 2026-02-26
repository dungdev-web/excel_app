// src/comparisons/comparisons.controller.ts
import { Controller, Post, Get, Body, Headers, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ComparisonsService } from './comparisons.service';
import type { ComparisonDto } from '../companies/dto/company.dto';

@Controller('api/comparisons')
export class ComparisonsController {
  constructor(
    private comparisonsService: ComparisonsService,
    private jwtService: JwtService,
  ) {}

  private getUserId(authHeader: string): string {
    if (!authHeader?.startsWith('Bearer '))
      throw new UnauthorizedException('Token không hợp lệ');
    try {
      const payload = this.jwtService.verify(authHeader.slice(7));
      return payload.sub as string;
    } catch {
      throw new UnauthorizedException('Token hết hạn hoặc không hợp lệ');
    }
  }

  @Post()
  async compare(
    @Body() comparisonDto: ComparisonDto,
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserId(auth);
    // console.log(userId);
    
    try {
      return await this.comparisonsService.compare(comparisonDto, userId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (msg.includes('access denied') || msg.includes('not found')) {
        throw new NotFoundException(msg);
      }
      throw new BadRequestException(msg);
    }
  }

  @Get()
  async findAll(@Headers('authorization') auth: string) {
    const userId = this.getUserId(auth);
    return this.comparisonsService.findAll(userId); // ← chỉ trả về của user
  }
}