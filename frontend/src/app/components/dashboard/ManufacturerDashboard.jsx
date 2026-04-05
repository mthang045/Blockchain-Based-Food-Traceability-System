import { Package, Truck, TrendingUp, CheckCircle, Plus, Eye } from 'lucide-react';
import { StatCard, ProductItem, EmptyProducts } from './DashboardShared';

export default function ManufacturerDashboard({ products, onOpenCreateProduct, onOpenMyProducts }) {
  const produced = products.filter((p) => (p.status || p.currentStatus) === 'Produced').length;
  const inTransit = products.filter((p) => (p.status || p.currentStatus) === 'InTransit').length;
  const delivered = products.filter((p) => (p.status || p.currentStatus) === 'Delivered').length;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Package} label="Lô của bạn" value={products.length} color="bg-blue-500" />
        <StatCard icon={TrendingUp} label="Đã sản xuất" value={produced} color="bg-indigo-500" />
        <StatCard icon={Truck} label="Đang vận chuyển" value={inTransit} color="bg-orange-500" />
        <StatCard icon={CheckCircle} label="Đã giao" value={delivered} color="bg-green-500" />
      </div>

      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl shadow p-6 text-white">
        <h3 className="text-xl mb-2">Khu vực nhà sản xuất</h3>
        <p className="mb-4 opacity-90">Tạo lô mới hoặc theo dõi toàn bộ lô do bạn quản lý.</p>
        <div className="flex gap-3">
          <button onClick={onOpenCreateProduct} className="px-6 py-2 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-colors font-medium">
            <Plus className="w-4 h-4 inline-block mr-2" />
            Tạo lô mới
          </button>
          <button onClick={onOpenMyProducts} className="px-6 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors">
            <Eye className="w-4 h-4 inline-block mr-2" />
            Xem lô của tôi
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg">Lô mới tạo gần đây</h3>
          <button onClick={onOpenMyProducts} className="text-sm text-green-700 hover:text-green-800">Mở trang quản lý</button>
        </div>
        <div className="p-6 space-y-3">
          {products.length === 0
            ? <EmptyProducts message="Bạn chưa tạo lô nào. Hãy tạo lô đầu tiên." />
            : products.slice(0, 6).map((p) => (
              <ProductItem key={p._id || p.productId} product={p} onClick={onOpenMyProducts} />
            ))}
        </div>
      </div>
    </>
  );
}
