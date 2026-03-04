"use client";
import { useState, useEffect, useCallback } from "react";
import CompanyForm from "./component/CompanyForm";
import ComparisonTable from "./component/ComparisonTable";
import ComparisonChart from "./component/ComparisonChart";
import AIRecommendations from "./component/AIRecommendations";
import AnalyticsDashboard from "./component/AnalyticsDashboard";
import SalaryComparison from "./component/SalaryComparison";
import RealtimeCollaboration from "./component/RealTimeCollaboration";
import { Company, Comparison } from "./type/company";
import CompanyListAdvanced from "./component/CompanyListAdvanced";
import { GetCompany, CompareCompany, AddCompany } from "./lib/api";
import {
  BarChart2,
  Bot,
  DollarSign,
  GitCompare,
  Layers,
  Loader2,
  PieChart,
  Scale,
  Users,
} from "lucide-react";

type TabType =
  | "table"
  | "chart"
  | "ai"
  | "analytics"
  | "salary"
  | "collaboration";

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [selectedCompany1, setSelectedCompany1] = useState<Company | null>(
    null,
  );
  const [selectedCompany2, setSelectedCompany2] = useState<Company | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("table");

  // useCallback để function không bị tạo mới mỗi lần render
  const fetchCompanies = useCallback(async () => {
    try {
      const data = await GetCompany();
      setCompanies(data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  }, []); // dependency rỗng — function không thay đổi

  useEffect(() => {
    fetchCompanies();
    // Không dùng polling interval — fetch lại sau khi add/compare thủ công
  }, [fetchCompanies]);

  const handleAddCompany = useCallback(
    async (formData: any) => {
      try {
        const res = await AddCompany(formData);
        if (res.ok) {
          await fetchCompanies();
        }
      } catch (error) {
        console.error("Error adding company:", error);
      }
    },
    [fetchCompanies],
  );

  const handleCompare = useCallback(async () => {
    if (!selectedCompany1 || !selectedCompany2) {
      alert("Vui lòng chọn 2 công ty để so sánh");
      return;
    }
    if (selectedCompany1.id === selectedCompany2.id) {
      alert("Vui lòng chọn 2 công ty khác nhau");
      return;
    }
    if (
      selectedCompany1.industry.toLocaleUpperCase() !==
      selectedCompany2.industry.toLocaleUpperCase()
    ) {
      alert(
        `Vui lòng chọn 2 công ty cùng ngành để so sánh (${selectedCompany1.industry} vs ${selectedCompany2.industry})`,
      );
      return;
    }

    setLoading(true);
    try {
      const res = await CompareCompany(
        selectedCompany1.id,
        selectedCompany2.id,
      );
      if (res.ok) {
        const data = await res.json();
        setComparison(data);
        setActiveTab("table");
      } else {
        const err = await res.json();
        alert(err.message || "Có lỗi xảy ra khi so sánh");
      }
    } catch (error) {
      console.error("Error comparing companies:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCompany1, selectedCompany2]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
           <div className="flex items-center gap-2"> <Layers /> Company Comparison System</div>
          </h1>
          <p className="text-gray-600">
            So sánh công ty để lựa chọn công việc phù hợp nhất
          </p>
        </div>

        {/* Main Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-lg p-2 flex gap-2 mb-8 flex-wrap">
          {(
            [
              {
                key: "table",
                label: "So Sánh",
                icon: <GitCompare size={16} />,
              },
              { key: "chart", label: "Biểu Đồ", icon: <BarChart2 size={16} /> },
              { key: "ai", label: "AI Gợi Ý", icon: <Bot size={16} /> },
              {
                key: "analytics",
                label: "Analytics",
                icon: <PieChart size={16} />,
              },
              {
                key: "salary",
                label: "Salary",
                icon: <DollarSign size={16} />,
              },
              {
                key: "collaboration",
                label: "Collaboration",
                icon: <Users size={16} />,
              },
            ] as { key: TabType; label: string; icon: React.ReactNode }[]
          ).map(({ key, label,icon  }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`py-2 px-4 rounded-lg font-semibold transition ${
                activeTab === key
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {" "}
              <div className="flex items-center gap-1">
              {icon}
              {label}
              </div>
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "table" ||
        activeTab === "chart" ||
        activeTab === "ai" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <CompanyForm onSubmit={handleAddCompany} />

              <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
                <h2 className="text-xl font-bold mb-4">So sánh 2 Công ty</h2>
                <div className="space-y-4">
                  {(["1", "2"] as const).map((n) => (
                    <div key={n}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Công ty {n}
                      </label>
                      <select
                        value={
                          n === "1"
                            ? (selectedCompany1?.id ?? "")
                            : (selectedCompany2?.id ?? "")
                        }
                        onChange={(e) => {
                          const company =
                            companies.find((c) => c.id === e.target.value) ??
                            null;
                          n === "1"
                            ? setSelectedCompany1(company)
                            : setSelectedCompany2(company);
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">-- Chọn công ty --</option>
                        {companies.map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.name} ({company.industry})
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}

                  <button
                    onClick={handleCompare}
                    disabled={loading || !selectedCompany1 || !selectedCompany2}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                   {loading ? (
                      <><Loader2 size={18} className="animate-spin" /> Đang so sánh...</>
                    ) : (
                      <div className="flex items-center justify-center gap-2"><Scale size={18} /> So sánh</div>
                    )}
                  </button>
                </div>
              </div>

              <CompanyListAdvanced companies={companies} itemsPerPage={5} />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeTab === "table" &&
                (comparison ? (
                  <ComparisonTable comparison={comparison} />
                ) : (
                  <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    <p className="text-gray-500 text-lg">
                      📋 Chọn 2 công ty từ bên cạnh để xem bảng so sánh
                    </p>
                  </div>
                ))}

              {activeTab === "chart" &&
                (comparison ? (
                  <ComparisonChart comparison={comparison} />
                ) : (
                  <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    <p className="text-gray-500 text-lg">
                      📊 Chọn 2 công ty từ bên cạnh để xem biểu đồ
                    </p>
                  </div>
                ))}

              {activeTab === "ai" && (
                <AIRecommendations
                  onSelectCompany={(id) => {
                    const company = companies.find((c) => c.id === id) ?? null;
                    setSelectedCompany1(company);
                  }}
                />
              )}
            </div>
          </div>
        ) : activeTab === "analytics" ? (
          <AnalyticsDashboard />
        ) : activeTab === "salary" ? (
          <SalaryComparison />
        ) : activeTab === "collaboration" ? (
          <RealtimeCollaboration />
        ) : null}
      </div>
    </main>
  );
}
