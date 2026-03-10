import { useAuth } from '../contexts/AuthContext';
import { storageService } from '../services/storage';
import { Package, Truck, Store, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();

  const products = storageService.getProducts();
  const users = storageService.getUsers();
  const supplyChainSteps = storageService.getSupplyChainSteps();
  const blockchainTxs = storageService.getBlockchainTransactions();

  // Mock chart data
  const monthlyData = [
    { name: 'T1', products: 12 },
    { name: 'T2', products: 19 },
    { name: 'T3', products: 15 },
    { name: 'T4', products: 25 },
    { name: 'T5', products: 22 },
    { name: 'T6', products: 30 },
  ];

  const roleStats = [
    { role: 'Nhà SX', count: users.filter(u => u.role === 'producer').length },
    { role: 'Vận chuyển', count: users.filter(u => u.role === 'transporter').length },
    { role: 'Cửa hàng', count: users.filter(u => u.role === 'store').length },
    { role: 'Tiêu dùng', count: users.filter(u => u.role === 'consumer').length },
  ];

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{label}</p>
          <p className="text-3xl">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Chào mừng, {user?.name}! 👋</h1>
        <p className="text-gray-600">Tổng quan hệ thống truy xuất nguồn gốc thực phẩm</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Package}
          label="Tổng sản phẩm"
          value={products.length}
          color="bg-blue-500"
        />
        <StatCard
          icon={Users}
          label="Người dùng"
          value={users.length}
          color="bg-green-500"
        />
        <StatCard
          icon={Truck}
          label="Bước chuỗi cung ứng"
          value={supplyChainSteps.length}
          color="bg-orange-500"
        />
        <StatCard
          icon={CheckCircle}
          label="Blockchain TXs"
          value={blockchainTxs.length}
          color="bg-purple-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg mb-4">Sản phẩm theo tháng</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
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
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-xl shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg">Sản phẩm gần đây</h3>
        </div>
        <div className="p-6">
          {products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Chưa có sản phẩm nào trong hệ thống</p>
              <p className="text-sm mt-1">Nhà sản xuất có thể tạo sản phẩm mới</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.producerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm inline-block">
                      {product.currentStatus}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(product.productionDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl shadow p-6 text-white">
        <h3 className="text-xl mb-2">Bắt đầu ngay!</h3>
        <p className="mb-4 opacity-90">
          {user?.role === 'producer' && 'Tạo sản phẩm mới và ghi nhận lên blockchain'}
          {user?.role === 'transporter' && 'Cập nhật trạng thái vận chuyển cho sản phẩm'}
          {user?.role === 'store' && 'Quản lý sản phẩm và cập nhật trạng thái bán lẻ'}
          {user?.role === 'consumer' && 'Quét mã QR để truy xuất nguồn gốc sản phẩm'}
          {user?.role === 'admin' && 'Quản lý toàn bộ hệ thống và theo dõi blockchain'}
        </p>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-colors">
            Tìm hiểu thêm
          </button>
        </div>
      </div>
    </div>
  );
}
