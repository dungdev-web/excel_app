// src/comparisons/comparisons.service.ts
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import { CompaniesService } from '../companies/companies.service';
import { ComparisonDto, ComparisonResponseDto } from '../companies/dto/company.dto';
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
  userId: string;
}

// Benchmark theo ngành + cấp bậc
// Nguồn tham khảo: ITviec, VietnamWorks, TopDev salary report Vietnam 2024
const INDUSTRY_BENCHMARK: Record<string, Record<string, {
  avgSalary: number; avgBenefits: number; avgGrowth: number; avgWLB: number; avgScore: number;
}>> = {
  IT: {
    INTERN:      { avgSalary: 300,  avgBenefits: 5,   avgGrowth: 7,   avgWLB: 8,   avgScore: 5.5 },
    FRESHER:     { avgSalary: 800,  avgBenefits: 6,   avgGrowth: 7.5, avgWLB: 7.5, avgScore: 6   },
    JUNIOR:      { avgSalary: 1500, avgBenefits: 7,   avgGrowth: 8,   avgWLB: 7,   avgScore: 6.8 },
    MIDDLE:      { avgSalary: 2500, avgBenefits: 7.5, avgGrowth: 8,   avgWLB: 6.5, avgScore: 7.2 },
    SENIOR:      { avgSalary: 4000, avgBenefits: 8,   avgGrowth: 8.5, avgWLB: 6,   avgScore: 7.8 },
    LEAD:        { avgSalary: 5500, avgBenefits: 8.5, avgGrowth: 8,   avgWLB: 5.5, avgScore: 8   },
    PRINCIPAL:   { avgSalary: 7000, avgBenefits: 9,   avgGrowth: 7.5, avgWLB: 5,   avgScore: 8.2 },
    MANAGER:     { avgSalary: 6000, avgBenefits: 8.5, avgGrowth: 7,   avgWLB: 5,   avgScore: 7.8 },
    DIRECTOR:    { avgSalary: 9000, avgBenefits: 9,   avgGrowth: 7,   avgWLB: 4.5, avgScore: 8.5 },
  },
  FINANCE: {
    INTERN:      { avgSalary: 250,  avgBenefits: 5,   avgGrowth: 6,   avgWLB: 7,   avgScore: 5   },
    FRESHER:     { avgSalary: 700,  avgBenefits: 6,   avgGrowth: 6.5, avgWLB: 6.5, avgScore: 5.8 },
    JUNIOR:      { avgSalary: 1200, avgBenefits: 7,   avgGrowth: 7,   avgWLB: 6,   avgScore: 6.5 },
    MIDDLE:      { avgSalary: 2200, avgBenefits: 7.5, avgGrowth: 7,   avgWLB: 5.5, avgScore: 7   },
    SENIOR:      { avgSalary: 3800, avgBenefits: 8.5, avgGrowth: 7,   avgWLB: 5,   avgScore: 7.5 },
    LEAD:        { avgSalary: 5000, avgBenefits: 8.5, avgGrowth: 6.5, avgWLB: 4.5, avgScore: 7.5 },
    MANAGER:     { avgSalary: 5500, avgBenefits: 9,   avgGrowth: 6.5, avgWLB: 4.5, avgScore: 7.8 },
    DIRECTOR:    { avgSalary: 8000, avgBenefits: 9,   avgGrowth: 6,   avgWLB: 4,   avgScore: 8   },
  },
  HR: {
    INTERN:      { avgSalary: 200,  avgBenefits: 5,   avgGrowth: 6,   avgWLB: 8,   avgScore: 5   },
    FRESHER:     { avgSalary: 600,  avgBenefits: 6.5, avgGrowth: 6.5, avgWLB: 8,   avgScore: 5.8 },
    JUNIOR:      { avgSalary: 1000, avgBenefits: 7,   avgGrowth: 7,   avgWLB: 7.5, avgScore: 6.3 },
    MIDDLE:      { avgSalary: 1800, avgBenefits: 7.5, avgGrowth: 7,   avgWLB: 7,   avgScore: 6.8 },
    SENIOR:      { avgSalary: 2800, avgBenefits: 8,   avgGrowth: 6.5, avgWLB: 7,   avgScore: 7.2 },
    MANAGER:     { avgSalary: 4000, avgBenefits: 8.5, avgGrowth: 6.5, avgWLB: 6.5, avgScore: 7.5 },
    DIRECTOR:    { avgSalary: 6000, avgBenefits: 9,   avgGrowth: 6,   avgWLB: 6,   avgScore: 7.8 },
  },
  SALES: {
    INTERN:      { avgSalary: 200,  avgBenefits: 4.5, avgGrowth: 7,   avgWLB: 6,   avgScore: 4.8 },
    FRESHER:     { avgSalary: 600,  avgBenefits: 5.5, avgGrowth: 7.5, avgWLB: 5.5, avgScore: 5.5 },
    JUNIOR:      { avgSalary: 1000, avgBenefits: 6,   avgGrowth: 8,   avgWLB: 5,   avgScore: 6   },
    MIDDLE:      { avgSalary: 1800, avgBenefits: 6.5, avgGrowth: 8.5, avgWLB: 5,   avgScore: 6.5 },
    SENIOR:      { avgSalary: 3000, avgBenefits: 7,   avgGrowth: 8.5, avgWLB: 4.5, avgScore: 7   },
    MANAGER:     { avgSalary: 4500, avgBenefits: 7.5, avgGrowth: 8,   avgWLB: 4.5, avgScore: 7.3 },
    DIRECTOR:    { avgSalary: 7000, avgBenefits: 8.5, avgGrowth: 7.5, avgWLB: 4,   avgScore: 7.8 },
  },
  MARKETING: {
    INTERN:      { avgSalary: 220,  avgBenefits: 5,   avgGrowth: 7,   avgWLB: 7,   avgScore: 5   },
    FRESHER:     { avgSalary: 650,  avgBenefits: 6,   avgGrowth: 7.5, avgWLB: 7,   avgScore: 5.8 },
    JUNIOR:      { avgSalary: 1100, avgBenefits: 6.5, avgGrowth: 8,   avgWLB: 6.5, avgScore: 6.3 },
    MIDDLE:      { avgSalary: 2000, avgBenefits: 7,   avgGrowth: 8,   avgWLB: 6,   avgScore: 6.8 },
    SENIOR:      { avgSalary: 3200, avgBenefits: 7.5, avgGrowth: 8,   avgWLB: 6,   avgScore: 7.3 },
    MANAGER:     { avgSalary: 4500, avgBenefits: 8,   avgGrowth: 7.5, avgWLB: 5.5, avgScore: 7.5 },
    DIRECTOR:    { avgSalary: 7000, avgBenefits: 8.5, avgGrowth: 7,   avgWLB: 5,   avgScore: 7.8 },
  },
  ENGINEERING: {
    INTERN:      { avgSalary: 280,  avgBenefits: 5.5, avgGrowth: 7,   avgWLB: 7.5, avgScore: 5.5 },
    FRESHER:     { avgSalary: 800,  avgBenefits: 6.5, avgGrowth: 7.5, avgWLB: 7,   avgScore: 6.2 },
    JUNIOR:      { avgSalary: 1400, avgBenefits: 7,   avgGrowth: 8,   avgWLB: 6.5, avgScore: 6.8 },
    MIDDLE:      { avgSalary: 2500, avgBenefits: 7.5, avgGrowth: 8.5, avgWLB: 6,   avgScore: 7.3 },
    SENIOR:      { avgSalary: 4200, avgBenefits: 8.5, avgGrowth: 8.5, avgWLB: 6,   avgScore: 8   },
    LEAD:        { avgSalary: 5800, avgBenefits: 9,   avgGrowth: 8,   avgWLB: 5.5, avgScore: 8.2 },
    MANAGER:     { avgSalary: 6500, avgBenefits: 9,   avgGrowth: 7.5, avgWLB: 5,   avgScore: 8.3 },
    DIRECTOR:    { avgSalary: 9500, avgBenefits: 9.5, avgGrowth: 7,   avgWLB: 4.5, avgScore: 8.5 },
  },
  MANUFACTURING: {
    INTERN:      { avgSalary: 200,  avgBenefits: 5,   avgGrowth: 6,   avgWLB: 7,   avgScore: 4.8 },
    FRESHER:     { avgSalary: 550,  avgBenefits: 6,   avgGrowth: 6.5, avgWLB: 6.5, avgScore: 5.5 },
    JUNIOR:      { avgSalary: 900,  avgBenefits: 6.5, avgGrowth: 7,   avgWLB: 6,   avgScore: 6   },
    MIDDLE:      { avgSalary: 1600, avgBenefits: 7,   avgGrowth: 7,   avgWLB: 5.5, avgScore: 6.5 },
    SENIOR:      { avgSalary: 2800, avgBenefits: 7.5, avgGrowth: 7,   avgWLB: 5.5, avgScore: 7   },
    MANAGER:     { avgSalary: 4000, avgBenefits: 8,   avgGrowth: 6.5, avgWLB: 5,   avgScore: 7.2 },
    DIRECTOR:    { avgSalary: 6500, avgBenefits: 8.5, avgGrowth: 6,   avgWLB: 4.5, avgScore: 7.5 },
  },
  HEALTHCARE: {
    INTERN:      { avgSalary: 220,  avgBenefits: 6,   avgGrowth: 6.5, avgWLB: 6.5, avgScore: 5.2 },
    FRESHER:     { avgSalary: 650,  avgBenefits: 7,   avgGrowth: 7,   avgWLB: 6,   avgScore: 6   },
    JUNIOR:      { avgSalary: 1100, avgBenefits: 7.5, avgGrowth: 7.5, avgWLB: 5.5, avgScore: 6.5 },
    MIDDLE:      { avgSalary: 2000, avgBenefits: 8,   avgGrowth: 7.5, avgWLB: 5,   avgScore: 7   },
    SENIOR:      { avgSalary: 3500, avgBenefits: 8.5, avgGrowth: 7,   avgWLB: 5,   avgScore: 7.5 },
    MANAGER:     { avgSalary: 5000, avgBenefits: 9,   avgGrowth: 7,   avgWLB: 4.5, avgScore: 7.8 },
    DIRECTOR:    { avgSalary: 7500, avgBenefits: 9,   avgGrowth: 6.5, avgWLB: 4,   avgScore: 8   },
  },
  EDUCATION: {
    INTERN:      { avgSalary: 180,  avgBenefits: 5.5, avgGrowth: 6.5, avgWLB: 8,   avgScore: 5   },
    FRESHER:     { avgSalary: 500,  avgBenefits: 6.5, avgGrowth: 7,   avgWLB: 8,   avgScore: 5.8 },
    JUNIOR:      { avgSalary: 800,  avgBenefits: 7,   avgGrowth: 7,   avgWLB: 7.5, avgScore: 6.2 },
    MIDDLE:      { avgSalary: 1400, avgBenefits: 7.5, avgGrowth: 7,   avgWLB: 7,   avgScore: 6.8 },
    SENIOR:      { avgSalary: 2500, avgBenefits: 8,   avgGrowth: 6.5, avgWLB: 7,   avgScore: 7.2 },
    MANAGER:     { avgSalary: 3500, avgBenefits: 8.5, avgGrowth: 6.5, avgWLB: 6.5, avgScore: 7.5 },
    DIRECTOR:    { avgSalary: 5500, avgBenefits: 9,   avgGrowth: 6,   avgWLB: 6,   avgScore: 7.8 },
  },
};

