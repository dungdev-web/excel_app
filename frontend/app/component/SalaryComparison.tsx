'use client';
import { useState } from 'react';
import { useSalaryBenchmark } from '../hooks/useSalaryBenchmark';
import { ChartPie, CircleChevronDown, HandCoins, Search } from 'lucide-react';

export default function SalaryComparison() {
  const [role, setRole] = useState('Software Developer');
  const [industry, setIndustry] = useState('IT');
  const [salary, setSalary] = useState(5500);
  const { data, loading, error, compareSalary } = useSalaryBenchmark();

  const handleCompare = async () => {
    await compareSalary(salary, industry, role);
  };

  const getRatingColor = (percentageDiff: number) => {
    if (percentageDiff > 20) return 'text-green-600';
    if (percentageDiff > 0) return 'text-green-500';
    if (percentageDiff > -20) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-8 bg-linear-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            <div className="flex items-center gap-2"><HandCoins size={35} /> Salary Benchmarking</div>
          </h1>
          <p className="text-gray-600">
            Compare your salary with market data
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
           <div className="flex items-center gap-2"> <ChartPie /> Your Information</div>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option>Software Developer</option>
                <option>Business Analyst</option>
                <option>Financial Analyst</option>
                <option>HR Manager</option>
                <option>Sales Executive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="IT">IT</option>
                <option value="Finance">Finance</option>
                <option value="HR">HR</option>
                <option value="Sales">Sales</option>
                <option value="Engineering">Engineering</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Salary ($)
              </label>
              <input
                type="number"
                value={salary}
                onChange={(e) => setSalary(parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={handleCompare}
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-semibold"
          >
            {loading ? 
              <><div>Comparing...</div></>:
              <><div className="flex items-center gap-2 justify-center"><Search />Compare Salary</div></>}
          </button>
        </div>

        {/* Results Section */}
        {data && (
          <div className="space-y-6">
            {/* Salary Comparison */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                <div className="flex items-center gap-2"><CircleChevronDown /> Comparison Result</div>
              </h2>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-gray-600 text-sm mb-2">Your Salary</p>
                  <p className="text-3xl font-bold text-blue-600">${salary}</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <p className="text-gray-600 text-sm mb-2">Market Average</p>
                  <p className="text-3xl font-bold text-purple-600">
                    ${data.avgSalary}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-gray-600 text-sm mb-2">Difference</p>
                  <p className={`text-3xl font-bold ${getRatingColor(data.percentageDiff)}`}>
                    {data.percentageDiff > 0 ? '+' : ''}{data.percentageDiff.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Analysis */}
              <div className="bg-linear-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-6">
                <p className="text-lg font-semibold text-gray-800 mb-2">
                  {data.analysis}
                </p>
                <p className="text-gray-700">{data.recommendation}</p>
              </div>

              {/* Salary Range */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Market Salary Range
                </h3>
                <div className="relative h-12 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div
                    className="absolute h-full bg-linear-to-r from-green-500 to-blue-500 flex items-center justify-center text-white font-bold"
                    style={{
                      left: `${Math.max(0, ((data.salary - data.benchmarkDetails.minSalary) / (data.benchmarkDetails.maxSalary - data.benchmarkDetails.minSalary)) * 100 - 10)}%`,
                      width: '20%'
                    }}
                  >
                    YOU
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>${data.benchmarkDetails.minSalary}</span>
                  <span className="font-semibold">Average: ${data.benchmarkDetails.avgSalary}</span>
                  <span>${data.benchmarkDetails.maxSalary}</span>
                </div>
              </div>

              {/* Experience Levels */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Junior</p>
                  <p className="font-bold text-blue-600">
                    ${data.benchmarkDetails.junior_salary}
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Mid-level</p>
                  <p className="font-bold text-purple-600">
                    ${data.benchmarkDetails.mid_salary}
                  </p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Senior</p>
                  <p className="font-bold text-indigo-600">
                    ${data.benchmarkDetails.senior_salary}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}