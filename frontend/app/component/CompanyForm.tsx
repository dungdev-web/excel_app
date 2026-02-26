'use client';
import { useState } from 'react';
import AutocompleteInputEnhanced from './AutocompleteInputEnhanced';
import { Landmark } from 'lucide-react';
const DEFAULT_INDUSTRIES = [
  'IT', 'Finance', 'HR', 'Sales', 'Marketing', 'Engineering',
  'Manufacturing', 'Retail', 'Healthcare', 'Education'
];

interface FormData {
  name: string;
  industry: string;
  salary: number;
  benefits: number;
  growth: number;
  workLifeBalance: number;
}

export default function CompanyForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const [industries, setIndustries] = useState<string[]>(DEFAULT_INDUSTRIES);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    industry: '',
    salary: 5000,
    benefits: 7,
    growth: 7,
    workLifeBalance: 7
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.industry) {
      onSubmit(formData);
      setFormData({
        name: '',
        industry: '',
        salary: 5000,
        benefits: 7,
        growth: 7,
        workLifeBalance: 7
      });
    }
  };

  const handleAddIndustry = (newIndustry: string) => {
    if (!industries.includes(newIndustry)) {
      setIndustries([...industries, newIndustry]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">➕ Thêm Công Ty</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên công ty
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Nhập tên công ty..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Industry - Autocomplete */}
        <AutocompleteInputEnhanced
          label="Ngành nghề"
          value={formData.industry}
          options={industries}
          onChange={(value) => setFormData({...formData, industry: value})}
          onCustomAdd={handleAddIndustry}
          placeholder="Nhập ngành nghề..."
          allowCustom={true}
          icon={<Landmark size={20} />}
        />

        {/* Salary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lương (${formData.salary}/tháng)
          </label>
          <input
            type="range"
            min="1000"
            max="15000"
            step="500"
            value={formData.salary}
            onChange={(e) => setFormData({...formData, salary: parseInt(e.target.value)})}
            className="w-full"
          />
        </div>

        {/* Benefits */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phúc lợi: {formData.benefits}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.benefits}
            onChange={(e) => setFormData({...formData, benefits: parseInt(e.target.value)})}
            className="w-full"
          />
        </div>

        {/* Growth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phát triển: {formData.growth}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.growth}
            onChange={(e) => setFormData({...formData, growth: parseInt(e.target.value)})}
            className="w-full"
          />
        </div>

        {/* Work-Life Balance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cân bằng: {formData.workLifeBalance}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.workLifeBalance}
            onChange={(e) => setFormData({...formData, workLifeBalance: parseInt(e.target.value)})}
            className="w-full"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!formData.name || !formData.industry}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
        >
          ➕ Thêm Công Ty
        </button>
      </form>
    </div>
  );
}