import { Package, Truck, Users, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { StatCard, ProductItem, EmptyProducts } from './DashboardShared';

export default function AdminDashboard({
  products,
  users,
  range,
  onChangeRange,
  onRefresh,
  monthlyData,
  roleStats,
  onOpenProducts
}) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Package} label="Tổng lô sản phẩm" value={products.length} color="bg-blue-500" />
        <StatCard icon={Users} label="Tổng người dùng" value={users.length} color="bg-green-500" />
        <StatCard
          icon={Truck}
          label="Đang vận chuyển"
          value={products.filter((p) => (p.status || p.currentStatus) === 'InTransit').length}
          color="bg-orange-500"
        />
        <StatCard
          icon={CheckCircle}
          label="Đã giao thành công"
          value={products.filter((p) => (p.status || p.currentStatus) === 'Delivered').length}
          color="bg-purple-500"
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Khoảng thời gian:</label>
          <select value={range} onChange={(e) => onChangeRange(e.target.value)} className="px-3 py-2 border rounded-md">
            <option value="3">3 tháng</option>
            <option value="6">6 tháng</option>
            <option value="12">12 tháng</option>
          </select>
        </div>
        <button onClick={onRefresh} className="px-3 py-2 bg-white border rounded-md">Làm mới</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg mb-4">Lô sản phẩm theo tháng</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                labelFormatter={(label) => {
                  const item = monthlyData.find((m) => m.name === label);
                  return item?.label || label;
                }}
                formatter={(value) => [value, 'Số lô']}
              />
              <Line type="monotone" dataKey="products" stroke="#22c55e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg mb-4">Người dùng theo vai trò</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={roleStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="role" />
              <YAxis />
              <Tooltip formatter={(value) => [value, 'Người dùng']} />
              <Bar dataKey="count" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg">Lô gần đây toàn hệ thống</h3>
          <button onClick={onOpenProducts} className="text-sm text-green-700 hover:text-green-800">Xem tất cả</button>
        </div>
        <div className="p-6 space-y-3">
          {products.length === 0
            ? <EmptyProducts message="Chưa có lô sản phẩm nào trong hệ thống" />
            : products.slice(0, 6).map((p) => (
              <ProductItem key={p._id || p.productId} product={p} onClick={onOpenProducts} />
            ))}
        </div>
      </div>
    </>
  );
}
