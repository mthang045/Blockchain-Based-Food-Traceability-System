import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Package,
  Truck,
  Store,
  Scan,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getMenuItems = () => {
    const common = [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
      { path: '/scan', icon: Scan, label: 'Quét QR Code' },
    ];

    switch (user?.role) {
      case 'ADMIN':
        return [
          ...common,
          { path: '/users', icon: Users, label: 'Quản lý người dùng' },
          { path: '/products', icon: Package, label: 'Quản lý sản phẩm' },
          { path: '/blockchain', icon: Store, label: 'Blockchain Logs' },
        ];
      case 'MANUFACTURER':
        return [
          ...common,
          { path: '/my-products', icon: Package, label: 'Sản phẩm của tôi' },
          { path: '/create-product', icon: Package, label: 'Tạo sản phẩm mới' },
        ];
      case 'TRANSPORTER':
        return [
          ...common,
          { path: '/transport', icon: Truck, label: 'Vận chuyển' },
        ];
      case 'STORE':
        return [
          ...common,
          { path: '/store-products', icon: Store, label: 'Sản phẩm' },
        ];
      case 'CONSUMER':
        return common;
      default:
        return common;
    }
  };

  const menuItems = getMenuItems();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-xl">
            🌾
          </div>
          <div>
            <h2 className="font-semibold">FoodChain</h2>
            <p className="text-xs text-gray-500">{user?.name}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-green-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-2">
        <button
          onClick={() => {
            navigate('/profile');
            setSidebarOpen(false);
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span>Cài đặt</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="lg:hidden absolute top-4 right-4">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                {user?.role === 'ADMIN' && 'Quản trị viên'}
                {user?.role === 'MANUFACTURER' && 'Nhà sản xuất'}
                {user?.role === 'TRANSPORTER' && 'Nhà vận chuyển'}
                {user?.role === 'STORE' && 'Cửa hàng'}
                {user?.role === 'CONSUMER' && 'Người tiêu dùng'}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
