// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const getToken = () =>
  typeof window !== 'undefined' ? (localStorage.getItem('auth_token') ?? '') : '';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

// ── Companies ──────────────────────────────────────────────
export async function GetCompany() {
  const res = await fetch(`${API_URL}/api/companies`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch companies');
  return res.json();
}

export async function AddCompany(data: any) {
  return fetch(`${API_URL}/api/companies`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
}

export async function CompareCompany(id1: string, id2: string) {
  return fetch(`${API_URL}/api/comparisons`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ company1Id: id1, company2Id: id2 }),
  });
}

// ── AI ─────────────────────────────────────────────────────
interface Preferences {
  prioritizeSalary: number;
  prioritizeBenefits: number;
  prioritizeGrowth: number;
  prioritizeWorkLifeBalance: number;
  industryPreference: string;
  minSalary: number;
  maxSalary: number;
}

export async function GetRecommendations(preferences: Preferences) {
  const res = await fetch(`${API_URL}/api/ai/recommend`, {
    method: 'POST',
    headers: authHeaders(), // ← thêm auth
    body: JSON.stringify(preferences),
  });
  if (!res.ok) throw new Error(`Failed to get recommendations: ${res.statusText}`);
  return res.json();
}

export async function GetInsight(preferences: Preferences) {
  const res = await fetch(`${API_URL}/api/ai/insight`, {
    method: 'POST',
    headers: authHeaders(), // ← thêm auth
    body: JSON.stringify(preferences),
  });
  if (!res.ok) throw new Error(`Failed to get insight: ${res.statusText}`);
  return res.json();
}

// ── Analytics ──────────────────────────────────────────────
export async function Dashboard() {
  const res = await fetch(`${API_URL}/api/analytics/dashboard`, {
    headers: authHeaders(), // ← thêm auth
  });
  if (!res.ok) throw new Error(`Failed to fetch dashboard: ${res.statusText}`);
  return res.json();
}

export async function SalaryStats() {
  const res = await fetch(`${API_URL}/api/analytics/salary-stats`, {
    headers: authHeaders(), // ← thêm auth
  });
  if (!res.ok) throw new Error(`Failed to fetch salary stats: ${res.statusText}`);
  return res.json();
}

// ── Salary Benchmark (public, không cần auth) ──────────────
export async function SalaryBenchmark(salary: number, industry: string, role: string) {
  const res = await fetch(`${API_URL}/api/benchmark/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ salary, industry, role, location: 'Vietnam' }),
  });
  return res.json();
}