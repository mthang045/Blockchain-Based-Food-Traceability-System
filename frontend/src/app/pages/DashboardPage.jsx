import { Suspense, lazy, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { productAPI, authAPI } from '../services/apiService';

const AdminDashboard = lazy(() => import('../components/dashboard/AdminDashboard'));
const ManufacturerDashboard = lazy(() => import('../components/dashboard/ManufacturerDashboard'));
const TransporterDashboard = lazy(() => import('../components/dashboard/TransporterDashboard'));
const StoreDashboard = lazy(() => import('../components/dashboard/StoreDashboard'));
const ConsumerDashboard = lazy(() => import('../components/dashboard/ConsumerDashboard'));

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [range, setRange] = useState('6');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user?.role]);

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

  const role = String(user?.role || '').toUpperCase();
  const currentUserId = String(user?._id || user?.id || '');

  const roleLabel = {
    ADMIN: 'Quản trị viên',
    MANUFACTURER: 'Nhà sản xuất',
    TRANSPORTER: 'Nhà vận chuyển',
    STORE: 'Cửa hàng',
    CONSUMER: 'Người tiêu dùng'
  }[role] || 'Người dùng';

  const roleDescription = {
    ADMIN: 'Theo dõi toàn bộ hệ thống, người dùng và dòng chảy sản phẩm',
    MANUFACTURER: 'Theo dõi lô bạn tạo và năng lực sản xuất hiện tại',
    TRANSPORTER: 'Ưu tiên các lô cần vận chuyển và cập nhật trạng thái nhanh',
    STORE: 'Quản lý hàng nhận, tồn kho và tình trạng bán tại cửa hàng',
    CONSUMER: 'Tra cứu nguồn gốc bằng QR và theo dõi sản phẩm có thể kiểm chứng'
  }[role] || 'Tổng quan hệ thống truy xuất nguồn gốc thực phẩm';

  const myManufacturedProducts = useMemo(() => {
    if (!currentUserId) return [];
    return products.filter((p) => {
      const producerUserId = String(p?.producer?.userId || '');
      return producerUserId && producerUserId === currentUserId;
    });
  }, [products, currentUserId]);

  const transporterScopedProducts = useMemo(() => {
    if (!currentUserId) return [];
    return products.filter((p) => {
      const assignedTransporterId = String(p?.relatedParties?.transporter?.userId || '');
      const status = p?.status || p?.currentStatus;

      if (assignedTransporterId && assignedTransporterId === currentUserId) {
        return ['Produced', 'InTransit', 'Delivered'].includes(status);
      }

      return !assignedTransporterId && ['Produced', 'InTransit'].includes(status);
    });
  }, [products, currentUserId]);

  const storeScopedProducts = useMemo(() => {
    if (!currentUserId) return [];
    return products.filter((p) => {
      const assignedStoreId = String(p?.relatedParties?.store?.userId || '');
      const status = p?.status || p?.currentStatus;

      if (assignedStoreId && assignedStoreId === currentUserId) {
        return ['Delivered', 'InStore', 'Sold'].includes(status);
      }

      return !assignedStoreId && ['Delivered', 'InStore'].includes(status);
    });
  }, [products, currentUserId]);

  const traceableProducts = useMemo(() => {
    return products.filter((p) => ['Delivered', 'InStore', 'Sold'].includes(p?.status || p?.currentStatus));
  }, [products]);

  const renderRoleDashboard = () => {
    if (role === 'ADMIN') {
      return (
        <AdminDashboard
          products={products}
          users={users}
          range={range}
          onChangeRange={setRange}
          onRefresh={refreshData}
          monthlyData={monthlyData}
          roleStats={roleStats}
          onOpenProducts={() => navigate('/products')}
        />
      );
    }

    if (role === 'MANUFACTURER') {
      return (
        <ManufacturerDashboard
          products={myManufacturedProducts}
          onOpenCreateProduct={() => navigate('/create-product')}
          onOpenMyProducts={() => navigate('/my-products')}
        />
      );
    }

    if (role === 'TRANSPORTER') {
      return (
        <TransporterDashboard
          products={transporterScopedProducts}
          onOpenTransport={() => navigate('/transport')}
        />
      );
    }

    if (role === 'STORE') {
      return (
        <StoreDashboard
          products={storeScopedProducts}
          onOpenStoreProducts={() => navigate('/store-products')}
          onOpenScan={() => navigate('/scan')}
        />
      );
    }

    return (
      <ConsumerDashboard products={traceableProducts} onOpenScan={() => navigate('/scan')} />
    );
  };

  const roleDashboardNode = renderRoleDashboard();

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
        <h1 className="text-3xl mb-2">Xin chào, {user?.username || user?.name}! 👋</h1>
        <p className="text-gray-600">{roleLabel}: {roleDescription}</p>
      </div>

      <Suspense
        fallback={
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-600">
            Dang tai dashboard theo vai tro...
          </div>
        }
      >
        {roleDashboardNode}
      </Suspense>
    </div>
  );
}
