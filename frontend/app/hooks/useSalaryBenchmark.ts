import { useState } from 'react';
import { SalaryBenchmark } from '../lib/api';
export interface BenchmarkDetails {
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

interface UseSalaryBenchmarkReturn {
  data: SalaryComparisonResult | null;
  loading: boolean;
  error: string | null;
  compareSalary: (salary: number, industry: string, role: string) => Promise<void>;
}

export function useSalaryBenchmark(): UseSalaryBenchmarkReturn {
  const [data, setData] = useState<SalaryComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compareSalary = async (
    salary: number,
    industry: string,
    role: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await SalaryBenchmark(salary, industry, role);
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error comparing salary:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    compareSalary
  };
}