import { Truck, Store, CheckCircle } from 'lucide-react';
import { StatCard, ProductItem, EmptyProducts } from './DashboardShared';

export default function StoreDashboard({ products, onOpenStoreProducts, onOpenScan }) {
  const incoming = products.filter((p) => (p.status || p.currentStatus) === 'Delivered').length;
  const inStore = products.filter((p) => (p.status || p.currentStatus) === 'InStore').length;
  const sold = products.filter((p) => (p.status || p.currentStatus) === 'Sold').length;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Truck} label="Vừa nhận" value={incoming} color="bg-indigo-500" />
        <StatCard icon={Store} label="Đang bán tại cửa hàng" value={inStore} color="bg-purple-500" />
        <StatCard icon={CheckCircle} label="Đã bán" value={sold} color="bg-green-500" />
      </div>

      <div className="bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-xl shadow p-6 text-white">
        <h3 className="text-xl mb-2">Khu vực cửa hàng</h3>
        <p className="mb-4 opacity-90">Xử lý nhập kho, theo dõi lô tại quầy và phục vụ truy xuất QR cho khách hàng.</p>
        <div className="flex gap-3">
          <button onClick={onOpenStoreProducts} className="px-6 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-medium">
            Mở sản phẩm cửa hàng
          </button>
          <button onClick={onOpenScan} className="px-6 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors">
            Quét QR
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg">Lô tại phạm vi cửa hàng</h3>
          <button onClick={onOpenStoreProducts} className="text-sm text-green-700 hover:text-green-800">Quản lý toàn bộ</button>
        </div>
        <div className="p-6 space-y-3">
          {products.length === 0
            ? <EmptyProducts message="Chưa có lô nào trong phạm vi cửa hàng" />
            : products.slice(0, 6).map((p) => (
              <ProductItem key={p._id || p.productId} product={p} onClick={onOpenStoreProducts} ctaLabel="Xử lý" />
            ))}
        </div>
      </div>
    </>
  );
}
