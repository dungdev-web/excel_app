// app/types/company.ts
export interface Company {
  id: string;
  name: string;
  industry: string;
  salary: number;
  benefits: number;
  growth: number;
  workLifeBalance: number;
  overallScore: number;
  createdAt: Date;
}

export interface Comparison {
  id: string;
  company1: Company;
  company2: Company;
  score1: number;
  score2: number;
  winner: 'company1' | 'company2' | 'tie';
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

export const INDUSTRIES = [
  'IT',
  'Finance',
  'HR',
  'Sales',
  'Marketing',
  'Engineering',
  'Other'
];