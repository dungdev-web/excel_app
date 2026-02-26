'use client';
import { useAnalytics } from '../hooks/useAnalytics';

export default function AnalyticsDashboard() {
  const { data, loading, error, refetch } = useAnalytics();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-600">Failed to load analytics</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📊 Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time insights about companies and comparisons
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-600 text-sm mb-2">Total Companies</p>
            <p className="text-3xl font-bold text-blue-600">
              {data.totalCompanies}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-600 text-sm mb-2">Comparisons Made</p>
            <p className="text-3xl font-bold text-purple-600">
              {data.totalComparisons}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-600 text-sm mb-2">Average Salary</p>
            <p className="text-3xl font-bold text-green-600">
              ${data.avgSalary}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-600 text-sm mb-2">Industries</p>
            <p className="text-3xl font-bold text-orange-600">
              {Object.keys(data.industryDistribution).length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Companies */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🏆 Top Companies by Views
            </h2>
            <div className="space-y-3">
              {data.topCompanies.map((company, idx) => (
                <div
                  key={company.id}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-blue-600">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {company.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Score: {company.score.toFixed(1)}/100
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-700">
                      {company.views}
                    </p>
                    <p className="text-xs text-gray-500">views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Industry Average Scores */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              📈 Industry Average Scores
            </h2>
            <div className="space-y-3">
              {data.industryAverages.map((industry) => (
                <div key={industry.industry} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <p className="font-semibold text-gray-800">
                        {industry.industry}
                      </p>
                      <p className="text-sm text-gray-600">
                        {industry.avgScore}/100
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        style={{
                          width: `${(industry.avgScore / 100) * 100}%`
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {industry.count} companies
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Industry Distribution */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🏢 Industry Distribution
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(data.industryDistribution).map(
              ([industry, count]) => (
                <div key={industry} className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg">
                  <p className="text-gray-700 font-semibold mb-2">
                    {industry}
                  </p>
                  <p className="text-3xl font-bold text-blue-600">{count}</p>
                  <p className="text-xs text-gray-600 mt-1">companies</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="text-center mt-8">
          <button
            onClick={refetch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}