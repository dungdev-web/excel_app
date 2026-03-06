// src/ai/ai.controller.ts
import {
  Controller,
  Post,
  Body,
  Param,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AiService } from './ai.service';
import type { UserPreferences } from './ai.service';
import { CompaniesService } from '../companies/companies.service';

class TrackDto {
  companyId: string;
  action: 'view' | 'compare' | 'save';
}

@Controller('api/ai')
export class AiController {
  constructor(
    private aiService: AiService,
    private companiesService: CompaniesService,
    private jwtService: JwtService,
  ) {}

  // ─────────────────────────────────────────
  // AUTH HELPER
  // ─────────────────────────────────────────

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

  // ─────────────────────────────────────────
  // ENDPOINTS CŨ (giữ nguyên, không đổi gì)
  // ─────────────────────────────────────────

  @Post('/recommend')
  async getRecommendations(
    @Body() preferences: UserPreferences,
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserId(auth);
    const recommendations = await this.aiService.getRecommendations(
      preferences,
      userId,
    );
    return {
      success: true,
      count: recommendations.length,
      recommendations,
      usedML: recommendations[0]?.usedML ?? false,
      message: `Tìm thấy ${recommendations.length} công ty phù hợp với tiêu chí của bạn`,
    };
  }

  @Post('/top3')
  async getTop3Recommendations(
    @Body() preferences: UserPreferences,
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserId(auth);
    const recommendations = await this.aiService.getRecommendations(
      preferences,
      userId,
    );
    return {
      success: true,
      count: Math.min(recommendations.length, 3),
      recommendations: recommendations.slice(0, 3),
      usedML: recommendations[0]?.usedML ?? false,
      message: 'Top 3 công ty phù hợp nhất với bạn',
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

  @Post('/match/:companyId')
  async getCompanyMatch(
    @Body() preferences: UserPreferences,
    @Param('companyId') companyId: string,
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserId(auth);
    const company = await this.companiesService.findById(companyId, userId);
    if (!company) return { success: false, message: 'Company not found' };

    const recommendations = await this.aiService.getRecommendations(
      preferences,
      userId,
    );
    const match = recommendations.find((r) => r.company.id === companyId);

    if (match) {
      return {
        success: true,
        company,
        matchPercentage: match.matchPercentage,
        score: match.score,
        reason: match.reason,
        usedML: match.usedML ?? false,
        message: `Độ phù hợp: ${match.matchPercentage}%`,
      };
    }

    return {
      success: false,
      message: 'Công ty không phù hợp với tiêu chí của bạn',
    };
  }

  // ─────────────────────────────────────────
  // ENDPOINT MỚI: track hành vi user cho ML
  // ─────────────────────────────────────────

  @Post('/track')
  async trackInteraction(
    @Body() dto: TrackDto,
    @Headers('authorization') auth: string,
  ) {
    const userId = this.getUserId(auth);
    await this.aiService.trackInteraction(userId, dto.companyId, dto.action);
    return { success: true };
  }
}
