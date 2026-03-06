// src/ai/ai.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CompaniesService } from '../companies/companies.service';

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

export interface UserPreferences {
  userId?: string;
  prioritizeSalary?: number;
  prioritizeBenefits?: number;
  prioritizeGrowth?: number;
  prioritizeWorkLifeBalance?: number;
  industryPreference?: string;
  minSalary?: number;
  maxSalary?: number;
}

export interface UserHistory {
  userId: string;
  companyId: string;
  rating: number; // 1=view, 3=compare, 5=saved
}

export interface RecommendationResult {
  company: any;
  score: number;
  reason: string;
  matchPercentage: number;
  // ML fields (có khi dùng ML)
  contentScore?: number;
  collaborativeScore?: number;
  usedML?: boolean;
}

// ─────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────

@Injectable()
export class AiService {
  private readonly ML_SERVICE_URL =
    process.env.ML_SERVICE_URL || 'http://localhost:8000';

  // In-memory history (TODO: chuyển sang DB sau)
  private interactionHistory: UserHistory[] = [];

  constructor(private companiesService: CompaniesService) {}

  // ─────────────────────────────────────────
  // PUBLIC: RECOMMEND
  // ─────────────────────────────────────────

  async getRecommendations(
    preferences: UserPreferences,
    userId: string,
  ): Promise<RecommendationResult[]> {
    const companies = await this.companiesService.findAll(userId);
    if (companies.length === 0) return [];

    // Thử gọi ML service trước
    const mlResults = await this.tryMLRecommend(preferences, userId, companies);
    if (mlResults) return mlResults;

    // Fallback: weighted scoring cũ
    return this.weightedScoringRecommend(preferences, companies);
  }

  // ─────────────────────────────────────────
  // ML HYBRID (gọi Python service)
  // ─────────────────────────────────────────

