// components/ComparisonTable.tsx
"use client";
import { BookmarkCheck, BookText, CalendarArrowDown } from "lucide-react";
import { Comparison } from "../type/company";

interface ComparisonTableProps {
  comparison: Comparison;
}

export default function ComparisonTable({ comparison }: ComparisonTableProps) {
  const { company1, company2, score1, score2, winner, recommendation, industryBenchmark } = comparison;

  // Support cả shape cũ (flat) và mới (company1/company2)
  const bm1 = (industryBenchmark as any).company1 ?? industryBenchmark;
  const bm2 = (industryBenchmark as any).company2 ?? industryBenchmark;

  const criteria = [
    { label: "Vị trí",              key: "role",            unit: ""    },
    { label: "Cấp bậc",             key: "level",           unit: ""    },
    { label: "Hình thức",           key: "position",        unit: ""    },
    { label: "Lương (USD)",         key: "salary",          unit: "$"   },
    { label: "Phúc lợi",            key: "benefits",        unit: "/10" },
    { label: "Phát triển",          key: "growth",          unit: "/10" },
    { label: "Cân bằng công việc",  key: "workLifeBalance", unit: "/10" },
  ];

  // Các tiêu chí so sánh số (highlight xanh/đỏ)
  const numericKeys = new Set(["salary", "benefits", "growth", "workLifeBalance"]);

  const getWinnerClass = (value1: number, value2: number, isCompany1: boolean) => {
    if (value1 === value2) return "";
    if ((value1 > value2 && isCompany1) || (value1 < value2 && !isCompany1))
      return "bg-green-100 font-bold text-green-800";
    return "bg-red-100 text-red-800";
  };

  const formatValue = (val: any): string => {
    if (val instanceof Date) return val.toLocaleDateString("vi-VN");
    return String(val ?? "—");
  };

  const BenchmarkRow = ({
    label, c1val, c2val, bm1val, bm2val, unit,
  }: {
    label: string; c1val: number; c2val: number; bm1val: number; bm2val: number; unit: string;
  }) => (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-100 text-sm">
      <span className="text-gray-600 font-medium">{label}</span>
      <span className={c1val > bm1val ? "text-green-600 font-semibold" : "text-red-500"}>
        {c1val}{unit} {c1val > bm1val ? "✅" : "❌"} (BM: {bm1val}{unit})
      </span>
      <span className={c2val > bm2val ? "text-green-600 font-semibold" : "text-red-500"}>
        {c2val}{unit} {c2val > bm2val ? "✅" : "❌"} (BM: {bm2val}{unit})
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          <div className="flex items-center gap-2">
            <CalendarArrowDown /> Kết Quả So Sánh
          </div>
        </h2>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {[
            { company: company1, score: score1, color: "text-blue-600",   isWinner: winner === "company1" },
            { company: company2, score: score2, color: "text-indigo-600", isWinner: winner === "company2" },
          ].map(({ company, score, color, isWinner }) => (
            <div
              key={company.id}
              className={`text-center p-6 rounded-lg ${isWinner ? "bg-green-100 border-2 border-green-500" : "bg-gray-50"}`}
            >
              <p className="text-lg font-semibold text-gray-700 mb-1">{company.name}</p>
              <p className="text-xs text-gray-500 mb-2">{company.role} · {company.level}</p>
              <p className={`text-5xl font-bold mb-2 ${color}`}>{score}</p>
              <p className="text-sm text-gray-600">Điểm tổng thể / 100</p>
              {isWinner && <p className="mt-2 text-green-700 font-bold">🏆 Công ty tốt hơn!</p>}
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-sm text-gray-600">
            Chênh lệch điểm:{" "}
            <span className="font-bold text-lg">{Math.abs(score1 - score2).toFixed(1)} điểm</span>
          </p>
        </div>
      </div>

      {/* Detailed Comparison */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          <div className="flex items-center gap-2"><BookText /> Chi tiết so sánh</div>
        </h3>

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
                const isNumeric = numericKeys.has(criterion.key);

                return (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-800">{criterion.label}</td>
                    <td className={`text-center p-3 rounded ${isNumeric ? getWinnerClass(Number(value1), Number(value2), true) : ""}`}>
                      {formatValue(value1)}
                      {criterion.unit && <span className="text-xs text-gray-500 ml-0.5">{criterion.unit}</span>}
                    </td>
                    <td className={`text-center p-3 rounded ${isNumeric ? getWinnerClass(Number(value1), Number(value2), false) : ""}`}>
                      {formatValue(value2)}
                      {criterion.unit && <span className="text-xs text-gray-500 ml-0.5">{criterion.unit}</span>}
                    </td>
                  </tr>
                );
              })}

              {/* Overall Score Row */}
              <tr className="bg-blue-50 border-t-2 border-blue-300">
                <td className="p-3 font-bold text-gray-800">Điểm Tổng Hợp</td>
                <td className={`text-center p-3 font-bold text-lg rounded ${winner === "company1" ? "bg-green-200" : ""}`}>{score1}</td>
                <td className={`text-center p-3 font-bold text-lg rounded ${winner === "company2" ? "bg-green-200" : ""}`}>{score2}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Industry Benchmark */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          <div className="flex items-center gap-2"><BookmarkCheck /> So sánh với Benchmark Ngành</div>
        </h3>

        {/* Header */}
        <div className="grid grid-cols-3 gap-2 pb-2 border-b-2 border-gray-200 text-sm font-semibold">
          <span className="text-gray-500">Tiêu chí</span>
          <span className="text-blue-600">{company1.name}</span>
          <span className="text-indigo-600">{company2.name}</span>
        </div>

        <BenchmarkRow label="Lương ($)"    c1val={company1.salary}          c2val={company2.salary}          bm1val={bm1.avgSalary}   bm2val={bm2.avgSalary}   unit="$"   />
        <BenchmarkRow label="Phúc lợi"    c1val={company1.benefits}        c2val={company2.benefits}        bm1val={bm1.avgBenefits} bm2val={bm2.avgBenefits} unit="/10" />
        <BenchmarkRow label="Phát triển"  c1val={company1.growth}          c2val={company2.growth}          bm1val={bm1.avgGrowth}   bm2val={bm2.avgGrowth}   unit="/10" />
        <BenchmarkRow label="Cân bằng"    c1val={company1.workLifeBalance} c2val={company2.workLifeBalance} bm1val={bm1.avgWLB}      bm2val={bm2.avgWLB}      unit="/10" />
      </div>

      {/* Recommendation */}
      <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-l-4 border-green-500 rounded-lg p-6">
        <h3 className="text-xl font-bold text-green-800 mb-3">💡 Khuyến nghị</h3>
        <p className="text-gray-800 whitespace-pre-line">{recommendation}</p>
      </div>
    </div>
  );
}