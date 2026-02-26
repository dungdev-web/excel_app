// components/ComparisonTable.tsx
'use client';
import { Comparison } from '../type/company';

interface ComparisonTableProps {
  comparison: Comparison;
}

export default function ComparisonTable({ comparison }: ComparisonTableProps) {
  const { company1, company2, score1, score2, winner, recommendation, industryBenchmark } = comparison;

  const criteria = [
    { label: 'Lương (USD)', key: 'salary', unit: '$' },
    { label: 'Phúc lợi', key: 'benefits', unit: '/10' },
    { label: 'Phát triển', key: 'growth', unit: '/10' },
    { label: 'Cân bằng công việc', key: 'workLifeBalance', unit: '/10' }
  ];

  const getWinnerClass = (value1: number, value2: number, isCompany1: boolean) => {
    if (value1 === value2) return '';
    if ((value1 > value2 && isCompany1) || (value1 < value2 && !isCompany1)) {
      return 'bg-green-100 font-bold text-green-800';
    }
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Kết Quả So Sánh</h2>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Company 1 Score */}
          <div className={`text-center p-6 rounded-lg ${winner === 'company1' ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-50'}`}>
            <p className="text-lg font-semibold text-gray-700 mb-2">{company1.name}</p>
            <p className="text-5xl font-bold text-blue-600 mb-2">{score1}</p>
            <p className="text-sm text-gray-600">Điểm tổng thể / 100</p>
            {winner === 'company1' && (
              <p className="mt-2 text-green-700 font-bold">🏆 Công ty tốt hơn!</p>
            )}
          </div>

          {/* Company 2 Score */}
          <div className={`text-center p-6 rounded-lg ${winner === 'company2' ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-50'}`}>
            <p className="text-lg font-semibold text-gray-700 mb-2">{company2.name}</p>
            <p className="text-5xl font-bold text-indigo-600 mb-2">{score2}</p>
            <p className="text-sm text-gray-600">Điểm tổng thể / 100</p>
            {winner === 'company2' && (
              <p className="mt-2 text-green-700 font-bold">🏆 Công ty tốt hơn!</p>
            )}
          </div>
        </div>

        {/* Score Difference */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-sm text-gray-600">
            Chênh lệch điểm: <span className="font-bold text-lg">{Math.abs(score1 - score2).toFixed(1)} điểm</span>
          </p>
        </div>
      </div>

      {/* Detailed Comparison */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Chi tiết so sánh</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left p-3 font-semibold text-gray-700">Tiêu chí</th>
                <th className="text-center p-3 font-semibold text-blue-600">{company1.name}</th>
                <th className="text-center p-3 font-semibold text-indigo-600">{company2.name}</th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((criterion, idx) => {
                const value1 = company1[criterion.key as keyof typeof company1];
                const value2 = company2[criterion.key as keyof typeof company2];

                return (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-800">{criterion.label}</td>
                    <td className={`text-center p-3 rounded ${getWinnerClass(Number(value1), Number(value2), true)}`}>
                      {value1}
                      <span className="text-xs text-gray-600">{criterion.unit}</span>
                    </td>
                    <td className={`text-center p-3 rounded ${getWinnerClass(Number(value1), Number(value2), false)}`}>
                      {value2}
                      <span className="text-xs text-gray-600">{criterion.unit}</span>
                    </td>
                  </tr>
                );
              })}

              {/* Overall Score Row */}
              <tr className="bg-blue-50 border-t-2 border-blue-300">
                <td className="p-3 font-bold text-gray-800">Điểm Tổng Hợp</td>
                <td className={`text-center p-3 font-bold text-lg rounded ${winner === 'company1' ? 'bg-green-200' : ''}`}>
                  {score1}
                </td>
                <td className={`text-center p-3 font-bold text-lg rounded ${winner === 'company2' ? 'bg-green-200' : ''}`}>
                  {score2}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Industry Benchmark */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📈 So sánh với Benchmark Ngành</h3>
        <p className="text-gray-600 mb-4">
          Ngành: <span className="font-bold">{industryBenchmark.industry}</span>
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Trung bình lương ngành</p>
            <p className="text-2xl font-bold text-green-600">${industryBenchmark.avgSalary}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Trung bình phúc lợi</p>
            <p className="text-2xl font-bold text-yellow-600">{industryBenchmark.avgBenefits}/10</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Trung bình phát triển</p>
            <p className="text-2xl font-bold text-blue-600">{industryBenchmark.avgGrowth}/10</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Trung bình cân bằng</p>
            <p className="text-2xl font-bold text-purple-600">{industryBenchmark.avgWLB}/10</p>
          </div>
        </div>

        {/* Comparison with Benchmark */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold text-gray-800 mb-2">{company1.name}</p>
            <ul className="space-y-2 text-sm">
              <li className={company1.salary > industryBenchmark.avgSalary ? 'text-green-600' : 'text-red-600'}>
                Lương: {company1.salary > industryBenchmark.avgSalary ? '✅ Cao hơn' : '❌ Thấp hơn'} benchmark
              </li>
              <li className={company1.benefits > industryBenchmark.avgBenefits ? 'text-green-600' : 'text-red-600'}>
                Phúc lợi: {company1.benefits > industryBenchmark.avgBenefits ? '✅ Tốt hơn' : '❌ Kém hơn'} benchmark
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gray-800 mb-2">{company2.name}</p>
            <ul className="space-y-2 text-sm">
              <li className={company2.salary > industryBenchmark.avgSalary ? 'text-green-600' : 'text-red-600'}>
                Lương: {company2.salary > industryBenchmark.avgSalary ? '✅ Cao hơn' : '❌ Thấp hơn'} benchmark
              </li>
              <li className={company2.benefits > industryBenchmark.avgBenefits ? 'text-green-600' : 'text-red-600'}>
                Phúc lợi: {company2.benefits > industryBenchmark.avgBenefits ? '✅ Tốt hơn' : '❌ Kém hơn'} benchmark
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-l-4 border-green-500 rounded-lg p-6">
        <h3 className="text-xl font-bold text-green-800 mb-3">💡 Khuyến nghị</h3>
        <p className="text-gray-800 whitespace-pre-line">{recommendation}</p>
      </div>
    </div>
  );
}