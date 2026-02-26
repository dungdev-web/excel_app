// src/ai/ai.service.ts
import { Injectable } from '@nestjs/common';
import { CompaniesService } from '../companies/companies.service';

export interface UserPreferences {
  prioritizeSalary?: number;
  prioritizeBenefits?: number;
  prioritizeGrowth?: number;
  prioritizeWorkLifeBalance?: number;
  industryPreference?: string;
  minSalary?: number;
  maxSalary?: number;
}

export interface RecommendationResult {
  company: any;
  score: number;
  reason: string;
  matchPercentage: number;
}

@Injectable()
export class AiService {
  constructor(private companiesService: CompaniesService) {}

  async getRecommendations(preferences: UserPreferences, userId: string): Promise<RecommendationResult[]> {
    const companies = await this.companiesService.findAll(userId); // ← filter by user

    if (companies.length === 0) return [];

    const prefs = {
      prioritizeSalary: preferences.prioritizeSalary || 5,
      prioritizeBenefits: preferences.prioritizeBenefits || 5,
      prioritizeGrowth: preferences.prioritizeGrowth || 5,
      prioritizeWorkLifeBalance: preferences.prioritizeWorkLifeBalance || 5,
      industryPreference: preferences.industryPreference || null,
      minSalary: preferences.minSalary || 0,
      maxSalary: preferences.maxSalary || 999999,
    };

    const totalWeight =
      prefs.prioritizeSalary +
      prefs.prioritizeBenefits +
      prefs.prioritizeGrowth +
      prefs.prioritizeWorkLifeBalance;

    const weights = {
      salary:         (prefs.prioritizeSalary / totalWeight) * 100,
      benefits:       (prefs.prioritizeBenefits / totalWeight) * 100,
      growth:         (prefs.prioritizeGrowth / totalWeight) * 100,
      workLifeBalance:(prefs.prioritizeWorkLifeBalance / totalWeight) * 100,
    };

    return companies
      .filter((company) => {
        if (company.salary < prefs.minSalary || company.salary > prefs.maxSalary) return false;
        if (prefs.industryPreference && company.industry !== prefs.industryPreference) return false;
        return true;
      })
      .map((company) => {
        const salaryScore   = Math.min((company.salary / 10000) * 100, 100);
        const benefitsScore = company.benefits * 10;
        const growthScore   = company.growth * 10;
        const wlbScore      = company.workLifeBalance * 10;

        const score =
          (salaryScore   * weights.salary)         / 100 +
          (benefitsScore * weights.benefits)        / 100 +
          (growthScore   * weights.growth)          / 100 +
          (wlbScore      * weights.workLifeBalance) / 100;

        return {
          company,
          score: Math.round(score * 10) / 10,
          reason: this.generateReason(company, prefs, weights),
          matchPercentage: Math.round(score),
        };
      })
      .sort((a, b) => b.score - a.score);
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

  async getInsight(preferences: UserPreferences, userId: string): Promise<string> {
    const companies = await this.companiesService.findAll(userId); // ← filter by user

    if (companies.length === 0) return 'Không có công ty nào để phân tích';

    const avgSalary   = Math.round(companies.reduce((s, c) => s + c.salary, 0) / companies.length);
    const avgBenefits = Math.round(companies.reduce((s, c) => s + c.benefits, 0) / companies.length * 10) / 10;
    const avgGrowth   = Math.round(companies.reduce((s, c) => s + c.growth, 0) / companies.length * 10) / 10;

    let insight = `📊 Phân tích dựa trên ${companies.length} công ty của bạn:\n`;
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
}