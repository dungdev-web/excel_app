// src/analytics/analytics.controller.ts
import { Controller, Get, Post, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AnalyticsService } from './analytics.service';

@Controller('api/analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly jwtService: JwtService,
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

  @Get('dashboard')
  async getDashboard(@Headers('authorization') auth: string) {
    const userId = this.getUserId(auth);
    return this.analyticsService.getDashboardMetrics(userId);
  }

  @Get('salary-stats')
  async getSalaryStats(@Headers('authorization') auth: string) {
    const userId = this.getUserId(auth);
    return this.analyticsService.getSalaryStats(userId);
  }

  @Get('company-health/:companyId')
  async getCompanyHealth(
    @Param('companyId') companyId: string,
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserId(auth);
    return this.analyticsService.getCompanyHealthScore(companyId, userId);
  }

  // ← Endpoint mới: track view khi user xem công ty
  @Post('track-view/:companyId')
  async trackView(
    @Param('companyId') companyId: string,
    @Headers('authorization') auth: string,
  ) {
    this.getUserId(auth); // verify token
    await this.analyticsService.trackCompanyView(companyId);
    return { success: true };
  }
}