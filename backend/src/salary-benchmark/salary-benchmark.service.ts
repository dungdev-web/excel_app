// src/salary-benchmark/salary-benchmark.service.ts
import { Injectable } from '@nestjs/common';

interface BenchmarkDetails {
  role: string;
  industry: string;
  minSalary: number;
  avgSalary: number;
  maxSalary: number;
  junior_salary: number;
  mid_salary: number;
  senior_salary: number;
}

export interface SalaryComparisonResult {
  salary: number;
  avgSalary: number;
  difference: number;
  percentageDiff: number;
  analysis: string;
  recommendation: string;
  benchmarkDetails: BenchmarkDetails;
}

@Injectable()
export class SalaryBenchmarkService {
  private mockBenchmarkData: Record<
    string,
    {
      role: string;
      locations: Record<string, { min: number; avg: number; max: number }>;
      levels: { junior: number; mid: number; senior: number };
    }
  > = {
    IT: {
      role: 'Software Engineer',
      locations: {
        Vietnam: { min: 3000, avg: 4500, max: 6000 },
        Singapore: { min: 5000, avg: 7000, max: 9000 },
        US: { min: 80000, avg: 120000, max: 150000 },
      },
      levels: { junior: 3000, mid: 4500, senior: 6000 },
    },
    Finance: {
      role: 'Financial Analyst',
      locations: {
        Vietnam: { min: 3500, avg: 5000, max: 7000 },
        Singapore: { min: 6000, avg: 8000, max: 10000 },
        US: { min: 70000, avg: 110000, max: 140000 },
      },
      levels: { junior: 3500, mid: 5000, senior: 7000 },
    },
    HR: {
      role: 'HR Manager',
      locations: {
        Vietnam: { min: 2500, avg: 3800, max: 5500 },
        Singapore: { min: 4500, avg: 6000, max: 8000 },
        US: { min: 60000, avg: 95000, max: 125000 },
      },
      levels: { junior: 2500, mid: 3800, senior: 5500 },
    },
    Sales: {
      role: 'Sales Executive',
      locations: {
        Vietnam: { min: 2000, avg: 3500, max: 5000 },
        Singapore: { min: 4000, avg: 5500, max: 7500 },
        US: { min: 50000, avg: 80000, max: 120000 },
      },
      levels: { junior: 2000, mid: 3500, senior: 5000 },
    },
    Engineering: {
      role: 'Engineer',
      locations: {
        Vietnam: { min: 2800, avg: 4200, max: 6000 },
        Singapore: { min: 5000, avg: 7000, max: 9000 },
        US: { min: 75000, avg: 110000, max: 145000 },
      },
      levels: { junior: 2800, mid: 4200, senior: 6000 },
    },
  };

  async getBenchmark(industry: string, location: string = 'Vietnam') {
    const data = this.mockBenchmarkData[industry] ?? this.mockBenchmarkData.IT;
    const loc = data.locations[location] ?? data.locations['Vietnam'];

    return {
      industry,
      location,
      role: data.role,
      minSalary: loc.min,
      avgSalary: loc.avg,
      maxSalary: loc.max,
      junior_salary: data.levels.junior,
      mid_salary: data.levels.mid,
      senior_salary: data.levels.senior,
      currency: location === 'US' ? 'USD (annual)' : 'USD (monthly)',
      dataSource: 'Market Research',
      lastUpdated: new Date(),
    };
  }

  async compareSalary(
    salary: number,
    industry: string,
    location: string = 'Vietnam',
  ): Promise<SalaryComparisonResult> {
    const benchmark = await this.getBenchmark(industry, location);

    const difference = salary - benchmark.avgSalary;
    const percentageDiff = (difference / benchmark.avgSalary) * 100;

    let analysis: string;
    if (percentageDiff > 20) {
      analysis = `✅ Lương cao hơn benchmark ${percentageDiff.toFixed(1)}%`;
    } else if (percentageDiff > 0) {
      analysis = `✅ Lương cao hơn benchmark ${percentageDiff.toFixed(1)}%`;
    } else if (percentageDiff > -20) {
      analysis = `⚠️ Lương thấp hơn benchmark ${Math.abs(percentageDiff).toFixed(1)}%`;
    } else {
      analysis = `❌ Lương thấp hơn benchmark ${Math.abs(percentageDiff).toFixed(1)}%`;
    }

    return {
      salary,
      avgSalary: benchmark.avgSalary,
      difference,
      percentageDiff,
      analysis,
      recommendation: this.getRecommendation(percentageDiff),
      benchmarkDetails: {
        role: benchmark.role,
        industry: benchmark.industry,
        minSalary: benchmark.minSalary,
        avgSalary: benchmark.avgSalary,
        maxSalary: benchmark.maxSalary,
        junior_salary: benchmark.junior_salary,
        mid_salary: benchmark.mid_salary,
        senior_salary: benchmark.senior_salary,
      },
    };
  }

  private getRecommendation(percentageDiff: number): string {
    if (percentageDiff > 20) return '✅ Offer rất tốt - Chấp nhận ngay!';
    if (percentageDiff > 0) return '✅ Offer tốt - Chấp nhận';
    if (percentageDiff > -20) return '⚠️ Offer cân bằng - Xem xét kỹ';
    return '❌ Offer thấp - Đàm phán lại';
  }

  async getSalaryTrend(industry: string) {
    return {
      industry,
      trend: [
        { year: 2021, avgSalary: 4000 },
        { year: 2022, avgSalary: 4300 },
        { year: 2023, avgSalary: 4800 },
        { year: 2024, avgSalary: 5200 },
        { year: 2025, avgSalary: 5500 },
      ],
      growth: 37.5,
      projection2026: 5800,
    };
  }
}