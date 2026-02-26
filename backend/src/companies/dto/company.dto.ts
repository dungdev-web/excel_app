// src/companies/dto/company.dto.ts
export class CreateCompanyDto {
  name: string;
  industry: string; // IT, Finance, HR, Sales, etc.
  salary: number; // USD per month
  benefits: number; // 1-10 score
  growth: number; // 1-10 score
  workLifeBalance: number; // 1-10 score
}

export class CompanyResponseDto extends CreateCompanyDto {
  id: string;
  overallScore: number;
  createdAt: Date;
}

export class ComparisonDto {
  company1Id: string;
  company2Id: string;
}

export class ComparisonResponseDto {
  id: string;
  company1: CompanyResponseDto;
  company2: CompanyResponseDto;
  score1: number;
  score2: number;
  winner: string; // 'company1', 'company2', or 'tie'
  recommendation: string;
  industryBenchmark: {
    industry: string;
    avgSalary: number;
    avgBenefits: number;
    avgGrowth: number;
    avgWLB: number;
  };
  createdAt: Date;
}