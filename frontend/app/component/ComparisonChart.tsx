// components/ComparisonChart.tsx
"use client";
import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadarController,
  PointElement, // ✅ Thêm
  LineElement, // ✅ Thêm
  Filler,
  BarController,
  RadialLinearScale
} from "chart.js";
import { Comparison } from "../type/company";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadarController,
  PointElement, // ✅ Thêm
  LineElement,
  Filler,
  BarController,
    RadialLinearScale
);

interface ComparisonChartProps {
  comparison: Comparison;
}

export default function ComparisonChart({ comparison }: ComparisonChartProps) {
  const barChartRef = useRef<HTMLCanvasElement>(null);
  const radarChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const radarChartInstanceRef = useRef<any>(null);

  const { company1, company2, score1, score2 } = comparison;

  // Bar Chart - Overall Scores
  useEffect(() => {
    if (!barChartRef.current) return;

    const ctx = barChartRef.current.getContext("2d");
    if (!ctx) return;

    // Destroy previous chart if exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels: [company1.name, company2.name],
        datasets: [
          {
            label: "Overall Score",
            data: [score1, score2],
            backgroundColor: [
              score1 > score2
                ? "rgba(34, 197, 94, 0.8)"
                : "rgba(156, 163, 175, 0.8)",
              score2 > score1
                ? "rgba(34, 197, 94, 0.8)"
                : "rgba(156, 163, 175, 0.8)",
            ],
            borderColor: [
              score1 > score2 ? "rgb(22, 163, 74)" : "rgb(107, 114, 128)",
              score2 > score1 ? "rgb(22, 163, 74)" : "rgb(107, 114, 128)",
            ],
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: "Điểm Tổng Hợp So Sánh",
            font: { size: 16, weight: "bold" },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function (value) {
                return value + " điểm";
              },
            },
          },
        },
      },
    });
  }, [company1, company2, score1, score2]);

  // Radar Chart - Detailed Comparison
  useEffect(() => {
    if (!radarChartRef.current) return;

    const ctx = radarChartRef.current.getContext("2d");
    if (!ctx) return;

    // Destroy previous chart if exists
    if (radarChartInstanceRef.current) {
      radarChartInstanceRef.current.destroy();
    }

    // Normalize salary to 1-10 scale for radar chart
    const maxSalary = 10000;
    const salary1Normalized = Math.min((company1.salary / maxSalary) * 10, 10);
    const salary2Normalized = Math.min((company2.salary / maxSalary) * 10, 10);

    radarChartInstanceRef.current = new ChartJS(ctx, {
      type: "radar",
      data: {
        labels: ["Lương", "Phúc lợi", "Phát triển", "Cân bằng công việc"],
        datasets: [
          {
            label: company1.name,
            data: [
              salary1Normalized,
              company1.benefits,
              company1.growth,
              company1.workLifeBalance,
            ],
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.25)",
            borderWidth: 2,
            pointBackgroundColor: "rgb(59, 130, 246)",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
          {
            label: company2.name,
            data: [
              salary2Normalized,
              company2.benefits,
              company2.growth,
              company2.workLifeBalance,
            ],
            borderColor: "rgb(168, 85, 247)",
            backgroundColor: "rgba(168, 85, 247, 0.25)",
            borderWidth: 2,
            pointBackgroundColor: "rgb(168, 85, 247)",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          title: {
            display: true,
            text: "So Sánh Chi Tiết (Radar Chart)",
            font: { size: 16, weight: "bold" },
          },
          legend: {
            display: true,
            position: "bottom",
          },
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 10,
            ticks: {
              callback: function (value) {
                return value;
              },
            },
          },
        },
      },
    });
  }, [company1, company2]);

  return (
    <div className="space-y-6">
      {/* Bar Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="relative h-80">
          <canvas ref={barChartRef}></canvas>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">{company1.name}</p>
            <p className="text-2xl font-bold text-blue-600">{score1}</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">{company2.name}</p>
            <p className="text-2xl font-bold text-purple-600">{score2}</p>
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="relative h-80">
          <canvas ref={radarChartRef}></canvas>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Chú thích:</strong> Radar chart hiển thị 4 yếu tố chính.
            Hình dạng càng lớn và gần tâm càng tốt. Lương được normalize (chia
            cho 10000 rồi nhân 10) để so sánh trên scale 1-10.
          </p>
        </div>
      </div>

      {/* Statistics Table */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          📊 Thống Kê Chi Tiết
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="text-left p-3 font-semibold">Tiêu chí</th>
                <th className="text-center p-3 font-semibold text-blue-600">
                  {company1.name}
                </th>
                <th className="text-center p-3 font-semibold text-purple-600">
                  {company2.name}
                </th>
                <th className="text-center p-3 font-semibold">Chênh lệch</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">Lương (USD)</td>
                <td className="text-center p-3">${company1.salary}</td>
                <td className="text-center p-3">${company2.salary}</td>
                <td className="text-center p-3 font-bold text-green-600">
                  ${Math.abs(company1.salary - company2.salary)}
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">Phúc lợi</td>
                <td className="text-center p-3">{company1.benefits}/10</td>
                <td className="text-center p-3">{company2.benefits}/10</td>
                <td className="text-center p-3 font-bold">
                  {company1.benefits > company2.benefits ? "+" : ""}
                  {company1.benefits - company2.benefits}
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">Phát triển</td>
                <td className="text-center p-3">{company1.growth}/10</td>
                <td className="text-center p-3">{company2.growth}/10</td>
                <td className="text-center p-3 font-bold">
                  {company1.growth > company2.growth ? "+" : ""}
                  {company1.growth - company2.growth}
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">Cân bằng công việc</td>
                <td className="text-center p-3">
                  {company1.workLifeBalance}/10
                </td>
                <td className="text-center p-3">
                  {company2.workLifeBalance}/10
                </td>
                <td className="text-center p-3 font-bold">
                  {company1.workLifeBalance > company2.workLifeBalance
                    ? "+"
                    : ""}
                  {company1.workLifeBalance - company2.workLifeBalance}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
