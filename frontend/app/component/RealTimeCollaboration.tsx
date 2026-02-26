'use client';
import { useState } from 'react';
import { useCollaboration } from '../hooks/useCollaboration';

export interface Company {
  id: string;
  name: string;
  industry: string;
  scores: {
    culture: number;        // Văn hóa doanh nghiệp & Môi trường làm việc
    growth: number;         // Cơ hội phát triển và Học tập
    reputation: number;     // Danh tiếng và Vị thế công ty
    compensation: number;   // Lương, Phúc lợi và Chính sách
    values: number;         // Sự phù hợp về giá trị
  };
}

const CRITERIA: { key: keyof Company['scores']; label: string; emoji: string }[] = [
  { key: 'culture',      label: 'Văn hóa & Môi trường',        emoji: '🏢' },
  { key: 'growth',       label: 'Phát triển & Học tập',         emoji: '📈' },
  { key: 'reputation',   label: 'Danh tiếng & Vị thế',          emoji: '⭐' },
  { key: 'compensation', label: 'Lương, Phúc lợi & Chính sách', emoji: '💰' },
  { key: 'values',       label: 'Sự phù hợp về giá trị',        emoji: '🎯' },
];

const MOCK_COMPANIES: Company[] = [
  {
    id: 'google', name: 'Google', industry: 'IT',
    scores: { culture: 9, growth: 10, reputation: 10, compensation: 10, values: 9 },
  },
  {
    id: 'meta', name: 'Meta', industry: 'IT',
    scores: { culture: 8, growth: 9, reputation: 8, compensation: 10, values: 7 },
  },
  {
    id: 'amazon', name: 'Amazon', industry: 'IT',
    scores: { culture: 6, growth: 9, reputation: 9, compensation: 9, values: 6 },
  },
  {
    id: 'vingroup', name: 'Vingroup', industry: 'Finance',
    scores: { culture: 7, growth: 8, reputation: 8, compensation: 7, values: 7 },
  },
  {
    id: 'fpt', name: 'FPT', industry: 'IT',
    scores: { culture: 8, growth: 8, reputation: 7, compensation: 7, values: 8 },
  },
];

const totalScore = (c: Company) =>
  Object.values(c.scores).reduce((sum, v) => sum + v, 0);

