import { Package, CheckCircle, TrendingUp } from 'lucide-react';
import { StatCard, ProductItem, EmptyProducts } from './DashboardShared';

export default function ConsumerDashboard({ products, onOpenScan }) {
  const inStore = products.filter((p) => (p.status || p.currentStatus) === 'InStore').length;
  const sold = products.filter((p) => (p.status || p.currentStatus) === 'Sold').length;
  const latestTraceable = products.slice(0, 6);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Package} label="Lô có thể truy xuất" value={products.length} color="bg-blue-500" />
        <StatCard icon={CheckCircle} label="Đã có tại cửa hàng" value={inStore} color="bg-green-500" />
        <StatCard icon={TrendingUp} label="Đã bán" value={sold} color="bg-orange-500" />
      </div>

      <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl shadow p-6 text-white">
        <h3 className="text-xl mb-2">Khu vực người tiêu dùng</h3>
        <p className="mb-4 opacity-90">Quét QR để xem hành trình sản phẩm và kiểm chứng dữ liệu blockchain.</p>
        <button onClick={onOpenScan} className="px-6 py-2 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-colors font-medium">
          Quét mã ngay
        </button>
      </div>

      <div className="bg-white rounded-xl shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg">Sản phẩm có thể truy xuất gần đây</h3>
        </div>
        <div className="p-6 space-y-3">
          {latestTraceable.length === 0
            ? <EmptyProducts message="Chưa có sản phẩm nào sẵn sàng để truy xuất" />
            : latestTraceable.map((p) => (
              <ProductItem key={p._id || p.productId} product={p} onClick={onOpenScan} ctaLabel="Tra cứu" />
            ))}
        </div>
      </div>
    </>
  );
}
