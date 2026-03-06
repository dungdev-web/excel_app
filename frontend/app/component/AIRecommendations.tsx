"use client";
import { useState } from "react";
import { GetRecommendations, GetInsight, TrackAI } from "../lib/api";
import {
  Bot,
  Settings,
  Lightbulb,
  Goal,
  CircleDollarSign,
  Gift,
  Loader,
  Landmark,
  ChartNoAxesCombined,
  Scale,
  ChartColumnDecreasing,
  Cpu,
  Zap,
} from "lucide-react";
import { INDUSTRIES } from "../lib/contants";
import AutocompleteInputEnhanced from "./AutocompleteInputEnhanced";

interface RecommendationResult {
  company: any;
  score: number;
  reason: string;
  matchPercentage: number;
  // ML fields
  contentScore?: number;
  collaborativeScore?: number;
  usedML?: boolean;
}

interface AIRecommendationsProps {
  onSelectCompany?: (companyId: string) => void;
}

export default function AIRecommendations({
  onSelectCompany,
}: AIRecommendationsProps) {
  const [industries, setIndustries] = useState<string[]>(INDUSTRIES);
  const [preferences, setPreferences] = useState({
    prioritizeSalary: 5,
    prioritizeBenefits: 5,
    prioritizeGrowth: 5,
    prioritizeWorkLifeBalance: 5,
    industryPreference: "",
    minSalary: 0,
    maxSalary: 15000,
  });

  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"preferences" | "recommendations" | "insight">("preferences");
  const [error, setError] = useState<string | null>(null);
  const [usedML, setUsedML] = useState(false);

  const handleGetRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await GetRecommendations(preferences);
      setRecommendations(data.recommendations);
      setUsedML(data.usedML ?? false);
      // Track view cho tất cả công ty được gợi ý
      data.recommendations?.forEach((rec: RecommendationResult) => {
        TrackAI(rec.company.id, 'view');
      });
      setActiveTab("recommendations");
    } catch (error) {
      console.error("Error getting recommendations:", error);
      setError("Lỗi lấy gợi ý. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleGetInsight = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await GetInsight(preferences);
      setInsight(data.insight);
      setActiveTab("insight");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddIndustry = (newIndustry: string) => {
    if (!industries.includes(newIndustry)) {
      setIndustries([...industries, newIndustry]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-lg p-2 flex gap-2">
        <button
          onClick={() => setActiveTab("preferences")}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
            activeTab === "preferences"
              ? "bg-purple-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            <Settings /> Tùy Chọn
          </div>
        </button>
        <button
          onClick={() => setActiveTab("recommendations")}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
            activeTab === "recommendations"
              ? "bg-purple-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            <Bot /> Gợi Ý
          </div>
        </button>
        <button
          onClick={() => setActiveTab("insight")}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
            activeTab === "insight"
              ? "bg-purple-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            <Lightbulb /> Phân Tích
          </div>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            <div className="flex items-center gap-3">
              <Goal /> Tùy Chọn Của Bạn
            </div>
          </h2>

          <div className="space-y-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <CircleDollarSign size={15} /> Ưu tiên Lương: {preferences.prioritizeSalary}/10
                </div>
              </label>
              <input type="range" min="1" max="10"
                value={preferences.prioritizeSalary}
                onChange={(e) => setPreferences({ ...preferences, prioritizeSalary: parseInt(e.target.value) })}
                className="w-full h-2 bg-green-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Gift size={15} /> Ưu tiên Phúc lợi: {preferences.prioritizeBenefits}/10
                </div>
              </label>
              <input type="range" min="1" max="10"
                value={preferences.prioritizeBenefits}
                onChange={(e) => setPreferences({ ...preferences, prioritizeBenefits: parseInt(e.target.value) })}
                className="w-full h-2 bg-blue-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <ChartNoAxesCombined size={15} /> Ưu tiên Phát triển: {preferences.prioritizeGrowth}/10
                </div>
              </label>
              <input type="range" min="1" max="10"
                value={preferences.prioritizeGrowth}
                onChange={(e) => setPreferences({ ...preferences, prioritizeGrowth: parseInt(e.target.value) })}
                className="w-full h-2 bg-yellow-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Scale size={15} /> Ưu tiên Cân bằng: {preferences.prioritizeWorkLifeBalance}/10
                </div>
              </label>
              <input type="range" min="1" max="10"
                value={preferences.prioritizeWorkLifeBalance}
                onChange={(e) => setPreferences({ ...preferences, prioritizeWorkLifeBalance: parseInt(e.target.value) })}
                className="w-full h-2 bg-purple-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lương tối thiểu</label>
              <input type="number" value={preferences.minSalary}
                onChange={(e) => setPreferences({ ...preferences, minSalary: parseInt(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="$"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lương tối đa</label>
              <input type="number" value={preferences.maxSalary}
                onChange={(e) => setPreferences({ ...preferences, maxSalary: parseInt(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="$"
              />
            </div>
          </div>

          <div className="mb-6">
            <AutocompleteInputEnhanced
              label="Ngành ưu thích"
              value={preferences.industryPreference}
              options={industries}
              onChange={(value) => setPreferences({ ...preferences, industryPreference: value })}
              onCustomAdd={handleAddIndustry}
              placeholder="Nhập ngành ưu thích..."
              allowCustom={true}
              icon={<Landmark size={20} />}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={handleGetRecommendations} disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-blue-600 text-white font-bold py-3 rounded-lg hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader size={20} className="animate-spin" /><span>Đang xử lý...</span></> : <><Bot size={20} /><span>Gợi Ý</span></>}
            </button>
            <button onClick={handleGetInsight} disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader size={20} className="animate-spin" /><span>Đang xử lý...</span></> : <><Lightbulb size={20} /><span>Phân tích</span></>}
            </button>
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === "recommendations" && (
        <div className="space-y-4">
          {recommendations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <p className="text-gray-500">Chưa có gợi ý. Click "Gợi Ý" để xem công ty phù hợp</p>
            </div>
          ) : (
            <>
              {/* Header banner — hiện engine đang dùng */}
              <div className={`rounded-lg shadow-lg p-4 ${usedML ? "bg-gradient-to-r from-purple-100 to-blue-100" : "bg-gradient-to-r from-gray-100 to-slate-100"}`}>
                <div className="flex items-center justify-between">
                  <p className={`font-semibold ${usedML ? "text-purple-800" : "text-gray-700"}`}>
                    ✨ Tìm thấy {recommendations.length} công ty phù hợp
                  </p>
                  {/* Badge engine */}
                  {usedML ? (
                    <span className="flex items-center gap-1 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      <Cpu size={12} /> Hybrid ML
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      <Zap size={12} /> Weighted Score
                    </span>
                  )}
                </div>
              </div>

              {recommendations.map((rec, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-gray-800">{rec.company.name}</h3>
                        {/* Rank badge */}
                        {idx === 0 && <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">🥇 #1</span>}
                        {idx === 1 && <span className="bg-gray-300 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">🥈 #2</span>}
                        {idx === 2 && <span className="bg-orange-300 text-orange-800 text-xs font-bold px-2 py-0.5 rounded-full">🥉 #3</span>}
                      </div>
                      <p className="text-sm text-gray-600">{rec.company.industry}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-purple-600">{rec.matchPercentage}%</div>
                      <p className="text-sm text-gray-600">Độ phù hợp</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(rec.matchPercentage, 100)}%` }}
                    />
                  </div>

                  {/* Reason */}
                  <p className="text-gray-700 mb-4">{rec.reason}</p>

                  {/* ML Score breakdown — chỉ hiện khi dùng ML */}
                  {rec.usedML && rec.contentScore !== undefined && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                      <p className="text-xs font-bold text-purple-700 mb-2 flex items-center gap-1">
                        <Cpu size={12} /> ML Score Breakdown
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-purple-800">
                        <div>
                          Content-Based:{" "}
                          <span className="font-bold">{((rec.contentScore ?? 0) * 100).toFixed(1)}%</span>
                        </div>
                        <div>
                          Collaborative:{" "}
                          <span className="font-bold">{((rec.collaborativeScore ?? 0) * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Company Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-xs text-gray-600">Lương</p>
                      <p className="font-bold text-green-600">${rec.company.salary}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-xs text-gray-600">Phúc lợi</p>
                      <p className="font-bold text-blue-600">{rec.company.benefits}/10</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded">
                      <p className="text-xs text-gray-600">Phát triển</p>
                      <p className="font-bold text-yellow-600">{rec.company.growth}/10</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <p className="text-xs text-gray-600">Cân bằng</p>
                      <p className="font-bold text-purple-600">{rec.company.workLifeBalance}/10</p>
                    </div>
                  </div>

                  {onSelectCompany && (
                    <button
                      onClick={() => {
                        onSelectCompany(rec.company.id);
                        TrackAI(rec.company.id, 'save'); // feed data cho Collaborative Filtering
                      }}
                      className="w-full bg-purple-500 text-white font-bold py-2 rounded-lg hover:bg-purple-600"
                    >
                      ✅ Chọn công ty này
                    </button>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Insight Tab */}
      {activeTab === "insight" && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          {insight ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  <div className="flex items-center gap-2">
                    <ChartColumnDecreasing /> Phân Tích AI
                  </div>
                </h2>
                <p className="text-gray-800 whitespace-pre-line">{insight}</p>
              </div>
              <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded">
                <h3 className="font-bold text-purple-900 mb-2">💡 Gợi Ý Hành Động</h3>
                <ul className="space-y-2 text-sm text-purple-800">
                  <li>✅ Ưu tiên công ty IT/Tech nếu bạn muốn phát triển kỹ năng nhanh</li>
                  <li>✅ Tìm công ty có lương $5000 nếu bạn ưu tiên tài chính</li>
                  <li>✅ Đừng quên cân bằng: Lương cao không bằng sức khỏe tâm thần</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <p className="text-gray-500">Nhấp vào tab "Tùy Chọn" rồi click "Phân Tích" để xem</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}