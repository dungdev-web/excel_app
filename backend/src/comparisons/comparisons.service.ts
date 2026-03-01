// src/comparisons/comparisons.service.ts
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import { CompaniesService } from '../companies/companies.service';
import {
  ComparisonDto,
  ComparisonResponseDto,
} from '../companies/dto/company.dto';
import { v4 as uuidv4 } from 'uuid';

export interface ComparisonRecord {
  id: string;
  company1Id: string;
  company1Name: string;
  company2Id: string;
  company2Name: string;
  company1Industry: string;
  company2Industry: string;
  score1: number;
  score2: number;
  winner: string;
  recommendation: string;
  createdAt: Date;
  userId: string; // ← thêm mới
}

const INDUSTRY_BENCHMARK = {
  IT: {
    avgSalary: 5500,
    avgBenefits: 8,
    avgGrowth: 8.5,
    avgWLB: 6,
    avgScore: 7.5,
  },
  Finance: {
    avgSalary: 6500,
    avgBenefits: 8.5,
    avgGrowth: 7,
    avgWLB: 5.5,
    avgScore: 7,
  },
  HR: {
    avgSalary: 4000,
    avgBenefits: 7.5,
    avgGrowth: 6.5,
    avgWLB: 8,
    avgScore: 7,
  },
  Sales: {
    avgSalary: 4500,
    avgBenefits: 6,
    avgGrowth: 8.5,
    avgWLB: 5,
    avgScore: 6.5,
  },
  Marketing: {
    avgSalary: 4800,
    avgBenefits: 7,
    avgGrowth: 8,
    avgWLB: 6.5,
    avgScore: 7,
  },
  Engineering: {
    avgSalary: 5800,
    avgBenefits: 8.5,
    avgGrowth: 8.5,
    avgWLB: 6.5,
    avgScore: 7.8,
  },
};

@Injectable()
export class ComparisonsService {
  private filePath = path.join(process.cwd(), 'comparisons.xlsx');
  private comparisons: ComparisonRecord[] = [];

  constructor(private companiesService: CompaniesService) {
    this.loadComparisons();
  }

  calculateComparisonScore(company: any, benchmark: any) {
    const salaryRatio = company.salary / benchmark.avgSalary;
    let benchmarkBonus = 0;
    if (salaryRatio > 1.2) benchmarkBonus = 10;
    else if (salaryRatio > 1.1) benchmarkBonus = 8;
    else if (salaryRatio > 1.0) benchmarkBonus = 5;
    else if (salaryRatio > 0.9) benchmarkBonus = 2;
    else benchmarkBonus = -3;

    return {
      score:
        Math.round((company.overallScore + benchmarkBonus * 0.1) * 10) / 10,
      benchmarkBonus,
    };
  }

  generateRecommendation(
    company1: any,
    company2: any,
    score1: number,
    score2: number,
  ): string {
    const diff = Math.abs(score1 - score2);
    if (diff < 2) {
      return `Cả hai công ty đều tốt! Lựa chọn dựa vào:\n- ${company1.name}: Lương ${company1.salary}$ / Ngành ${company1.industry}\n- ${company2.name}: Lương ${company2.salary}$ / Ngành ${company2.industry}`;
    } else if (score1 > score2) {
      return `✅ KHUYẾN NGHỊ: ${company1.name}\nĐiểm cao hơn (${score1} vs ${score2}).\nLương: ${company1.salary}$ vs ${company2.salary}$`;
    } else {
      return `✅ KHUYẾN NGHỊ: ${company2.name}\nĐiểm cao hơn (${score2} vs ${score1}).\nLương: ${company2.salary}$ vs ${company1.salary}$`;
    }
  }

