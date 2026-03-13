import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { productAPI, authAPI } from '../services/apiService';
import { Package, Truck, Store, Users, TrendingUp, CheckCircle, Plus, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [range, setRange] = useState('6'); // months: '3','6','12'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const productsRes = await productAPI.getAllProducts();
      if (productsRes.success) {
        setProducts(productsRes.data);
      }

      // Fetch users (only for admin)
      if (user?.role === 'ADMIN') {
        const usersRes = await authAPI.getAllUsers();
        if (usersRes.success) {
          setUsers(usersRes.data);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthlyProductData = (monthsCount = 6) => {
    const now = new Date();
    const months = [];

    for (let i = monthsCount - 1; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const monthLabel = new Intl.DateTimeFormat('vi-VN', { month: 'short', year: 'numeric' }).format(date);
      months.push({
        key,
        name: `T${date.getMonth() + 1}`,
        label: monthLabel,
        products: 0,
      });
    }

    products.forEach((product) => {
      if (!product?.createdAt) return;
      const createdAt = new Date(product.createdAt);
      const monthKey = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
      const targetMonth = months.find((month) => month.key === monthKey);
      if (targetMonth) targetMonth.products += 1;
    });

    return months.map(({ key, ...month }) => month);
  };

  const monthlyData = useMemo(() => getMonthlyProductData(Number(range)), [products, range]);

  const roleStats = [
    { role: 'Admin', count: users.filter(u => u.role === 'ADMIN').length },
    { role: 'Nhà SX', count: users.filter(u => u.role === 'MANUFACTURER').length },
    { role: 'Vận chuyển', count: users.filter(u => u.role === 'TRANSPORTER').length },
    { role: 'Cửa hàng', count: users.filter(u => u.role === 'STORE').length },
    { role: 'Tiêu dùng', count: users.filter(u => u.role === 'CONSUMER').length },
  ];

  const refreshData = async () => {
    await fetchData();
  };

  const getQuickAction = () => {
    switch (user?.role) {
      case 'MANUFACTURER':
        return {
          text: 'Tạo sản phẩm mới và ghi nhận lên blockchain',
          buttonText: 'Tạo sản phẩm',
          onClick: () => navigate('/create-product')
        };
      case 'TRANSPORTER':
        return {
          text: 'Cập nhật trạng thái vận chuyển cho sản phẩm',
          buttonText: 'Quản lý vận chuyển',
          onClick: () => navigate('/transport')
        };
      case 'STORE':
        return {
          text: 'Quản lý sản phẩm và cập nhật trạng thái bán lẻ',
          buttonText: 'Xem sản phẩm',
          onClick: () => navigate('/store-products')
        };
      case 'CONSUMER':
        return {
          text: 'Quét mã QR để truy xuất nguồn gốc sản phẩm',
          buttonText: 'Quét QR',
          onClick: () => navigate('/scan')
        };
      case 'ADMIN':
        return {
          text: 'Quản lý toàn bộ hệ thống và theo dõi blockchain',
          buttonText: 'Quản lý người dùng',
          onClick: () => navigate('/users')
        };
      default:
        return {
          text: 'Khám phá hệ thống truy xuất nguồn gốc thực phẩm',
          buttonText: 'Tìm hiểu thêm',
          onClick: () => {}
        };
    }
  };

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

  const quickAction = getQuickAction();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Chào mừng, {user?.username || user?.name}! 👋</h1>
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
          value={user?.role === 'ADMIN' ? users.length : '-'}
          color="bg-green-500"
        />
        <StatCard
          icon={Truck}
          label="Sản phẩm đang vận chuyển"
          value={products.filter(p => p.status === 'InTransit').length}
          color="bg-orange-500"
        />
        <StatCard
          icon={CheckCircle}
          label="Sản phẩm đã giao"
          value={products.filter(p => p.status === 'Delivered').length}
          color="bg-purple-500"
        />
      </div>

      {/* Controls + Charts */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Khoảng thời gian:</label>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="3">3 tháng</option>
            <option value="6">6 tháng</option>
            <option value="12">12 tháng</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={refreshData} className="px-3 py-2 bg-white border rounded-md">Làm mới</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg mb-4">Sản phẩm theo tháng</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                labelFormatter={(label, payload) => {
                  const item = monthlyData.find(m => m.name === label);
                  return item?.label || label;
                }}
                formatter={(value, name) => [value, 'Số sản phẩm']}
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
                  key={product._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/products`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.producer?.name || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-sm inline-block ${
                      product.status === 'Produced' ? 'bg-blue-100 text-blue-700' :
                      product.status === 'InTransit' ? 'bg-orange-100 text-orange-700' :
                      product.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {product.status === 'Produced' ? 'Đã sản xuất' :
                       product.status === 'InTransit' ? 'Đang vận chuyển' :
                       product.status === 'Delivered' ? 'Đã giao' :
                       product.status}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(product.createdAt).toLocaleDateString('vi-VN')}
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
          {quickAction.text}
        </p>
        <div className="flex gap-3">
          <button 
            onClick={quickAction.onClick}
            className="px-6 py-2 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            {quickAction.buttonText}
          </button>
          {products.length > 0 && (
            <button 
              onClick={() => navigate('/products')}
              className="px-6 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              Xem tất cả sản phẩm
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