export default function RealtimeCollaboration() {
  const [sessionId, setSessionId] = useState('');
  const [userName, setUserName] = useState('');
  const [comparisonInput, setComparisonInput] = useState({ company1: '', company2: '' });

  const { sessionData, isConnected, error, joinSession, leaveSession, shareComparison, selectCompany } =
    useCollaboration();

  const handleJoinSession = async () => {
    if (sessionId.trim() && userName.trim()) {
      await joinSession(sessionId, userName);
    }
  };

  const handleShareComparison = () => {
    const c1 = MOCK_COMPANIES.find((c) => c.id === comparisonInput.company1);
    const c2 = MOCK_COMPANIES.find((c) => c.id === comparisonInput.company2);
    if (!c1 || !c2 || c1.id === c2.id) return;
    // Truyền score tổng để backend tính winner
    shareComparison({
      company1: { ...c1, score: totalScore(c1) },
      company2: { ...c2, score: totalScore(c2) },
      sharedAt: new Date().toISOString(),
    });
  };

  const selectedCompanyIds = sessionData?.companies ?? [];

  const renderWinner = () => {
    const cmp = sessionData?.comparison;
    if (!cmp) return null;
    if (cmp.winner === 'draw') return <p className="text-yellow-600 font-semibold">🤝 Hòa!</p>;
    const winner =
      cmp.winner === 'company1' ? cmp.company1 :
      cmp.winner === 'company2' ? cmp.company2 :
      null;
    if (!winner) return <p className="text-gray-400 italic">Chưa xác định</p>;
    return <p className="text-green-700 font-semibold">🏆 {winner.name}</p>;
  };

  if (error) {
    return (
      <div className="p-8 bg-red-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="text-xl text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-linear-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🔄 Real-time Collaboration</h1>
          <p className="text-gray-600">Compare companies with team members in real-time</p>
        </div>

        {!isConnected ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Join a Collaboration Session</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session ID</label>
                <input
                  type="text"
                  placeholder="Enter session ID (e.g., session-123)"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={handleJoinSession}
              disabled={!sessionId.trim() || !userName.trim()}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-semibold"
            >
              ✅ Join Session
            </button>
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">💡 <strong>How it works:</strong></p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Share the same Session ID with team members</li>
                <li>✓ All users see real-time updates</li>
                <li>✓ Compare companies together instantly</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Session Info */}
            <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Session ID</p>
                  <p className="text-2xl font-bold">{sessionData?.sessionId}</p>
                </div>
                <button onClick={leaveSession} className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition">
                  Leave Session
                </button>
              </div>
            </div>

            {/* Active Users */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                👥 Active Users ({sessionData?.users.length || 0})
              </h2>
              {sessionData?.users?.length ? (
                <div className="space-y-2">
                  {sessionData.users.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <span className="inline-block w-3 h-3 bg-green-500 rounded-full" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-600">
                          Joined {new Date(user.joinedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Waiting for users to join...</p>
              )}
            </div>

            {/* Select Company */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">🏢 Select Company</h2>
              <p className="text-sm text-gray-500 mb-4">
                Click a company to add it to the session. All members will see your selection.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MOCK_COMPANIES.map((company) => {
                  const isSelected = selectedCompanyIds.includes(company.id);
                  return (
                    <button
                      key={company.id}
                      onClick={() => selectCompany(company)}
                      className={`p-4 rounded-lg border-2 text-left transition
                        ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-gray-800">{company.name}</p>
                          <p className="text-xs text-gray-500">{company.industry}</p>
                        </div>
                        <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                          {totalScore(company)}/50
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {CRITERIA.map(({ key, label, emoji }) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-xs w-4">{emoji}</span>
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-400 rounded-full transition-all"
                                style={{ width: `${company.scores[key] * 10}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-4 text-right">{company.scores[key]}</span>
                          </div>
                        ))}
                      </div>
                      {isSelected && (
                        <span className="inline-block mt-2 text-xs text-blue-600 font-medium">✅ Selected</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Share Comparison */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">📤 Share Comparison</h2>
              <p className="text-sm text-gray-500 mb-4">
                Chọn 2 công ty để so sánh theo 5 tiêu chí và chia sẻ kết quả với cả team.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {(['company1', 'company2'] as const).map((key, i) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company {i + 1}
                    </label>
                    <select
                      value={comparisonInput[key]}
                      onChange={(e) => setComparisonInput((prev) => ({ ...prev, [key]: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Select --</option>
                      {MOCK_COMPANIES.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Preview bảng so sánh */}
              {comparisonInput.company1 && comparisonInput.company2 &&
               comparisonInput.company1 !== comparisonInput.company2 && (() => {
                const c1 = MOCK_COMPANIES.find((c) => c.id === comparisonInput.company1)!;
                const c2 = MOCK_COMPANIES.find((c) => c.id === comparisonInput.company2)!;
                return (
                  <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden text-sm">
                    <div className="grid grid-cols-3 bg-gray-100 px-4 py-2 font-semibold text-gray-600 text-xs">
                      <span>{c1.name}</span>
                      <span className="text-center">Tiêu chí</span>
                      <span className="text-right">{c2.name}</span>
                    </div>
                    {CRITERIA.map(({ key, label, emoji }) => {
                      const s1 = c1.scores[key];
                      const s2 = c2.scores[key];
                      return (
                        <div key={key} className="grid grid-cols-3 items-center px-4 py-2 border-t border-gray-100">
                          <span className={`font-bold ${s1 > s2 ? 'text-green-600' : s1 < s2 ? 'text-red-500' : 'text-gray-500'}`}>
                            {s1}
                          </span>
                          <span className="text-xs text-center text-gray-500">{emoji} {label}</span>
                          <span className={`font-bold text-right ${s2 > s1 ? 'text-green-600' : s2 < s1 ? 'text-red-500' : 'text-gray-500'}`}>
                            {s2}
                          </span>
                        </div>
                      );
                    })}
                    <div className="grid grid-cols-3 items-center px-4 py-2.5 border-t-2 border-gray-200 bg-gray-50 font-bold">
                      <span className={totalScore(c1) >= totalScore(c2) ? 'text-green-600' : 'text-gray-500'}>
                        {totalScore(c1)}
                      </span>
                      <span className="text-xs text-center text-gray-500">Tổng điểm</span>
                      <span className={`text-right ${totalScore(c2) >= totalScore(c1) ? 'text-green-600' : 'text-gray-500'}`}>
                        {totalScore(c2)}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <button
                onClick={handleShareComparison}
                disabled={
                  !comparisonInput.company1 ||
                  !comparisonInput.company2 ||
                  comparisonInput.company1 === comparisonInput.company2
                }
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition font-semibold"
              >
                📤 Share Comparison with Team
              </button>

              {comparisonInput.company1 === comparisonInput.company2 && comparisonInput.company1 !== '' && (
                <p className="text-xs text-red-500 mt-2">Please select two different companies.</p>
              )}
            </div>

            {/* Shared Comparison Result */}
            {sessionData?.comparison && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Shared Comparison</h2>
                <div className="bg-linear-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                  <p className="text-gray-800 mb-3">
                    <strong>Comparing:</strong>{' '}
                    {sessionData.comparison.company1?.name} vs {sessionData.comparison.company2?.name}
                  </p>
                  <div>
                    <p className="text-sm text-gray-600 mb-1"><strong>Winner:</strong></p>
                    {renderWinner()}
                  </div>
                  {sessionData.comparison.sharedAt && (
                    <p className="text-xs text-gray-400 mt-3">
                      Shared at {new Date(sessionData.comparison.sharedAt).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Session Status */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📌 Session Status</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Users in Session</p>
                  <p className="text-2xl font-bold text-blue-600">{sessionData?.users.length || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Companies Selected</p>
                  <p className="text-2xl font-bold text-green-600">{sessionData?.companies.length || 0}</p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}