// Lấy benchmark theo ngành + cấp bậc, fallback về IT MIDDLE
const getBenchmark = (industry: string, level: string) => {
  // Normalize level key — lấy từ đầu tiên (ví dụ "JUNIOR (1-2 NĂM)" → "JUNIOR")
  const levelKey = level.toUpperCase().split(' ')[0].split('(')[0].trim();
  const industryKey = industry.toUpperCase();
  return (
    INDUSTRY_BENCHMARK[industryKey]?.[levelKey] ??
    INDUSTRY_BENCHMARK[industryKey]?.MIDDLE ??
    INDUSTRY_BENCHMARK.IT.MIDDLE
  );
};

const COLUMNS = [
  { header: 'ID',             key: 'id',               width: 40 },
  { header: 'Company 1 ID',   key: 'company1Id',       width: 40 },
  { header: 'Company 1 Name', key: 'company1Name',     width: 25 },
  { header: 'Company 2 ID',   key: 'company2Id',       width: 40 },
  { header: 'Company 2 Name', key: 'company2Name',     width: 25 },
  { header: 'Industry 1',     key: 'company1Industry', width: 15 },
  { header: 'Industry 2',     key: 'company2Industry', width: 15 },
  { header: 'Score 1',        key: 'score1',           width: 12 },
  { header: 'Score 2',        key: 'score2',           width: 12 },
  { header: 'Winner',         key: 'winner',           width: 12 },
  { header: 'Recommendation', key: 'recommendation',   width: 60 },
  { header: 'Created At',     key: 'createdAt',        width: 20 },
  { header: 'User ID',        key: 'userId',           width: 38 },
];

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
    if      (salaryRatio > 1.2) benchmarkBonus = 10;
    else if (salaryRatio > 1.1) benchmarkBonus = 8;
    else if (salaryRatio > 1.0) benchmarkBonus = 5;
    else if (salaryRatio > 0.9) benchmarkBonus = 2;
    else                        benchmarkBonus = -3;

    return {
      score: Math.round((company.overallScore + benchmarkBonus * 0.1) * 10) / 10,
      benchmarkBonus,
    };
  }

  generateRecommendation(company1: any, company2: any, score1: number, score2: number): string {
    const diff = Math.abs(score1 - score2);
    if (diff < 2) {
      return `Cả hai công ty đều tốt! Lựa chọn dựa vào:\n- ${company1.name}: $${company1.salary}/tháng, ${company1.role} (${company1.level})\n- ${company2.name}: $${company2.salary}/tháng, ${company2.role} (${company2.level})`;
    } else if (score1 > score2) {
      return `✅ KHUYẾN NGHỊ: ${company1.name}\nĐiểm cao hơn (${score1} vs ${score2}).\nLương: $${company1.salary} vs $${company2.salary}`;
    } else {
      return `✅ KHUYẾN NGHỊ: ${company2.name}\nĐiểm cao hơn (${score2} vs ${score1}).\nLương: $${company2.salary} vs $${company1.salary}`;
    }
  }

  async compare(comparisonDto: ComparisonDto, userId: string): Promise<ComparisonResponseDto> {
    const company1 = await this.companiesService.findById(comparisonDto.company1Id, userId);
    const company2 = await this.companiesService.findById(comparisonDto.company2Id, userId);

    if (!company1 || !company2) throw new Error('Company not found or access denied');

    const industry1 = company1.industry.toUpperCase();
    const industry2 = company2.industry.toUpperCase();

    // Ngành khác nhau → chặn hoàn toàn (điểm benchmark không có ý nghĩa)
    if (industry1 !== industry2) {
      throw new Error(
        `Không thể so sánh 2 công ty khác ngành (${company1.industry} vs ${company2.industry}). Vui lòng chọn 2 công ty cùng ngành.`,
      );
    }

    // Cấp bậc / hình thức khác → cảnh báo nhưng vẫn cho so sánh
    const warnings: string[] = [];
    if (company1.level !== company2.level) {
      warnings.push(`⚠️ Cấp bậc khác nhau: ${company1.level} vs ${company2.level} — bạn đang apply cả 2 cùng lúc.`);
    }
    if (company1.position !== company2.position) {
      warnings.push(`⚠️ Hình thức làm việc khác nhau: ${company1.position} vs ${company2.position}.`);
    }

    // Benchmark theo ngành + cấp bậc của từng company
    const benchmark1 = getBenchmark(industry1, company1.level);
    const benchmark2 = getBenchmark(industry1, company2.level); // cùng ngành, level có thể khác

    const { score: score1 } = this.calculateComparisonScore(company1, benchmark1);
    const { score: score2 } = this.calculateComparisonScore(company2, benchmark2);

    const winner = score1 > score2 ? 'company1' : score2 > score1 ? 'company2' : 'tie';
    const recommendation = this.generateRecommendation(company1, company2, score1, score2);

    const record: ComparisonRecord = {
      id: uuidv4(),
      company1Id:       company1.id,
      company1Name:     company1.name,
      company2Id:       company2.id,
      company2Name:     company2.name,
      company1Industry: company1.industry,
      company2Industry: company2.industry,
      score1, score2, winner, recommendation,
      createdAt: new Date(),
      userId,
    };

    this.comparisons.push(record);
    await this.saveToExcel();

    return {
      id: record.id,
      company1, company2,
      score1, score2, winner, recommendation,
      warnings, // ← trả về frontend để hiển thị
      industryBenchmark: {
        company1: { industry: company1.industry, level: company1.level, ...benchmark1 },
        company2: { industry: company2.industry, level: company2.level, ...benchmark2 },
      },
      createdAt: record.createdAt,
    };
  }

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
    if (!worksheet) { this.comparisons = []; return; }

    this.comparisons = [];
    worksheet.eachRow((row: any, rowNumber: number) => {
      if (rowNumber > 1) {
        const record: ComparisonRecord = {
          id:               row.getCell(1).value,
          company1Id:       row.getCell(2).value,
          company1Name:     row.getCell(3).value,
          company2Id:       row.getCell(4).value,
          company2Name:     row.getCell(5).value,
          company1Industry: row.getCell(6).value,
          company2Industry: row.getCell(7).value,
          score1:           row.getCell(8).value,
          score2:           row.getCell(9).value,
          winner:           row.getCell(10).value,
          recommendation:   row.getCell(11).value,
          createdAt:        row.getCell(12).value,
          userId:           row.getCell(13).value ?? '',
        };
        if (record.id) this.comparisons.push(record);
      }
    });
  }

  private async saveToExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Comparisons');
    worksheet.columns = COLUMNS;

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    this.comparisons.forEach((c) => worksheet.addRow(c));
    await workbook.xlsx.writeFile(this.filePath);
  }

  private async createNewFile() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Comparisons');
    worksheet.columns = COLUMNS;

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    await workbook.xlsx.writeFile(this.filePath);
  }
}