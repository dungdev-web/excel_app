// src/companies/companies.controller.ts
import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Headers, UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CompaniesService } from './companies.service';
import type { CreateCompanyDto } from './dto/company.dto';

@Controller('api/companies')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly jwtService: JwtService,
  ) {}

  // Helper: lấy userId từ Bearer token
  private getUserId(authHeader: string): string {
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token không hợp lệ');
    }
    try {
      const payload = this.jwtService.verify(authHeader.slice(7));
      return payload.sub as string;
    } catch {
      throw new UnauthorizedException('Token hết hạn hoặc không hợp lệ');
    }
  }

  // GET /api/companies — chỉ trả về companies của user đang đăng nhập
  @Get()
  async findAll(@Headers('authorization') auth: string) {
    const userId = this.getUserId(auth);
    return this.companiesService.findAll(userId);
  }

  // GET /api/companies/:id
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserId(auth);
    const company = await this.companiesService.findById(id, userId);
    if (!company) throw new UnauthorizedException('Không tìm thấy công ty');
    return company;
  }

  // POST /api/companies
  @Post()
  async create(
    @Body() dto: CreateCompanyDto,
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserId(auth);
    return this.companiesService.create(dto, userId);
  }

  // PUT /api/companies/:id
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateCompanyDto>,
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserId(auth);
    return this.companiesService.update(id, dto, userId);
  }

  // DELETE /api/companies/:id
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserId(auth);
    return this.companiesService.delete(id, userId);
  }
}