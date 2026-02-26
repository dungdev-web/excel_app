// src/auth/excel-storage.service.ts
import { Injectable, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';

export interface UserRow {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
}

const FILE_PATH = path.join(process.cwd(), 'data', 'users.xlsx');
const SHEET_NAME = 'Users';
const HEADERS = ['id', 'email', 'password', 'name', 'createdAt'];

@Injectable()
export class ExcelStorageService implements OnModuleInit {
  async onModuleInit() {
    await this.ensureFile();
  }

  private async ensureFile() {
    const dir = path.dirname(FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (!fs.existsSync(FILE_PATH)) {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet(SHEET_NAME);

      ws.addRow(HEADERS);
      ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      ws.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F46E5' },
      };
      ws.columns = [
        { key: 'id',        width: 38 },
        { key: 'email',     width: 30 },
        { key: 'password',  width: 65 },
        { key: 'name',      width: 20 },
        { key: 'createdAt', width: 25 },
      ];

      await wb.xlsx.writeFile(FILE_PATH);
    }
  }

  // Helper: lấy worksheet, throw nếu không tìm thấy
  private getSheet(wb: ExcelJS.Workbook): ExcelJS.Worksheet {
    const ws = wb.getWorksheet(SHEET_NAME);
    if (!ws) throw new InternalServerErrorException(`Sheet "${SHEET_NAME}" không tồn tại`);
    return ws;
  }

  async getAllUsers(): Promise<UserRow[]> {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(FILE_PATH);
    const ws = this.getSheet(wb);
    const users: UserRow[] = [];

    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const [, id, email, password, name, createdAt] = row.values as string[];
      if (email) {
        users.push({ id, email, password, name, createdAt });
      }
    });

    return users;
  }

  async findByEmail(email: string): Promise<UserRow | null> {
    const users = await this.getAllUsers();
    return users.find((u) => u.email === email) ?? null;
  }

  async findById(id: string): Promise<UserRow | null> {
    const users = await this.getAllUsers();
    return users.find((u) => u.id === id) ?? null;
  }

  async addUser(user: UserRow): Promise<void> {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(FILE_PATH);
    const ws = this.getSheet(wb);

    const newRow = ws.addRow([
      user.id,
      user.email,
      user.password,
      user.name,
      user.createdAt,
    ]);

    if (newRow.number % 2 === 0) {
      newRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF5F3FF' },
      };
    }

    await wb.xlsx.writeFile(FILE_PATH);
  }
}