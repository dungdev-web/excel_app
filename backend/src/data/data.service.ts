import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DataService {
  private filePath = path.join(process.cwd(), 'data.xlsx');

  // Đọc dữ liệu từ Excel
  async readData() {
    const workbook = new ExcelJS.Workbook();
    
    // Nếu file chưa tồn tại, tạo mới
    if (!fs.existsSync(this.filePath)) {
      await this.createNewFile();
    }
    
    await workbook.xlsx.readFile(this.filePath);
    const worksheet = workbook.getWorksheet(1);
    
    if (!worksheet) {
      return [];
    }

    const data: any[] = [];
    worksheet.eachRow((row: any, rowNumber: number) => {
      if (rowNumber > 1) { // Skip header
        data.push({
          id: rowNumber - 1,
          name: row.getCell(1).value,
          email: row.getCell(2).value,
          phone: row.getCell(3).value
        });
      }
    });
    
    return data;
  }

  // Ghi dữ liệu vào Excel
  async addData(input: { name: string; email: string; phone: string }) {
    const workbook = new ExcelJS.Workbook();
    
    if (!fs.existsSync(this.filePath)) {
      await this.createNewFile();
    }
    
    await workbook.xlsx.readFile(this.filePath);
    const worksheet = workbook.getWorksheet(1);
    
    if (!worksheet) {
      throw new Error('Worksheet not found');
    }

    // Thêm row mới
    worksheet.addRow([input.name, input.email, input.phone]);
    
    await workbook.xlsx.writeFile(this.filePath);
    return { success: true, message: 'Dữ liệu đã được lưu' };
  }

  private async createNewFile() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 }
    ];
    
    await workbook.xlsx.writeFile(this.filePath);
  }
}