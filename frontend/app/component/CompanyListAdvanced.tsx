'use client';
import { useState, useMemo } from 'react';
import { usePagination } from '../hooks/usePagination';
import { ChevronLeft, ChevronRight, Search, ArrowUpDown } from 'lucide-react';
import { Company } from '../type/company';
import { TrackView } from '../lib/api';

type SortBy = 'name' | 'salary' | 'overallScore';
type SortOrder = 'asc' | 'desc';

interface CompanyListAdvancedProps {
  companies: Company[];
  itemsPerPage?: number;
  onSelectCompany?: (company: Company) => void; // ← optional callback
}

export default function CompanyListAdvanced({
  companies,
  itemsPerPage = 5,
  onSelectCompany,
}: CompanyListAdvancedProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredCompanies = useMemo(() => {
    return companies.filter(
      (company) =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [companies, searchTerm]);

  const sortedCompanies = useMemo(() => {
    const sorted = [...filteredCompanies];
    sorted.sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.name.toLowerCase().localeCompare(b.name.toLowerCase())
          : b.name.toLowerCase().localeCompare(a.name.toLowerCase());
      } else if (sortBy === 'salary') {
        return sortOrder === 'asc' ? a.salary - b.salary : b.salary - a.salary;
      } else if (sortBy === 'overallScore') {
        return sortOrder === 'asc'
          ? a.overallScore - b.overallScore
          : b.overallScore - a.overallScore;
      }
      return 0;
    });
    return sorted;
  }, [filteredCompanies, sortBy, sortOrder]);

  const {
    currentPage, totalPages, currentItems,
    goToPage, nextPage, prevPage, canGoPrev, canGoNext,
  } = usePagination({ items: sortedCompanies, itemsPerPage });

  const handleSort = (field: SortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Track view + highlight khi click
  const handleCompanyClick = (company: Company) => {
    setSelectedId(company.id);
    TrackView(company.id); // fire-and-forget, không cần await
    onSelectCompany?.(company);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">
          Danh sách Công ty ({companies.length})
        </h2>
        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          Trang {currentPage}/{totalPages}
        </span>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm công ty hoặc ngành..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); goToPage(1); }}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Sort Controls */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {(['name', 'salary', 'overallScore'] as SortBy[]).map((field) => (
          <button
            key={field}
            onClick={() => handleSort(field)}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
              sortBy === field
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ArrowUpDown size={14} />
            {field === 'name' ? 'Tên' : field === 'salary' ? 'Lương' : 'Điểm'}
            {sortBy === field && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
          </button>
        ))}
      </div>

      {/* Company List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {currentItems.length > 0 ? (
          currentItems.map((company) => (
            <div
              key={company.id}
              onClick={() => handleCompanyClick(company)}
              className={`p-3 rounded-lg border-l-4 hover:shadow-md transition cursor-pointer ${
                selectedId === company.id
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-blue-500 bg-gradient-to-r from-blue-50 to-transparent'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{company.name}</p>
                  <p className="text-sm text-gray-600">{company.industry}</p>
                </div>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                  {company.overallScore}
                </span>
              </div>
              <p className="text-xs text-gray-500">Lương: ${company.salary}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Không tìm thấy công ty phù hợp</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between gap-4">
          <button
            onClick={prevPage} disabled={!canGoPrev}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition text-sm font-medium"
          >
            <ChevronLeft size={16} /> Trước
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page} onClick={() => goToPage(page)}
                className={`w-8 h-8 rounded-lg font-semibold transition text-sm ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={nextPage} disabled={!canGoNext}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition text-sm font-medium"
          >
            Sau <ChevronRight size={16} />
          </button>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Hiển thị {currentItems.length} trên {sortedCompanies.length} công ty
          {searchTerm && ` (tìm thấy từ ${companies.length})`}
        </div>
      )}
    </div>
  );
}