  // So sánh 2 công ty — cần userId để verify ownership và lưu vào record
  async compare(
    comparisonDto: ComparisonDto,
    userId: string,
  ): Promise<ComparisonResponseDto> {
    const company1 = await this.companiesService.findById(
      comparisonDto.company1Id,
      userId,
    );
    const company2 = await this.companiesService.findById(
      comparisonDto.company2Id,
      userId,
    );

    if (!company1 || !company2)
      throw new Error('Company not found or access denied');

    const benchmark1 =
      INDUSTRY_BENCHMARK[company1.industry.toLocaleUpperCase()] || INDUSTRY_BENCHMARK.IT;
    const benchmark2 =
      INDUSTRY_BENCHMARK[company2.industry.toLocaleUpperCase()] || INDUSTRY_BENCHMARK.IT;
    if (benchmark1 !== benchmark2) {
      throw new Error(
        `Không thể so sánh 2 công ty khác ngành (${company1.industry} vs ${company2.industry}). Vui lòng chọn 2 công ty cùng ngành.`,
      );
    }
    const { score: score1 } = this.calculateComparisonScore(
      company1,
      benchmark1,
    );
    const { score: score2 } = this.calculateComparisonScore(
      company2,
      benchmark2,
    );

    const winner =
      score1 > score2 ? 'company1' : score2 > score1 ? 'company2' : 'tie';
    const recommendation = this.generateRecommendation(
      company1,
      company2,
      score1,
      score2,
    );

    const record: ComparisonRecord = {
      id: uuidv4(),
      company1Id: company1.id,
      company1Name: company1.name,
      company2Id: company2.id,
      company2Name: company2.name,
      company1Industry: company1.industry,
      company2Industry: company2.industry,
      score1,
      score2,
      winner,
      recommendation,
      createdAt: new Date(),
      userId, // ← lưu userId
    };

    this.comparisons.push(record);
    await this.saveToExcel();

    return {
      id: record.id,
      company1,
      company2,
      score1,
      score2,
      winner,
      recommendation,
      industryBenchmark: {
        industry: company1.industry.toLocaleUpperCase(),
        avgSalary: benchmark1.avgSalary,
        avgBenefits: benchmark1.avgBenefits,
        avgGrowth: benchmark1.avgGrowth,
        avgWLB: benchmark1.avgWLB,
      },
      createdAt: record.createdAt,
    };
  }

  // Lấy tất cả — nếu có userId thì filter
  async findAll(userId?: string) {
    await this.loadComparisons();
    if (userId) return this.comparisons.filter((c) => c.userId === userId);
    return this.comparisons;
  }

  private async loadComparisons() {
    if (!fs.existsSync(this.filePath)) {
      await this.createNewFile();
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(this.filePath);
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      this.comparisons = [];
      return;
    }

    this.comparisons = [];
    worksheet.eachRow((row: any, rowNumber: number) => {
      if (rowNumber > 1) {
        const record: ComparisonRecord = {
          id: row.getCell(1).value,
          company1Id: row.getCell(2).value,
          company1Name: row.getCell(3).value,
          company2Id: row.getCell(4).value,
          company2Name: row.getCell(5).value,
          company1Industry: row.getCell(6).value,
          company2Industry: row.getCell(7).value,
          score1: row.getCell(8).value,
          score2: row.getCell(9).value,
          winner: row.getCell(10).value,
          recommendation: row.getCell(11).value,
          createdAt: row.getCell(12).value,
          userId: row.getCell(13).value ?? '', // ← cột mới
        };
        if (record.id) this.comparisons.push(record);
      }
    });
  }

  private async saveToExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Comparisons');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 40 },
      { header: 'Company 1 ID', key: 'company1Id', width: 40 },
      { header: 'Company 1 Name', key: 'company1Name', width: 25 },
      { header: 'Company 2 ID', key: 'company2Id', width: 40 },
      { header: 'Company 2 Name', key: 'company2Name', width: 25 },
      { header: 'Industry 1', key: 'company1Industry', width: 15 },
      { header: 'Industry 2', key: 'company2Industry', width: 15 },
      { header: 'Score 1', key: 'score1', width: 12 },
      { header: 'Score 2', key: 'score2', width: 12 },
      { header: 'Winner', key: 'winner', width: 12 },
      { header: 'Recommendation', key: 'recommendation', width: 60 },
      { header: 'Created At', key: 'createdAt', width: 20 },
      { header: 'User ID', key: 'userId', width: 38 }, // ← cột mới
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' },
    };
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    this.comparisons.forEach((c) => worksheet.addRow(c));
    await workbook.xlsx.writeFile(this.filePath);
  }

  private async createNewFile() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Comparisons');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 40 },
      { header: 'Company 1 ID', key: 'company1Id', width: 40 },
      { header: 'Company 1 Name', key: 'company1Name', width: 25 },
      { header: 'Company 2 ID', key: 'company2Id', width: 40 },
      { header: 'Company 2 Name', key: 'company2Name', width: 25 },
      { header: 'Industry 1', key: 'company1Industry', width: 15 },
      { header: 'Industry 2', key: 'company2Industry', width: 15 },
      { header: 'Score 1', key: 'score1', width: 12 },
      { header: 'Score 2', key: 'score2', width: 12 },
      { header: 'Winner', key: 'winner', width: 12 },
      { header: 'Recommendation', key: 'recommendation', width: 60 },
      { header: 'Created At', key: 'createdAt', width: 20 },
      { header: 'User ID', key: 'userId', width: 38 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' },
    };
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    await workbook.xlsx.writeFile(this.filePath);
  }
}
