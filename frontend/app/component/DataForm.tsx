'use client';
import { useState, useEffect } from 'react';
import { Data } from '../type/Data';
export default function DataForm() {
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Lấy dữ liệu từ API
  useEffect(() => {
    fetchData();
    // Poll mỗi 2 giây để cập nhật real-time
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    const res = await fetch('http://localhost:3000/api/data');
    const result = await res.json();
    setData(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch('http://localhost:3000/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (res.ok) {
      setFormData({ name: '', email: '', phone: '' });
      fetchData(); // Cập nhật danh sách ngay
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Nhập dữ liệu</h1>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-gray-100 p-6 rounded mb-6">
        <input
          type="text"
          placeholder="Tên"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="block w-full mb-3 p-2 border rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="block w-full mb-3 p-2 border rounded"
          required
        />
        <input
          type="tel"
          placeholder="Điện thoại"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          className="block w-full mb-3 p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Lưu dữ liệu
        </button>
      </form>

      {/* Hiển thị dữ liệu */}
      <div>
        <h2 className="text-xl font-bold mb-4">Danh sách dữ liệu</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Tên</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Điện thoại</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item:Data) => (
              <tr key={item.id}>
                <td className="border p-2">{item.name}</td>
                <td className="border p-2">{item.email}</td>
                <td className="border p-2">{item.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}