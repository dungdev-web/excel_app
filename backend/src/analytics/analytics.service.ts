// src/analytics/analytics.service.ts
import { Injectable } from '@nestjs/common';
import { CompaniesService } from '../companies/companies.service';
import { ComparisonsService } from '../comparisons/comparisons.service';

@Injectable()
export class AnalyticsService {
  // In-memory cache để tránh đọc/ghi Excel liên tục
  // Sync với Excel mỗi FLUSH_INTERVAL ms
  private viewCache = new Map<string, number>();
  private dirtyKeys = new Set<string>(); // keys cần flush
  private readonly FLUSH_INTERVAL = 10_000; // 10 giây

  constructor(
    private companiesService: CompaniesService,
    private comparisonsService: ComparisonsService,
  ) {
    this.loadViewsFromExcel();
    // Auto flush cache → Excel mỗi 10s
    setInterval(() => this.flushViews(), this.FLUSH_INTERVAL);
  }

  // ─────────────────────────────────────────
  // VIEW TRACKING
  // ─────────────────────────────────────────

  async trackCompanyView(companyId: string) {
    const current = this.viewCache.get(companyId) || 0;
    this.viewCache.set(companyId, current + 1);
    this.dirtyKeys.add(companyId); // đánh dấu cần flush
  }

  // Load views từ Excel khi khởi động
  private async loadViewsFromExcel() {
    try {
      const all = await this.companiesService.findAll();
      for (const c of all as any[]) {
        if (c.id && c.viewCount != null) {
          this.viewCache.set(c.id, c.viewCount);
        }
      }
    } catch {
      // File chưa có viewCount column → bỏ qua, bắt đầu từ 0
    }
  }

  // Flush dirty cache → Excel
  private async flushViews() {
    if (this.dirtyKeys.size === 0) return;
    const keys = Array.from(this.dirtyKeys);
    this.dirtyKeys.clear();

    for (const id of keys) {
      const count = this.viewCache.get(id) || 0;
      try {
        await this.companiesService.updateViewCount(id, count);
      } catch {
        // Company đã bị xóa → bỏ qua
        this.viewCache.delete(id);
      }
    }
  }

  // Force flush ngay (dùng khi cần)
  async forceFlush() {
    this.dirtyKeys = new Set(this.viewCache.keys());
    await this.flushViews();
  }

  // ─────────────────────────────────────────
  // DASHBOARD
  // ─────────────────────────────────────────

  async getDashboardMetrics(userId: string) {
    const companies   = await this.companiesService.findAll(userId);
    const comparisons = await this.comparisonsService.findAll(userId);

    if (companies.length === 0) {
      return {
        totalCompanies: 0, totalComparisons: comparisons.length,
        avgSalary: 0, topCompanies: [], industryDistribution: {},
        industryAverages: [], timestamp: new Date(),
      };
    }

    const avgSalary = Math.round(
      companies.reduce((sum, c) => sum + c.salary, 0) / companies.length,
    );

    const topCompanies = companies
      .map((c) => ({
        id:    c.id,
        name:  c.name,
        views: this.viewCache.get(c.id) || 0,
        score: c.overallScore,
      }))
      .sort((a, b) => b.views - a.views || b.score - a.score) // tie-break bằng score
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
      totalCompanies:      companies.length,
      totalComparisons:    comparisons.length,
      avgSalary,
      topCompanies,
      industryDistribution: industryCount,
      industryAverages,
      timestamp:           new Date(),
    };
  }

  async getSalaryStats(userId: string) {
    const companies = await this.companiesService.findAll(userId);
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
    const company = await this.companiesService.findById(companyId, userId);
    if (!company) return null;

    const factors = {
      salary:          (company.salary / 10000) * 20,
      benefits:        company.benefits * 10,
      growth:          company.growth * 10,
      workLifeBalance: company.workLifeBalance * 10,
      overall:         (company.overallScore / 100) * 40,
    };

    return {
      companyId,
      companyName: company.name,
      healthScore: Math.round(Object.values(factors).reduce((a, b) => a + b, 0) * 10) / 10,
      factors,
    };
  }
}