  private async tryMLRecommend(
    preferences: UserPreferences,
    userId: string,
    companies: any[],
  ): Promise<RecommendationResult[] | null> {
    try {
      const preference = {
        userId,
        prioritizeSalary:   preferences.prioritizeSalary   ?? 5,
        prioritizeBenefits: preferences.prioritizeBenefits ?? 5,
        prioritizeGrowth:   preferences.prioritizeGrowth   ?? 5,
        prioritizeWorkLife: preferences.prioritizeWorkLifeBalance ?? 5,
        minSalary: preferences.minSalary ?? 0,
        maxSalary: preferences.maxSalary ?? 999999,
      };

      const mlCompanies = companies.map((c) => ({
        id:               c.id,
        name:             c.name,
        salary:           c.salary,
        benefits:         c.benefits,
        growth:           c.growth,
        workLifeBalance:  c.workLifeBalance,
        industry:         c.industry,
      }));

      const response = await fetch(`${this.ML_SERVICE_URL}/recommend`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          preference,
          companies: mlCompanies,
          history:   this.mergeHistory(
            await this.buildHistoryFromData(),
            this.interactionHistory,
          ),
        }),
        signal: AbortSignal.timeout(3000), // timeout 3s, tự fallback
      });

      if (!response.ok) return null;

      const mlResults: any[] = await response.json();

      // Map ML result về format cũ để controller không cần đổi gì
      return mlResults.map((r) => {
        const company = companies.find((c) => c.id === r.companyId);
        return {
          company,
          score:               Math.round(r.score * 100) / 10,
          reason:              r.reason,
          matchPercentage:     Math.round(r.score * 100),
          contentScore:        r.contentScore,
          collaborativeScore:  r.collaborativeScore,
          usedML:              true,
        };
      });
    } catch {
      // ML service không chạy → fallback, không throw lỗi
      return null;
    }
  }

  // ─────────────────────────────────────────
  // FALLBACK: WEIGHTED SCORING (logic cũ)
  // ─────────────────────────────────────────

  private weightedScoringRecommend(
    preferences: UserPreferences,
    companies: any[],
  ): RecommendationResult[] {
    const prefs = {
      prioritizeSalary:         preferences.prioritizeSalary         ?? 5,
      prioritizeBenefits:       preferences.prioritizeBenefits       ?? 5,
      prioritizeGrowth:         preferences.prioritizeGrowth         ?? 5,
      prioritizeWorkLifeBalance:preferences.prioritizeWorkLifeBalance ?? 5,
      industryPreference:       preferences.industryPreference        ?? null,
      minSalary:                preferences.minSalary                ?? 0,
      maxSalary:                preferences.maxSalary                ?? 999999,
    };

    const totalWeight =
      prefs.prioritizeSalary +
      prefs.prioritizeBenefits +
      prefs.prioritizeGrowth +
      prefs.prioritizeWorkLifeBalance;

    const weights = {
      salary:         (prefs.prioritizeSalary          / totalWeight) * 100,
      benefits:       (prefs.prioritizeBenefits        / totalWeight) * 100,
      growth:         (prefs.prioritizeGrowth          / totalWeight) * 100,
      workLifeBalance:(prefs.prioritizeWorkLifeBalance / totalWeight) * 100,
    };

    return companies
      .filter((c) => {
        if (c.salary < prefs.minSalary || c.salary > prefs.maxSalary) return false;
        if (prefs.industryPreference && c.industry !== prefs.industryPreference) return false;
        return true;
      })
      .map((company) => {
        const salaryScore   = Math.min((company.salary / 10000) * 100, 100);
        const benefitsScore = company.benefits        * 10;
        const growthScore   = company.growth          * 10;
        const wlbScore      = company.workLifeBalance * 10;

        const score =
          (salaryScore   * weights.salary)         / 100 +
          (benefitsScore * weights.benefits)        / 100 +
          (growthScore   * weights.growth)          / 100 +
          (wlbScore      * weights.workLifeBalance) / 100;

        return {
          company,
          score:           Math.round(score * 10) / 10,
          reason:          this.generateReason(company, prefs, weights),
          matchPercentage: Math.round(score),
          usedML:          false,
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  // ─────────────────────────────────────────
  // TRACK INTERACTION (feed data cho ML)
  // ─────────────────────────────────────────

  async trackInteraction(
    userId: string,
    companyId: string,
    action: 'view' | 'compare' | 'save',
  ): Promise<void> {
    const ratingMap = { view: 1, compare: 3, save: 5 };
    const existing = this.interactionHistory.find(
      (h) => h.userId === userId && h.companyId === companyId,
    );
    if (existing) {
      // Giữ rating cao nhất
      existing.rating = Math.max(existing.rating, ratingMap[action]);
    } else {
      this.interactionHistory.push({ userId, companyId, rating: ratingMap[action] });
    }
  }

  // ─────────────────────────────────────────
  // GIỮ NGUYÊN CÁC METHOD CŨ
  // ─────────────────────────────────────────

  async getInsight(preferences: UserPreferences, userId: string): Promise<string> {
    const companies = await this.companiesService.findAll(userId);
    if (companies.length === 0) return 'Không có công ty nào để phân tích';

    const avgSalary   = Math.round(companies.reduce((s, c) => s + c.salary,   0) / companies.length);
    const avgBenefits = Math.round(companies.reduce((s, c) => s + c.benefits, 0) / companies.length * 10) / 10;
    const avgGrowth   = Math.round(companies.reduce((s, c) => s + c.growth,   0) / companies.length * 10) / 10;

    let insight = `Phân tích dựa trên ${companies.length} công ty của bạn:\n`;
    insight += `- Lương trung bình: $${avgSalary}/tháng\n`;
    insight += `- Phúc lợi TB: ${avgBenefits}/10\n`;
    insight += `- Phát triển TB: ${avgGrowth}/10\n`;

    if ((preferences?.prioritizeSalary ?? 5) > 7)
      insight += `\n💡 Bạn ưu tiên lương: Công ty với lương cao là lựa chọn tốt`;
    if ((preferences?.prioritizeGrowth ?? 5) > 7 && companies.some((c) => c.growth >= 8))
      insight += `\n💡 Bạn ưu tiên phát triển: Công ty IT/Tech thường có cơ hội tốt`;

    return insight;
  }

  async getIdeaProfileComparison(preferences: UserPreferences): Promise<string> {
    return `
🎯 Hồ Sơ Lý Tưởng Của Bạn:
- Mức lương tối thiểu: $${preferences.minSalary || 'không giới hạn'}
- Ưu tiên lương: ${preferences.prioritizeSalary || 5}/10
- Ưu tiên phúc lợi: ${preferences.prioritizeBenefits || 5}/10
- Ưu tiên phát triển: ${preferences.prioritizeGrowth || 5}/10
- Ưu tiên cân bằng: ${preferences.prioritizeWorkLifeBalance || 5}/10
- Ngành ưu thích: ${preferences.industryPreference || 'Tất cả'}

✅ Tìm công ty phù hợp với hồ sơ này sẽ tối ưu hóa sự hài lòng của bạn!
    `;
  }

  private generateReason(company: any, prefs: any, weights: any): string {
    const reasons: string[] = [];

    if (weights.salary > 25 && company.salary >= prefs.minSalary)
      reasons.push(`💰 Lương cao: $${company.salary}/tháng`);
    if (weights.benefits > 25 && company.benefits >= 7)
      reasons.push(`🎁 Phúc lợi tốt: ${company.benefits}/10`);
    if (weights.growth > 25 && company.growth >= 7)
      reasons.push(`📈 Phát triển tốt: ${company.growth}/10`);
    if (weights.workLifeBalance > 25 && company.workLifeBalance >= 7)
      reasons.push(`⚖️ Cân bằng tốt: ${company.workLifeBalance}/10`);

    if (reasons.length === 0) {
      const best = Math.max(company.benefits, company.growth, company.workLifeBalance);
      if (company.benefits === best)       reasons.push(`✅ Phúc lợi không tệ: ${company.benefits}/10`);
      else if (company.growth === best)    reasons.push(`✅ Cơ hội phát triển: ${company.growth}/10`);
      else                                 reasons.push(`✅ Cân bằng khá: ${company.workLifeBalance}/10`);
    }

    return reasons.join(' • ');
  }

  // Chuyển overallScore từ Excel thành rating 1–5 cho Collaborative Filtering
  private async buildHistoryFromData(): Promise<UserHistory[]> {
    const allCompanies = await this.companiesService.findAll(); // không truyền userId → lấy tất cả
    return allCompanies
      .filter((c: any) => c.userId && c.id && c.overallScore != null)
      .map((c: any) => ({
        userId:    c.userId,
        companyId: c.id,
        // overallScore 0–100 → rating 1–5
        rating: Math.max(1, Math.min(5, Math.round((c.overallScore / 100) * 5))),
      }));
  }

  // Merge history từ Excel + in-memory, giữ rating cao nhất nếu trùng
  private mergeHistory(base: UserHistory[], extra: UserHistory[]): UserHistory[] {
    const map = new Map<string, UserHistory>();
    for (const h of [...base, ...extra]) {
      const key = `${h.userId}__${h.companyId}`;
      const existing = map.get(key);
      if (!existing || h.rating > existing.rating) {
        map.set(key, h);
      }
    }
    return Array.from(map.values());
  }
}