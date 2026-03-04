'use client';
import { useState } from 'react';
import AutocompleteInputEnhanced from './AutocompleteInputEnhanced';
import { Landmark, Plus, Briefcase, TrendingUp, MapPin } from 'lucide-react';
import { INDUSTRIES, getRolesByIndustry, LEVELS, COMPANY_POSITIONS } from '../lib/contants';

interface FormData {
  name: string;
  industry: string;
  role: string;
  level: string;
  position: string;
  salary: number;
  benefits: number;
  growth: number;
  workLifeBalance: number;
}

export default function CompanyForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const [industries, setIndustries] = useState<string[]>(INDUSTRIES);
  const [roles, setRoles] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    industry: '',
    role: '',
    level: '',
    position: '',
    salary: 5000,
    benefits: 7,
    growth: 7,
    workLifeBalance: 7,
  });

  const handleIndustryChange = (value: string) => {
    setFormData({ ...formData, industry: value, role: '' });
    setRoles(getRolesByIndustry(value));
  };

  const handleAddIndustry = (v: string) => {
    if (!industries.includes(v)) setIndustries([...industries, v]);
  };

  const handleAddRole = (v: string) => {
    if (!roles.includes(v)) setRoles([...roles, v]);
  };

  const set = (key: keyof FormData) => (value: string | number) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.industry && formData.role && formData.level && formData.position) {
      onSubmit(formData);
      setFormData({ name: '', industry: '', role: '', level: '', position: '', salary: 5000, benefits: 7, growth: 7, workLifeBalance: 7 });
      setRoles([]);
    }
  };

  const isValid = formData.name && formData.industry && formData.role && formData.level && formData.position;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">
        <div className="flex items-center gap-2"><Plus /> Thêm Công Ty</div>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tên công ty</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => set('name')(e.target.value)}
            placeholder="Nhập tên công ty..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Industry */}
        <AutocompleteInputEnhanced
          label="Ngành nghề"
          value={formData.industry}
          options={industries}
          onChange={handleIndustryChange}
          onCustomAdd={handleAddIndustry}
          placeholder="Nhập ngành nghề..."
          allowCustom={true}
          icon={<Landmark size={20} />}
        />

        {/* Role — chỉ hiện sau khi chọn industry */}
        {formData.industry ? (
          <AutocompleteInputEnhanced
            label="Vị trí / Role"
            value={formData.role}
            options={roles}
            onChange={set('role')}
            onCustomAdd={handleAddRole}
            placeholder={roles.length > 0 ? `Tìm trong ${roles.length} vị trí...` : 'Nhập vị trí mới...'}
            allowCustom={true}
            icon={<Briefcase size={20} />}
          />
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Vị trí / Role</label>
            <div className="w-full p-3 border border-dashed border-gray-200 rounded-lg bg-gray-50 text-gray-400 text-sm">
              Chọn ngành nghề trước
            </div>
          </div>
        )}

        {/* Level */}
        <AutocompleteInputEnhanced
          label="Cấp bậc kinh nghiệm"
          value={formData.level}
          options={LEVELS}
          onChange={set('level')}
          placeholder="Intern / Fresher / Junior..."
          allowCustom={false}
          icon={<TrendingUp size={20} />}
        />

        {/* Company Position */}
        <AutocompleteInputEnhanced
          label="Hình thức làm việc"
          value={formData.position}
          options={COMPANY_POSITIONS}
          onChange={set('position')}
          placeholder="Toàn thời gian / Remote / Hybrid..."
          allowCustom={false}
          icon={<MapPin size={20} />}
        />

        {/* Salary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lương (${formData.salary.toLocaleString()}/tháng)
          </label>
          <input
            type="range" min="1000" max="15000" step="500"
            value={formData.salary}
            onChange={(e) => set('salary')(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Benefits */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phúc lợi: {formData.benefits}/10
          </label>
          <input
            type="range" min="1" max="10"
            value={formData.benefits}
            onChange={(e) => set('benefits')(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Growth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phát triển: {formData.growth}/10
          </label>
          <input
            type="range" min="1" max="10"
            value={formData.growth}
            onChange={(e) => set('growth')(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Work-Life Balance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cân bằng: {formData.workLifeBalance}/10
          </label>
          <input
            type="range" min="1" max="10"
            value={formData.workLifeBalance}
            onChange={(e) => set('workLifeBalance')(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <button
          type="submit"
          disabled={!isValid}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
        >
          <div className="flex items-center justify-center gap-2"><Plus /> Thêm Công Ty</div>
        </button>
      </form>
    </div>
  );
}