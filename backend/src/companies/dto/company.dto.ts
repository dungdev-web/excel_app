// src/companies/dto/company.dto.ts

export class CreateCompanyDto {
  name: string;
  industry: string;
  role: string; // ← mới: Frontend Developer, Backend Developer...
  level: string; // ← mới: Intern, Fresher, Junior, Senior...
  position: string; // ← mới: Remote, Hybrid, Onsite, Toàn thời gian...
  salary: number;
  benefits: number;
  growth: number;
  workLifeBalance: number;
}

export class CompanyResponseDto extends CreateCompanyDto {
  id: string;
  userId: string;
  overallScore: number;
  createdAt: Date;
}

export class ComparisonDto {
  company1Id: string;
  company2Id: string;
}

export interface ComparisonResponseDto {
  id: string;
  company1: CompanyResponseDto;
  company2: CompanyResponseDto;
  score1: number;
  score2: number;
  winner: string;
  recommendation: string;
  warnings: string[];
  industryBenchmark: {
    company1: {
      industry: string;
      avgSalary: number;
      avgBenefits: number;
      level: string;
      avgGrowth: number;
      avgWLB: number;
    };
    company2: {
      industry: string;
      avgSalary: number;
      avgBenefits: number;
      level: string;
      avgGrowth: number;
      avgWLB: number;
    };
  };
  createdAt: Date;
}
