import { useState, useEffect } from 'react';
import { Dashboard } from '../lib/api';
export interface DashboardData {
  totalCompanies: number;
  totalComparisons: number;
  avgSalary: number;
  topCompanies: Array<{
    id: string;
    name: string;
    views: number;
    score: number;
  }>;
  industryDistribution: Record<string, number>;
  industryAverages: Array<{
    industry: string;
    avgScore: number;
    count: number;
  }>;
  timestamp: string;
}

interface UseAnalyticsReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAnalytics(): UseAnalyticsReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {    
      const result = await Dashboard();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboard
  };
}