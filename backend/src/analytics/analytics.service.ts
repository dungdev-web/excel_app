// src/analytics/analytics.service.ts
import { Injectable } from '@nestjs/common';
import { CompaniesService } from '../companies/companies.service';
import { ComparisonsService } from '../comparisons/comparisons.service';

@Injectable()
export class AnalyticsService {
  private viewCounts = new Map<string, number>();

  constructor(
    private companiesService: CompaniesService,
    private comparisonsService: ComparisonsService,
  ) {}

  trackCompanyView(companyId: string) {
    this.viewCounts.set(companyId, (this.viewCounts.get(companyId) || 0) + 1);
  }

  async getDashboardMetrics(userId: string) {
    const companies   = await this.companiesService.findAll(userId);
    const comparisons = await this.comparisonsService.findAll(userId); // ← filter by user

    if (companies.length === 0) {
      return {
        totalCompanies: 0, totalComparisons: comparisons.length,
        avgSalary: 0, topCompanies: [], industryDistribution: {}, industryAverages: [],
        timestamp: new Date(),
      };
    }

    const avgSalary = Math.round(
      companies.reduce((sum, c) => sum + c.salary, 0) / companies.length,
    );

    const topCompanies = companies
      .map((c) => ({ id: c.id, name: c.name, views: this.viewCounts.get(c.id) || 0, score: c.overallScore }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    const industryCount = companies.reduce((acc, c) => {
      acc[c.industry] = (acc[c.industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const industryScores = companies.reduce((acc, c) => {
      if (!acc[c.industry]) acc[c.industry] = { total: 0, count: 0 };
      acc[c.industry].total += c.overallScore;
      acc[c.industry].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const industryAverages = Object.entries(industryScores).map(([industry, data]) => ({
      industry,
      avgScore: Math.round((data.total / data.count) * 10) / 10,
      count: data.count,
    }));

    return {
      totalCompanies: companies.length,
      totalComparisons: comparisons.length,
      avgSalary,
      topCompanies,
      industryDistribution: industryCount,
      industryAverages,
      timestamp: new Date(),
    };
  }

  async getSalaryStats(userId: string) {
    const companies = await this.companiesService.findAll(userId); // ← filter by user

    if (companies.length === 0) {
      return { average: 0, median: 0, min: 0, max: 0, distribution: {} };
    }

    const salaries = companies.map((c) => c.salary).sort((a, b) => a - b);
    return {
      average:  Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length),
      median:   salaries[Math.floor(salaries.length / 2)],
      min:      salaries[0],
      max:      salaries[salaries.length - 1],
      distribution: {
        '< 3000':    companies.filter((c) => c.salary < 3000).length,
        '3000-5000': companies.filter((c) => c.salary >= 3000 && c.salary < 5000).length,
        '5000-7000': companies.filter((c) => c.salary >= 5000 && c.salary < 7000).length,
        '7000+':     companies.filter((c) => c.salary >= 7000).length,
      },
    };
  }

  async getCompanyHealthScore(companyId: string, userId: string) {
    const company = await this.companiesService.findById(companyId, userId); // ← check ownership
    if (!company) return null;

    const factors = {
      salary:         (company.salary / 10000) * 20,
      benefits:       company.benefits * 10,
      growth:         company.growth * 10,
      workLifeBalance:company.workLifeBalance * 10,
      overall:        (company.overallScore / 100) * 40,
    };

    return {
      companyId,
      companyName: company.name,
      healthScore: Math.round(Object.values(factors).reduce((a, b) => a + b, 0) * 10) / 10,
      factors,
    };
  }
}