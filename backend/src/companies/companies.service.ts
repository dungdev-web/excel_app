// src/companies/companies.service.ts
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import { CreateCompanyDto, CompanyResponseDto } from './dto/company.dto';
import { v4 as uuidv4 } from 'uuid';

interface Company extends CreateCompanyDto {
  id: string;
  userId: string;
  overallScore: number;
  viewCount: number;   // ← thêm field mới
  createdAt: Date;
}

const COLUMNS = [
  { header: 'ID',                       key: 'id',              width: 40 },
  { header: 'Company Name',             key: 'name',            width: 25 },
  { header: 'Industry',                 key: 'industry',        width: 15 },
  { header: 'Role',                     key: 'role',            width: 25 },
  { header: 'Level',                    key: 'level',           width: 20 },
  { header: 'Work Position',            key: 'position',        width: 20 },
  { header: 'Salary (USD)',             key: 'salary',          width: 15 },
  { header: 'Benefits (1-10)',          key: 'benefits',        width: 15 },
  { header: 'Growth (1-10)',            key: 'growth',          width: 15 },
  { header: 'Work-Life Balance (1-10)', key: 'workLifeBalance', width: 20 },
  { header: 'Overall Score',            key: 'overallScore',    width: 15 },
  { header: 'View Count',               key: 'viewCount',       width: 12 }, // ← thêm column
  { header: 'Created At',               key: 'createdAt',       width: 20 },
  { header: 'User ID',                  key: 'userId',          width: 38 },
];

@Injectable()
export class CompaniesService {
  private filePath = path.join(process.cwd(), 'companies.xlsx');
  private companies: Company[] = [];

  constructor() {
    this.loadCompanies();
  }

  calculateScore(company: CreateCompanyDto): number {
    const { salary, benefits, growth, workLifeBalance } = company;
    const normalizedSalary = Math.min((salary / 10000) * 10, 10);
    const score =
      normalizedSalary * 0.3 +
      benefits         * 0.2 +
      growth           * 0.2 +
      workLifeBalance  * 0.2;
    return Math.round(score * 100) / 10;
  }

  async loadCompanies() {
    if (!fs.existsSync(this.filePath)) {
      await this.createNewFile();
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(this.filePath);
    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) { this.companies = []; return; }

    this.companies = [];
    worksheet.eachRow((row: any, rowNumber: number) => {
      if (rowNumber > 1) {
        // Detect xem file cũ (13 col) hay mới (14 col) để đọc đúng vị trí
        const hasViewCount = worksheet.columnCount >= 14;

        const company: Company = {
          id:              row.getCell(1).value,
          name:            row.getCell(2).value,
          industry:        String(row.getCell(3).value ?? '').toUpperCase(),
          role:            row.getCell(4).value ?? '',
          level:           row.getCell(5).value ?? '',
          position:        row.getCell(6).value ?? '',
          salary:          row.getCell(7).value,
          benefits:        row.getCell(8).value,
          growth:          row.getCell(9).value,
          workLifeBalance: row.getCell(10).value,
          overallScore:    row.getCell(11).value,
          viewCount:       hasViewCount ? (row.getCell(12).value || 0) : 0,
          createdAt:       hasViewCount ? row.getCell(13).value : row.getCell(12).value,
          userId:          hasViewCount ? row.getCell(14).value ?? '' : row.getCell(13).value ?? '',
        };
        if (company.id) this.companies.push(company);
      }
    });
  }

  async findAll(userId?: string): Promise<CompanyResponseDto[]> {
    await this.loadCompanies();
    if (userId) return this.companies.filter((c) => c.userId === userId);
    return this.companies;
  }

  async findById(id: string, userId?: string): Promise<CompanyResponseDto | undefined> {
    await this.loadCompanies();
    const company = this.companies.find((c) => c.id === id);
    if (!company) return undefined;
    if (userId && company.userId !== userId) return undefined;
    return company;
  }

  async create(createCompanyDto: CreateCompanyDto, userId: string): Promise<CompanyResponseDto> {
    const newCompany: Company = {
      ...createCompanyDto,
      id:           uuidv4(),
      userId,
      overallScore: this.calculateScore(createCompanyDto),
      viewCount:    0,  // ← bắt đầu từ 0
      createdAt:    new Date(),
    };
    this.companies.push(newCompany);
    await this.saveToExcel();
    return newCompany;
  }

  async update(id: string, updateDto: Partial<CreateCompanyDto>, userId: string): Promise<CompanyResponseDto> {
    const company = this.companies.find((c) => c.id === id && c.userId === userId);
    if (!company) throw new Error('Company not found or access denied');
    Object.assign(company, updateDto);
    company.overallScore = this.calculateScore(company);
    await this.saveToExcel();
    return company;
  }

  // ← Method mới: chỉ update viewCount, không reload toàn bộ
  async updateViewCount(id: string, viewCount: number): Promise<void> {
    const company = this.companies.find((c) => c.id === id);
    if (!company) return;
    company.viewCount = viewCount;
    await this.saveToExcel();
  }

  async delete(id: string, userId: string): Promise<{ success: boolean }> {
    const index = this.companies.findIndex((c) => c.id === id && c.userId === userId);
    if (index === -1) throw new Error('Company not found or access denied');
    this.companies.splice(index, 1);
    await this.saveToExcel();
    return { success: true };
  }

  private async saveToExcel() {
    const workbook  = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Companies');
    worksheet.columns = COLUMNS;

    const headerRow = worksheet.getRow(1);
    headerRow.font      = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    this.companies.forEach((company) => {
      const row = worksheet.addRow(company);
      row.alignment = { horizontal: 'left', vertical: 'middle' };
      if (company.overallScore >= 7) {
        row.getCell('overallScore').fill = {
          type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' },
        };
      }
      // Highlight viewCount cao
      if (company.viewCount >= 5) {
        row.getCell('viewCount').fill = {
          type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' },
        };
      }
    });

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];
    await workbook.xlsx.writeFile(this.filePath);
  }

  private async createNewFile() {
    const workbook  = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Companies');
    worksheet.columns = COLUMNS;

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    await workbook.xlsx.writeFile(this.filePath);
  }
}