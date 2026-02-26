// src/ai/ai.controller.ts
import { Controller, Post, Body, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AiService } from './ai.service';
import { CompaniesService } from '../companies/companies.service';

interface UserPreferences {
  prioritizeSalary?: number;
  prioritizeBenefits?: number;
  prioritizeGrowth?: number;
  prioritizeWorkLifeBalance?: number;
  industryPreference?: string;
  minSalary?: number;
  maxSalary?: number;
}

@Controller('api/ai')
export class AiController {
  constructor(
    private aiService: AiService,
    private companiesService: CompaniesService,
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

  @Post('/recommend')
  async getRecommendations(
    @Body() preferences: UserPreferences,
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserId(auth);
    const recommendations = await this.aiService.getRecommendations(preferences, userId);
    return {
      success: true,
      count: recommendations.length,
      recommendations,
      message: `Tìm thấy ${recommendations.length} công ty phù hợp với tiêu chí của bạn`,
    };
  }

  @Post('/insight')
  async getInsight(
    @Body() preferences: UserPreferences,
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserId(auth);
    const insight = await this.aiService.getInsight(preferences, userId);
    return { success: true, insight };
  }

  @Post('/profile')
  async getIdealProfile(@Body() preferences: UserPreferences) {
    const profile = await this.aiService.getIdeaProfileComparison(preferences);
    return { success: true, profile };
  }

  @Post('/top3')
  async getTop3Recommendations(
    @Body() preferences: UserPreferences,
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserId(auth);
    const recommendations = await this.aiService.getRecommendations(preferences, userId);
    return {
      success: true,
      count: Math.min(recommendations.length, 3),
      recommendations: recommendations.slice(0, 3),
      message: 'Top 3 công ty phù hợp nhất với bạn',
    };
  }

  @Post('/match/:companyId')
  async getCompanyMatch(
    @Body() preferences: UserPreferences,
    @Param('companyId') companyId: string,
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserId(auth);
    const company = await this.companiesService.findById(companyId, userId); // ← check ownership
    if (!company) return { success: false, message: 'Company not found' };

    const recommendations = await this.aiService.getRecommendations(preferences, userId);
    const match = recommendations.find((r) => r.company.id === companyId);

    if (match) {
      return {
        success: true,
        company,
        matchPercentage: match.matchPercentage,
        score: match.score,
        reason: match.reason,
        message: `Độ phù hợp: ${match.matchPercentage}%`,
      };
    }

    return { success: false, message: 'Công ty không phù hợp với tiêu chí của bạn' };
  }
}